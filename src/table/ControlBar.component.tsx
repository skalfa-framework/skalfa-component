"use client"

import { ReactNode, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownZA, faArrowUpAZ, faEllipsisV, faEyeLowVision, faMagnifyingGlass, faPlus, faRefresh, faSearch, faSliders, faSort } from '@fortawesome/free-solid-svg-icons';
import { ApiFilterType, cn, conversion, shortcut, useResponsive } from '@utils';
import { useToggleContext } from '@contexts';
import { InputCheckboxComponent } from "../input/InputCheckbox.component";
import { InputComponent } from "../input/Input.component";
import { SelectComponent } from "../input/Select.component";
import { OutsideClickComponent } from "../wrap/OutsideClick.component";
import { ButtonComponent } from "../button/Button.component";
import { BottomSheetComponent } from "../modal/BottomSheet.component";
import { FilterComponent, FilterColumnOption } from "./FilterComponent";

export type ControlBarOptionType = "SEARCH" | "SEARCHABLE" | "FILTER" | "SELECTABLE" | "REFRESH" | ReactNode;

export interface ControlBarProps {
  id                 ?:  string;
  options            ?:  ControlBarOptionType[];
  className          ?:  string
  search             ?:  string,
  onSearch           ?:  (searchable: string) => void,
  searchableOptions  ?:  {label: string | ReactNode, selector: string}[]
  searchable         ?:  string[],
  onSearchable       ?:  (searchable: string[]) => void,
  selectableOptions  ?:  {label: string | ReactNode, selector: string}[]
  selectable         ?:  string[],
  onSelectable       ?:  (searchable: string[]) => void,
  sortableOptions    ?:  {label: string | ReactNode, selector: string}[]
  sort               ?:  string[],
  onSort             ?:  (sort: string[]) => void,
  filterableColumns  ?:  FilterColumnOption[],
  onFilter           ?:  (filters: ApiFilterType[]) => void,
  filter             ?:  ApiFilterType[],
  onRefresh          ?:  () => void,
}

