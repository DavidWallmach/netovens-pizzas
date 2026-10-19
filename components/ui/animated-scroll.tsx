"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import PizzaHero from "./pizza-hero";

const GREEN_LIGHT = "#067401";
const GREEN_DARK = "#010D01";
const YELLOW = "#FCD800";

const SITE = "https://netovens-pizza.vercel.app";
const WA = "https://wa.me/526562073084";
const TEL = "tel:+526562073084";

// Tipografías (se cargan en pizza-hero.tsx)
const DISPLAY = '"Alfa Slab One", Georgia, serif';
const BODY = 'Karla, system-ui, sans-serif';

const MAP_MARQUIS =
  "https://www.google.com/maps?q=C.+Cam.+Viejo+a+San+Jos%C3%A9+7203,+Marquis,+32528+Ju%C3%A1rez,+Chih.&output=embed";
const MAP_SENECU =
  "https://www.google.com/maps?q=C.+Valle+del+Sol+1952,+Partido+Senec%C3%BA,+32422+Ju%C3%A1rez,+Chih.&output=embed";

type Content = { heading?: string; description: React.ReactNode };

type Page = {
  leftBgImage: string | null;
  rightBgImage: string | null;
  leftContent: Content | null;
  rightContent: Content | null;
  leftMap?: string;
  rightMap?: string;
  /** Páginas con mucho texto: en celular el contenido ocupa toda la pantalla */
  menu?: boolean;
};

type Item = { name: string; price?: string; desc?: string; tag?: string };

const photo = (file: string) => `${SITE}/${file}.webp`;

/* ------------------------------------------------------------------ */
/* Horario: abierto / cerrado (hora de Ciudad Juárez)                  */
/* ------------------------------------------------------------------ */

type Status = { open: boolean; text: string };

function getStatus(now: Date = new Date()): Status {
  const fmt = (tz: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    });
  let f: Intl.DateTimeFormat;
  try {
    f = fmt("America/Ciudad_Juarez");
  } catch {
    f = fmt("America/Denver");
  }
  const parts = f.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("weekday"); // "Mon", "Tue", ...
  const mins = Number(get("hour")) * 60 + Number(get("minute"));

  const OPEN = 11 * 60; // 11:00 a.m.
  const CLOSE = 20 * 60 + 30; // 8:30 p.m.
  const isMon = day === "Mon";

  if (!isMon && mins >= OPEN && mins < CLOSE) {
    return {
      open: true,
      text: CLOSE - mins <= 60 ? "Abierto · cerramos pronto (8:30 p.m.)" : "Abierto ahora · cerramos a las 8:30 p.m.",
    };
  }
  if (!isMon && mins < OPEN) return { open: false, text: "Cerrado · abrimos hoy a las 11:00 a.m." };
  if (isMon) return { open: false, text: "Hoy (lunes) cerramos · abrimos mañana a las 11:00 a.m." };
  if (day === "Sun") return { open: false, text: "Cerrado · abrimos el martes a las 11:00 a.m." };
  return { open: false, text: "Cerrado · abrimos mañana a las 11:00 a.m." };
}

