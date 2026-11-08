// Todo el movimiento de la landing. Sin JavaScript la página se ve completa y quieta;
// con «reducir movimiento» se salta la carga, no se fija nada y la fila muestra el final.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends Element = HTMLElement>(sel: string, raiz: ParentNode = document) =>
  raiz.querySelector<T & Element>(sel) as T | null;
const $$ = <T extends Element = HTMLElement>(sel: string, raiz: ParentNode = document) =>
  Array.from(raiz.querySelectorAll(sel)) as T[];

export function iniciar() {
  const lenis = quieto ? null : scrollSuave();
  barra();
  aparecer();
  calcularFila();
  tvEnVivo();
  if (quieto) {
    $("#cargador")?.remove();
    document.documentElement.classList.remove("cargando");
    return;
  }
  lenis?.stop();
  cargar().then(() => {
    lenis?.start();
    entradaHero();
    ScrollTrigger.refresh();
  });
  parallaxHero();
  revelarTitulos();
  escenas();
  recalcularAlCrecer();
}

// --- Recalcular los disparadores cuando la página cambia de alto ----------------------------
// Las fuentes, las fotos y el fin de la pantalla de carga cambian el alto de la página después
// de que ScrollTrigger midió dónde empieza cada animación. Sin esto, algunas se quedan escondidas.

function recalcularAlCrecer() {
  let pendiente: number | undefined;
  const recalcular = () => {
    clearTimeout(pendiente);
    pendiente = window.setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  document.fonts?.ready.then(recalcular);
  window.addEventListener("load", recalcular, { once: true });
  for (const img of document.images) {
    if (!img.complete) img.addEventListener("load", recalcular, { once: true });
  }
}

// --- Scroll suave ----------------------------------------------------------------------------

function scrollSuave() {
  const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -80 } });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

// --- Pantalla de carga -----------------------------------------------------------------------

function cargar() {
  const cargador = $("#cargador");
  if (!cargador) return Promise.resolve();
  const silla = $<HTMLImageElement>('[data-hero="silla"]');
  const imagenLista = new Promise<void>((listo) => {
    if (!silla || silla.complete) return listo();
    silla.addEventListener("load", () => listo(), { once: true });
    silla.addEventListener("error", () => listo(), { once: true });
    setTimeout(listo, 2500);
  });
  const numero = $('[data-cargador="numero"]', cargador);
  const contador = { n: 1 };

  const intro = gsap
    .timeline()
    .to('[data-cargador="trazo"]', { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" })
    .to('[data-cargador="punteado"]', { opacity: 1, duration: 0.3 }, "-=0.3")
    .to('[data-cargador="punto"]', { opacity: 1, scale: 1, transformOrigin: "center", duration: 0.4, ease: "back.out(3)" }, "<")
    .to(
      contador,
      {
        n: 14,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => {
          if (numero) numero.textContent = String(Math.round(contador.n)).padStart(2, "0");
        },
      },
      0.15,
    );

  return Promise.all([intro.then(), imagenLista]).then(
    () =>
      new Promise<void>((listo) => {
        gsap
          .timeline({
            onComplete: () => {
              cargador.remove();
              document.documentElement.classList.remove("cargando");
            },
          })
          .to(cargador.firstElementChild, { y: -40, opacity: 0, duration: 0.45, ease: "power2.in" })
          .add(listo, "-=0.1")
          .to(cargador, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "-=0.15");
      }),
  );
}

// --- Hero ------------------------------------------------------------------------------------

function entradaHero() {
  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .from('[data-hero="boleto"]', { opacity: 0, scale: 0.7, rotate: -8, duration: 1.6 }, 0)
    .from('[data-hero="silla"]', { yPercent: 18, opacity: 0, scale: 0.9, filter: "blur(14px)", duration: 1.5 }, 0.1)
    .from('[data-hero="palabra"] .letra', { yPercent: 110, opacity: 0, duration: 1.2, stagger: 0.07 }, 0.35)
    .from('[data-hero="texto"]', { y: 30, opacity: 0, duration: 1, stagger: 0.1 }, 0.6)
    .from('[data-hero="recortes"] > div > div', { y: 60, rotate: 0, opacity: 0, duration: 1.1, stagger: 0.12 }, 0.75)
    .from('[data-hero="bajar"]', { opacity: 0, duration: 0.8 }, 1.1);
}

function parallaxHero() {
  const hero = $("#hero");
  if (!hero) return;
  const t = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
  gsap.to('[data-hero="silla"]', { yPercent: -14, scale: 1.06, ease: "none", scrollTrigger: t });
  gsap.to('[data-hero="boleto"]', { yPercent: -40, rotate: 8, opacity: 0.3, ease: "none", scrollTrigger: t });
  gsap.to('[data-hero="palabra"]', { yPercent: 35, opacity: 0, ease: "none", scrollTrigger: t });
  gsap.to('[data-hero="recortes"]', { y: -120, ease: "none", scrollTrigger: t });
}

// --- Barra: color según la sección de abajo y fondo al bajar ---------------------------------

function barra() {
  const barra = $("#barra");
  if (!barra) return;
  const oscuras = $$("[data-tema='oscuro'], footer");
  const actualizar = () => {
    const y = 36;
    const sobreOscuro = oscuras.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= y && r.bottom >= y;
    });
    const abajo = window.scrollY > 24;
    barra.dataset.sobre = sobreOscuro ? "oscuro" : "claro";
    barra.classList.toggle("bg-fondo/85", abajo && !sobreOscuro);
    barra.classList.toggle("bg-noche/60", abajo && sobreOscuro);
    barra.classList.toggle("backdrop-blur", abajo);
    barra.classList.toggle("shadow-[0_8px_30px_-12px_rgb(26_25_24/0.25)]", abajo && !sobreOscuro);
  };
  actualizar();
  window.addEventListener("scroll", actualizar, { passive: true });
}

