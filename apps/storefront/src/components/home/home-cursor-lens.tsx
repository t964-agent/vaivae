"use client";

import { useEffect, useRef } from "react";

export function HomeCursorLens({ disabled }: { disabled: boolean }) {
  const lensRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lens = lensRef.current;

    if (!lens || disabled || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let visible = false;
    let frame = 0;

    const showAtPointer = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!visible) {
        visible = true;
        lens.style.opacity = "1";
      }
    };

    const hide = () => {
      visible = false;
      lens.style.opacity = "0";
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      lens.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      frame = window.requestAnimationFrame(loop);
    };

    lens.style.opacity = "0";
    window.addEventListener("mousemove", showAtPointer, { passive: true });
    window.addEventListener("mouseleave", hide);
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", showAtPointer);
      window.removeEventListener("mouseleave", hide);
    };
  }, [disabled]);

  if (disabled) {
    return null;
  }

  return (
    <div
      ref={lensRef}
      className="pointer-events-none fixed top-0 left-0 z-[90] size-80 rounded-full bg-[radial-gradient(circle,rgba(255,220,170,.16),rgba(255,120,40,.04)_50%,transparent_75%)] opacity-0 mix-blend-screen blur-[28px] transition-opacity duration-500 ease-out will-change-[transform,opacity] max-md:hidden"
      id="cursor-lens"
    />
  );
}
