"use client"

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { cn, pcn } from "@utils";



type CT = "item" | "prev-button" | "next-button" | "navigation" | "base";

interface CarouselItem {
  background   :  string;
  content     ?:  string;
}

interface CarouselProps {
  items          :  CarouselItem[];
  noButton      ?:  boolean;
  noNavigation  ?:  boolean;

  /** Use custom class with: "item::", "prev-button::", "next-button::", "navigation::". */
  className  ?:  string;
}



export function CarouselComponent({
  items,
  className = "",
  noButton,
  noNavigation,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex]  =  useState<number>(0);
  const touchStartX                      =  useRef<number | null>(null);
  const touchEndX                        =  useRef<number | null>(null);
  const intervalRef                      =  useRef<NodeJS.Timeout | null>(null);

  const handlePrev = (): void => setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);

  const handleNext = (): void => setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>): void => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      if (touchStartX.current - touchEndX.current > 50) handleNext();
      if (touchEndX.current - touchStartX.current > 50) handlePrev();
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(handleNext, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className={cn("carousel", pcn<CT>(className, "base"))}>
      <div
        className="carousel-inner"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn("carousel-item", pcn<CT>(className, "item"))}
            style={{ backgroundImage: `url(${item.background})` }}
          >
            {item.content}
          </div>
        ))}
      </div>

      {!noNavigation && (
        <div className={cn("carousel-navigation", pcn<CT>(className, "navigation"))}>
          {items.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${currentIndex === index ? "carousel-indicator-active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></button>
          ))}
        </div>
      )}

      {!noButton && (
        <>
          <button
            className={cn("carousel-btn carousel-prev-btn", pcn<CT>(className, "prev-button"))}
            onClick={handlePrev}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            className={cn("carousel-btn carousel-next-btn", pcn<CT>(className, "next-button"))}
            onClick={handleNext}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      )}
    </div>
  );
}
