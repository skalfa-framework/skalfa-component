"use client"

import { ReactNode, Suspense, useEffect, useMemo } from "react";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { faEdit, faFileExcel, faFilePdf, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ApiType, cn, conversion, FetchControlType, registry, shortcut, ShortcutHandler, UseResourceIdb, UseResourceProps, useResponsive, useTable } from "@utils";
import { useToggleContext } from "@contexts";
import { FloatingPageComponent, FloatingPageProps } from "../modal/FloatingPage.component";
import { ButtonComponent, ButtonProps } from "../button/Button.component";
import { TableColumnType, TableComponent, TableProps } from "../table/Table.component";
import { FormSupervisionComponent, FormType } from "./FormSupervision.component";
import { ModalConfirmComponent, ModalConfirmProps } from "../modal/ModalConfirm.component";
import { TypographyColumnComponent } from "../typography/TypographyColumn.component";
import { ControlBarOptionType } from "../table/ControlBar.component";
import { BottomSheetComponent } from "../modal/BottomSheet.component";

const ExportExcel = registry.get("ExportExcel");
const ImportExcel = registry.get("ImportExcel");



export interface TableSupervisionColumnProps {
  selector     :  string;
  label       ?:  string;
  width       ?:  string;
  sortable    ?:  boolean;
  searchable  ?:  boolean;
  filterable  ?:  boolean | {
    type       :  "text" | "number" | "currency" | "date";
  } | {
    type       :  "select";
    options    :   { label: string; value: any }[];
  };
  accessCode  ?:  string;
  item        ?:  (data: any) => string | ReactNode;
  tip         ?:  string | ((data: any) => string);
  exportable  ?:  boolean | "default" | "optional" | "hidden";
  importable  ?:  boolean;
}

export interface TableSupervisionFormProps {
  fields                :  string[] | (FormType & { visibility?: "*" | "create" | "update" })[];
  defaultValue        ?:  (item: Record<string, any> | null) => Promise<Record<string, any>> | Record<string, any>;
  payload             ?:  (values: any) => Promise<Record<string, any>> | object;
  modalControl        ?:  Omit<FloatingPageProps, "show" | "onClose" | "children">;
  contentType         ?:  "application/json" | "multipart/form-data";
}


export type TableSupervisionDetailProps = boolean 
  | (
    | string 
    | { label: string, item: string | ((data: Record<string, any>) => ReactNode), conversion?: keyof typeof conversion }
    | ((data: Record<string, any>) => ReactNode)
  )[] 
  | ((data: Record<string, any>) => void)
  | {
      modal?: Omit<FloatingPageProps, "show" | "onClose" | "children">;
      content?: boolean 
        | (
          | string 
          | { label: string, item: string | ((data: Record<string, any>) => ReactNode), conversion?: keyof typeof conversion }
          | ((data: Record<string, any>) => ReactNode)
        )[] 
        | ((data: Record<string, any>) => ReactNode);
      action?: (data: Record<string, any>) => void;
    };

export type TableSupervisionProps = {
  fetchControl     :  UseResourceProps;
  title           ?:  string;
  id              ?:  string;
  accessCode      ?:  number;
  urlParam        ?:  boolean | { compressed    ?:  boolean };
  columnControl   ?:  string[] | TableSupervisionColumnProps[];
  formControl     ?:  TableSupervisionFormProps;
  detailControl   ?:  TableSupervisionDetailProps;
  actionControl   ?:  boolean | (
    | 'EDIT' | 'DELETE' | {
      label           :  string,
      modal          ?:  Omit<ModalConfirmProps, "show" | "onClose">,
      button         ?:  ButtonProps,
      shortcut       ?:  { key: string, description: string },
    } | ((
      row              :  Record<string, any>,
      setModal         :  (type: "EDIT" | "DELETE") => void,
      setDataSelected ?:  () => void,
      setShortcut     ?:  (key: string, handler: ShortcutHandler, description?: string) => void
    ) => ReactNode)
  )[];
  block                ?:  boolean,
  noIndex              ?: boolean;
  actionBulkingControl ?:  TableProps["actionBulking"],
  controlBar           ?:  (ControlBarOptionType | "CREATE" | "IMPORT" | "EXPORT" | "PRINT")[];
  responsiveControl    ?:  {
    mobile            ?:  TableProps["responsiveControl"] extends { mobile?: infer M } ? M | boolean : boolean;
  };
  importControl        ?:  FetchControlType;
};



