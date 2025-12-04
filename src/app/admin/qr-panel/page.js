// / src/app/admin/qr-panel/page.js

"use client";

import { useEffect, useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { supabase } from "@/lib/supabaseClient";
import AdminLogin from "@/components/AdminLogin"; // <-- IMPORTAR NUEVO COMPONENTE

export default function QrAdminPanel() {
	// CAMBIO CLAVE: authorized A session
	const [session, setSession] = useState(null); 
	const [loading, setLoading] = useState(false);
    //... (mantener el resto de estados)
	const [qrs, setQrs] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState("TENTACION");
	const [count, setCount] = useState(10);
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [query, setQuery] = useState("");
	const [searchResult, setSearchResult] = useState(null);


	// 1. GESTIÓN DE AUTORIZACIÓN (USANDO SUPABASE AUTH)
	useEffect(() => {
		// A. Intentar obtener la sesión actual
		const getInitialSession = async () => {
			setLoading(true);
			const { data: { session } } = await supabase.auth.getSession();
			setSession(session);
			setLoading(false);
		};
		getInitialSession();

		// B. Crear un listener para cambios de autenticación (login/logout)
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				// Este evento se dispara automáticamente después de un login exitoso
				setSession(session);
			}
		);

		// Limpieza
		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	// 2. CARGAR LISTA (USANDO useCallback para evitar ciclos y optimizar)
	const fetchQrs = useCallback(async () => {
		setLoading(true);
		let queryBuilder = supabase
			.from('qr_codes')
			.select('*, scan_count')
			.order('created_at', { ascending: false })
			.limit(100);

		if (statusFilter !== "ALL") {
			queryBuilder = queryBuilder.eq('status', statusFilter);
		}

		const { data, error } = await queryBuilder;
		if (error) console.error("Error cargando QRs: " + error.message);
		else setQrs(data || []);
		setLoading(false);
	}, [statusFilter]); // Dependencia del filtro

	// 3. EFECTO PARA CARGAR DATOS SÓLO SI HAY SESIÓN
	useEffect(() => {
		// Los datos solo se cargan si hay una sesión activa
		if (session) {
			fetchQrs();
		} else {
			// Limpia QRs si se cierra la sesión
			setQrs([]); 
		}
	}, [session, statusFilter, fetchQrs]); // Depende de la sesión y el filtro

	// 4. LOGOUT (NUEVA FUNCIÓN)
	const handleLogout = async () => {
		setLoading(true);
		await supabase.auth.signOut();
		// setSession(null) se activa automáticamente por el listener
		setLoading(false);
	}


	// --- Resto de funciones (handleGenerate, exportQrs, toggleStatus, deleteQr) se mantienen sin cambios ---

    // 3. GENERAR NUEVOS QRS (Lógica de Secuencia)
    const handleGenerate = async () => {
        if (count <= 0) return alert("Cantidad inválida");
        setLoading(true);

        try {
            // A. Determinar rango según categoría para mantener orden
            let prefix = 200; 
            if (categoryFilter === "TENTACION") prefix = 100;
            if (categoryFilter === "DESEO_PROHIBIDO") prefix = 300;

            // B. Buscar el ID más alto existente para esa categoría
            const { data: lastQr } = await supabase
                .from('qr_codes')
                .select('id')
                .ilike('id', `QR${String(prefix)[0]}%`)
                .order('id', { ascending: false })
                .limit(1)
                .single();

            let nextNum = prefix;
            if (lastQr) {
                const lastNum = parseInt(lastQr.id.replace('QR', ''));
                if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }

            // C. Generar Array de inserción
            const newRows = [];
            for (let i = 0; i < count; i++) {
                newRows.push({
                    id: `QR${nextNum + i}`,
                    category: categoryFilter,
                    status: 'NEW',
                    scan_count: 0
                });
            }

            // D. Guardar en Supabase
            const { error } = await supabase.from('qr_codes').insert(newRows);
            if (error) throw error;

            alert(`✅ Se generaron ${count} códigos nuevos comenzando en QR${nextNum}.`);
            fetchQrs();

        } catch (e) {
            console.error(e);
            alert("Error generando: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // 4. EXPORTAR ZIP (Generación de Imágenes)
    const exportQrs = async () => {
        if (!qrs.length) return alert("No hay QR en pantalla para exportar.");
        setLoading(true);

        const zip = new JSZip();
        // Importamos ReactDOM dinámicamente para renderizar el canvas invisible
        const ReactDOM = (await import("react-dom/client")).default;

        for (const qr of qrs) {
            const container = document.createElement("div");
            // Oculto pero renderizable
            container.style.position = "fixed";
            container.style.left = "-9999px";
            document.body.appendChild(container);

            // URL de Producción (o la actual)
            const url = `${window.location.origin}/invitacion-ritual?qr=${qr.id}`;

            const qrElement = (
                <QRCodeCanvas
                    value={url}
                    size={500} // Alta calidad para imprenta
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H" // Alta corrección de errores
                    includeMargin={true}
                />
            );

            const root = ReactDOM.createRoot(container);
            root.render(qrElement);

            // Esperar a que React dibuje
            await new Promise((res) => setTimeout(res, 150));
            
            const canvas = container.querySelector("canvas");
            if (canvas) {
                const dataUrl = canvas.toDataURL("image/png");
                const bin = dataUrl.split(",")[1];
                // Nombre de archivo: Categoria_ID.png
                zip.file(`${qr.category}_${qr.id}.png`, bin, { base64: true });
            }

            root.unmount();
            document.body.removeChild(container);
        }

        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, `QRs_LlaveProhibida_${new Date().toISOString().slice(0,10)}.zip`);
        setLoading(false);
    };

    // 5. ACCIONES INDIVIDUALES
    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'DISABLED' ? 'NEW' : 'DISABLED';
        await supabase.from('qr_codes').update({ status: newStatus }).eq('id', id);
        fetchQrs();
    };

    const deleteQr = async (id) => {
        if(!confirm("¿Borrar este QR permanentemente?")) return;
        await supabase.from('qr_codes').delete().eq('id', id);
        fetchQrs();
    }


	// RENDER DE SEGURIDAD
	// 1. Muestra la página de carga mientras Supabase verifica la sesión
	if (loading && !session) return <div className="p-10 text-white">Verificando sesión...</div>;
    
	// 2. Si no hay sesión, muestra el formulario de Login
	if (!session) return <AdminLogin />;

    // 3. Si hay sesión, muestra el panel completo
	return (
		<main className="p-8 bg-black min-h-screen text-white font-sans">
			<div className="flex justify-between items-center mb-6 border-b border-yellow-800 pb-4">
				<h1 className="text-3xl text-yellow-400 font-serif">
					🏭 Fábrica de Llaves (Panel QR)
				</h1>
				<button 
					onClick={handleLogout}
					disabled={loading}
					className="text-sm bg-red-700 hover:bg-red-600 px-4 py-2 rounded transition-all disabled:opacity-50"
				>
					{loading ? "Cerrando..." : `Cerrar Sesión (${session.user.email})`}
				</button>
			</div>

			{/* CONTROLES */}
			<div className="bg-gray-900 p-6 rounded-lg border border-yellow-700 mb-8 flex flex-wrap gap-4 items-end">
				<div>
					<label className="block text-sm text-gray-400 mb-1">Categoría</label>
					<select
						className="bg-black border border-gray-600 text-white p-2 rounded w-48"
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
					>
						<option value="TENTACION">TENTACIÓN (1xx)</option>
						<option value="PASION">PASIÓN (2xx)</option>
						<option value="DESEO_PROHIBIDO">PROHIBIDO (3xx)</option>
					</select>
				</div>

				<div>
					<label className="block text-sm text-gray-400 mb-1">Cantidad</label>
					<input
						type="number"
						className="bg-black border border-gray-600 text-white p-2 rounded w-24"
						value={count}
						onChange={(e) => setCount(e.target.value)}
					/>
				</div>

				<button	
					onClick={handleGenerate}
					disabled={loading}
					className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded transition-all"
				>
					{loading ? "Fabricando..." : "⚡ Generar QRs"}
				</button>

				<div className="flex-grow"></div>

				<button	
					onClick={exportQrs}
					disabled={loading || qrs.length === 0}
					className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded transition-all"
				>
					📦 Descargar ZIP (Visualizados)
				</button>
			</div>

			{/* FILTROS DE VISUALIZACIÓN */}
			<div className="mb-4 flex gap-4 items-center">
				<span className="text-gray-400">Filtrar vista por estado:</span>
				{['ALL', 'NEW', 'ACTIVE', 'USED', 'DISABLED'].map(st => (
					<button	
						key={st}
						onClick={() => setStatusFilter(st)}
						className={`px-3 py-1 rounded text-sm ${statusFilter === st ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}
					>
						{st}
					</button>
				))}
				<span className="ml-auto text-sm text-gray-500">Mostrando últimos 100 registros</span>
			</div>

			{/* TABLA DE QRS */}
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-gray-800 text-yellow-200">
							<th className="p-3">ID</th>
							<th className="p-3">Categoría</th>
							<th className="p-3">Estado</th>
							<th className="p-3">Usos</th>
							<th className="p-3">Fecha</th>
							<th className="p-3 text-center">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{qrs.map(qr => (
							<tr key={qr.id} className="border-b border-gray-800 hover:bg-gray-900">
								<td className="p-3 font-mono text-yellow-500">{qr.id}</td>
								<td className="p-3">{qr.category}</td>
								<td className="p-3">
									<span className={`px-2 py-1 rounded text-xs font-bold
										${qr.status === 'NEW' ? 'bg-green-900 text-green-300' : ''}
										${qr.status === 'USED' ? 'bg-red-900 text-red-300' : ''}
										${qr.status === 'DISABLED' ? 'bg-gray-700 text-gray-400' : ''}
									`}>
										{qr.status}
									</span>
								</td>
								<td className="p-3 text-sm text-yellow-400 font-bold">
									{qr.scan_count || 0}
								</td>
								<td className="p-3 text-sm text-gray-400">
									{new Date(qr.created_at).toLocaleDateString()}
								</td>
								<td className="p-3 flex justify-center gap-2">
									<button	
										onClick={() => toggleStatus(qr.id, qr.status)}
										className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
									>
										{qr.status === 'DISABLED' ? 'Activar' : 'Bloquear'}
									</button>
									<button	
										onClick={() => deleteQr(qr.id)}
										className="text-xs bg-red-900 hover:bg-red-700 text-red-200 px-2 py-1 rounded"
									>
										🗑
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{qrs.length === 0 && !loading && (
					<div className="text-center p-10 text-gray-500">No hay códigos en esta vista. Genera algunos arriba.</div>
				)}
			</div>
		</main>
	);
}