import { ReactNode } from 'react'

export interface TypographyContentProps {
  title     :  string | ReactNode;
  content   :  string | ReactNode;
}

export function TypographyContentComponent({
  title,
  content,
} : TypographyContentProps) {
  return (
    <>
      <div>
        <p className="typography-content-title">{title}</p>
        <p className="typography-content-body">{content}</p>
      </div>
    </>
  )
}
