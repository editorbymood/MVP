import React, { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";

const BLUR = 12;
const FADE_IN = { type: "spring", stiffness: 300, damping: 30 };
const FADE_OUT = { type: "spring", stiffness: 80, damping: 26 };
const LAYERS = 6;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ScrollBlurEssential(props) {
  const { direction = "bottom" } = props;
  const containerRef = useRef(null);
  const sb = useMotionValue(0);
  const active = useRef(false);
  const idle = useRef(null);
  const controls = useRef(null);

  useIsoLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const write = v => node.style.setProperty("--sb", String(Math.max(0, v)));
    write(sb.get());
    const unsub = sb.on("change", write);
    return unsub;
  }, [sb]);

  useEffect(() => {
    const HOLD_MS = 180;
    const clearIdle = () => {
      if (idle.current) {
        clearTimeout(idle.current);
        idle.current = null;
      }
    };
    const onScroll = () => {
      if (!active.current) {
        active.current = true;
        controls.current = animate(sb, 1, FADE_IN);
      }
      clearIdle();
      idle.current = setTimeout(() => {
        active.current = false;
        controls.current = animate(sb, 0, FADE_OUT);
      }, HOLD_MS);
    };
    const opts = { passive: true, capture: true };
    window.addEventListener("scroll", onScroll, opts);
    return () => {
      window.removeEventListener("scroll", onScroll, opts);
      clearIdle();
      if (controls.current) controls.current.stop();
    };
  }, [sb]);

  const gradientDir = direction === "top" ? "to bottom" : "to top";
  const layers = [];
  const step = 100 / LAYERS;
  for (let i = 0; i < LAYERS; i++) {
    const b = (BLUR * (i + 1)) / LAYERS;
    const coverTop = 100 - i * step;
    const fadeStart = Math.max(0, coverTop - step);
    const mask = `linear-gradient(${gradientDir}, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${fadeStart}%, rgba(0,0,0,0) ${coverTop}%)`;
    const filter = `blur(calc(var(--sb, 0) * ${b}px))`;
    layers.push(
      <div
        key={i}
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: filter,
          WebkitBackdropFilter: filter,
          WebkitMaskImage: mask,
          maskImage: mask,
          pointerEvents: "none",
        }}
      />
    );
  }
  const containerStyle = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    pointerEvents: "none",
  };
  return (
    <div ref={containerRef} style={containerStyle}>
      {layers}
    </div>
  );
}
