import { useMemo } from "react";
import { cn } from "@utils";

export interface ContentWrapperProps {
  content    :  string;
  className  ?:  string;
}

export const COLOR_MAP: Record<string, { label: string; tw: string; css: string }> = {
  normal:    { label: "Normal",    tw: "text-foreground",       css: "var(--color-foreground, #1f2937)"       },
  light:     { label: "Light",     tw: "text-light-foreground", css: "var(--color-light-foreground, #9ca3af)" },
  primary:   { label: "Primary",   tw: "text-primary",          css: "var(--color-primary, #3b82f6)"          },
  secondary: { label: "Secondary", tw: "text-secondary",        css: "var(--color-secondary, #8b5cf6)"        },
  warning:   { label: "Warning",   tw: "text-warning",          css: "var(--color-warning, #f59e0b)"          },
  danger:    { label: "Danger",    tw: "text-danger",           css: "var(--color-danger, #ef4444)"           },
};

export function formatLinkUrl(url: string): string {
  if (!url) return "";
  const hasProtocol = /^(https?:\/\/|\/\/|\/|#|mailto:|tel:|javascript:)/i.test(url);
  if (hasProtocol) {
    return url;
  }
  return `https://${url}`;
}

export function parseInlineFormats(text: string): string {
  if (!text) return "";
  let result = text;

  result = result.replace(/\[color:(\w+)\](.*?)\[color\]/g, (_, color, content) => {
    const colorInfo = COLOR_MAP[color];
    const twClass = colorInfo?.tw || "text-foreground";
    return `<span class="${twClass}" data-color="${color}">${content}</span>`;
  });

  result = result.replace(/\[size:(\d+)\](.*?)\[size\]/g, (_, size, content) => {
    return `<span style="font-size:${size}px" data-size="${size}">${content}</span>`;
  });

  result = result.replace(/\[link:(.*?)\](.*?)\[link\]/g, (_, url, content) => {
    const formattedUrl = formatLinkUrl(url);
    return `<a href="${formattedUrl}" class="text-primary underline" data-link="${formattedUrl}" target="_blank" rel="noopener noreferrer">${content}</a>`;
  });

  result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/(?<![:"'=])\/\/(.*?)(?<![:"'=])\/\//g, "<em>$1</em>");
  result = result.replace(/__(.*?)__/g, "<u>$1</u>");
  result = result.replace(/--(.*?)--/g, "<s>$1</s>");

  return result;
}

export function parseContentToHtml(content: string): string {
  if (!content) return "";

  const lines = content.replace(/\r/g, "").split("\n");
  const htmlParts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "---") {
      htmlParts.push('<div class="skcontent-divider" contenteditable="false"><hr /></div>');
      i++;
      continue;
    }

    const headerMatch = line.match(/^##(.+?)##$/);
    if (headerMatch) {
      htmlParts.push(`<h2>${parseInlineFormats(headerMatch[1])}</h2>`);
      i++;
      continue;
    }

    if (line.match(/^\[list:bullet\]/)) {
      const items: string[] = [];
      let matchedAny = false;
      while (i < lines.length) {
        const bm = lines[i].match(/^\[list:bullet\](.*?)\[list\]$/);
        if (!bm) break;
        matchedAny = true;
        items.push(`<li>${parseInlineFormats(bm[1])}</li>`);
        i++;
      }
      if (matchedAny) {
        htmlParts.push(`<ul>${items.join("")}</ul>`);
        continue;
      }
    }

    if (line.match(/^\[list:number\]/)) {
      const items: string[] = [];
      let matchedAny = false;
      while (i < lines.length) {
        const nm = lines[i].match(/^\[list:number\](.*?)\[list\]$/);
        if (!nm) break;
        matchedAny = true;
        items.push(`<li>${parseInlineFormats(nm[1])}</li>`);
        i++;
      }
      if (matchedAny) {
        htmlParts.push(`<ol>${items.join("")}</ol>`);
        continue;
      }
    }

    const alignMatch = line.match(/^\[align:(left|center|right|justify)\](.*?)\[align\]$/);
    if (alignMatch) {
      const alignVal = alignMatch[1];
      const alignStyle = alignVal === "left" ? "text-align:left" : alignVal === "center" ? "text-align:center" : alignVal === "right" ? "text-align:right" : "text-align:justify";
      htmlParts.push(`<p style="${alignStyle}" class="text-${alignVal}">${parseInlineFormats(alignMatch[2])}</p>`);
      i++;
      continue;
    }

    if (line.trim() === "") {
      htmlParts.push("<p><br></p>");
      i++;
      continue;
    }

    htmlParts.push(`<p>${parseInlineFormats(line)}</p>`);
    i++;
  }

  return htmlParts.join("");
}

export function parseHtmlToContent(html: string): string {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  const lines: string[] = [];

  for (let i = 0; i < root.childNodes.length; i++) {
    const node = root.childNodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) lines.push(parseNodeToCustom(node));
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (el.classList.contains("skcontent-divider") || tag === "hr") {
      lines.push("---");
      continue;
    }

    if (tag === "h2") {
      lines.push(`##${parseChildrenToCustom(el)}##`);
      continue;
    }

    if (tag === "ul") {
      for (let j = 0; j < el.children.length; j++) {
        const li = el.children[j];
        lines.push(`[list:bullet]${parseChildrenToCustom(li as HTMLElement)}[list]`);
      }
      continue;
    }

    if (tag === "ol") {
      for (let j = 0; j < el.children.length; j++) {
        const li = el.children[j];
        lines.push(`[list:number]${parseChildrenToCustom(li as HTMLElement)}[list]`);
      }
      continue;
    }

    if (tag === "p" || tag === "div") {
      const align = el.style.textAlign || (el.classList.contains("text-center") ? "center" : el.classList.contains("text-right") ? "right" : el.classList.contains("text-justify") ? "justify" : "");
      const content = parseChildrenToCustom(el);

      if (!content || content === "\n" || el.innerHTML === "<br>" || el.innerHTML === "<br/>") {
        lines.push("");
        continue;
      }

      if (align && align !== "left" && align !== "start") {
        lines.push(`[align:${align}]${content}[align]`);
      } else {
        lines.push(content);
      }
      continue;
    }

    const fallback = parseChildrenToCustom(el);
    if (fallback) lines.push(fallback);
  }

  return lines.join("\n");
}

function parseChildrenToCustom(el: HTMLElement): string {
  let result = "";
  for (let i = 0; i < el.childNodes.length; i++) {
    result += parseNodeToCustom(el.childNodes[i]);
  }
  return result;
}

function parseNodeToCustom(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || "").replace(/\u200B/g, "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const inner = parseChildrenToCustom(el);

  if (tag === "strong" || tag === "b") return `**${inner}**`;
  if (tag === "em" || tag === "i") return `//${inner}//`;
  if (tag === "u") return `__${inner}__`;
  if (tag === "s" || tag === "strike" || tag === "del") return `--${inner}--`;

  if (tag === "span" && el.dataset.color) {
    return `[color:${el.dataset.color}]${inner}[color]`;
  }

  if (tag === "span" && el.dataset.size) {
    return `[size:${el.dataset.size}]${inner}[size]`;
  }

  if (tag === "a") {
    const href = el.getAttribute("href") || el.dataset.link || "";
    return `[link:${href}]${inner}[link]`;
  }

  if (tag === "br") return "";
  if (tag === "hr") return "---";

  return inner;
}

export function ContentWrapperComponent({
  content,
  className,
}: ContentWrapperProps) {
  const renderedHtml = useMemo(() => parseContentToHtml(content), [content]);

  return (
    <div
      className={cn("skcontent-wrapper", className)}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
