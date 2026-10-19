"use client";

import React, { memo, useEffect, useRef } from "react";
import { startPizza } from "./pizza-engine";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Karla:wght@400;700&display=swap');
.nvp{font-family:Karla,system-ui,sans-serif;color:#fff;background:#010D01}
.nvp *{box-sizing:border-box}
.nvp-story{height:800vh;position:relative}
.nvp-stage{position:sticky;top:0;height:100vh;height:100svh;display:grid;grid-template-columns:1fr 1fr;align-items:center;overflow:hidden;background:linear-gradient(135deg,#067401,#010D01)}
.nvp-bar{position:absolute;top:0;left:0;height:4px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:#FCD800;z-index:5}
.nvp-copy{position:relative;display:grid;align-self:stretch;padding:0 4vw 0 7vw}
.nvp-step{grid-area:1/1;align-self:center;max-width:30rem;opacity:0;visibility:hidden;transform:translateY(26px);transition:opacity .5s,transform .5s,visibility .5s}
.nvp-step.on{opacity:1;visibility:visible;transform:none}
.nvp-step h1,.nvp-step h2{font-family:"Alfa Slab One",Georgia,serif;font-weight:400;color:#FCD800;line-height:1.05;margin:0 0 .5em}
.nvp-step h1{font-size:clamp(2.2rem,5vw,4.2rem)}
.nvp-step h2{font-size:clamp(1.8rem,3.6vw,3rem)}
.nvp-step p{font-size:clamp(1rem,1.5vw,1.3rem);line-height:1.55;margin:0 0 1.2rem}
.nvp-row{display:flex;flex-wrap:wrap;gap:.8rem}
.nvp-btn{display:inline-block;padding:.7rem 1.3rem;border-radius:999px;border:2px solid #FCD800;background:#FCD800;color:#032A00;font:700 1rem Karla,system-ui,sans-serif;cursor:pointer;transition:background .2s,color .2s}
.nvp-btn:hover{background:#fff;border-color:#fff}
.nvp-btn.ghost{background:transparent;color:#FCD800}
.nvp-btn.ghost:hover{background:#FCD800;color:#032A00;border-color:#FCD800}
.nvp-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
.nvp-hint{display:flex;align-items:center;gap:.5rem;font-size:.95rem;opacity:.8}
.nvp-hint svg{animation:nvp-bob 1.4s ease-in-out infinite}
@keyframes nvp-bob{50%{transform:translateY(6px)}}
.nvp-art{height:100%;min-height:0;display:grid;place-items:center}
.nvp-art svg{width:min(88%,78vh);height:auto;overflow:visible}
.nvp-fl{transform-box:fill-box;transform-origin:50% 100%;animation:nvp-flame .45s ease-in-out infinite alternate}
@keyframes nvp-flame{to{transform:scale(.9,1.15)}}
.nvp-st{transform-box:fill-box;transform-origin:50% 100%;animation:nvp-rise 3.2s ease-out infinite}
@keyframes nvp-rise{0%{transform:translateY(0) scale(.7);opacity:0}25%{opacity:.7}100%{transform:translateY(-70px) scale(1.6);opacity:0}}
.nvp-ticks{position:absolute;left:7vw;bottom:9vh;display:flex;align-items:center;gap:6px;font-size:.85rem;opacity:.9}
.nvp-ticks i{display:block;width:22px;height:4px;border-radius:2px;background:#ffffff40;transition:background .3s}
.nvp-ticks i.on{background:#FCD800}
.nvp-ticks span{margin-left:8px}
@media (max-width:800px){
  .nvp-stage{grid-template-columns:1fr;grid-template-rows:54% 46%}
  .nvp-art{grid-row:1;padding-top:84px}
  .nvp-art svg{width:auto;height:100%;max-width:100%}
  .nvp-copy{grid-row:2;padding:0 20px;align-self:stretch}
  .nvp-step{align-self:start;max-width:none}
  .nvp-ticks{left:20px;bottom:8vh}
  .nvp-step h1{font-size:2.1rem}
  .nvp-step h2{font-size:1.7rem}
}
@media (prefers-reduced-motion:reduce){.nvp-fl,.nvp-st,.nvp-hint svg{animation:none}.nvp-step{transition:none}}
`;

const SVG = `
<svg viewBox="0 0 240 270" role="img" aria-label="Una pizza que se arma mientras haces scroll">
  <defs>
    <radialGradient id="gDough" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#F9E8BC"/><stop offset=".7" stop-color="#EBC77D"/><stop offset="1" stop-color="#DDAF5E"/></radialGradient>
    <radialGradient id="gBall" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#7a5320" stop-opacity=".35"/></radialGradient>
    <radialGradient id="gSauce" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#E24E36"/><stop offset=".65" stop-color="#BA2718"/><stop offset="1" stop-color="#8C150C"/></radialGradient>
    <radialGradient id="gGloss"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="gChA" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFF4C8"/><stop offset=".7" stop-color="#F6D98A"/><stop offset="1" stop-color="#EBC163"/></radialGradient>
    <radialGradient id="gChB" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#FCEBAA"/><stop offset=".7" stop-color="#F0CB72"/><stop offset="1" stop-color="#E4B755"/></radialGradient>
    <radialGradient id="gPep" cx=".4" cy=".35" r=".85"><stop offset="0" stop-color="#D9573E"/><stop offset=".6" stop-color="#B22B1C"/><stop offset="1" stop-color="#84160E"/></radialGradient>
    <radialGradient id="gOli" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#4a4a4a"/><stop offset="1" stop-color="#111"/></radialGradient>
    <radialGradient id="gJal" cx=".4" cy=".35" r=".9"><stop offset="0" stop-color="#B9E066"/><stop offset="1" stop-color="#6A9E1E"/></radialGradient>
    <radialGradient id="gLeaf" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#4DB35A"/><stop offset="1" stop-color="#1F7A31"/></radialGradient>
    <radialGradient id="gVig" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#8A4410" stop-opacity="0"/><stop offset="1" stop-color="#8A4410" stop-opacity=".7"/></radialGradient>
    <radialGradient id="gChar"><stop offset="0" stop-color="#2E1304" stop-opacity=".95"/><stop offset="1" stop-color="#2E1304" stop-opacity="0"/></radialGradient>
    <radialGradient id="gBub" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#E2A04A"/><stop offset="1" stop-color="#A9611A"/></radialGradient>
    <radialGradient id="gBoard" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7B5231"/><stop offset="1" stop-color="#4A2E17"/></radialGradient>
    <radialGradient id="gGlow"><stop offset="0" stop-color="#FF9A2E" stop-opacity=".85"/><stop offset="1" stop-color="#FF9A2E" stop-opacity="0"/></radialGradient>

    <filter id="fGrain" filterUnits="userSpaceOnUse" x="-20" y="-120" width="280" height="400">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .55  0 0 0 0 .36  0 0 0 0 .12  0 0 0 1.5 -.62" result="s"/>
      <feComposite in="s" in2="SourceGraphic" operator="in" result="sp"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sp"/></feMerge>
    </filter>
    <filter id="fGrain2" filterUnits="userSpaceOnUse" x="-20" y="-120" width="280" height="400">
      <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="8" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .75  0 0 0 0 .5  0 0 0 0 .15  0 0 0 1.2 -.55" result="s"/>
      <feComposite in="s" in2="SourceGraphic" operator="in" result="sp"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sp"/></feMerge>
    </filter>
    <filter id="fBlotch" filterUnits="userSpaceOnUse" x="-20" y="-120" width="280" height="400">
      <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="9" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .62  0 0 0 0 .3  0 0 0 0 .04  2.6 0 0 0 -1" result="b"/>
      <feComposite in="b" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="fWood" filterUnits="userSpaceOnUse" x="-20" y="-120" width="280" height="400">
      <feTurbulence type="fractalNoise" baseFrequency=".012 .55" numOctaves="2" seed="2" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .15  0 0 0 0 .08  0 0 0 0 .02  0 0 0 2.2 -.9" result="w"/>
      <feComposite in="w" in2="SourceGraphic" operator="in" result="wi"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="wi"/></feMerge>
    </filter>
    <filter id="fShadow" filterUnits="userSpaceOnUse" x="-20" y="-120" width="280" height="400">
      <feDropShadow dx="1" dy="2" stdDeviation="1.4" flood-color="#000" flood-opacity=".45"/>
    </filter>
    <filter id="fSlice" filterUnits="userSpaceOnUse" x="-40" y="-140" width="320" height="440">
      <feDropShadow dx="2" dy="5" stdDeviation="3.2" flood-color="#000" flood-opacity=".5"/>
    </filter>
    <filter id="fSoft" filterUnits="userSpaceOnUse" x="-40" y="-140" width="320" height="440"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="fSteam" filterUnits="userSpaceOnUse" x="-40" y="-140" width="320" height="440"><feGaussianBlur stdDeviation="4"/></filter>

    <clipPath id="cutOut"><path clip-rule="evenodd" d="M-100 -100H400V400H-100Z M120 120L120 -30L226.1 13.9Z"/></clipPath>
    <clipPath id="wedge"><path d="M120 120L120 -30L226.1 13.9Z"/></clipPath>
    <g id="pz"></g>
  </defs>

  <circle id="glow" cx="120" cy="130" r="150" fill="url(#gGlow)" opacity="0"/>
  <g id="flames"></g>
  <g id="board" opacity=".35">
    <circle cx="120" cy="120" r="113" fill="url(#gBoard)" filter="url(#fWood)"/>
    <circle cx="120" cy="120" r="113" fill="none" stroke="#2F1C0C" stroke-width="2" opacity=".6"/>
    <circle cx="120" cy="120" r="106" fill="none" stroke="#9A6B3F" stroke-width=".8" opacity=".5"/>
  </g>
  <ellipse id="shd" cx="124" cy="128" rx="0" ry="0" fill="#000" opacity=".4" filter="url(#fSoft)"/>
  <g id="flour" fill="#fff"></g>
  <use id="main" href="#pz"/>
  <g id="lines" fill="none" stroke="#1C1411" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round">
    <line x1="22" y1="120" x2="218" y2="120" stroke-dasharray="196" stroke-dashoffset="196"/>
    <line x1="22" y1="120" x2="218" y2="120" stroke-dasharray="196" stroke-dashoffset="196" transform="rotate(45 120 120)"/>
    <line x1="22" y1="120" x2="218" y2="120" stroke-dasharray="196" stroke-dashoffset="196" transform="rotate(90 120 120)"/>
    <line x1="22" y1="120" x2="218" y2="120" stroke-dasharray="196" stroke-dashoffset="196" transform="rotate(135 120 120)"/>
  </g>
  <g id="slice" style="display:none" filter="url(#fSlice)"><g clip-path="url(#wedge)"><use href="#pz"/></g></g>
  <g id="strings" fill="none" stroke="#F7DE92" stroke-linecap="round"></g>
  <g id="steam" opacity="0" fill="#fff" filter="url(#fSteam)"></g>
</svg>
`;

type Props = { onOrder: () => void; onMenu: () => void };

function PizzaHero({ onOrder, onMenu }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return startPizza(ref.current);
  }, []);

  return (
    <section ref={ref} className="nvp" aria-label="Cómo se prepara una pizza Netoven’s">
      <style>{CSS}</style>
      <div className="nvp-story">
        <div className="nvp-stage">
          <div className="nvp-bar" />
          <div className="nvp-copy">
            <div className="nvp-step on">
              <h1>Así se arma una Netoven’s</h1>
              <p>Baja despacio. Te la preparamos paso a paso, desde cero.</p>
              <div className="nvp-hint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
                Baja para empezar
              </div>
            </div>
            <div className="nvp-step">
              <h2>Primero, la masa</h2>
              <p>Masa fresca del día, estirada para que cada orilla quede en su punto.</p>
            </div>
            <div className="nvp-step">
              <h2>Salsa hecha en casa</h2>
              <p>Tomate, la de siempre, o Carablanca, la que solo encuentras aquí. Tú eliges.</p>
            </div>
            <div className="nvp-step">
              <h2>Queso, el que alcanza</h2>
              <p>Una capa generosa que se funde de orilla a orilla.</p>
            </div>
            <div className="nvp-step">
              <h2>Tus ingredientes</h2>
              <p>Pepperoni, aceitunas, jalapeño y más. Los ponemos al momento, nada de congelados.</p>
            </div>
            <div className="nvp-step">
              <h2>Directo al horno</h2>
              <p>Se hornea cuando la pides, para que llegue caliente y recién hecha.</p>
            </div>
            <div className="nvp-step">
              <h2>Lista para tu mesa</h2>
              <p>Come en el lugar, pídela desde el auto o te la llevamos a domicilio.</p>
              <div className="nvp-row">
                <button type="button" className="nvp-btn" onClick={onOrder}>
                  Armar mi pedido
                </button>
                <button type="button" className="nvp-btn ghost" onClick={onMenu}>
                  Ver el menú
                </button>
              </div>
            </div>
            <div className="nvp-ticks" aria-hidden="true" />
          </div>
          <div className="nvp-art" dangerouslySetInnerHTML={{ __html: SVG }} />
        </div>
      </div>
    </section>
  );
}

export default memo(PizzaHero);
