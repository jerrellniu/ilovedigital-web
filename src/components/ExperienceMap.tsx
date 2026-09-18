'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { ExperienceMapData, ExperienceMapNode } from '@/types/content';

/**
 * The career mindmap on the author page. Ported from the approved Claude Design
 * canvas: a 1440x900 composition scaled to its container, with the branch lines
 * drawn once on entry and a slow cyan pulse travelling them afterwards.
 *
 * Every node is a real <button> carrying its own aria-label, so the map is
 * reachable by keyboard and readable by a screen reader rather than being a
 * picture. Below the md breakpoint the branch lines and absolute positioning are
 * dropped and the same nodes stack, so the roles are in the server-rendered HTML
 * at every width.
 */

const W = 1440;
const H = 900;
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/** The design's mobile frame scales every circle by 40/60 of its desktop diameter. */
function mobileSize(size: number) {
  return Math.round((size * 2) / 3);
}

/** Role, industry and duration, so the node reads the same aloud as its card does on screen. */
function ariaLabel(n: ExperienceMapNode) {
  const spans = n.rows.map((r) => (r.label ? `${r.label} ${r.years}` : r.years)).join(' and ');
  return n.secondary ? `${n.primary}, ${n.secondary}, ${spans}` : `${n.primary}, ${spans}`;
}

/**
 * The nodes were placed by eye on the 1440x900 design frame, so the drawn composition
 * sits off-centre inside it with wide empty margins. Measure the real bounding box and
 * render only that, which both centres the map and buys back the scale those margins
 * were wasting: at two thirds of a page it is the difference between 9px labels and
 * readable ones.
 */
function bounds(nodes: ExperienceMapNode[], withCentreLabel: boolean) {
  const WRAP = 170; // every node wrapper is this wide; its circle is centred in it
  const CENTRE = { left: 620, right: 900, top: 350, bottom: 350 + 240 + (withCentreLabel ? 72 : 0) };
  const minX = Math.min(CENTRE.left, ...nodes.map((n) => n.x + (WRAP - n.size) / 2));
  const maxX = Math.max(CENTRE.right, ...nodes.map((n) => n.x + (WRAP + n.size) / 2));
  const minY = Math.min(CENTRE.top, ...nodes.map((n) => n.y));
  const maxY = Math.max(CENTRE.bottom, ...nodes.map((n) => n.y + n.size));
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}

function pulseDelay(drawDelay: number) {
  return 3000 + ((drawDelay - 500) / 140) * 220;
}