// --- Aparecer al entrar ----------------------------------------------------------------------

function aparecer() {
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("visto");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  $$("[data-aparece]").forEach((el) => io.observe(el));
}

function revelarTitulos() {
  $$("main h2, [data-revela]").forEach((h) => {
    if (h.closest("#hero")) return;
    gsap.from(h, {
      clipPath: "inset(0 0 100% 0)",
      y: 60,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: h, start: "top 88%" },
    });
  });
}

// --- La fila del sábado ----------------------------------------------------------------------

function calcularFila() {
  const escena = $('[data-fila="escena"]');
  if (!escena) return;
  const boletos = $$<HTMLLIElement>("[data-sale]", escena);
  const reloj = $('[data-fila="reloj"]', escena);
  const idos = $('[data-fila="idos"]', escena);
  const perdido = $('[data-fila="perdido"]', escena);
  const minutosDe = (h: string) => Number(h.split(":")[1]);
  const PRECIO = 150;

  const pintar = (minuto: number) => {
    let n = 0;
    for (const b of boletos) {
      const fuera = minuto >= minutosDe(b.dataset.sale ?? "99:99");
      b.classList.toggle("ido", fuera);
      if (fuera) n++;
    }
    if (reloj) reloj.textContent = `10:${String(Math.floor(minuto)).padStart(2, "0")}`;
    if (idos) idos.textContent = String(n);
    if (perdido) perdido.textContent = `L ${n * PRECIO}`;
  };

  if (quieto) return pintar(45);
  pintar(0);
  gsap.from($$(".boleto-li", escena), {
    y: 50,
    opacity: 0,
    stagger: 0.06,
    duration: 0.9,
    ease: "expo.out",
    scrollTrigger: { trigger: escena, start: "top 75%" },
  });
  ScrollTrigger.create({
    trigger: escena,
    start: "top top",
    end: "+=160%",
    pin: true,
    scrub: true,
    onUpdate: (st) => pintar(st.progress * 45),
  });
}

// --- Escenas con scroll ----------------------------------------------------------------------

