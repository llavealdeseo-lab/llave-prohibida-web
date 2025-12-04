export const mockSessions = [
  {
    id: "GAME-0001",
    used: false,
    category: "PASION",
    p1: null,
    p2: null,
    result: null, // se llenará al final
  },
  {
    id: "GAME-0002",
    used: false,
    category: "DESEO_PROHIBIDO",
    p1: null,
    p2: null,
    result: null,
  },
  {
    id: "GAME-0003",
    used: true,
    category: "TENTACION",
    p1: { desire: { title: "Beso con los ojos vendados" } },
    p2: { desire: { title: "Juego de prendas" } },
    result: {
      chosenCards: ["Beso con los ojos vendados", "Juego de prendas"],
      deck: ["Carta A", "Carta B", "Carta C"], // ejemplo
    },
  },
];
