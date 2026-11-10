// Datos que se cambian sin tocar el diseño.

// WhatsApp de NextCut, con código de país y sin signos (+504 8975-9031).
export const WHATSAPP = "50489759031";

export function enlaceWhatsApp(mensaje = "Hola, quiero NextCut para mi barbería.") {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}

/** Foto de Unsplash recortada por su CDN al ancho pedido. */
export function foto(id: string, ancho: number, alto?: number) {
  const parametros = new URLSearchParams({
    auto: "format",
    fit: "crop",
    q: "70",
    w: String(ancho),
  });
  if (alto) parametros.set("h", String(alto));
  return `https://images.unsplash.com/photo-${id}?${parametros}`;
}

export function srcset(id: string, anchos: number[], proporcion?: number) {
  return anchos
    .map((w) => `${foto(id, w, proporcion ? Math.round(w * proporcion) : undefined)} ${w}w`)
    .join(", ");
}

export const FOTOS = {
  hero: "1605497788044-5a32c7078486",
  rizos: "1567894340315-735d7c361db0",
  degradado: "1593702275687-f8b402bf1fb5",
  sombrero: "1635273051937-a0ddef9573b6",
  local: "1585747860715-2ba37e788b70",
} as const;

// Precios propuestos (por barbería, no por barbero). Ajustar antes de publicar.
export const PLANES = [
  {
    nombre: "Prueba",
    precio: "Gratis",
    periodo: "30 días",
    nota: "Todo lo de Barbería, sin tarjeta.",
    incluye: [
      "Fila virtual y QR para la puerta",
      "Avisos al celular del cliente",
      "Panel para cada barbero",
      "Resumen del día",
    ],
    foto: FOTOS.rizos,
  },
  {
    nombre: "Fila",
    precio: "L 390",
    periodo: "al mes",
    nota: "Para empezar a ordenar la fila.",
    incluye: [
      "Fila virtual sin descargar nada",
      "QR imprimible para la puerta",
      "Avisos a los 15 minutos y al llamar",
      "Panel del barbero",
      "Barberos sin límite",
    ],
    foto: FOTOS.degradado,
  },
  {
    nombre: "Barbería",
    precio: "L 690",
    periodo: "al mes",
    nota: "La fila y los números del negocio.",
    destacado: true,
    incluye: [
      "Todo lo de Fila",
      "Pantalla de TV para el local",
      "Resumen del dueño: abandonos, ingresos y horas pico",
      "Cuenta propia para cada barbero",
      "Servicios con precio y duración",
    ],
    foto: FOTOS.sombrero,
  },
] as const;

// App de NextCut en producción (fila, panel y aviso de privacidad de los clientes).
export const APP = "https://nextcut-produccion.gustavoapz07.workers.dev";

// Fecha de la última versión de las páginas legales.
export const LEGAL_ACTUALIZADO = "10 de noviembre de 2026";