function useOpenStatus() {
  const [s, setS] = useState<Status | null>(null);
  useEffect(() => {
    const tick = () => setS(getStatus());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  return s;
}

function OpenNow({ className = "" }: { className?: string }) {
  const s = useOpenStatus();
  if (!s) return null;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur ${className}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.open ? "bg-green-400" : "bg-red-500"}`} />
      {s.text}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Carrito                                                             */
/* ------------------------------------------------------------------ */

type Cart = Record<string, { price: number; qty: number }>;

type CartCtx = {
  cart: Cart;
  add: (name: string, price: number) => void;
  sub: (name: string) => void;
  open: () => void;
};

const CartContext = createContext<CartCtx>({ cart: {}, add: () => {}, sub: () => {}, open: () => {} });

function QtyControl({ name, price }: { name: string; price: number }) {
  const { cart, add, sub } = useContext(CartContext);
  const qty = cart[name]?.qty ?? 0;

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(name, price)}
        aria-label={`Agregar ${name}`}
        className="rounded-full border border-[#FCD800] px-3 py-1 text-xs font-bold text-[#FCD800] transition-colors hover:bg-[#FCD800] hover:text-[#032A00]"
      >
        + Agregar
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => sub(name)}
        aria-label={`Quitar uno de ${name}`}
        className="h-7 w-7 rounded-full border border-[#FCD800] font-bold leading-none text-[#FCD800] hover:bg-[#FCD800] hover:text-[#032A00]"
      >
        −
      </button>
      <span className="min-w-5 text-center text-sm font-bold text-white" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => add(name, price)}
        aria-label={`Agregar otro ${name}`}
        className="h-7 w-7 rounded-full border border-[#FCD800] font-bold leading-none text-[#FCD800] hover:bg-[#FCD800] hover:text-[#032A00]"
      >
        +
      </button>
    </div>
  );
}

function MenuList({ items, note }: { items: Item[]; note?: string }) {
  return (
    <div className="w-full max-w-md text-left">
      <ul className="space-y-3 md:space-y-3.5">
        {items.map((it) => {
          const m = it.price?.match(/^\$(\d+)$/);
          const amount = m ? Number(m[1]) : null;
          return (
            <li key={it.name}>
              <div className="flex items-baseline gap-2">
                <span className="text-base leading-tight md:text-lg" style={{ fontFamily: DISPLAY }}>
                  {it.name}
                  {it.tag && (
                    <span
                      className="ml-2 rounded-full bg-[#FCD800] px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-[#032A00]"
                      style={{ fontFamily: BODY }}
                    >
                      {it.tag}
                    </span>
                  )}
                </span>
                {it.price && <span className="min-w-4 flex-1 self-end border-b-2 border-dotted border-white/30" />}
                {it.price && (
                  <span className="text-lg text-[#FCD800] md:text-xl" style={{ fontFamily: DISPLAY }}>
                    {it.price}
                  </span>
                )}
              </div>
              {it.desc && <p className="mt-0.5 text-[13px] leading-snug text-white/75 md:text-sm">{it.desc}</p>}
              {amount !== null && (
                <div className="mt-1.5 flex justify-end">
                  <QtyControl name={it.name} price={amount} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {note && <p className="mt-4 text-xs text-white/80 md:text-sm">{note}</p>}
    </div>
  );
}

const btnClass = (solid: boolean) =>
  `inline-block rounded-full px-5 py-2.5 text-sm font-bold transition-colors md:px-6 md:py-3 md:text-base ${
    solid
      ? "bg-[#FCD800] text-[#032A00] hover:bg-white"
      : "border-2 border-[#FCD800] text-[#FCD800] hover:bg-[#FCD800] hover:text-[#032A00]"
  }`;

function Btn({ href, children, solid = true }: { href: string; children: React.ReactNode; solid?: boolean }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={btnClass(solid)}
    >
      {children}
    </a>
  );
}

function OrderBtn({ children, solid = true }: { children: React.ReactNode; solid?: boolean }) {
  const { open } = useContext(CartContext);
  return (
    <button type="button" onClick={open} className={btnClass(solid)}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Mapas y sucursales                                                  */
/* ------------------------------------------------------------------ */

function MapFrame({ src, title }: { src: string; title: string }) {
  const [active, setActive] = useState(false);
  return (
    <div className="relative h-full w-full" onMouseLeave={() => setActive(false)} onClick={() => setActive(true)}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={`h-full w-full border-0 ${active ? "" : "pointer-events-none"}`}
      />
      {active ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActive(false);
          }}
          className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white"
        >
          Salir del mapa
        </button>
      ) : (
        <span className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white">
          Toca el mapa para moverlo
        </span>
      )}
    </div>
  );
}

function Branch({ address, city, maps }: { address: string; city: string; maps: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-sm md:text-base">
      <p className="flex items-start gap-2 text-left">
        <svg
          viewBox="0 0 24 24"
          className="mt-0.5 h-5 w-5 shrink-0 text-[#FCD800]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <span>
          {address}
          <br />
          {city}
        </span>
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Btn href={TEL}>Llamar</Btn>
        <Btn href={maps} solid={false}>
          Cómo llegar
        </Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel del pedido                                                    */
/* ------------------------------------------------------------------ */

const TIPOS = ["A domicilio", "Para llevar", "Comer aquí", "Desde el auto"] as const;
const SUCURSALES = ["Marquis", "Senecú"] as const;
const SALSAS = ["Tomate", "Carablanca"] as const;

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-bold text-white/80">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
              value === o
                ? "border-[#FCD800] bg-[#FCD800] text-[#032A00]"
                : "border-white/40 text-white hover:border-[#FCD800]"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-[#FCD800] focus:outline-none";

function CartPanel({ open, onClose, onClear }: { open: boolean; onClose: () => void; onClear: () => void }) {
  const { cart, add, sub } = useContext(CartContext);
  const status = useOpenStatus();

  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("A domicilio");
  const [sucursal, setSucursal] = useState<(typeof SUCURSALES)[number]>("Marquis");
  const [salsa, setSalsa] = useState<(typeof SALSAS)[number]>("Tomate");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  const lines = Object.entries(cart);
  const total = lines.reduce((s, [, l]) => s + l.price * l.qty, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const send = () => {
    if (lines.length === 0) return setError("Agrega al menos un producto.");
    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (tipo === "A domicilio" && !direccion.trim()) return setError("Escribe tu dirección para la entrega.");
    setError("");

    const msg = [
      "Hola, quiero hacer un pedido en Netoven's Pizza 🍕",
      "",
      "*Pedido*",
      ...lines.map(([n, l]) => `• ${l.qty} x ${n} — $${l.price * l.qty}`),
      "",
      `*Subtotal:* $${total}${tipo === "A domicilio" ? " (más envío, por confirmar)" : ""}`,
      "",
      `*Tipo de pedido:* ${tipo}`,
      `*Sucursal:* ${sucursal}`,
      `*Nombre:* ${nombre.trim()}`,
      ...(tipo === "A domicilio" ? [`*Dirección:* ${direccion.trim()}`] : []),
      `*Salsa base:* ${salsa}`,
      ...(notas.trim() ? [`*Notas:* ${notas.trim()}`] : []),
    ].join("\n");

    window.open(`${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mi pedido"
        className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col text-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: `linear-gradient(160deg, ${GREEN_LIGHT}, ${GREEN_DARK} 70%)` }}
        {...(!open && { inert: true as never })}
      >
        <div className="flex items-center justify-between border-b border-white/20 px-5 py-4">
          <h2 className="text-xl font-bold uppercase text-[#FCD800]">Mi pedido</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="h-9 w-9 rounded-full border border-white/40 text-lg leading-none hover:border-[#FCD800]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4">
          {lines.length === 0 ? (
            <div className="space-y-4 py-10 text-center">
              <p className="text-white/80">Aún no agregas nada. Elige tus pizzas en el menú y toca “Agregar”.</p>
              <button type="button" onClick={onClose} className={btnClass(true)}>
                Seguir viendo el menú
              </button>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {lines.map(([name, l]) => (
                  <li key={name} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{name}</p>
                      <p className="text-xs text-white/70">${l.price} c/u</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => sub(name)}
                          aria-label={`Quitar uno de ${name}`}
                          className="h-7 w-7 rounded-full border border-[#FCD800] text-[#FCD800]"
                        >
                          −
                        </button>
                        <span className="min-w-5 text-center text-sm font-bold">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => add(name, l.price)}
                          aria-label={`Agregar otro ${name}`}
                          className="h-7 w-7 rounded-full border border-[#FCD800] text-[#FCD800]"
                        >
                          +
                        </button>
                      </div>
                      <span className="w-14 text-right text-sm font-bold text-[#FCD800]">${l.price * l.qty}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <button type="button" onClick={onClear} className="text-xs text-white/70 underline hover:text-white">
                Vaciar pedido
              </button>

              <Choice label="¿Cómo lo quieres?" value={tipo} options={TIPOS} onChange={setTipo} />
              <Choice label="Sucursal" value={sucursal} options={SUCURSALES} onChange={setSucursal} />
              <Choice label="Salsa base de tus pizzas" value={salsa} options={SALSAS} onChange={setSalsa} />

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-white/80">Tu nombre</span>
                <input className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </label>

              {tipo === "A domicilio" && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-white/80">Dirección de entrega</span>
                  <input
                    className={inputClass}
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, número y colonia"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-white/80">Notas (opcional)</span>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej. salsa de las alitas, ingredientes de tu pizza de 3…"
                />
              </label>
            </>
          )}
        </div>

        {lines.length > 0 && (
          <div className="space-y-2 border-t border-white/20 px-5 py-4">
            {status && !status.open && (
              <p className="text-xs text-white/80">
                Ahora estamos cerrados: puedes dejar tu pedido y te respondemos al abrir.
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm font-bold text-red-300">
                {error}
              </p>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm">Subtotal</span>
              <span className="text-2xl font-bold text-[#FCD800]">${total}</span>
            </div>
            <p className="text-xs text-white/70">El envío (si aplica) se confirma por WhatsApp.</p>
            <button type="button" onClick={send} className={`${btnClass(true)} w-full text-center`}>
              Enviar pedido por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Datos del menú                                                      */
/* ------------------------------------------------------------------ */

const combos: Item[] = [
  { name: "El Básico Familiar", price: "$255", desc: "Pizza de 1 ingrediente, orden de alitas y soda de 1.5 L." },
  { name: "Doble Pizza", price: "$375", desc: "2 pizzas de 1 ingrediente, orden de alitas y soda de 2.5 L." },
  { name: "Dúo de 3 ingredientes", price: "$320", desc: "2 pizzas de 3 ingredientes, los que tú elijas." },
  {
    name: "Ultimate Combo",
    price: "$820",
    tag: "El más pedido",
    desc: "1 especialidad, 2 pizzas de 3 ingredientes, 2 órdenes de alitas y 2 sodas de 2.5 L.",
  },
];

const salsas: Item[] = [
  { name: "Salsa de tomate", tag: "Tradicional", desc: "Tomate maduro y especias seleccionadas. El sabor auténtico de siempre." },
  { name: "Carablanca", tag: "De la casa", desc: "Nuestra creación exclusiva: especias seleccionadas y ranch. Cremosa y única, solo aquí." },
];

const esp1: Item[] = [
  { name: "Pizza Netovens", price: "$220", tag: "La de la casa", desc: "Pepperoni, champiñón, morrón, cebolla, jalapeño y salchicha italiana." },
  { name: "Pizza Carnívoro", price: "$220", desc: "Pepperoni, tocino, sausage, carne, jamón y salami." },
  { name: "Sweet Pea Pizza", price: "$220", desc: "Espinaca, champiñón, tocino, salchicha italiana y doble queso." },
  { name: "Cowboy Pizza", price: "$220", desc: "Pepperoni, piña, champiñones, cebolla, jalapeño y chorizo." },
  { name: "Pizza Hawaiana", price: "$190", desc: "Piña, jamón, morrón y cereza." },
  { name: "Boneless Pizza", price: "$230", tag: "Nueva", desc: "Pepperoni y boneless en la misma pizza." },
];

const esp2: Item[] = [
  { name: "Pizza Ranchera", price: "$220", desc: "Salami, tomate, cebolla, jalapeño, salchicha italiana y tocino." },
  { name: "Pizza Vegetariana", price: "$220", desc: "Aceitunas, tomate, cebolla, morrón y champiñones." },
  { name: "Tritón", price: "$275", desc: "Camarón, piña, cebolla morada y morrón." },
  { name: "Chicken Pizza", price: "$220", desc: "Pollo, tomate, cebolla, morrón y champiñones." },
  { name: "4 Fantásticos", price: "$220", desc: "Mozzarella, gouda, menonita y suizo." },
  { name: "Crazy Pizza", price: "$220", desc: "Pepperoni, piña, aceitunas, jalapeño, carne y tocino." },
  { name: "La Favorita del Chef", price: "$220", tag: "Top", desc: "Pollo, pepperoni, tocino, piña y salsa secreta del chef." },
];

const clasicas: Item[] = [
  { name: "Pizza Grande Tradicional", price: "$120", desc: "Nuestra base clásica, hecha al momento." },
  { name: "Pepperoni Extra Grande", price: "$175", desc: "Para los que no comparten." },
  { name: "Pepperoni Mediana", price: "$95", desc: "La porción justa para una comida." },
  { name: "Pizza de 3 Ingredientes", price: "$170", desc: "Arma la tuya con tus ingredientes favoritos." },
  { name: "Pepperoni Suprema", price: "$165", desc: "Doble carga de pepperoni y queso extra." },
];

const complementos: Item[] = [
  { name: "Orden de alitas (350 g)", price: "$98", tag: "Popular" },
  { name: "Orden de boneless (350 g)", price: "$120", desc: "Sin hueso, con la salsa que prefieras." },
  { name: "Ensalada de pollo o atún", price: "$115" },
  { name: "Panes de ajo", price: "$80", desc: "Recién horneados." },
  { name: "Panes de canela", price: "$80", desc: "Dulces, perfectos de postre." },
  { name: "Orilla rellena grande", price: "$35" },
  { name: "Orilla rellena XL", price: "$45" },
  { name: "Ranch o parmesano extra", price: "$7" },
];

/* La portada ahora es la pizza que se arma (pizza-hero.tsx),
   así que esta lista empieza directo en los combos. */
const pages: Page[] = [
  {
    menu: true,
    leftBgImage: null,
    rightBgImage: photo("dos-pizzas"),
    leftContent: { heading: "Combos para compartir", description: <MenuList items={combos} /> },
    rightContent: null,
  },
  {
    menu: true,
    leftBgImage: photo("pizza-especialidad-cerca"),
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: "Salsas de la casa",
      description: <MenuList items={salsas} note="Elige tu salsa base al armar tu pedido." />,
    },
  },
  {
    menu: true,
    leftBgImage: null,
    rightBgImage: photo("pizza-carnivoro"),
    leftContent: {
      heading: "Especialidades",
      description: <MenuList items={esp1} note="Todas en tamaño grande." />,
    },
    rightContent: null,
  },
  {
    menu: true,
    leftBgImage: photo("pizza-espinaca"),
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: "Más especialidades",
      description: <MenuList items={esp2} note="Todas en tamaño grande." />,
    },
  },
  {
    menu: true,
    leftBgImage: null,
    rightBgImage: photo("pizza-pepperoni"),
    leftContent: { heading: "Pizzas clásicas", description: <MenuList items={clasicas} /> },
    rightContent: null,
  },
  {
    menu: true,
    leftBgImage: photo("pizza-alitas"),
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: "Alitas y complementos",
      description: (
        <MenuList
          items={complementos}
          note="Salsas: Búfalo, BBQ, BBQ Spicy, Louisiana, Mango Habanero, Lemon Pepper y Sabrosita. Dinos cuál en las notas."
        />
      ),
    },
  },
  {
    menu: true,
    leftBgImage: null,
    rightBgImage: photo("pizza-mitad-mitad"),
    leftContent: {
      heading: "Más que pizza: un pedazo de Juárez",
      description: (
        <div className="max-w-md space-y-3 text-sm md:text-base">
          <p>
            Preparamos cada pizza al momento, con masa fresca del día e ingredientes que elegimos con cuidado. Nada de
            congelados, nada de atajos.
          </p>
          <p>
            Desde nuestras salsas hechas en casa hasta cada topping, buscamos que cada pizza se sienta como hecha en tu
            propia mesa.
          </p>
          <p className="font-bold text-[#FCD800]">Dos sucursales, un solo compromiso.</p>
        </div>
      ),
    },
    rightContent: null,
  },
  {
    leftBgImage: null,
    rightBgImage: null,
    rightMap: MAP_MARQUIS,
    leftContent: {
      heading: "Sucursal Marquis",
      description: (
        <Branch
          address="C. Cam. Viejo a San José 7203,"
          city="Col. Marquis, 32528, Ciudad Juárez, Chihuahua"
          maps="https://www.google.com/maps/search/?api=1&query=C.+Cam.+Viejo+a+San+Jos%C3%A9+7203+Marquis+Ju%C3%A1rez"
        />
      ),
    },
    rightContent: null,
  },
  {
    leftBgImage: null,
    rightBgImage: null,
    leftMap: MAP_SENECU,
    leftContent: null,
    rightContent: {
      heading: "Sucursal Senecú",
      description: (
        <Branch
          address="C. Valle del Sol 1952,"
          city="Partido Senecú, 32422, Ciudad Juárez, Chihuahua"
          maps="https://www.google.com/maps/search/?api=1&query=C.+Valle+del+Sol+1952+Partido+Senec%C3%BA+Ju%C3%A1rez"
        />
      ),
    },
  },
  {
    leftBgImage: null,
    rightBgImage: null,
    leftContent: {
      heading: "Horario",
      description: (
        <div className="flex flex-col items-center space-y-2 text-sm md:text-base">
          <OpenNow className="mb-2" />
          <p>Martes a domingo, 11:00 a.m. – 8:30 p.m.</p>
          <p className="text-white/80">Lunes cerrado</p>
          <p className="text-white/80">Consumo en el lugar, desde el auto o a domicilio.</p>
        </div>
      ),
    },
    rightContent: {
      heading: "¿Antojo? Ordena en un minuto",
      description: (
        <div className="flex flex-col items-center gap-3 text-sm md:text-base">
          <p className="max-w-xs">Confirma cobertura y costo de envío al hacer tu pedido.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <OrderBtn>Armar mi pedido</OrderBtn>
            <Btn href={WA} solid={false}>
              WhatsApp
            </Btn>
            <Btn href={TEL} solid={false}>
              656 207 3084
            </Btn>
          </div>
        </div>
      ),
    },
  },
];

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

const ANIM_MS = 1000;

export default function ScrollAdventure() {
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [inSection, setInSection] = useState(false);
  const numOfPages = pages.length;

  const sectionRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const locked = useRef(false);
  const blockNav = useRef(false);
  const lastFree = useRef(0);
  const touchY = useRef<number | null>(null);
  const touchStart = useRef<{ el: HTMLElement | null; top: number; engaged: boolean }>({
    el: null,
    top: 0,
    engaged: false,
  });

  const openCart = useCallback(() => setCartOpen(true), []);
  const goMenu = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const add = (name: string, price: number) =>
    setCart((c) => ({ ...c, [name]: { price, qty: (c[name]?.qty ?? 0) + 1 } }));

  const sub = (name: string) =>
    setCart((c) => {
      const cur = c[name];
      if (!cur) return c;
      if (cur.qty <= 1) {
        const next = { ...c };
        delete next[name];
        return next;
      }
      return { ...c, [name]: { ...cur, qty: cur.qty - 1 } };
    });

  const lines = Object.values(cart);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);

  useEffect(() => {
    blockNav.current = cartOpen;
  }, [cartOpen]);

  const go = (n: number) => {
    if (locked.current) return;
    const next = Math.min(numOfPages, Math.max(1, n));
    if (next === pageRef.current) return;
    pageRef.current = next;
    locked.current = true;
    setTimeout(() => (locked.current = false), ANIM_MS);
    setCurrentPage(next);
  };
  const step = (dir: 1 | -1) => go(pageRef.current + dir);

  /* ¿Está la sección del menú ocupando toda la pantalla? */
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      setInSection(el.getBoundingClientRect().top <= window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const engaged = () => {
      const el = sectionRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top <= 1 && r.bottom >= window.innerHeight - 1;
    };

    const findScroller = (t: EventTarget | null): HTMLElement | null => {
      let el = t as HTMLElement | null;
      while (el && el !== document.body) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) return el;
        el = el.parentElement;
      }
      return null;
    };

    const panelCanScroll = (t: EventTarget | null, dy: number) => {
      const el = findScroller(t);
      if (!el) return false;
      return dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0;
    };

    /* En el primer o último panel el scroll sale de la sección (sube a la pizza) */
    const atEdge = (dir: 1 | -1) =>
      (dir === 1 && pageRef.current === numOfPages) || (dir === -1 && pageRef.current === 1);

    const onWheel = (e: WheelEvent) => {
      if (blockNav.current) return; // carrito abierto: scroll normal
      if (!engaged()) {
        lastFree.current = Date.now();
        return; // pizza o transición: scroll normal de la página
      }
      // al llegar desde la pizza, absorbe la inercia para no saltar de panel
      if (Date.now() - lastFree.current < 450) {
        e.preventDefault();
        return;
      }
      if (panelCanScroll(e.target, e.deltaY)) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      if (atEdge(dir)) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < 6) return;
      step(dir);
    };

    const onKey = (e: KeyboardEvent) => {
      if (blockNav.current) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (!engaged()) return;
      const dir = e.key === "ArrowDown" ? 1 : -1;
      if (atEdge(dir)) return;
      e.preventDefault();
      step(dir);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (blockNav.current) return;
      const el = findScroller(e.target);
      touchStart.current = { el, top: el ? el.scrollTop : 0, engaged: engaged() };
      touchY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchY.current === null) return;
      if (blockNav.current || !touchStart.current.engaged) {
        touchY.current = null;
        return;
      }
      const { el, top } = touchStart.current;
      if (el && el.scrollTop !== top) {
        touchY.current = null;
        return;
      }
      const d = touchY.current - e.changedTouches[0].clientY;
      touchY.current = null;
      if (Math.abs(d) > 50) {
        const dir = d > 0 ? 1 : -1;
        if (!atEdge(dir)) step(dir);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const half = (
    side: "left" | "right",
    bgImage: string | null,
    content: Content | null,
    isActive: boolean,
    menu?: boolean,
    map?: string
  ) => {
    const pos = side === "left" ? "top-0 left-0" : "top-1/2 left-0 md:top-0 md:left-1/2";
    const off =
      side === "left"
        ? "translate-y-full max-md:translate-y-0 max-md:-translate-x-full"
        : "-translate-y-full max-md:translate-y-0 max-md:translate-x-full";
    const mobileMenu = menu ? (content ? "max-md:top-0 max-md:h-full" : "max-md:hidden") : "";
    const box = `absolute h-1/2 w-full transition-transform duration-[1000ms] md:h-full md:w-1/2 ${pos} ${mobileMenu} ${
      isActive ? "translate-x-0 translate-y-0" : off
    }`;

    if (map) {
      return (
        <div className={box}>
          <MapFrame src={map} title="Mapa de la sucursal" />
        </div>
      );
    }

    return (
      <div className={box}>
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: bgImage
              ? `url(${bgImage})`
              : `linear-gradient(135deg, ${GREEN_LIGHT}, ${GREEN_DARK})`,
          }}
        >
          <div className="flex h-full flex-col overflow-y-auto overscroll-contain p-5 pt-20 pb-20 text-white md:p-8">
            {content && (
              <div className="m-auto flex w-full flex-col items-center text-center">
                {content.heading && (
                  <>
                    <h2
                      className="text-center text-3xl leading-tight text-[#FCD800] md:text-5xl"
                      style={{ fontFamily: DISPLAY }}
                    >
                      {content.heading}
                    </h2>
                    <span className="mb-5 mt-3 block h-1 w-16 rounded-full bg-[#FCD800]" />
                  </>
                )}
                <div className="flex w-full flex-col items-center text-center text-base md:text-lg">
                  {content.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <CartContext.Provider value={{ cart, add, sub, open: openCart }}>
      <div className="bg-black" style={{ fontFamily: BODY }}>
        {/* 1. La pizza que se arma mientras bajas */}
        <PizzaHero onOrder={openCart} onMenu={goMenu} />

        {/* 2. El menú con el scroll dividido */}
        <div ref={sectionRef} className="relative h-screen overflow-hidden bg-black">
          {pages.map((page, i) => {
            const isActive = currentPage === i + 1;
            return (
              <div
                key={i}
                className="absolute inset-0"
                aria-hidden={!isActive}
                {...(!isActive && { inert: true as never })}
              >
                {half("left", page.leftBgImage, page.leftContent, isActive, page.menu, page.leftMap)}
                {half("right", page.rightBgImage, page.rightContent, isActive, page.menu, page.rightMap)}
              </div>
            );
          })}
        </div>

        {/* Elementos fijos */}
        <div
          className="pointer-events-none fixed left-4 top-3 z-10 leading-none text-[#FCD800] md:left-7 md:top-5"
          style={{ fontFamily: DISPLAY, textShadow: "0 2px 10px rgba(0,0,0,.45)" }}
          aria-label="Netoven’s Pizzas"
        >
          <span className="block text-2xl md:text-4xl">Netoven’s</span>
          <span className="mt-1 block text-xs tracking-[0.3em] text-white md:text-sm">PIZZAS</span>
        </div>

        <button
          type="button"
          onClick={openCart}
          className="fixed right-4 top-4 z-10 rounded-full bg-[#FCD800] px-4 py-2 text-sm font-bold text-[#032A00] shadow-lg transition-colors hover:bg-white"
        >
          Ordenar
        </button>

        {inSection && (
          <nav aria-label="Secciones" className="fixed right-3 top-1/2 z-10 grid -translate-y-1/2 gap-2.5">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i + 1)}
                aria-label={`Ir a la sección ${i + 1}`}
                className="h-3 w-3 rounded-full border-2 border-[#FCD800]"
                style={{ backgroundColor: currentPage === i + 1 ? YELLOW : "transparent" }}
              />
            ))}
          </nav>
        )}

        <OpenNow className="fixed bottom-4 left-4 z-10 max-w-[52vw]" />

        <button
          type="button"
          onClick={openCart}
          aria-label={`Abrir mi pedido, ${count} productos`}
          className="fixed bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-[#FCD800] px-4 py-3 text-sm font-bold text-[#032A00] shadow-xl transition-colors hover:bg-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L21 7H6" />
          </svg>
          {count > 0 ? `Mi pedido · ${count} · $${total}` : "Mi pedido"}
        </button>

        <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} onClear={() => setCart({})} />
      </div>
    </CartContext.Provider>
  );
}
