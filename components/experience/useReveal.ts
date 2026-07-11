"use client";

import { useEffect, type RefObject } from "react";

/**
 * Adds the `.in` class to every `.exp-reveal` element inside `rootRef` as it
 * scrolls into view, driving the fade-up beat animations (decoupled from the
 * smooth-scroll engine for robustness).
 */
export function useReveal(rootRef: RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>(".exp-reveal"));

    if (!enabled) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef, enabled]);
}
