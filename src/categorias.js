// Listas fijas que usan varios archivos: categorías de gastos, prioridades y tipos de evento

export const CATEGORIAS = {
  comida: "Comida",
  transporte: "Transporte",
  ocio: "Ocio",
  estudios: "Estudios",
  hogar: "Hogar",
  otros: "Otros",
};

// De más a menos importante (sirve para ordenar)
export const PRIORIDADES = ["alta", "media", "baja"];

export const TIPOS_EVENTO = {
  plan: "Plan",
  examen: "Examen",
};