export default function ExperienceMap({
  data,
  portrait,
  portraitAlt,
  name,
  jobTitle,
  showCentreLabel = true,
}: {
  data: ExperienceMapData;
  portrait?: string;
  portraitAlt?: string;
  name: string;
  jobTitle: string;
  /** Off in the hero, where the H1 and the role line already carry both. */
  showCentreLabel?: boolean;
}) {
  const [play, setPlay] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const state = play ? 'running' : 'paused';
  const box = bounds(data.nodes, showCentreLabel);

  return (
    <div ref={rootRef}>
      <style>{css(data.nodes, box)}</style>

      {/* Graphic. Hidden from assistive tech: the list below carries the same facts. */}
      <div className="em-scale hidden md:block">
        <div className="em-canvas">
          <svg
            viewBox={`${box.minX} ${box.minY} ${box.width} ${box.height}`}
            preserveAspectRatio="xMidYMid meet"
            className="em-svg"
          >
            <g fill="none" stroke="rgba(28, 191, 212, 0.35)" strokeWidth={1}>
              {data.nodes.map((n) => (
                <path
                  key={`d-${n.id}`}
                  d={n.path}
                  style={{
                    strokeDasharray: n.len,
                    strokeDashoffset: n.len,
                    animation: `em-draw-${n.id} 1000ms ${EASE} ${n.delay}ms both`,
                    animationPlayState: state,
                  }}
                />
              ))}
            </g>
            <g fill="none" stroke="#1CBFD4" strokeWidth={1.5} strokeLinecap="round" opacity={0.85}>
              {data.nodes.map((n) => (
                <path
                  key={`p-${n.id}`}
                  d={n.path}
                  style={{
                    strokeDasharray: `24 ${n.len}`,
                    strokeDashoffset: 24,
                    animation: `em-pulse-${n.id} 4200ms linear ${pulseDelay(n.delay)}ms infinite`,
                    animationPlayState: state,
                  }}
                />
              ))}
            </g>
          </svg>

          <div
            className="em-centre"
            style={{ animation: `em-centre 900ms ${EASE} 120ms both`, animationPlayState: state }}
          >
            <div className="em-portrait">
              {portrait ? (
                <Image src={portrait} alt={portraitAlt ?? name} width={480} height={480} />
              ) : null}
            </div>
            {showCentreLabel ? (
              <>
                <div className="em-name">{name}</div>
                <div className="em-role">{jobTitle}</div>
              </>
            ) : null}
          </div>

          {data.nodes.map((n) => (
            <div
              key={n.id}
              className="em-node"
              style={{
                left: `calc(${n.x - box.minX} * var(--u))`,
                top: `calc(${n.y - box.minY} * var(--u))`,
                animation: `em-in-${n.id} 900ms ${EASE} ${n.delay + 500}ms both`,
                animationPlayState: state,
              }}
            >
              <button
                type="button"
                aria-label={ariaLabel(n)}
                className="em-dot"
                style={{
                  width: `calc(${n.size} * var(--u))`,
                  height: `calc(${n.size} * var(--u))`,
                  opacity: active && active !== n.id ? 0.45 : 1,
                }}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive((a) => (a === n.id ? null : a))}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive((a) => (a === n.id ? null : a))}
                onClick={() => setActive((a) => (a === n.id ? null : n.id))}
              >
                <span className="em-dot-label">{n.primary}</span>
              </button>

              {active === n.id ? (
                <div
                  className="em-card"
                  style={{
                    top: `calc(${n.size / 2} * var(--u))`,
                    [n.side === 'right' ? 'right' : 'left']: `calc(50% + ${n.size / 2 + 16} * var(--u))`,
                  }}
                >
                  <div className="em-card-title">{n.primary}</div>
                  {n.secondary ? <div className="em-card-sub">{n.secondary}</div> : null}
                  <div className="em-card-rows">
                    {n.rows.map((r) => (
                      <div key={r.label ?? r.years} className="em-card-row">
                        <span>{r.label ?? ''}</span>
                        <strong>{r.years}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Phones get the same nodes stacked, without the branches. */}
      <div className="em-mob mt-2 grid gap-8 sm:grid-cols-2 md:hidden">
        {data.nodes.map((n) => (
          <div key={n.id} className="flex flex-col items-center gap-4 text-center">
            <div className="em-dot em-dot-static" style={{ width: `${mobileSize(n.size)}px`, height: `${mobileSize(n.size)}px` }}>
              <span className="em-dot-label">{n.primary}</span>
            </div>
            <div className="w-full max-w-[16rem]">
              {n.secondary ? <div className="text-[0.95rem] text-faint">{n.secondary}</div> : null}
              <div className="mt-1 space-y-1">
                {n.rows.map((r) => (
                  <div key={r.label ?? r.years} className="flex justify-between gap-4 text-[0.95rem]">
                    <span className="text-muted">{r.label ?? ''}</span>
                    <span className="font-semibold text-cyan">{r.years}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function css(nodes: ExperienceMapNode[], box: ReturnType<typeof bounds>) {
  const frames = nodes
    .map(
      (n) => `
@keyframes em-draw-${n.id} { from { stroke-dashoffset: ${n.len}; } to { stroke-dashoffset: 0; } }
@keyframes em-pulse-${n.id} { from { stroke-dashoffset: 24; } to { stroke-dashoffset: -${n.len}; } }
@keyframes em-in-${n.id} {
  from { opacity: 0; transform: translate(calc(${n.fromX} * var(--u)), calc(${n.fromY} * var(--u))) scale(0.6); }
  to { opacity: 1; transform: translate(0, 0) scale(1); }
}`,
    )
    .join('\n');

  return `
/*
 * Every length below is a multiple of --u, one design pixel of the 1440-wide
 * canvas expressed in real pixels. That keeps the composition fluid without a
 * scale() transform, which cannot take a length.
 */
.em-scale { container-type: inline-size; width: 100%; --u: calc(100cqw / ${box.width}); }
.em-canvas { position: relative; width: 100%; height: calc(${box.height} * var(--u)); }

.em-svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 0; }

.em-centre {
  position: absolute; left: calc(${620 - box.minX} * var(--u)); top: calc(${350 - box.minY} * var(--u));
  width: calc(280 * var(--u)); opacity: 0;
  display: flex; flex-direction: column; align-items: center; z-index: 1;
}
.em-portrait {
  width: calc(240 * var(--u)); height: calc(240 * var(--u)); border-radius: 50%;
  overflow: hidden; background: #2C2F3A; box-shadow: 0 0 0 1px rgba(28, 191, 212, 0.45);
}
.em-portrait img { width: 100%; height: 100%; object-fit: cover; }
.em-name {
  margin-top: calc(18 * var(--u)); color: #FFFFFF; font-family: var(--font-heading), sans-serif;
  font-weight: 700; font-size: calc(24 * var(--u)); letter-spacing: -0.02em; white-space: nowrap;
}
.em-role { margin-top: calc(5 * var(--u)); color: #BBBBBB; font-size: calc(14 * var(--u)); white-space: nowrap; }

.em-node {
  position: absolute; width: calc(170 * var(--u)); opacity: 0; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
}
.em-dot {
  padding: 0; border-radius: 50%; cursor: pointer;
  background: rgba(28, 191, 212, 0.10); border: 1px solid rgba(28, 191, 212, 0.45);
  display: flex; align-items: center; justify-content: center;
  transition: background 200ms ${EASE}, border-color 200ms ${EASE},
    transform 200ms ${EASE}, opacity 200ms ${EASE};
}
.em-dot:hover, .em-dot:focus-visible {
  background: rgba(28, 191, 212, 0.20); border-color: #1CBFD4; transform: translateY(-4px);
  outline: none; box-shadow: 0 0 0 3px rgba(28, 191, 212, 0.55);
}
.em-dot-static { cursor: default; }
.em-dot-label {
  color: #FFFFFF; font-family: var(--font-heading), sans-serif; font-weight: 700;
  font-size: max(11px, calc(16 * var(--u))); line-height: 1.15; letter-spacing: -0.02em;
  padding: 0 calc(16 * var(--u)); text-align: center; text-wrap: pretty;
}
.em-card {
  position: absolute; transform: translateY(-50%); width: calc(230 * var(--u));
  background: #2C2F3A; border-radius: calc(16 * var(--u)); padding: calc(16 * var(--u));
  text-align: left; pointer-events: none; z-index: 2;
}
.em-card-title {
  color: #FFFFFF; font-family: var(--font-heading), sans-serif; font-weight: 700;
  font-size: calc(16 * var(--u)); line-height: 1.25; letter-spacing: -0.01em;
}
.em-card-sub { margin-top: calc(4 * var(--u)); color: #8E9099; font-size: calc(13 * var(--u)); line-height: 1.4; }
.em-card-rows { margin-top: calc(10 * var(--u)); display: flex; flex-direction: column; gap: calc(6 * var(--u)); }
.em-card-row { display: flex; justify-content: space-between; gap: calc(12 * var(--u)); font-size: calc(13 * var(--u)); line-height: 1.4; }
.em-card-row span { color: #BBBBBB; }
.em-card-row strong { color: #1CBFD4; font-weight: 600; }

/* Phone layout: no canvas, so the circles get their own fixed sizes. */
.em-mob .em-dot-label { font-size: 15px; padding: 0 14px; }

@keyframes em-centre { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
${frames}

@media (prefers-reduced-motion: reduce) {
  .em-canvas *, .em-canvas { transition-duration: 1ms !important; animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
}

`;
}
