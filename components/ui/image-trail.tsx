"use client";

import React, {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useAnimation, useAnimationFrame } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

type TrailSegment = [Record<string, any>, Record<string, any> | undefined];
type TrailAnimationSequence = TrailSegment[];

interface ImageTrailProps {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLElement | null>; // ✅ allow null
  newOnTop?: boolean;
  rotationRange?: number; // degrees
  animationSequence?: TrailAnimationSequence;
  interval?: number; // ms between spawns
}

interface TrailItem {
  id: string;
  x: number; // page clientX
  y: number; // page clientY
  rotation: number;
  animationSequence: TrailAnimationSequence;
  child: React.ReactNode;
}

const DEFAULT_SEQUENCE: TrailAnimationSequence = [
  [{ scale: 1.2 }, { duration: 0.08, ease: [0.22, 1, 0.36, 1] }],
  [{ scale: 0 }, { duration: 0.45, ease: [0.55, 0.06, 0.68, 0.19] }],
];

export const ImageTrail = ({
  children,
  containerRef,
  newOnTop = true,
  rotationRange = 15,
  animationSequence = DEFAULT_SEQUENCE,
  interval = 90,
}: ImageTrailProps) => {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const childrenArray = useMemo(() => Children.toArray(children), [children]);
  const currentIndexRef = useRef(0);
  const lastAddedRef = useRef(0);
  const mouseRef = useRef<{ x: number; y: number; lastMove: number }>({
    x: 0,
    y: 0,
    lastMove: 0,
  });

  // pointer handlers
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.lastMove = performance.now();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      mouseRef.current.x = e.touches[0].clientX;
      mouseRef.current.y = e.touches[0].clientY;
      mouseRef.current.lastMove = performance.now();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const addToTrail = useCallback(
    (clientX: number, clientY: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          return;
        }
      }

      const item: TrailItem = {
        id: uuidv4(),
        x: clientX,
        y: clientY,
        rotation: (Math.random() - 0.5) * rotationRange * 2,
        animationSequence,
        child: childrenArray[currentIndexRef.current] ?? null,
      };

      currentIndexRef.current =
        (currentIndexRef.current + 1) % Math.max(1, childrenArray.length);

      setTrail((prev) => (newOnTop ? [...prev, item] : [item, ...prev]));
    },
    [animationSequence, childrenArray, containerRef, newOnTop, rotationRange]
  );

  useAnimationFrame((time) => {
    const m = mouseRef.current;
    if (!m.lastMove) return;
    if (time - lastAddedRef.current < interval) return;
    if (performance.now() - m.lastMove > 120) return;
    lastAddedRef.current = time;
    addToTrail(m.x, m.y);
  });

  const removeFromTrail = useCallback((id: string) => {
    setTrail((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none">
      {trail.map((item) => (
        <TrailSprite key={item.id} item={item} onComplete={removeFromTrail} />
      ))}
    </div>
  );
};

interface TrailSpriteProps {
  item: TrailItem;
  onComplete: (id: string) => void;
}

const TrailSprite: React.FC<TrailSpriteProps> = ({ item, onComplete }) => {
  const controls = useAnimation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const segment of item.animationSequence) {
        if (cancelled) return;
        const [props, transition] = segment;
        await controls.start({ ...props, transition });
      }
      if (!cancelled) onComplete(item.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [controls, item, onComplete]);

  const style: React.CSSProperties = {
    position: "fixed",
    left: item.x,
    top: item.y,
    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
    pointerEvents: "none",
    zIndex: 9999,
    display: "inline-block",
  };

  return (
    <motion.div initial={{ scale: 0 }} animate={controls} style={style}>
      {item.child}
    </motion.div>
  );
};
