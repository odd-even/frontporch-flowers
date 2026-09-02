"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealVariant = "up" | "fade" | "scale" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** Delay in ms before the enter transition starts once visible. */
  delay?: number;
  /** Intersection threshold 0–1. */
  threshold?: number;
  /** Root margin to trigger a bit early. */
  rootMargin?: string;
  /** Stagger direct children with the same variant. */
  stagger?: boolean;
  /** Delay step between staggered children (ms). */
  staggerMs?: number;
  /** Keep revealed once seen (default true). */
  once?: boolean;
};

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "reveal-up",
  fade: "reveal-fade",
  scale: "reveal-scale",
  left: "reveal-left",
  right: "reveal-right",
};

export function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  threshold = 0.08,
  rootMargin = "0px 0px -40px 0px",
  stagger = false,
  staggerMs = 70,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const revealIfVisible = () => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh - 24 && rect.bottom > 24) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (revealIfVisible()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  const stateClass = visible ? "is-revealed" : "";
  const variantClass = VARIANT_CLASS[variant];

  if (stagger) {
    const items = Children.toArray(children).filter(isValidElement);
    return (
      <div
        ref={ref}
        className={`reveal-stagger ${stateClass} ${className}`.trim()}
        data-revealed={visible ? "true" : "false"}
      >
        {items.map((child, index) => (
          <div
            key={child.key ?? index}
            className={`reveal ${variantClass} h-full w-full min-w-0`}
            style={
              {
                "--reveal-delay": `${delay + index * staggerMs}ms`,
              } as CSSProperties
            }
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass} ${stateClass} ${className}`.trim()}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      data-revealed={visible ? "true" : "false"}
    >
      {children}
    </div>
  );
}
