'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { ExperienceMapData, ExperienceMapNode } from '@/types/content';

/**
 * The career mindmap on the author page. Ported from the approved Claude Design
 * canvas: a 1440x900 composition scaled to its container, with the branch lines
 * drawn once on entry and a slow cyan pulse travelling them afterwards.
 *
 * Every node is a real <button> carrying its own aria-label, and the same role
 * data is rendered again as a plain list below the map. That list is what a
 * crawler, a screen reader and a narrow phone all read, so the evidence on this
 * page never depends on the graphic rendering.
 */

const W = 1440;
const H = 900;
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

function pulseDelay(drawDelay: number) {
  return 3000 + ((drawDelay - 500) / 140) * 220;
}

export default function ExperienceMap({ data, portrait, portraitAlt, name, jobTitle }: {
  data: ExperienceMapData;
  portrait?: string;
  portraitAlt?: string;
  name: string;
  jobTitle: string;
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

  return (
    <div ref={rootRef}>
      <style>{css(data.nodes)}</style>

      {/* Graphic. Hidden from assistive tech: the list below carries the same facts. */}
      <div className="em-scale hidden md:block" aria-hidden="true">
        <div className="em-canvas">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="em-svg">
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
            <div className="em-name">{name}</div>
            <div className="em-role">{jobTitle}</div>
          </div>

          {data.nodes.map((n) => (
            <div
              key={n.id}
              className="em-node"
              style={{
                left: `${n.x}px`,
                top: `${n.y}px`,
                animation: `em-in-${n.id} 900ms ${EASE} ${n.delay + 500}ms both`,
                animationPlayState: state,
              }}
            >
              <button
                type="button"
                className="em-dot"
                style={{
                  width: `${n.size}px`,
                  height: `${n.size}px`,
                  opacity: active && active !== n.id ? 0.45 : 1,
                }}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive((a) => (a === n.id ? null : a))}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive((a) => (a === n.id ? null : a))}
                onClick={() => setActive((a) => (a === n.id ? null : n.id))}
                tabIndex={-1}
              >
                <span className="em-dot-label">{n.label}</span>
              </button>

              {active === n.id ? (
                <div
                  className="em-card"
                  style={{
                    top: `${n.size / 2}px`,
                    [n.side === 'right' ? 'right' : 'left']: `calc(50% + ${n.size / 2 + 16}px)`,
                  }}
                >
                  <div className="em-card-title">{n.label}</div>
                  <div className="em-card-rows">
                    {n.rows.map((r) => (
                      <div key={r.label} className="em-card-row">
                        <span>{r.label}</span>
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

      {/* The same roles as text. Always rendered, and the only version on phones. */}
      <ul className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
        {data.nodes.map((n) => (
          <li key={n.id} className="rounded-2xl bg-surface p-5">
            <div className="font-heading font-bold">{n.label}</div>
            <div className="mt-2 space-y-1">
              {n.rows.map((r) => (
                <div key={r.label} className="flex justify-between gap-4 text-[0.95rem]">
                  <span className="text-muted">{r.label}</span>
                  <span className="font-semibold text-cyan">{r.years}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function css(nodes: ExperienceMapNode[]) {
  const frames = nodes
    .map(
      (n) => `
@keyframes em-draw-${n.id} { from { stroke-dashoffset: ${n.len}; } to { stroke-dashoffset: 0; } }
@keyframes em-pulse-${n.id} { from { stroke-dashoffset: 24; } to { stroke-dashoffset: -${n.len}; } }
@keyframes em-in-${n.id} {
  from { opacity: 0; transform: translate(${n.fromX}px, ${n.fromY}px) scale(0.6); }
  to { opacity: 1; transform: translate(0, 0) scale(1); }
}`,
    )
    .join('\n');

  return `
.em-scale { container-type: inline-size; width: 100%; }
.em-canvas {
  position: relative; width: ${W}px; height: ${H}px;
  transform: scale(calc(100cqw / ${W})); transform-origin: top left;
}
.em-scale { height: calc(100cqw * ${H / W}); }
.em-svg { position: absolute; left: 0; top: 0; pointer-events: none; z-index: 0; }

.em-centre {
  position: absolute; left: 620px; top: 350px; width: 280px; opacity: 0;
  display: flex; flex-direction: column; align-items: center; z-index: 1;
}
.em-portrait {
  width: 240px; height: 240px; border-radius: 50%; overflow: hidden;
  background: #2C2F3A; box-shadow: 0 0 0 1px rgba(28, 191, 212, 0.45);
}
.em-portrait img { width: 240px; height: 240px; object-fit: cover; }
.em-name {
  margin-top: 18px; color: #FFFFFF; font-family: var(--font-heading), sans-serif;
  font-weight: 700; font-size: 24px; letter-spacing: -0.02em;
}
.em-role { margin-top: 5px; color: #BBBBBB; font-size: 14px; }

.em-node {
  position: absolute; width: 170px; opacity: 0; z-index: 1;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
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
.em-dot-label {
  color: #FFFFFF; font-family: var(--font-heading), sans-serif; font-weight: 700;
  font-size: 16px; line-height: 1.15; letter-spacing: -0.02em; padding: 0 16px;
  text-align: center; text-wrap: pretty;
}
.em-card {
  position: absolute; transform: translateY(-50%); width: 230px; background: #2C2F3A;
  border-radius: 16px; padding: 16px; text-align: left; pointer-events: none; z-index: 2;
}
.em-card-title {
  color: #FFFFFF; font-family: var(--font-heading), sans-serif; font-weight: 700;
  font-size: 16px; line-height: 1.25; letter-spacing: -0.01em;
}
.em-card-rows { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.em-card-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; line-height: 1.4; }
.em-card-row span { color: #BBBBBB; }
.em-card-row strong { color: #1CBFD4; font-weight: 600; }

@keyframes em-centre { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
${frames}

@media (prefers-reduced-motion: reduce) {
  .em-canvas *, .em-canvas { transition-duration: 1ms !important; animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
}
`;
}
