import { ReactNode } from 'react'

export interface TypographyTipsProps {
  title     :  string | ReactNode;
  content   :  string | ReactNode;
}

export function TypographyTipsComponent({
  title,
  content,
} : TypographyTipsProps) {
  return (
    <>
      <div className="typography-tips">
        <p className="typography-tips-title">{title}</p>
        <p className="typography-tips-body">{content}</p>
      </div>
    </>
  )
}
