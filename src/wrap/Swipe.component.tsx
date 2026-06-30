"use client"

import { ReactNode, useRef, useState } from 'react'
import { cn } from '@utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export type SwipeActionType = {
  label      ?:  string,
  icon       ?:  any,
  onAction   ?:  () => void;
  className  ?:  string;
}

export type SwipeProps = {
  leftActionControl   ?:  SwipeActionType;
  rightActionControl  ?:  SwipeActionType;
  children            ?:  ReactNode;
  className           ?:  string;
};

export function SwipeComponent({
  leftActionControl,
  rightActionControl,
  children,
  className,
} : SwipeProps) {

  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  function onTouchStart(e: React.TouchEvent) {
    setDragging(true);
    startX.current = e.touches[0].clientX - offset;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return;

    const currentX = e.touches[0].clientX;
    const delta = currentX - startX.current;

    let allowed = delta;

    // Jika tidak ada aksi kiri → larang geser ke kanan
    if (!leftActionControl && delta > 0) allowed = 0;

    // Jika tidak ada aksi kanan → larang geser ke kiri
    if (!rightActionControl && delta < 0) allowed = 0;

    // Batasi maksimal ±100px
    allowed = Math.max(Math.min(allowed, 100), -100);

    setOffset(allowed);
  }

  function onTouchEnd() {
    if (!dragging) return;
    setDragging(false);

    if (offset > 40 && leftActionControl) {
      setOffset(80);
    } else if (offset < -40 && rightActionControl) {
      setOffset(-80);
    } else {
      setOffset(0);
    }
  }

  function handleAction(side: 'left' | 'right') {
    const control = side === 'left' ? leftActionControl : rightActionControl;
    control?.onAction?.();
    setOffset(0);
  }
  
  return (
    <div className={cn("swipe-container", className)}>
      <div 
        onClick={() => handleAction('left')}
        className={cn(
          "swipe-left-action", 
          leftActionControl?.className,
          offset > 0 ? "opacity-100" : "opacity-0"
        )}
      >
        {leftActionControl?.icon && <FontAwesomeIcon icon={leftActionControl?.icon} />} {leftActionControl?.label}
      </div>

      <div 
        onClick={() => handleAction('right')}
        className={cn(
          "swipe-right-action", 
          rightActionControl?.className,
          offset < 0 ? "opacity-100" : "opacity-0"
        )}
      >
        {rightActionControl?.icon && <FontAwesomeIcon icon={rightActionControl?.icon} />} {rightActionControl?.label}
      </div>

      <div
        className={cn("swipe-content", className)}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={(e) => {
          if (offset !== 0) {
            setOffset(0);
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}