export function TableSupervisionComponent({
  title,
  id,
  fetchControl,
  columnControl,
  formControl,
  detailControl,
  actionControl,
  actionBulkingControl,
  block,
  controlBar,
  noIndex,
  responsiveControl,
  urlParam,
  importControl,
}: TableSupervisionProps) {
  const { tableKey, tableControl, data, selected, setSelected, checks, setChecks, reset, focus }  =  useTable(fetchControl, id, title, (urlParam || true))
  const { setToggle, toggle }                                                                               =  useToggleContext()
  const { isSm }                                                                                            =  useResponsive();

  const isDetailControlObject = detailControl && typeof detailControl === "object" && !Array.isArray(detailControl);
  const detailAction = isDetailControlObject 
    ? (detailControl as any)?.action 
    : (typeof detailControl === "function" ? detailControl : undefined);
  const detailContent = isDetailControlObject 
    ? (detailControl as any)?.content 
    : (typeof detailControl === "function" ? undefined : detailControl);
  const detailModalProps = isDetailControlObject 
    ? (detailControl as any)?.modal 
    : undefined;

  const toggleKey = useMemo(() => conversion.strSnake(tableKey).toUpperCase(), [tableKey])

  // ============================
  // ## Shortcut register
  // ============================
  useEffect(() => {
    if(!isSm) {
      if (controlBar == undefined || controlBar?.includes("CREATE")) {
        shortcut.register("alt+n", () => {
          setToggle(`MODAL_FORM_${toggleKey}`)
          setSelected(null)
        }, "Tambah Data Baru")
      }
  
      if (controlBar?.includes("IMPORT")) {
        shortcut.register("alt+i", () => {
          setToggle(`MODAL_IMPORT_${toggleKey}`)
        }, "Import Data Dari Excel")
      }
  
      if (controlBar?.includes("EXPORT")) {
        shortcut.register("alt+e", () => {
          setToggle(`MODAL_EXPORT_${toggleKey}`)
        }, "Export Data Ke Excel")
      }
    }

    return () => {
      if(!isSm) {
        shortcut.unregister("alt+n")
        shortcut.unregister("alt+i")
        shortcut.unregister("alt+e")
      }
    }
  }, [controlBar, isSm])


  useEffect(() => {
    if(actionControl && Array.isArray(actionControl) && selected) {
      actionControl.filter((ac) => typeof ac == "object")?.forEach((ac) => {
        if(typeof ac == "object" && ac?.shortcut) {
          shortcut.register(ac.shortcut.key, () => {
            setToggle(`MODAL_${conversion.strSnake(ac.label).toUpperCase()}_${toggleKey}`)
          }, ac.shortcut.description)
        }
      })
    }

    return () => {
      if(actionControl && Array.isArray(actionControl)) {
        actionControl.filter((ac) => typeof ac == "object")?.forEach((ac) => {
          if(typeof ac == "object" && ac?.shortcut) {
            shortcut.unregister(ac.shortcut.key)
          }
        })
      }
    }
  }, [actionControl, selected])



  const columns: TableSupervisionColumnProps[] = useMemo(() => {
    return columnControl ? columnControl.map((col) => {
      if(typeof col == "string") {
        return {
          selector  :  col,
          label     :  col,
        };
      } else {
        return { ...col };
      }
    })
  : data?.columns || data?.data?.at(0) ? Object.keys(data.data[0]).map((col) => {
      return {
        selector  :  col,
        label     :  col,
      };
    })
  : [];
  }, [columnControl, data]);



  const renderTableAction = (
    actions             :  TableSupervisionProps["actionControl"],
    item               ?:  Record<string,                          any>,
    options            ?:  {size?: ButtonProps['size'], className?: string}
  ) => {
    return (
      <>
        <div className={cn("table-supervision-action-list", options?.className)}>
          {(Array.isArray(actions) ? actions : (actions || actions == undefined) ? ['EDIT', "DELETE"] : [])?.map((action, key) => {
            if(action == "EDIT") {
              return (
                <ButtonComponent
                  key={key}
                  icon={faEdit}
                  label={"Ubah"}
                  variant="outline"
                  paint="warning"
                  size={options?.size || "xs"}
                  rounded
                  onClick={() => {
                    setToggle(`MODAL_FORM_${toggleKey}`);
                    item && setSelected?.(item);
                  }}
                />
              )
            }

            if(action == "DELETE") {
              return (
                <ButtonComponent
                  key={key}
                  icon={faTrash}
                  label={"Hapus"}
                  variant="outline"
                  paint="danger"
                  size={options?.size || "xs"}
                  rounded
                  onClick={() => {
                    setToggle(`MODAL_DELETE_${toggleKey}`);
                    item && setSelected?.(item);
                  }}
                />
              )
            }

            if (typeof action == "object") {
              return (
                <ButtonComponent
                  key={key}
                  label={action.label}
                  variant="outline"
                  paint="primary"
                  size={options?.size || "xs"}
                  rounded
                  onClick={() => {
                    setToggle(`MODAL_${conversion.strSnake(action.label).toUpperCase()}_${toggleKey}`);
                    item && setSelected?.(item);
                  }}
                  {...action.button}
                />
              )
            }

            if (typeof action == "function") {
              return (
                <div key={key}>
                  {action(
                    item || {}, 
                    (type) => {
                      setToggle(`MODAL_${type}_${toggleKey}`)
                      item && setSelected?.(item)
                    },
                    () => item && setSelected?.(item)
                  )}
                </div>
              )
            }
          })}
        </div>
      </>
    )
  }




  // ============================
  // ## Render detail page 
  // ============================
  const detailPage = useMemo(() => {
    if (detailContent === false || detailContent === undefined) return null;
    return (
      <div className="table-supervision-detail-container">
        <div className="table-supervision-detail-body">
          {!!selected && (typeof detailContent === "object" && Array.isArray(detailContent) ? detailContent?.map((column, key) => {
            if (typeof column === "string") {
              return (<TypographyColumnComponent
                key={key}
                title={columns?.find((c) => c.selector == column)?.label} 
                content={selected[column]}
              />)
            } else if (typeof column === "object" && column !== null) {
              const colObj = column as { label: string, item: string | ((data: Record<string, any>) => ReactNode), conversion?: keyof typeof conversion };
              const rawContent = typeof colObj.item === "string" ? selected[colObj.item] : colObj.item(selected);
              const conversionKey = colObj.conversion;
              const content = conversionKey && conversion[conversionKey] ? (conversion[conversionKey] as any)(rawContent) : rawContent;
              return (<TypographyColumnComponent
                key={key}
                title={colObj.label} 
                content={content}
              />)
            } else {
              return column?.(selected)
            }
          }) : typeof detailContent === "function" ? (detailContent as any)(selected) : columns?.map((column, key) => (
            <TypographyColumnComponent
              key={key}
              title={column.label} 
              content={selected[column.selector]}
            />
          )))}
        </div>
      </div>
    )
  }, [selected, detailContent, columns]);




  // ============================
  // ## Form preparation
  // ============================
  const fields = useMemo(() => {
    return formControl?.fields?.length ? formControl?.fields.map((form) => {
      return typeof form === "string" ? {
        label      :  form,
        name       :  conversion.strSnake(form),
        type       : "text",
        visibility : "*"
      } : {
        ...form,
        visibility : form.visibility || "*"
      }
    }) as FormType[] : []
  }, [formControl]);



  const formPage = useMemo(() => {
    return (
      <FormSupervisionComponent 
        fields={fields}
        defaultValue={formControl?.defaultValue}
        payload={formControl?.payload}
        submitControl={fetchControl}
        onSuccess={() => {
          setToggle(`MODAL_FORM_${toggleKey}`, false)
          reset()
        }}
      />
    )
  }, [selected, fields])


  const dataTables = useMemo(() => {
    return data?.data?.map((item: Record<string, any>) => {
      return {
        ...item,
        action: renderTableAction(actionControl, item)
      };
    }) || [];
  }, [actionControl, data]);


  useEffect(() => {
    if(toggle[`REFRESH_${toggleKey}`] != undefined) reset();
  }, [toggle[`REFRESH_${toggleKey}`]]);


  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {title && <h1 className="table-supervision-title">{title}</h1>}
      

        <TableComponent
          id={tableKey}
          controlBar={controlBar?.map((cb) => {
              if (cb == "CREATE") {
                if (isSm) return 
                return (
                  <div className="control-bar-create-wrapper" key="button-add">
                    <ButtonComponent
                      icon={faPlus}
                      label="Tambah Data"
                      size="sm"
                      onClick={() => {
                        setToggle(`MODAL_FORM_${toggleKey}`)
                        setSelected(null)
                      }}
                    />
                  </div>
                )
              }

              if (cb == "IMPORT") {
                return (
                  <div className="control-bar-button-wrapper" key={"import"}>
                    <ButtonComponent
                      icon={faFileExcel}
                      label="Import"
                      variant="outline"
                      className="table-supervision-control-button"
                      onClick={() => setToggle(`MODAL_IMPORT_${toggleKey}`)}
                      size="sm"
                    />
                  </div>
                )
              }

              if (cb == "EXPORT") {
                return (
                  <div className="control-bar-button-wrapper" key={"export-excel"}>
                    <ButtonComponent
                      icon={faFileExcel}
                      label="Export"
                      variant="outline"
                      className="table-supervision-control-button"
                      onClick={() => setToggle(`MODAL_EXPORT_${toggleKey}`)}
                      size="sm"
                    />
                  </div>
                )
              }

              if (cb == "PRINT") {
                return (
                  <div className="control-bar-button-wrapper" key={"export-pdf"}>
                    <ButtonComponent
                      icon={faFilePdf}
                      label="Cetak"
                      variant="outline"
                      className="table-supervision-control-button"
                      onClick={() => setToggle(`MODAL_PRINT_${toggleKey}`)}
                      size="sm"
                    />
                  </div>
                )
              }

              return cb
            }) || [
            ...(!isSm ? [
              <div className="control-bar-create-wrapper" key="button-add">
                <ButtonComponent
                  icon={faPlus}
                  label="Tambah Data"
                  size="sm"
                  onClick={() => {
                    setToggle(`MODAL_FORM_${toggleKey}`)
                    setSelected(null)
                  }}
                />
              </div>
            ] : []), 
            "SEARCH", 
            ...(columns?.filter((c) => !!(c as { filterable?: any }).filterable)?.length ? ["FILTER"] : []),
            ...(columns?.filter((c) => !!(c as { sortable?: any }).sortable)?.length ? ["SORT"] : []),
            "SELECTABLE", "REFRESH",
          ]}
          columns={columns as TableColumnType[]}
          data={dataTables}
          onRowClick={detailAction ? detailAction : (detailContent !== false && detailContent !== undefined) ? (e) => {
            setToggle(`MODAL_SHOW_${toggleKey}`)
            setSelected(e)
          } : undefined}
          actionBulking={actionBulkingControl}
          checks={checks || []}
          onChangeChecks={(e) => setChecks(e)}
          block={block}
          focus={focus}
          noIndex={noIndex}
          responsiveControl={responsiveControl ? {
            mobile: responsiveControl?.mobile == true ? {
              leftActionControl: (Array.isArray(actionControl) ? actionControl : (actionControl || actionControl == undefined) ? ['EDIT', "DELETE"] : []).includes('EDIT') ? {
                icon: faEdit,
                onAction: (item) => {
                  setToggle(`MODAL_FORM_${toggleKey}`);
                  item && setSelected?.(item);
                }
              } : undefined,
              rightActionControl: (Array.isArray(actionControl) ? actionControl : (actionControl || actionControl == undefined) ? ['EDIT', "DELETE"] : []).includes('DELETE') ? {
                icon: faTrash,
                onAction: (item) => {
                  setToggle(`MODAL_DELETE_${toggleKey}`);
                  item && setSelected?.(item);
                }
              } : undefined
            } : responsiveControl?.mobile || undefined,
          } : undefined}
          {...tableControl}
        />

        <ButtonComponent
          icon={faPlus}
          className="table-supervision-mobile-add-btn"
          size="lg"
          rounded
          onClick={() => {
            setToggle(`MODAL_FORM_${toggleKey}`)
            setSelected(null)
          }}
        />


        {(detailContent !== false && detailContent !== undefined) && (isSm ? (
          <BottomSheetComponent
            show={!!toggle[`MODAL_SHOW_${toggleKey}`]}
            onClose={() => setToggle(`MODAL_SHOW_${toggleKey}`, false)}
            className="table-supervision-modal"
            footer={renderTableAction(actionControl, undefined, {className: isSm ? "justify-end p-2 bg-background" : "justify-end", size: isSm ? "sm" : "md"})}
            size="98vh"
            {...(detailModalProps as any)}
          >
            {detailPage}
          </BottomSheetComponent>
        ) : (
          <FloatingPageComponent
            show={!!toggle[`MODAL_SHOW_${toggleKey}`]}
            onClose={() => setToggle(`MODAL_SHOW_${toggleKey}`, false)}
            title="Detail"
            className="table-supervision-modal"
            footer={renderTableAction(actionControl, undefined, {className: isSm ? "justify-end p-2 bg-background" : "justify-end", size: isSm ? "sm" : "md"})}
            {...(detailModalProps as any)}
          >
            {detailPage}
          </FloatingPageComponent>
        ))}


        {isSm ? (
          <BottomSheetComponent
            show={!!toggle[`MODAL_FORM_${toggleKey}`]}
            onClose={() => setToggle(`MODAL_FORM_${toggleKey}`, false)}
            className={cn("table-supervision-modal", formControl?.modalControl?.className)}
            size="98vh"
          >
            <div className="table-supervision-form-mobile-container">
              {formPage}
            </div>
          </BottomSheetComponent>
        ) : (
          <FloatingPageComponent
            show={!!toggle[`MODAL_FORM_${toggleKey}`]}
            onClose={() => setToggle(`MODAL_FORM_${toggleKey}`, false)}
            title={!!selected ? "Ubah Data" : "Tambah Data"}
            className={cn("table-supervision-modal", formControl?.modalControl?.className)}
          >
            <div className="table-supervision-form-container">
              {formPage}
            </div>
          </FloatingPageComponent>
        )}


        {ExportExcel && (
          <FloatingPageComponent
            show={!!toggle[`MODAL_EXPORT_${toggleKey}`]}
            onClose={() => setToggle(`MODAL_EXPORT_${toggleKey}`, false)}
            title="Export Ke Excel"
            className="table-supervision-large-modal"
          >
            <ExportExcel 
              fetchControl={fetchControl as FetchControlType} 
              filename={"Export - " + title}
              columnControl={columns?.map((cc: TableSupervisionColumnProps) => ({
                label: cc.label || "",
                selector: cc.selector || "",
                status: cc.exportable === false ? "hidden" : cc.exportable === true ? "default" : typeof cc.exportable === "string" ? cc.exportable : undefined,
              }))} 
            />
          </FloatingPageComponent>
        )}


        {ImportExcel && (
          <FloatingPageComponent
            show={!!toggle[`MODAL_IMPORT_${toggleKey}`]}
            onClose={() => setToggle(`MODAL_IMPORT_${toggleKey}`, false)}
            title="Import Dari Excel"
            className="table-supervision-large-modal"
          >
            <ImportExcel 
              submitControl={importControl}
              fetchControl={
                (fetchControl as ApiType).path ? {
                  path: (fetchControl as ApiType).path,
                } : undefined
              }
              columnControl={columns?.filter((cc: TableSupervisionColumnProps) => cc.importable !== false).map((cc: TableSupervisionColumnProps) => ({
                label: cc.label || "",
                selector: cc.selector || "",
              }))} 
            />
          </FloatingPageComponent>
        )}


        <ModalConfirmComponent
          show={!!toggle[`MODAL_DELETE_${toggleKey}`]}
          onClose={() => setToggle(`MODAL_DELETE_${toggleKey}`, false)}
          icon={faQuestionCircle}
          title={`Menghapus Data?`}
          submitControl={{
            onSubmit: {
              ...((fetchControl as ApiType).path 
                ? {path: `${(fetchControl as ApiType).path}/${(selected as { id: number })?.id || ""}`} 
                : (fetchControl as ApiType).url ? {url: `${(fetchControl as ApiType).url}/${(selected as { id: number })?.id || ""}`}
                : { idb: { ...(fetchControl as ({ idb: UseResourceIdb }))?.idb, id: (selected as { id: number })?.id || "" }}
              ),
              method: "DELETE",
            },
            onSuccess: () => {
              reset();
              setToggle(`MODAL_DELETE_${toggleKey}`, false);
            },
          }}
        >
          {columns?.at(0)?.selector && selected ? (
            <p className="table-supervision-confirm-text">Yakin menghapus <span className="table-supervision-confirm-item-name">&quot;{selected[columns?.at(0)?.selector || ""]}&quot;</span>?</p>
          ) : (
            <p className="table-supervision-confirm-text">Yakin yang dihapus sudah benar?</p>
          )}
        </ModalConfirmComponent>

        {actionControl && Array.isArray(actionControl) && actionControl.filter((ac) => typeof ac == "object")?.map((ac, acKey) => {
          const submitControl = ac.modal?.submitControl?.onSubmit as ApiType;
          return (
            <ModalConfirmComponent
              key={acKey}
              show={!!toggle[`MODAL_${conversion.strSnake(ac.label).toUpperCase()}_${toggleKey}`]}
              onClose={() => setToggle(`MODAL_${conversion.strSnake(ac.label).toUpperCase()}_${toggleKey}`, false)}
              icon={faQuestionCircle}
              title={`${ac.label} Data?`}
              submitControl={{
                onSubmit: {
                  ...((submitControl as ApiType)?.path 
                    ? {path: `${(submitControl as ApiType).path}/${(selected as { id: number })?.id || ""}`} 
                    : (submitControl as ApiType)?.url ? {url: `${(submitControl as ApiType).url}/${(selected as { id: number })?.id || ""}`}
                    : { idb: { ...(submitControl as ({ idb: UseResourceIdb }))?.idb, id: (selected as { id: number })?.id || "" }}
                  ),
                  ...ac.modal?.submitControl?.onSubmit,
                },
                onSuccess: () => {
                  reset();
                  setToggle(`MODAL_${conversion.strSnake(ac.label).toUpperCase()}_${toggleKey}`, false);
                },
              }}
              {...ac.modal}
            >
              {columns?.at(0)?.selector && selected ? (
                <p className="table-supervision-confirm-text">Yakin melakukan aksi untuk data <span className="table-supervision-confirm-item-name">&quot;{selected[columns?.at(0)?.selector || ""]}&quot;</span>?</p>
              ) : (
                <p className="table-supervision-confirm-text">Yakin aksi yang dilakukan sudah benar?</p>
              )}
            </ModalConfirmComponent>
          )
        })}
      </Suspense>
    </>
  );
}
