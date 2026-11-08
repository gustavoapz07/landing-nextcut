# NextCut · Landing

Página de venta de [NextCut](../NextCut), la fila virtual para barberías. Vive en un repo aparte de la app.

- **Stack:** Astro 7 + Tailwind 4, salida estática. Sin React. El movimiento (pantalla de carga, hero, fila fijada con el scroll, TV en vivo, scroll suave) está en `src/scripts/animaciones.ts` con GSAP + ScrollTrigger y Lenis. Con «reducir movimiento» no se anima nada.
- **Identidad:** la de la app (ADR-018): monocromo con ladrillo y marino, Big Shoulders Display y Bricolage Grotesque, logo del boleto.
- **Hero:** silla de barbero generada en Magnific y recortada (`public/img/silla.webp`); prompt y créditos en `fuente/Prompts_imagenes.md`.
- **Fotos:** Unsplash, servidas desde su CDN (`foto()` en `src/lib/sitio.ts`).
- **Publicación:** Cloudflare Pages, proyecto `landing-nextcut`, conectado a este repo de GitHub. Cada push a `main` se compila con `npm run build` (Node 24, por `.node-version`) y publica `dist/`. Los push a otras ramas dan una vista previa.

## Antes de publicar

- El WhatsApp (+504 8975-9031) está en `WHATSAPP` (`src/lib/sitio.ts`).
- Confirmar los precios de `PLANES` (son una propuesta: Prueba gratis 30 días, Fila L 390, Barbería L 690).

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # sale en dist/
```

## Secciones

1. Hero: la silla recortada, el boleto encendido y «NEXT», con el turno y el aviso en la esquina.
2. El problema: el «ahorita vuelvo» del sábado, con la fila fijada que avanza con el scroll.
3. Cómo funciona: tres pasos con pantallas de ejemplo.
4. Del otro lado del mostrador: barbero, dueño y TV.
5. Calculadora: cuánto se queda en la puerta al mes, con los números del dueño.
6. Precios: comparación con apps de citas y los tres planes.
7. Preguntas frecuentes y cierre con WhatsApp.
