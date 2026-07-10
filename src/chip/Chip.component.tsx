import { Icon, type IconName } from "@skalfa/skalfa-icon";
import { cn } from "@utils";

export function ChipComponent({ 
  items, 
  onClick,
  onDelete, 
  className, 
} : { 
  items      :  Record<string, any>,
  onClick    ?:  (item: any, index: number) => void,
  onDelete   ?:  (item: any, index: number) => void,
  className  ?:  string,
}) {
  return (
    <div className={cn("chip-group", className)}>
      {items?.map((item: any, key: number) => {
        return (
          <div 
            key={key} 
            className="chip" 
            onClick={() => onClick?.(item, key)}
          >
            <span>{item}</span>
            
            {onDelete && (
              <Icon
                icon="solid/times"
                className="chip-delete"
                onClick={() =>  onDelete?.(item, key)}
              />
            )}
          </div>
        );
      })}
    </div>
  )
}
