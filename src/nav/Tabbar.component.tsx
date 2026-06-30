import { cn, pcn } from "@utils";



type CT = "item" | "active" | "base";

export interface TabbarItemProps {
  label  :  string;
  value  :  string | number;
};

export interface TabbarProps {
  items       :  string[] | TabbarItemProps[];
  onChange   ?:  (item: string | number) => void;
  active     ?:  string | number;
  className  ?:  string;
};



export function TabbarComponent({
  items,
  onChange,
  active,

  /** Use custom class with: "item::", "active::". */
  className = "",
}: TabbarProps) {
  return (
    <>
      <div
        className={cn(
          "tabbar-base",
          pcn<CT>(className, "base"),
        )}
      >
        {items?.map((item, i) => {
          const isItemActive = active == (typeof item != "string" ? item?.value : item);
          return (
            <div
              key={i}
              className={cn(
                "tabbar-item",
                isItemActive
                  ? "tabbar-item-active"
                  : "tabbar-item-inactive",
                pcn<CT>(className, "item"),
                pcn<CT>(className, "active"),
              )}
              onClick={() =>
                onChange?.(typeof item != "string" ? item?.value : item)
              }
            >
              {typeof item != "string" ? item?.label : item}
            </div>
          );
        })}
      </div>
    </>
  );
}
