"use client"

import { useEffect, useState } from "react";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn, pcn } from "@utils";
import { ButtonComponent } from "../button/Button.component";
import { InputRadioComponent } from "../input/InputRadio.component";

type CT = "item" | "active" | "base";

export interface PaginationProps {
  totalRow    :  number;
  paginate    :  number;
  page        :  number;
  onChange   ?:  (totalRow: number, paginate: number, page: number) => void;
  className  ?:  string;
}

export function PaginationComponent({
  paginate   =  10,
  page       =  1,
  totalRow   =  0,
  onChange,
  className  =  "",
}: PaginationProps) {
  const [pages, setPages]  =  useState<number[]>([]);
  const lastPage           =  Math.ceil(totalRow / paginate);

  useEffect(() => {
    let newPages      =  [];
    if (totalRow > paginate) {
      const start     =  Math.max(1, page - 1);
      const end       =  Math.min(lastPage, page + 1);
      newPages        =  Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else {
      newPages        =  [1];
    }
    setPages(newPages);
  }, [totalRow, page, paginate]);

  if (!totalRow) return null;

  return (
    <div className={cn("pagination-container", pcn<CT>(className, "base"))}>
      <div className="pagination-desktop-wrapper">
        <InputRadioComponent
          name="paginate"
          options={[10, 20, 50].map((val) => ({
            value: val,
            label: String(val),
          }))}
          value={paginate}
          onChange={(e) => onChange?.(totalRow, Number(e), 1)}
          className="pagination-paginate-select"
        />

        {totalRow > paginate && (
          <div className="pagination-desktop-pages">
            {page > 1 && (
              <button
                className="pagination-overflow"
                onClick={() => onChange?.(totalRow, paginate, page - 1)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}

            {page > 2 && (
              <>
                <button
                  className={cn("pagination-item", pcn<CT>(className, "item"))}
                  onClick={() => onChange?.(totalRow, paginate, 1)}
                >
                  1
                </button>
                {page > 3 && <span className="pagination-overflow">...</span>}
              </>
            )}

            {pages.map((p) => (
              <button
                key={p}
                className={cn(
                  "pagination-item",
                  pcn<CT>(className, "item"),
                  p === page && cn("pagination-item-active", pcn<CT>(className, "active"))
                )}
                onClick={() => onChange?.(totalRow, paginate, p)}
              >
                {p}
              </button>
            ))}

            {page < lastPage - 1 && (
              <>
                {page < lastPage - 2 && (
                  <span className="pagination-overflow">...</span>
                )}
                <button
                  className={cn("pagination-item", pcn<CT>(className, "item"))}
                  onClick={() => onChange?.(totalRow, paginate, lastPage)}
                >
                  {lastPage}
                </button>
              </>
            )}

            {page < lastPage && (
              <button
                className="pagination-overflow"
                onClick={() => onChange?.(totalRow, paginate, page + 1)}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="pagination-desktop-info">
        {Math.min(totalRow, paginate * (page - 1) + 1)} - {Math.min(totalRow, paginate * page)} / {totalRow}
      </div>
      

      <div className="pagination-mobile-wrapper">
        <div className="pagination-mobile-info">
          {Math.min(totalRow, paginate * (page - 1) + 1)} - {Math.min(totalRow, paginate * page)} / {totalRow}
        </div>
        
        {totalRow > paginate && (
          <div className="pagination-mobile-controls">
            {page > 1 && (
              <ButtonComponent 
                icon={faChevronLeft}
                onClick={() => onChange?.(totalRow, paginate, page - 1)}
                size="sm"
              />
            )}
            {page < lastPage && (
              <ButtonComponent 
                icon={faChevronRight}
                onClick={() => onChange?.(totalRow, paginate, page + 1)}
                size="sm"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
