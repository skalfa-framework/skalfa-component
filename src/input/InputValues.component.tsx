import { CSSProperties } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@utils';

export function InputValues({
  value,
  className,
  onDelete,
  isFocus,
  onFocus,
  style,
} : {
  value?: string[] | number[];
  className?: string;
  onDelete?: (val: string | number, index: string | number) => void;
  isFocus?: boolean,
  onFocus?: () => void;
  style?: CSSProperties
}) {
  if(isFocus) {
    return (
      <>
        {!!value?.length && (
          <div
            className={cn("input-values-dropdown", className)}
            onClick={() => onFocus?.()}
          >
            {value?.map((item, key) => {
              return (
                <div key={key} className="input-values-item">
                  <span className="">{item}</span>
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="input-values-delete"
                    onClick={() =>  onDelete?.(item, key)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </>
    )
  } else {
    return (
      <>
        <div 
          className={cn("input-values-preview", className)}
          style={style}
          onClick={() => onFocus?.()}
        >
          <div className="input-values-container">
            {value?.map((item, key) => {
              return (
                <div key={key} className="input-values-item">
                  <span>{item}</span>
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="input-values-delete"
                    onClick={() =>  onDelete?.(item, key)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </>
    )
  }
}