function escenas() {
  // Celulares de «Cómo funciona»: cada uno flota a su ritmo.
  $$("#como-funciona figure").forEach((tel, i) => {
    gsap.fromTo(
      tel,
      { y: 80 + i * 30, rotate: i === 1 ? 0 : i === 0 ? -3 : 3 },
      {
        y: -40 - i * 20,
        rotate: 0,
        ease: "none",
        scrollTrigger: { trigger: tel, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  // Barras del resumen del dueño.
  $$("[data-barra]").forEach((b, i) => {
    gsap.from(b, {
      scaleY: 0,
      transformOrigin: "bottom",
      duration: 1,
      delay: i * 0.05,
      ease: "expo.out",
      scrollTrigger: { trigger: b, start: "top 92%" },
    });
  });

  // Números que cuentan.
  $$("[data-contar]").forEach((el) => {
    const meta = Number(el.dataset.contar);
    const prefijo = el.dataset.prefijo ?? "";
    const valor = { n: 0 };
    const formato = new Intl.NumberFormat("es-HN");
    gsap.to(valor, {
      n: meta,
      duration: 1.6,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => {
        el.textContent = `${prefijo}${formato.format(Math.round(valor.n))}`;
      },
    });
  });

  // Fotos: se destapan con cortina y bajan de zoom.
  $$("[data-foto]").forEach((foto) => {
    gsap.fromTo(
      foto,
      { clipPath: "inset(12% 12% 12% 12% round 2rem)", scale: 1.15 },
      {
        clipPath: "inset(0% 0% 0% 0% round 2rem)",
        scale: 1,
        ease: "expo.out",
        duration: 1.4,
        scrollTrigger: { trigger: foto, start: "top 85%" },
      },
    );
  });

  // Planes: entran escalonados con un poco de giro.
  $$("[data-plan]").forEach((plan, i) => {
    gsap.from(plan, {
      y: 100,
      rotate: i % 2 ? 2 : -2,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: plan, start: "top 90%" },
    });
  });
}

// --- TV en vivo ------------------------------------------------------------------------------

type Turno = { n: number; nombre: string; barbero: number | null; servicio: string };

function tvEnVivo() {
  const tv = $("[data-tv]");
  if (!tv) return;
  const BARBEROS = [
    { nombre: "Óscar", silla: 1 },
    { nombre: "Kevin", silla: 2 },
    { nombre: "Elmer", silla: 3 },
  ];
  const NOMBRES = ["Pedro V.", "Dani H.", "Marcos T.", "Iván C.", "Rafa G.", "Josué M.", "Allan B.", "Nelson F."];
  const SERVICIOS = ["Fade", "Corte", "Barba", "Corte + barba"];
  const atendiendo = [12, 11, 13];
  let fila: Turno[] = [
    { n: 14, nombre: "Carlos M.", barbero: 0, servicio: "Fade" },
    { n: 15, nombre: "Ana P.", barbero: 1, servicio: "Corte" },
    { n: 16, nombre: "José A.", barbero: 2, servicio: "Barba" },
    { n: 17, nombre: "Luis R.", barbero: null, servicio: "Corte" },
    { n: 18, nombre: "Mario P.", barbero: 0, servicio: "Fade" },
  ];
  let siguienteNumero = 19;
  let turnoBarbero = 0;
  let extra = 0;

  const columnas = $$("[data-tv-columna]", tv);
  const lista = $('[data-tv="fila"]', tv)!;
  const cuantos = $('[data-tv="cuantos"]', tv);
  const anuncio = $('[data-tv="anuncio"]', tv)!;
  const reloj = $('[data-tv="reloj"]', tv);

  const proximoDe = (b: number) => fila.find((t) => t.barbero === b) ?? fila.find((t) => t.barbero === null);

  const pintarSigue = () => {
    columnas.forEach((col, b) => {
      const t = proximoDe(b);
      const sigue = $('[data-tv="sigue"]', col)!;
      const servicio = $('[data-tv="servicio"]', col)!;
      const texto = t ? `#${t.n} ${t.nombre}` : "Sin fila";
      if (sigue.textContent !== texto) {
        sigue.textContent = texto;
        servicio.textContent = t?.servicio ?? "Anótate con el QR";
        if (!quieto) gsap.from([sigue, servicio], { y: 10, opacity: 0, duration: 0.5, ease: "power2.out" });
      }
    });
    if (cuantos) cuantos.textContent = String(fila.length);
  };

  const filaHtml = (t: Turno) => {
    const li = document.createElement("li");
    li.className = "flex items-center gap-[0.8cqw] rounded-[0.8cqw] bg-noche/[0.06] px-[1cqw] py-[0.7cqw]";
    li.dataset.n = String(t.n);
    li.innerHTML = `<span class="w-[4.4cqw] font-display text-[2.2cqw] leading-none font-black">#${t.n}</span><span class="min-w-0 flex-1 truncate text-[1.35cqw] font-semibold"></span><span class="text-[1cqw] opacity-60"></span>`;
    li.children[1].textContent = t.nombre;
    li.children[2].textContent = t.barbero === null ? "El primero" : BARBEROS[t.barbero].nombre;
    return li;
  };

  const ciclo = () => {
    const b = turnoBarbero;
    turnoBarbero = (turnoBarbero + 1) % BARBEROS.length;
    const t = proximoDe(b);
    if (!t) return;
    const barbero = BARBEROS[b];

    $('[data-tv="anuncio-numero"]', anuncio)!.textContent = `#${t.n}`;
    $('[data-tv="anuncio-nombre"]', anuncio)!.textContent = t.nombre;
    $('[data-tv="anuncio-barbero"]', anuncio)!.textContent = `Pasa con ${barbero.nombre} · silla ${barbero.silla}`;

    gsap
      .timeline()
      .to(anuncio, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power4.inOut" })
      .fromTo($('[data-tv="anuncio-numero"]', anuncio), { scale: 0.5 }, { scale: 1, duration: 0.7, ease: "back.out(2)" }, "-=0.3")
      .add(() => {
        // La silla cambia de número con un giro, como en la app.
        const numero = $('[data-tv="numero"]', columnas[b])!;
        atendiendo[b] = t.n;
        gsap
          .timeline()
          .to(numero, { rotateX: 95, opacity: 0, duration: 0.25, ease: "power2.in" })
          .add(() => {
            numero.textContent = `#${t.n}`;
          })
          .fromTo(numero, { rotateX: -95, opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)" });

        // Sale de la fila y entra alguien nuevo al final.
        const li = lista.querySelector<HTMLElement>(`[data-n="${t.n}"]`);
        fila = fila.filter((x) => x.n !== t.n);
        const nuevo: Turno = {
          n: siguienteNumero++,
          nombre: NOMBRES[extra % NOMBRES.length],
          barbero: extra % 3 === 2 ? null : (extra + 1) % 3,
          servicio: SERVICIOS[extra % SERVICIOS.length],
        };
        extra++;
        fila.push(nuevo);
        const liNuevo = filaHtml(nuevo);
        if (li) {
          gsap.to(li, {
            x: "-30%",
            opacity: 0,
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 0,
            duration: 0.45,
            ease: "power2.in",
            onComplete: () => li.remove(),
          });
        }
        lista.append(liNuevo);
        gsap.from(liNuevo, { x: "30%", opacity: 0, duration: 0.6, delay: 0.25, ease: "expo.out" });
        pintarSigue();
      }, "+=1.1")
      .to(anuncio, { clipPath: "inset(0 0 0 100%)", duration: 0.6, ease: "power4.inOut" }, "+=0.2")
      .set(anuncio, { clipPath: "inset(0 100% 0 0)" });
  };

  // Reloj de la tele (hora de ejemplo que avanza).
  let minuto = 24;
  const tic = () => {
    minuto = (minuto + 1) % 60;
    if (reloj) reloj.textContent = `10:${String(minuto).padStart(2, "0")}`;
  };

  if (quieto) return;
  let intervalo: number | undefined;
  let relojId: number | undefined;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !intervalo) {
        setTimeout(ciclo, 2500);
        intervalo = window.setInterval(ciclo, 7000);
        relojId = window.setInterval(tic, 7000);
      } else if (!e.isIntersecting && intervalo) {
        clearInterval(intervalo);
        clearInterval(relojId);
        intervalo = undefined;
      }
    },
    { threshold: 0.4 },
  );
  io.observe(tv);
}
