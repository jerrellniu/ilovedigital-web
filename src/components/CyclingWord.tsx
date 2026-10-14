'use client';

import { useEffect, useState } from 'react';

const STEP_MS = 2200;

/**
 * A highlighted word that cycles through a list, for the hero outcome lines
 * ("We put your loyalty card in your customer's phone", then membership, then
 * business...). The first word is in the server HTML, so the sentence reads
 * whole before any script runs. Screen readers get every option once, as a
 * plain list, instead of a word that keeps changing. It only moves while its
 * slide is showing, and never for visitors who ask for reduced motion.
 */
export default function CyclingWord({ words, active }: { words: string[]; active: boolean }) {
  const [i, setI] = useState(0);
  const [still, setStill] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setStill(mq.matches);
    const onChange = () => setStill(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Start from the first word each time the slide comes back into view.
  useEffect(() => {
    if (!active) setI(0);
  }, [active]);

  useEffect(() => {
    if (!active || still || words.length < 2) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % words.length), STEP_MS);
    return () => window.clearInterval(t);
  }, [active, still, words.length]);

  const spoken =
    words.length > 1 ? `${words.slice(0, -1).join(', ')} or ${words[words.length - 1]}` : words[0];

  return (
    <>
      <span className="sr-only">{spoken}</span>
      <span aria-hidden="true" key={i} className="cycle-word font-semibold text-accent">
        {words[i]}
      </span>
    </>
  );
}