export function ControlBarComponent({
  id = "",
  options, 
  className, 
  search, 
  onSearch, 
  searchableOptions,
  searchable,
  onSearchable,
  selectableOptions,
  selectable,
  onSelectable,
  sortableOptions,
  sort,
  onSort,
  filterableColumns,
  onFilter,
  filter,
  onRefresh
}: ControlBarProps) {
  const {toggle, setToggle}  =  useToggleContext()
  const { isSm }             =  useResponsive();

  const searchRef             =  useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (options?.includes("SEARCH")) {
      shortcut.register("ctrl+s", () => {
        searchRef.current?.focus()
      }, "Cari")
    }

    if (options?.includes("FILTER")) {
      shortcut.register("ctrl+f", () => {
        setToggle("FILTER")
      }, "Filter")
    }

    if (options?.includes("SORT")) {
      shortcut.register("ctrl+o", () => {
        setToggle("SORT")
      }, "Urutkan")
    }

    if (options?.includes("SELECTABLE")) {
      shortcut.register("ctrl+l", () => {
        setToggle("SELECTABLE")
      }, "Kolom Ditampilkan")
    }

    if (options?.includes("REFRESH")) {
      shortcut.register("ctrl+shift+r", () => {
        onRefresh?.()
      }, "Refresh Tabel")
    }

    return () => {
      options?.includes("SEARCH") && shortcut.unregister("ctrl+s")
      options?.includes("FILTER") && shortcut.unregister("ctrl+f")
      options?.includes("SORT") && shortcut.unregister("ctrl+o")
      options?.includes("SELECTABLE") && shortcut.unregister("ctrl+l")
      options?.includes("REFRESH") && shortcut.unregister("ctrl+shift+r")
    }
  }, [options])

  const onChangeSort = (item: string) => {
    if(!!sort?.find((s) => s.split(" ")?.at(0) == item)) {
      const findSort = sort.find((s) => s.split(" ")?.at(0) == item);

      if (findSort?.split(" ")?.at(1) == "desc") {
        onSort?.(sort.filter((s) => s != findSort));
      } else {
        const newSorts = [...sort];
        newSorts[newSorts?.findIndex((s) => s == findSort)] = `${item} desc`
        onSort?.(newSorts);
      }
    } else {
      onSort?.([...(sort || []), `${item} asc`])
    }
  }
  
  return (
    <>
      <div className={cn("control-bar", className)}>
        {(isSm ? [
          ...(options?.filter((op, iop) => iop == 0 || op == "REFRESH") || []), 
          ...(options && options?.length > 1 ? ['MOBILE_OPTION'] : [])
        ] : options)?.map((option: ControlBarOptionType, key: number) => {
          {
            // =========================>
            // ## Create button 
            // =========================>
          }
          if (option == "CREATE") {
            return (
              <div className="control-bar-create-wrapper" key="button-add">
                <ButtonComponent
                  icon={faPlus}
                  label="Tambah Data"
                  size="sm"
                  onClick={() => setToggle(`MODAL_FORM_${conversion.strSnake(id).toUpperCase()}`)}
                />
              </div>
            );
          }

          {
            // =========================>
            // ## Search Field
            // =========================>
          }
          if (option == "SEARCH") {
            const searchable = !!options?.find((option) => option == "SEARCHABLE");

            return (
              <div className={cn("control-bar-search-wrapper", searchable ? "control-bar-search-wrapper-searchable" : "control-bar-search-wrapper-standalone")} key={key}>
                <InputComponent
                  ref={searchRef}
                  name="search"
                  placeholder="Cari disini..."
                  rightIcon={faMagnifyingGlass}
                  value={search}
                  onChange={(e) => onSearch?.(e)}
                  className={cn("control-bar-search-input", searchable && "control-bar-search-input-searchable")}
                />
              </div>
            );
          }

          {
            // =========================>
            // ## Searchable Field
            // =========================>
          }
          if (option == "SEARCHABLE") {
            return searchableOptions?.length ? (
              <div className="control-bar-searchable-wrapper" key={key}>
                <SelectComponent
                  name="searchableColumn"
                  leftIcon={faSearch}
                  options={searchableOptions?.map((column) => {
                    return {
                      label: column.label,
                      value: column.selector,
                    };
                  }) || []}
                  value={searchable}
                  onChange={(e) => onSearchable?.(e as string[])}
                  className="control-bar-searchable-select"
                  multiple
                />
              </div>
            ) : <></>;
          }

          {
            // =========================>
            // ## Selectable Button
            // =========================>
          }
          if (option == "SELECTABLE") {
            return (
              <div className="control-bar-button-wrapper" key={key}>
                <ButtonComponent
                  icon={faEyeLowVision}
                  variant="outline"
                  className="control-bar-icon-button"
                  onClick={() => setToggle("SELECTABLE")}
                  size="sm"
                />
                <OutsideClickComponent onOutsideClick={() => setToggle("SELECTABLE", false)}>
                  <div
                    className={cn(
                      "control-bar-dropdown",
                      !toggle.SELECTABLE && "control-bar-dropdown-hidden"
                    )}
                  >
                    <p className='control-bar-dropdown-title'>Kolom Ditampilkan</p>
                    <InputCheckboxComponent
                      vertical
                      name="show_column"
                      options={selectableOptions?.map((option) => {
                        return {
                          label: option.label as string,
                          value: option.selector,
                        };
                      })}
                      onChange={(e) => onSelectable?.(Array().concat(e).map((val) => String(val)))}
                      value={selectable}
                      className='control-bar-selectable-checkbox-list'
                      classNameCheckbox='control-bar-selectable-checkbox label::text-xs'
                    />
                  </div>
                </OutsideClickComponent>
              </div>
            );
          }

          {
            // =========================>
            // ## Sort Button
            // =========================>
          }
          if (option == "SORT") {
            return sortableOptions?.length ? (
              <div className="control-bar-button-wrapper" key={key}>
                <ButtonComponent
                  icon={faSort}
                  variant="outline"
                  className="control-bar-icon-button"
                  onClick={() => setToggle("SORT")}
                  size="sm"
                />
                <OutsideClickComponent onOutsideClick={() => setToggle("SORT", false)}>
                  <div
                    className={cn(
                      "control-bar-dropdown",
                      !toggle.SORT && "control-bar-dropdown-hidden"
                    )}
                  >
                    <p className='control-bar-dropdown-title'>Urut Berdasarkan</p>
                    <div className='control-bar-sort-list'>
                      {sortableOptions?.map((option, key) => {
                        const sortBy = sort?.find((s) => s.split(" ")?.at(0) == option?.selector)?.split(" ")?.at(1) || "";
                        return (
                          <div 
                            key={key}
                            className={cn('control-bar-sort-item', !!sortBy && "control-bar-sort-item-active")}
                            onClick={() => onChangeSort(option.selector)}
                          >
                            <p>{option.label}</p>

                            {sortBy && (
                              <div className='control-bar-sort-active-icon'>
                                <FontAwesomeIcon icon={sortBy == "desc" ? faArrowDownZA : faArrowUpAZ} className='control-bar-sort-icon' /> 
                                {sort?.length && sort?.length > 1 && <span className='control-bar-sort-badge'>{sort.findIndex((s) => s.split(" ")?.at(0) == option?.selector) + 1}</span>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </OutsideClickComponent>
              </div>
            ) : <></>;
          }

          {
            // =========================>
            // ## Refresh Button 
            // =========================>
          }
          if (option == "REFRESH") {
            return (
              <div className="control-bar-button-wrapper-refresh" key={key}>
                <ButtonComponent
                  icon={faRefresh}
                  variant="outline"
                  className="control-bar-icon-button"
                  onClick={() => onRefresh?.()}
                  size="sm"
                />
              </div>
            );
          }

          {
            // =========================>
            // ## Filter Button 
            // =========================>
          }
          if (option == "FILTER") {
            return (
              <div className="control-bar-button-wrapper" key={key}>
                <ButtonComponent
                  icon={faSliders}
                  label="Filter"
                  variant="outline"
                  className="control-bar-filter-button"
                  onClick={() => setToggle("FILTER")}
                  size="sm"
                />
              </div>
            );
          }

          {
            // =========================>
            // ## Mobile option button
            // =========================>
          }
          if (option == "MOBILE_OPTION") {
            return (
              <div className="control-bar-button-wrapper" key={key}>
                <ButtonComponent
                  icon={faEllipsisV}
                  variant="outline"
                  className="control-bar-icon-button"
                  onClick={() => setToggle("MOBILE_OPTION")}
                  size="sm"
                />
              </div>
            );
          }

          return option;
        })}
      </div>

      {!!filterableColumns && !!filterableColumns?.length && (
        <FilterComponent 
          className={cn(
            !toggle.FILTER ? "control-bar-filter-panel-hidden" : "control-bar-filter-panel"
          )}
          columns={filterableColumns}
          onChange={onFilter}
          value={filter}
          onMinimize={() => setToggle("FILTER")}
        />
      )}

      {isSm && (
        <BottomSheetComponent
          show={!!toggle["MOBILE_OPTION"]}
          onClose={() => setToggle("MOBILE_OPTION", false)}
          maxSize="98vh"
        >
          <div className='control-bar-mobile-container'>
            {options?.filter((op, iop) => (iop != 0 && op != "CREATE" && op != "REFRESH"))?.map((option: ControlBarOptionType, key: number) => {
              {
                // =========================>
                // ## Search Field
                // =========================>
              }
              if (option == "SEARCH") {
                return (
                  <div key={key}>
                    <InputComponent
                      name="search"
                      placeholder="Cari disini..."
                      rightIcon={faMagnifyingGlass}
                      value={search}
                      onChange={(e) => onSearch?.(e)}
                    />
                  </div>
                );
              }

              {
                // =========================>
                // ## Searchable Field
                // =========================>
              }
              if (option == "SEARCHABLE") {
                return searchableOptions?.length ? (
                  <div key={key}>
                    <SelectComponent
                      name="searchableColumn"
                      leftIcon={faSearch}
                      options={searchableOptions?.map((column) => {
                        return {
                          label: column.label,
                          value: column.selector,
                        };
                      }) || []}
                      value={searchable}
                      onChange={(e) => onSearchable?.(e as string[])}
                      multiple
                    />
                  </div>
                ) : <></>;
              }

              {
                // =========================>
                // ## Selectable Button
                // =========================>
              }
              if (option == "SELECTABLE") {
                return (
                  <div key={key}>
                    <p className='control-bar-mobile-title'>Kolom Ditampilkan</p>
                    <InputCheckboxComponent
                      vertical
                      name="show_column"
                      options={selectableOptions?.map((option) => {
                        return {
                          label: option.label as string,
                          value: option.selector,
                        };
                      })}
                      onChange={(e) => onSelectable?.(Array().concat(e).map((val) => String(val)))}
                      value={selectable}
                      className='control-bar-mobile-checkbox-list'
                      classNameCheckbox='control-bar-selectable-checkbox label::text-xs'
                    />
                  </div>
                );
              }

              {
                // =========================>
                // ## Sort Button
                // =========================>
              }
              if (option == "SORT") {
                return sortableOptions?.length ? (
                  <div key={key}>
                    <p className='control-bar-mobile-title'>Urut Berdasarkan</p>
                    <div className='flex flex-col'>
                      {sortableOptions?.map((option, key) => {
                        const sortBy = sort?.find((s) => s.split(" ")?.at(0) == option?.selector)?.split(" ")?.at(1) || "";
                        return (
                          <div 
                            key={key}
                            className={cn('control-bar-mobile-sort-item', !!sortBy && "control-bar-mobile-sort-item-active")}
                            onClick={() => onChangeSort(option.selector)}
                          >
                            <p>{option.label}</p>

                            {sortBy && (
                              <div className='text-primary'>
                                <FontAwesomeIcon icon={sortBy == "desc" ? faArrowDownZA : faArrowUpAZ} className='text-xs' /> 
                                {sort?.length && sort?.length > 1 && <span className='text-[9px] ml-1'>{sort.findIndex((s) => s.split(" ")?.at(0) == option?.selector) + 1}</span>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : <></>;
              }

              {
                // =========================>
                // ## Filter 
                // =========================>
              }
              if (option == "FILTER") {
                return (
                  <div key={key}>
                    {filterableColumns && filterableColumns?.length && (
                      <FilterComponent
                        className='control-bar-mobile-filter title::text-xs'
                        columns={filterableColumns}
                        onChange={onFilter}
                        value={filter}
                      />
                    )}
                  </div>
                );
              }

              return option;
            })}
          </div>
        </BottomSheetComponent>
      )}
    </>
  )
}
