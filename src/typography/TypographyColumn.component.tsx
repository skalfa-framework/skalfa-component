import { ReactNode } from 'react'

export interface TypographyColumnProps {
  title     :  string | ReactNode;
  content   :  string | ReactNode;
}

export function TypographyColumnComponent({
  title,
  content,
} : TypographyColumnProps) {
  return (
    <>
      <div>
        <div className="typography-column-title">{title}</div>
        <div>{content}</div>
      </div>
    </>
  )
}
