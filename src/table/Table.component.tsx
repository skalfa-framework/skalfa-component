"use client"

import { isValidElement, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownZA, faArrowUpAZ, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { ApiFilterType, cn, pcn, useLazySearch, useResponsive } from "@utils";
import { ControlBarComponent, ControlBarOptionType } from "./ControlBar.component";
import { PaginationComponent, PaginationProps } from "./Pagination.component";
import { ScrollContainerComponent } from "../wrap/ScrollContainer.component";
import { FilterColumnOption } from "./FilterComponent";
import { CheckboxComponent } from "../input/Checkbox.component";
import { SwipeComponent, SwipeActionType } from "../wrap/Swipe.component";

type CT = "controller-bar" | "head-column" | "column" | "row" | "floating-action" | "base";

export interface TableColumnType {
  selector    :  string;
  label       :  string | ReactNode;
  width      ?:  string;
  sortable   ?:  boolean;
  searchable ?:  boolean;
  filterable ?:  boolean | {
    type      : "text" | "number" | "currency" | "date";
  } | {
    type      :  "select";
    options   :  { label: string; value: any }[];
  };
  className  ?:  string;
  item       ?:  (data: any) => string | ReactNode;
  tip        ?:  string | ((data: any) => string);
}

export interface TableProps {
  id                        ?: string;
  
  controlBar                ?:  false | ControlBarOptionType[];

  columns                    :  TableColumnType[];
  data                       :  Record<string, any>[];
  pagination                ?:  PaginationProps | false;

  loading                   ?:  boolean;
  sortBy                    ?:  string[];
  onChangeSortBy            ?:  (sort: string[]) => void;
  search                    ?:  string;
  onChangeSearch            ?:  (search: string) => void;
  searchableColumn          ?:  string[];
  onChangeSearchableColumn  ?:  (column: string) => void;
  filter                    ?:  ApiFilterType[];
  onChangeFilter            ?:  (filters: ApiFilterType[]) => void;
  checks                    ?:  (string | number)[];
  onChangeChecks            ?:  (checks: (string | number)[]) => void;
  actionBulking             ?:  ((checks: (string | number)[]) => ReactNode) | false;
  focus                     ?:  number | null;
  setFocus                  ?:  (focus: number | null) => void; 

  onRowClick                ?:  (data: Record<string, any>, key: number) => void;
  onRefresh                 ?:  () => void;

  block                     ?: boolean;
  noIndex                   ?: boolean;
  responsiveControl         ?: {
    mobile                ?: {
      item                ?:  (item: Record<string, any>, key: number) => ReactNode,
      leftActionControl   ?:  Omit<SwipeActionType, "onAction"> & { onAction?: (item: Record<string, any>, key?: number) => void },
      rightActionControl  ?:  Omit<SwipeActionType, "onAction"> & { onAction?: (item: Record<string, any>, key?: number) => void },
    }
  };

  /** Use custom class with: "controller-bar::", "head-column::", "column::", "floating-action::", "row::". */
  className?: string;
}

export function TableComponent({
  id,
  controlBar,
  columns,
  data,
  pagination,
  loading,
  
  sortBy,
  onChangeSortBy,
  search,
  onChangeSearch,
  searchableColumn,
  onChangeSearchableColumn,
  filter,
  onChangeFilter,
  checks,
  onChangeChecks,
  actionBulking,
  focus,

  onRowClick,
  onRefresh,
  
  block,
  noIndex,
  responsiveControl,
  
  className = "",
}: TableProps) {
  const [displayColumns, setDisplayColumns]              =  useState<string[]>([]);
  const [showFloatingAction, setShowFloatingAction]      =  useState(false);
  const [floatingActionActive, setFloatingActionActive]  =  useState<false | number>(false);
  const [keyword, setKeyword]                            =  useState<string>("");
  const [keywordSearch]                                  =  useLazySearch(keyword);
  const { isSm }                                         =  useResponsive();

  const actionColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (columns) setDisplayColumns([...columns.map((column) => column.selector)]);
  }, [columns]);
  

  useEffect(() => {
    setKeyword(search || "");
  }, [search]);


  useEffect(() => {
    keywordSearch ? onChangeSearch?.(keywordSearch) : onChangeSearch?.("");
    
    if(pagination != false) {
      pagination?.onChange?.(pagination.totalRow, pagination.paginate, 1);
    }
  }, [keywordSearch]);

  const columnMapping = useMemo(() => {
    return ( columns?.filter((column) => displayColumns.includes(column.selector)) || []);
  }, [columns, displayColumns]);


  const numberOfRow = (key: number) => pagination && (pagination?.page || 1) != 1 ? pagination?.paginate * ((pagination?.page || 1) - 1) + key + 1 : key + 1;


  function renderHead() {
    return (
      <>
        {columnMapping?.map((column, key) => {
          const sortColumn  = sortBy?.find((e) => e.split(" ")?.at(0) == column.selector)?.split(" ")?.at(0) || "";
          const sortDirection  = sortBy?.find((e) => e.split(" ")?.at(0) == column.selector)?.split(" ")?.at(1) || "";

          return (
            <div
              key={key}
              className={cn(
                "table-head-column",
                column.sortable && "cursor-pointer",
                pcn<CT>(className, "head-column")
              )}
              style={{ width: column.width ? column.width : 200 }}
              onClick={() => column.sortable && onChangeSortBy?.([`${column.selector} ${sortDirection == "desc" ? "asc" : "desc"}`])}
            >
              {column.label}

              {!!sortColumn && (
                <FontAwesomeIcon
                  icon={sortDirection == "desc" ? faArrowDownZA : faArrowUpAZ}
                  className="text-light-foreground/70"
                />
              )}
            </div>
          );
        })}
      </>
    );
  }


  function renderItem(item: Record<string, any>, itemKey: number) {
    const itemMapping = columnMapping.map((column) => {
      if (column?.item) {
        return column.item(item);
      }

      const value = item[column.selector];

      if (isValidElement(value)) {
        return value;
      }

      if (value === null || value === undefined) {
        return "-";
      }

      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      return value;
    });

    if(!isSm || !responsiveControl?.mobile) {
      return (
        <>
          {itemMapping?.map((one, key) => {
            const column = columnMapping?.[key];
          
            let title = one as string;
            if (column?.tip) {
              if (typeof column.tip === "string") {
                title = (item[column.tip as keyof object] as any)?.toString() || "-";
              } else if (typeof column.tip === "function") {
                title = column.tip(item);
              }
            }
            return (
              <div
                key={key}
                className={cn("table-body-column", onRowClick && "cursor-pointer", pcn<CT>(className, "column"))}
                style={{ width: columnMapping?.at(key)?.width || 200 }}
                onClick={() => onRowClick?.(item, itemKey) }
                title={title}
              >
                {one}
              </div>
            );
          })}
        </>
      );
    } else {

      const { onAction: onLeftAction, ...restLeftAction } = responsiveControl?.mobile?.leftActionControl || {};
      const { onAction: onRightAction, ...restRightAction } = responsiveControl?.mobile?.rightActionControl || {};
      
      return (
        <SwipeComponent 
          className="rounded-lg"
          leftActionControl={!!responsiveControl?.mobile?.leftActionControl ? {
            ...restLeftAction,
            ...(onLeftAction ? { onAction: () => onLeftAction?.(item, itemKey)} : {})
          } : undefined}
          rightActionControl={!!responsiveControl?.mobile?.rightActionControl ? {
            ...restRightAction,
            ...(onRightAction ? { onAction: () => onRightAction?.(item, itemKey)} : {})
          } : undefined}
        >
          <div onClick={() => onRowClick?.(item, itemKey)}>
            {responsiveControl?.mobile?.item ? responsiveControl?.mobile?.item(item, itemKey) : (
              <>
                <p className="font-semibold">{Object.values(itemMapping)[0] as any}</p>
                <p className="text-sm">{Object.values(itemMapping)[1] as any}</p>
              </>
            )}
          </div>
        </SwipeComponent>
      );
    }
  }


  return (
    <div className={cn("relative", pcn<CT>(className, "base"))}>
      {controlBar != false && (
        <ControlBarComponent 
          id={id}
          options={!controlBar ? ["SEARCH", "SELECTABLE", "REFRESH"] : controlBar}
          searchableOptions={columns?.filter((c: TableColumnType) => c.searchable)}
          onSearchable={(e) => onChangeSearchableColumn?.(String(e))}
          searchable={searchableColumn || []}
          onSearch={(e) => setKeyword(e)}
          search={keyword}
          selectableOptions={columns}
          onSelectable={(e) => setDisplayColumns(e)}
          selectable={displayColumns}
          sortableOptions={columns?.filter((c: TableColumnType) => c.sortable)}
          sort={sortBy}
          onSort={(sort) => onChangeSortBy?.(sort)}
          onRefresh={() => onRefresh?.()}
          filterableColumns={columns?.filter((c) => !!c?.filterable)?.map((c) => ({
            label: c.label, 
            selector: c.selector, 
            type: typeof c?.filterable == "object" ? c?.filterable?.type : "text",
            options: typeof c?.filterable == "object" &&  c?.filterable?.type == "select" ? c?.filterable?.options : undefined
          })) as FilterColumnOption[]}
          onFilter={(filters) => onChangeFilter?.(filters)}
          filter={filter}
          className={pcn<CT>(className, "controller-bar") || ""}
        />
      )}

      <div className="relative">
        <ScrollContainerComponent
          scrollFloating={!isSm && block}
          className="w-full"
          onScroll={(e) => {
            actionColumnRef.current?.clientWidth &&  e.scrollLeft &&
              setShowFloatingAction(e.scrollLeft + e.clientWidth <=  e.scrollWidth - actionColumnRef.current?.clientWidth);
          }}
          footer={
            <>
              {block && pagination && (
                <>
                  <div className="py-6"></div>
                  <div className="my-2 absolute bottom-0 w-full">
                    <PaginationComponent {...pagination} />
                  </div>
                </>
              )}
            </>
          }
        >
          {loading ? (
            <div className="w-max min-w-full">
              <div className="table-loading-container">
                <h1 className="table-loading-text">
                  Memuat data...
                </h1>
              </div>
            </div>
          ) : !data || !data.length ? (
            <div className="table-empty-container">
              <h1 className="table-empty-text">
                Belum Ada Data
              </h1>
            </div>
          ) : (
            <>
              {!isSm || !responsiveControl?.mobile ? (
                <div className="w-max min-w-full">
                  <div className={cn("table-head-row", pcn<CT>(className, "row"))}>
                    {!!actionBulking && (
                      <div className="table-head-column w-max">
                        <CheckboxComponent
                          name="selected_table"
                          className="w-5 h-5"
                          checked={data.length > 0 && checks?.length === data.length}
                          onChange={() => data.length > 0 && checks?.length === data.length ? onChangeChecks?.([]) : onChangeChecks?.(data.map((d) => d.id))}
                        />
                      </div>
                    )}
                    {!noIndex && <div className={cn("table-head-column w-8", pcn<CT>(className, "head-column"))}>#</div>}
                    {renderHead()}
                  </div>

                  <div className="table-body">
                    {data.map((item: Record<string, any>, key) => {
                      return (
                        <div
                          style={{ animationDelay: `${(key + 1) * 0.05}s` }}
                          className={cn(
                            "table-body-row",
                            key % 2 ? "bg-light-primary/10" : "bg-white",
                            focus == key && "bg-light-primary/30",
                            pcn<CT>(className, "row")
                          )}
                          key={key}
                        >
                          {!!actionBulking && (
                            <div className={cn("table-body-column w-max", pcn<CT>(className, "column"))}>
                              <CheckboxComponent
                                name="selected_table"
                                className="w-5 h-5"
                                checked={checks?.includes(item?.id)}
                                onChange={() => checks?.includes(item?.id) ? onChangeChecks?.(checks.filter((i) => i !== item?.id)) : onChangeChecks?.([...(checks || []), item?.id])}
                              />
                            </div>
                          )}
                          {!noIndex && <div className={cn("table-body-column w-8", pcn<CT>(className, "column"))}>{numberOfRow(key)}</div>}
                          {renderItem(item, key)}
                          <div ref={actionColumnRef} className="table-action-column">
                            {item["action" as keyof object]}
                          </div>

                          {item["action" as keyof object] && showFloatingAction && (
                            <div
                              className={cn("table-floating-action", pcn<CT>(className, "floating-action"))}
                              onClick={() =>
                                floatingActionActive !== false &&
                                floatingActionActive == key ? setFloatingActionActive(false) : setFloatingActionActive(key)
                              }
                            >
                              <div className="table-floating-action-icon-wrapper">
                                <FontAwesomeIcon icon={floatingActionActive === false || floatingActionActive != key ? faChevronLeft : faChevronRight}/>
                              </div>

                              <div className={cn("table-floating-action-content", floatingActionActive === key && "table-floating-action-content-active")}>
                                {item["action" as keyof object]}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="table-mobile-list">
                  {data.map((item: Record<string, any>, key) => {
                    return (
                      <div
                        style={{ animationDelay: `${(key + 1) * 0.05}s` }}
                        key={key}
                      >
                        {renderItem(item, key)}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </ScrollContainerComponent>
      </div>

      {!!actionBulking && !!checks?.length && (
        <div className="table-bulk-actions-bar">
          <div className="table-bulk-actions-title">{checks?.length} Data Terpilih</div>
          <div className="table-bulk-actions-buttons">
            {actionBulking?.(checks)}
          </div>
        </div>
      )}

      {!block && pagination && (
        <div className="table-pagination-desktop">
          <PaginationComponent {...pagination} />
        </div>
      )}

      {pagination && (
        <div className="table-pagination-mobile">
          <PaginationComponent {...pagination} />
        </div>
      )}
    </div>
  );
}
