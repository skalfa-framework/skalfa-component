import { ReactNode } from 'react'

export interface TypographyArticleProps {
  title     :  string | ReactNode;
  content   :  string | ReactNode;
  header   ?:  string | ReactNode;
  footer   ?:  string | ReactNode;
}

export function TypographyArticleComponent({
  title,
  content,
  header,
  footer,
} : TypographyArticleProps) {
  return (
    <>
      <h4 className="typography-article-header">{header}</h4>
      <h1 className="typography-article-title">{title}</h1>
      <div className="typography-article-content">{content}</div>
      <div className="typography-article-footer">
        {footer}
      </div>
    </>
  )
}
