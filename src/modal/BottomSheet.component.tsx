"use client"

import { MouseEvent, ReactNode, TouchEvent, useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';
import { cn, pcn } from "@utils";

type CT = "base" | "backdrop" | "footer";

export type BottomSheetProps = {
  show       :  boolean;
  children   :  ReactNode;
  onClose    :  () => void;
  size      ?:  string | number;
  maxSize   ?:  string | number;
  footer    ?:  ReactNode;

   /** Use custom class with: "backdrop::", "footer::". */
  className ?:  string;
};

function sizeToPx(value: string | number | undefined): number {
  if (typeof window === "undefined") return 0;
  if (value === undefined || value === null) return 0;

  if (typeof value === "number") return value;

  const v = value.trim();

  if (v.endsWith("vh")) {
    const n = parseFloat(v.replace("vh", ""));
    return (n / 100) * window.innerHeight;
  }
  if (v.endsWith("px")) {
    return parseFloat(v.replace("px", ""));
  }
  return parseFloat(v) || 0;
}

function findScrollableParent(target: HTMLElement | null, stopAt: HTMLElement | null): HTMLElement | null {
  if (typeof window === "undefined") return null;
  let el = target;
  while (el && el !== stopAt && el !== document.body) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const canScroll = (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight;
    if (canScroll) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

const BottomSheet = ({
  show,
  children,
  onClose,
  size = 500,
  maxSize,
  footer,
  className = "",
}: BottomSheetProps) => {
  const scrollRef  =  useRef<HTMLDivElement | null>(null);
  const sheetRef   =  useRef<HTMLDivElement | null>(null);

  const startY    =  useRef(0);
  const lastY     =  useRef(0);
  const dragging  =  useRef(false);

  const [offset, setOffset]          =  useState(0);
  const [isExpanded, setIsExpanded]  =  useState(false);
  const [isDragging, setIsDragging]  =  useState(false);
  const isClosing                    =  useRef(false);

  const canExpand = Boolean(maxSize) && sizeToPx(maxSize) > sizeToPx(size);
  const realMaxSize = canExpand && (typeof maxSize === "number" || typeof maxSize === "string") ? maxSize : size;
  const canDragUp = canExpand && !isExpanded;

  const clamp = (v: number) => {
    const max = window.innerHeight;
    const min = canDragUp ? -200 : 0;
    return Math.max(min, Math.min(v, max));
  };

  useEffect(() => {
    if (show) {
      lastY.current = 0;
      setOffset(0);
      setIsExpanded(false);
      isClosing.current = false;
    } else {
      const t = setTimeout(() => {
        lastY.current = 0;
        setOffset(0);
        setIsExpanded(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [show]);

  const onStart = (clientY: number, target: EventTarget | null) => {
    const targetEl = target as HTMLElement | null;

    // Abaikan drag jika menekan elemen interaktif seperti button, input, link
    if (targetEl?.closest("button, input, textarea, select, a, [role='button']")) {
      dragging.current = false;
      return;
    }

    // Abaikan drag jika sentuhan berada di dalam elemen yang sedang bisa di-scroll
    const scrollableParent = findScrollableParent(targetEl, sheetRef.current);
    if (scrollableParent) {
      dragging.current = false;
      return;
    }

    dragging.current  =  true;
    startY.current    =  clientY;
    lastY.current     =  offset;
    setIsDragging(true);
  };

  const onMove = (clientY: number) => {
    if (!dragging.current) return;

    const diff = clientY - startY.current;
    setOffset(clamp(lastY.current + diff));
  };

  const onEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);

    const current = offset;

    const thresholdDown = 120;
    const thresholdUp = -40;

    // 1. Expand ke maxSize jika di-drag ke atas melebihi threshold
    if (!isExpanded && current < thresholdUp && canExpand) {
      setIsExpanded(true);
      setOffset(0);
      lastY.current = 0;
      return;
    }

    // 2. Collapse kembali ke size normal jika sedang expanded dan di-drag ke bawah
    if (isExpanded && current > thresholdDown) {
      setIsExpanded(false);
      setOffset(0);
      lastY.current = 0;
      return;
    }

    // 3. Menutup bottom sheet jika di-drag ke bawah melebihi threshold
    if (!isExpanded && current > thresholdDown) {
      if (isClosing.current) return;
      isClosing.current = true;
      setOffset(window.innerHeight);
      setTimeout(() => {
        onClose();
        lastY.current = 0;
        setOffset(0);
        isClosing.current = false;
      }, 300);
      return;
    }

    // 4. Kembali ke posisi 0 (bouncing back smoothly)
    setOffset(0);
    lastY.current = 0;
  };

  const collapsedPx = sizeToPx(size);
  const expandedPx = sizeToPx(realMaxSize);

  const topPx = isExpanded ? window.innerHeight - expandedPx : window.innerHeight - collapsedPx;

  const bindTouch = {
    onTouchStart : (e: TouchEvent) => onStart(e.touches[0].clientY, e.target),
    onTouchMove  : (e: TouchEvent) => onMove(e.touches[0].clientY),
    onTouchEnd   : () => onEnd(),
    onTouchCancel: () => onEnd(),
  };

  const bindMouse = {
    onMouseDown   : (e: MouseEvent) => onStart(e.clientY, e.target),
    onMouseMove   : (e: MouseEvent) => dragging.current && onMove(e.clientY),
    onMouseUp     : () => onEnd(),
    onMouseLeave  : () => onEnd(),
  };

  useEffect(() => {
    if (show) {
      history.pushState({ bottomsheet: true }, "");
    }
  }, [show]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (show) {
        event.preventDefault();

        onClose();
        history.pushState({}, "");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [show, onClose]);

  return (
    <>
      <div
        className={cn(
          "modal-backdrop transition-opacity duration-300",
          !show && "opacity-0 pointer-events-none translate-y-full",
          pcn<CT>(className, "backdrop"),
        )}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className="bottom-sheet"
        style={{
          top: show ? `${topPx}px` : "150vh",
          transform: `translateY(${offset}px)`,
          transition: isDragging
            ? "none"
            : "top 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
          touchAction: "pan-y",
        }}
        {...bindTouch}
        {...bindMouse}
      >
        <div className="bottom-sheet-container">
          <div
            className="bottom-sheet-handle-wrapper"
            style={{ touchAction: "none" }}
          >
            <div className="bottom-sheet-handle" />
          </div>

          <div
            ref={scrollRef}
            className="overflow-y-auto"
            style={{
              height: isExpanded ? realMaxSize : size,
              transition: isDragging
                ? "none"
                : "height 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              touchAction: "pan-y",
              overscrollBehaviorY: "contain",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {show && footer && (
        <div className="bottom-sheet-footer">
          {footer}
        </div>
      )}
    </>
  );
}


export const BottomSheetComponent = dynamic(() => Promise.resolve(BottomSheet), { ssr: false })