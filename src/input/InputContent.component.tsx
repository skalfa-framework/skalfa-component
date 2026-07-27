"use client"

import { ReactNode, Ref, useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@skalfa/skalfa-icon";
import { cn, pcn, shortcut, useInputHandler, useInputRandomId, useValidation, ValidationRules } from "@utils";
import { COLOR_MAP, parseContentToHtml, parseHtmlToContent } from "../wrap/ContentWrapper.component";
import { ButtonComponent } from "../button/Button.component";

type CT = "label" | "tip" | "error" | "base" | "toolbar" | "editor";

export type ToolbarControlName =
  | "HEADER"
  | "BOLD"
  | "ITALIC"
  | "UNDERLINE"
  | "STRIKETHROUGH"
  | "TEXT_SIZE"
  | "FONT_SIZE"
  | "ALIGN_LEFT"
  | "ALIGN_CENTER"
  | "ALIGN_RIGHT"
  | "ALIGN_JUSTIFY"
  | "LINK"
  | "COLOR"
  | "LIST_BULLET"
  | "BULLET_LIST"
  | "LIST_NUMBER"
  | "NUMBER_LIST"
  | "DIVIDER"
  | "SEP";

export type ToolbarControlItem = ToolbarControlName | ReactNode;

export const DEFAULT_TOOLBAR_CONTROLS: ToolbarControlItem[] = [
  "HEADER",
  "TEXT_SIZE",
  "BOLD",
  "ITALIC",
  "UNDERLINE",
  "STRIKETHROUGH",
  "ALIGN_LEFT",
  "ALIGN_CENTER",
  "ALIGN_RIGHT",
  "ALIGN_JUSTIFY",
  "LINK",
  "COLOR",
  "LIST_BULLET",
  "LIST_NUMBER",
  "DIVIDER",
];

export interface InputContentProps {
  label          ?:  string;
  tip            ?:  string | ReactNode;
  name           ?:  string;
  placeholder    ?:  string;
  disabled       ?:  boolean;

  value          ?:  string;
  invalid        ?:  string;

  validations    ?:  ValidationRules;
  toolbarControl ?:  Array<ToolbarControlItem>;

  onChange       ?:  (value: string) => any;
  register       ?:  (name: string, validations?: ValidationRules) => void;
  unregister     ?:  (name: string) => void;

  ref            ?:  Ref<HTMLDivElement>;

  className      ?:  string;
}

export function InputContentComponent({
  label,
  tip,
  className = "",

  value,
  invalid,

  validations,
  toolbarControl,

  register,
  unregister,
  onChange,

  ref,
  ...props
}: InputContentProps) {
  const inputHandler = useInputHandler(props.name, value, validations, register, false, unregister);
  const randomId     = useInputRandomId();

  const [invalidMessage] = useValidation(inputHandler.value, validations, invalid, inputHandler.idle);

  const editorRef        = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [showColorPicker, setShowColorPicker]  = useState(false);
  const [showLinkInput, setShowLinkInput]       = useState(false);
  const [linkUrl, setLinkUrl]                   = useState("");
  const savedSelectionRef = useRef<Range | null>(null);

  const [textSize, setTextSize]       = useState<number>(14);
  const [activeColor, setActiveColor] = useState<string>("normal");
  const [activeStates, setActiveStates] = useState({
    header: false,
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editorRef.current) {
      const html = parseContentToHtml(inputHandler.value || "");
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
  }, [inputHandler.value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  }, []);

  const handleEditorChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const customFormat = parseHtmlToContent(html);

    isInternalChange.current = true;
    inputHandler.setValue(customFormat);
    inputHandler.setIdle(false);
    if (onChange) onChange(customFormat);
  }, [onChange, inputHandler]);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    handleEditorChange();
  }, [restoreSelection, saveSelection, handleEditorChange]);

  const isCommandActive = useCallback((command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);

  const handleBold = useCallback(() => execCommand("bold"), [execCommand]);
  const handleItalic = useCallback(() => execCommand("italic"), [execCommand]);
  const handleUnderline = useCallback(() => execCommand("underline"), [execCommand]);
  const handleStrikethrough = useCallback(() => execCommand("strikeThrough"), [execCommand]);

  const handleHeader = useCallback(() => {
    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.anchorNode;
    let isInHeader = false;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "H2") {
        isInHeader = true;
        break;
      }
      node = node.parentNode;
    }

    if (isInHeader) {
      document.execCommand("formatBlock", false, "p");
    } else {
      document.execCommand("formatBlock", false, "h2");
    }

    saveSelection();
    handleEditorChange();
  }, [restoreSelection, saveSelection, handleEditorChange]);

  const handleFontSizeChange = useCallback((newSize: number) => {
    const clampedSize = Math.max(8, Math.min(72, newSize));
    setTextSize(clampedSize);

    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    if (sel.isCollapsed) {
      let containerNode: Node | null = range.commonAncestorContainer;
      if (containerNode.nodeType === Node.TEXT_NODE) containerNode = containerNode.parentNode;
      if (containerNode && (containerNode as HTMLElement).dataset?.size) {
        (containerNode as HTMLElement).style.fontSize = `${clampedSize}px`;
        (containerNode as HTMLElement).dataset.size = clampedSize.toString();
      } else {
        const span = document.createElement("span");
        span.style.fontSize = `${clampedSize}px`;
        span.dataset.size = clampedSize.toString();
        span.appendChild(document.createTextNode("\u200B"));

        range.insertNode(span);
        const newRange = document.createRange();
        newRange.setStart(span.firstChild!, 1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    } else {
      const span = document.createElement("span");
      span.style.fontSize = `${clampedSize}px`;
      span.dataset.size = clampedSize.toString();

      try {
        range.surroundContents(span);
      } catch {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }

      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    }

    saveSelection();
    handleEditorChange();
  }, [restoreSelection, saveSelection, handleEditorChange]);

  const handleAlign = useCallback((align: string) => {
    const commandMap: Record<string, string> = {
      left: "justifyLeft",
      center: "justifyCenter",
      right: "justifyRight",
      justify: "justifyFull",
    };
    const targetCmd = commandMap[align] || "justifyLeft";
    if (isCommandActive(targetCmd)) {
      execCommand("justifyLeft");
    } else {
      execCommand(targetCmd);
    }
  }, [execCommand, isCommandActive]);

  const handleColor = useCallback((colorKey: string) => {
    const targetColor = activeColor === colorKey ? "normal" : colorKey;
    const colorInfo = COLOR_MAP[targetColor];
    if (!colorInfo) return;

    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setShowColorPicker(false);
      return;
    }

    const range = sel.getRangeAt(0);

    if (targetColor === "normal") {
      let containerNode: Node | null = range.commonAncestorContainer;
      if (containerNode.nodeType === Node.TEXT_NODE) containerNode = containerNode.parentNode;
      if (containerNode && (containerNode as HTMLElement).dataset?.color) {
        const parent = containerNode.parentNode;
        while (containerNode.firstChild) {
          parent?.insertBefore(containerNode.firstChild, containerNode);
        }
        parent?.removeChild(containerNode);
      }
    } else {
      const span = document.createElement("span");
      span.className = colorInfo.tw;
      span.style.color = colorInfo.css;
      span.dataset.color = targetColor;

      try {
        range.surroundContents(span);
      } catch {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }

      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    }

    setActiveColor(targetColor);
    saveSelection();
    setShowColorPicker(false);
    handleEditorChange();
  }, [activeColor, restoreSelection, saveSelection, handleEditorChange]);

  const handleBulletList = useCallback(() => execCommand("insertUnorderedList"), [execCommand]);
  const handleNumberList = useCallback(() => execCommand("insertOrderedList"), [execCommand]);

  const handleLink = useCallback(() => {
    saveSelection();
    setShowLinkInput(true);
    setLinkUrl("");
  }, [saveSelection]);

  const handleLinkSubmit = useCallback(() => {
    if (!linkUrl) {
      setShowLinkInput(false);
      return;
    }

    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setShowLinkInput(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const linkText = sel.isCollapsed ? linkUrl : range.toString();

    const a = document.createElement("a");
    a.href = linkUrl;
    a.className = "text-primary underline";
    a.dataset.link = linkUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = linkText;

    if (!sel.isCollapsed) {
      range.deleteContents();
    }
    range.insertNode(a);

    const newRange = document.createRange();
    newRange.setStartAfter(a);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    saveSelection();
    setShowLinkInput(false);
    setLinkUrl("");
    handleEditorChange();
  }, [linkUrl, restoreSelection, saveSelection, handleEditorChange]);

  const handleDivider = useCallback(() => {
    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    const dividerWrapper = document.createElement("div");
    dividerWrapper.className = "skcontent-divider";
    const hr = document.createElement("hr");
    dividerWrapper.appendChild(hr);

    const newP = document.createElement("p");
    newP.innerHTML = "<br>";

    range.deleteContents();
    range.insertNode(newP);
    range.insertNode(dividerWrapper);

    const newRange = document.createRange();
    newRange.setStart(newP, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    saveSelection();
    handleEditorChange();
  }, [restoreSelection, saveSelection, handleEditorChange]);



  const updateActiveStates = useCallback(() => {
    const sel = window.getSelection();
    let inH2 = false;
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "H2") {
          inH2 = true;
          break;
        }
        node = node.parentNode;
      }
    }

    setActiveStates({
      header: inH2,
      bold: isCommandActive("bold"),
      italic: isCommandActive("italic"),
      underline: isCommandActive("underline"),
      strikeThrough: isCommandActive("strikeThrough"),
      justifyLeft: isCommandActive("justifyLeft"),
      justifyCenter: isCommandActive("justifyCenter"),
      justifyRight: isCommandActive("justifyRight"),
      justifyFull: isCommandActive("justifyFull"),
      insertUnorderedList: isCommandActive("insertUnorderedList"),
      insertOrderedList: isCommandActive("insertOrderedList"),
    });

    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      let detectedColor = "normal";
      let detectedSize: number | null = null;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.dataset.color && detectedColor === "normal") {
            detectedColor = el.dataset.color;
          }
          if (el.dataset.size && detectedSize === null) {
            const parsed = parseInt(el.dataset.size);
            if (!isNaN(parsed)) detectedSize = parsed;
          }
        }
        node = node.parentNode;
      }
      setActiveColor(detectedColor);
      if (detectedSize !== null) {
        setTextSize(detectedSize);
      }
    }
  }, [isCommandActive]);

  useEffect(() => {
    shortcut.register("ctrl+b", () => handleBold(), "Bold text");
    shortcut.register("ctrl+i", () => handleItalic(), "Italic text");
    shortcut.register("ctrl+u", () => handleUnderline(), "Underline text");
    shortcut.register("ctrl+shift+x", () => handleStrikethrough(), "Strikethrough text");
    shortcut.register("ctrl+k", () => handleLink(), "Insert link");

    return () => {
      shortcut.unregister("ctrl+b");
      shortcut.unregister("ctrl+i");
      shortcut.unregister("ctrl+u");
      shortcut.unregister("ctrl+shift+x");
      shortcut.unregister("ctrl+k");
    };
  }, [handleBold, handleItalic, handleUnderline, handleStrikethrough, handleLink]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isMod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (isMod && !e.shiftKey && !e.altKey && key === "b") {
      e.preventDefault();
      handleBold();
      updateActiveStates();
      return;
    }

    if (isMod && !e.shiftKey && !e.altKey && key === "i") {
      e.preventDefault();
      handleItalic();
      updateActiveStates();
      return;
    }

    if (isMod && !e.shiftKey && !e.altKey && key === "u") {
      e.preventDefault();
      handleUnderline();
      updateActiveStates();
      return;
    }

    if (isMod && e.shiftKey && !e.altKey && key === "x") {
      e.preventDefault();
      handleStrikethrough();
      updateActiveStates();
      return;
    }

    if (isMod && !e.shiftKey && !e.altKey && key === "k") {
      e.preventDefault();
      handleLink();
      return;
    }

    if (e.key === "Backspace") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        if (range.startOffset === 0) {
          let node: Node | null = range.startContainer;
          let currentBlock: HTMLElement | null = null;
          while (node && node !== editorRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE && node.parentNode === editorRef.current) {
              currentBlock = node as HTMLElement;
              break;
            }
            node = node.parentNode;
          }

          if (currentBlock) {
            const prev = currentBlock.previousElementSibling as HTMLElement | null;
            if (prev && (prev.classList.contains("skcontent-divider") || prev.tagName === "HR")) {
              e.preventDefault();
              prev.remove();
              handleEditorChange();
              return;
            }
          }
        }
      }
    }

    if (e.key === "Delete") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        let node: Node | null = range.startContainer;
        const textLen = node.textContent?.length || 0;
        if (range.startOffset >= textLen) {
          let currentBlock: HTMLElement | null = null;
          while (node && node !== editorRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE && node.parentNode === editorRef.current) {
              currentBlock = node as HTMLElement;
              break;
            }
            node = node.parentNode;
          }

          if (currentBlock) {
            const next = currentBlock.nextElementSibling as HTMLElement | null;
            if (next && (next.classList.contains("skcontent-divider") || next.tagName === "HR")) {
              e.preventDefault();
              next.remove();
              handleEditorChange();
              return;
            }
          }
        }
      }
    }
  }, [handleBold, handleItalic, handleUnderline, handleStrikethrough, handleLink, handleEditorChange, updateActiveStates]);

  const renderControlItem = useCallback((item: ToolbarControlItem, index: number) => {
    if (typeof item !== "string") {
      return <div key={index}>{item}</div>;
    }

    switch (item) {
      // case "HEADER":
      //   return (
      //     <ButtonComponent
      //       key={index}
      //       variant={activeStates.header ? "light" : "simple"}
      //       paint="primary"
      //       size="sm"
      //       icon="solid/text-h"
      //       tips="Header"
      //       className={cn("toolbar-btn", activeStates.header && "toolbar-btn-active")}
      //       onClick={(e: any) => { e?.preventDefault?.(); handleHeader(); }}
      //     />
      //   );
      case "TEXT_SIZE":
      case "FONT_SIZE":
        return (
          <div className="flex items-center gap-0.5" key={index}>
            <ButtonComponent
              variant="simple"
              paint="primary"
              size="sm"
              icon="solid/minus"
              tips="Decrease Font Size"
              className="toolbar-btn"
              onClick={(e: any) => { e?.preventDefault?.(); handleFontSizeChange(textSize - 1); }}
            />
            <input
              type="number"
              value={textSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 14)}
              onFocus={() => saveSelection()}
              className="w-10 h-7 text-xs text-center border border-stroke rounded focus:outline-none focus:border-primary bg-background text-foreground select-none"
            />
            <ButtonComponent
              variant="simple"
              paint="primary"
              size="sm"
              icon="solid/plus"
              tips="Increase Font Size"
              className="toolbar-btn"
              onClick={(e: any) => { e?.preventDefault?.(); handleFontSizeChange(textSize + 1); }}
            />
          </div>
        );
      case "COLOR":
        return (
          <div className="relative" key={index}>
            <ButtonComponent
              variant={activeColor !== "normal" ? "light" : "simple"}
              paint="primary"
              size="sm"
              label={<div><div className="skcontent-color-dot" style={{ backgroundColor: COLOR_MAP[activeColor]?.css || COLOR_MAP.normal.css }} /></div>}
              tips={`Text Color (${COLOR_MAP[activeColor]?.label || "Normal"})`}
              className={cn("toolbar-btn", (activeColor !== "normal" || showColorPicker) && "toolbar-btn-active")}
              onClick={(e: any) => { e?.preventDefault?.(); setShowColorPicker(!showColorPicker); }}
            />

            {showColorPicker && (
              <div className="skcontent-dropdown skcontent-color-picker">
                {Object.entries(COLOR_MAP).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    title={info.label}
                    className={cn(
                      "skcontent-color-dot",
                      activeColor === key && "scale-125 border-2 border-primary"
                    )}
                    style={{ backgroundColor: info.css }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleColor(key);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case "BOLD":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.bold ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/text-b"
            tips="Bold (Ctrl+B)"
            className={cn("toolbar-btn", activeStates.bold && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleBold(); }}
          />
        );
      case "ITALIC":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.italic ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/text-italic"
            tips="Italic (Ctrl+I)"
            className={cn("toolbar-btn", activeStates.italic && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleItalic(); }}
          />
        );
      case "UNDERLINE":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.underline ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/text-underline"
            tips="Underline (Ctrl+U)"
            className={cn("toolbar-btn", activeStates.underline && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleUnderline(); }}
          />
        );
      case "STRIKETHROUGH":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.strikeThrough ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/text-slash"
            tips="Strikethrough (Ctrl+Shift+X)"
            className={cn("toolbar-btn", activeStates.strikeThrough && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleStrikethrough(); }}
          />
        );
      case "ALIGN_LEFT":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.justifyLeft ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/text-left"
            tips="Align Left"
            className={cn("toolbar-btn", activeStates.justifyLeft && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleAlign("left"); }}
          />
        );
      case "ALIGN_CENTER":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.justifyCenter ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/text-center"
            tips="Align Center"
            className={cn("toolbar-btn", activeStates.justifyCenter && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleAlign("center"); }}
          />
        );
      case "ALIGN_RIGHT":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.justifyRight ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/text-right"
            tips="Align Right"
            className={cn("toolbar-btn", activeStates.justifyRight && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleAlign("right"); }}
          />
        );
      case "ALIGN_JUSTIFY":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.justifyFull ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/text-justify"
            tips="Align Justify"
            className={cn("toolbar-btn", activeStates.justifyFull && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleAlign("justify"); }}
          />
        );
      case "LINK":
        return (
          <div className="relative" key={index}>
            <ButtonComponent
              variant={showLinkInput ? "light" : "simple"}
              paint="primary"
              size="sm"
              icon="solid/link"
              tips="Link (Ctrl+K)"
              className={cn("toolbar-btn", showLinkInput && "toolbar-btn-active")}
              onClick={(e: any) => { e?.preventDefault?.(); handleLink(); }}
            />

            {showLinkInput && (
              <div className="skcontent-dropdown skcontent-link-input">
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLinkSubmit();
                    }
                    if (e.key === "Escape") {
                      setShowLinkInput(false);
                    }
                  }}
                  className="skcontent-link-url-input"
                  autoFocus
                />
                <ButtonComponent
                  variant="solid"
                  paint="primary"
                  size="xs"
                  icon="solid/check"
                  onClick={(e: any) => { e?.preventDefault?.(); handleLinkSubmit(); }}
                />
              </div>
            )}
          </div>
        );
      case "LIST_BULLET":
      case "BULLET_LIST":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.insertUnorderedList ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/list-bullet"
            tips="Bullet List"
            className={cn("toolbar-btn", activeStates.insertUnorderedList && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleBulletList(); }}
          />
        );
      case "LIST_NUMBER":
      case "NUMBER_LIST":
        return (
          <ButtonComponent
            key={index}
            variant={activeStates.insertOrderedList ? "light" : "simple"}
            paint="primary"
            size="sm"
            icon="solid/list-number"
            tips="Numbered List"
            className={cn("toolbar-btn", activeStates.insertOrderedList && "toolbar-btn-active")}
            onClick={(e: any) => { e?.preventDefault?.(); handleNumberList(); }}
          />
        );
      case "DIVIDER":
        return (
          <ButtonComponent
            key={index}
            variant="simple"
            paint="primary"
            size="sm"
            icon="solid/minus"
            tips="Divider"
            className="toolbar-btn"
            onClick={(e: any) => { e?.preventDefault?.(); handleDivider(); }}
          />
        );
      case "SEP":
        return <div className="skcontent-toolbar-sep" key={index} />;
      default:
        return null;
    }
  }, [
    activeStates,
    showLinkInput,
    linkUrl,
    activeColor,
    showColorPicker,
    textSize,
    handleHeader,
    handleFontSizeChange,
    handleBold,
    handleItalic,
    handleUnderline,
    handleStrikethrough,
    handleAlign,
    handleLink,
    handleLinkSubmit,
    handleColor,
    handleBulletList,
    handleNumberList,
    handleDivider,
    saveSelection,
  ]);

  return (
    <div className="relative flex flex-col gap-y-0.5 w-full">
      {label && (
        <label
          htmlFor={randomId}
          className={cn(
            "input-label",
            props.disabled && "input-label-disabled",
            !!invalidMessage && "input-label-error",
            pcn<CT>(className, "label"),
            props.disabled && pcn<CT>(className, "label", "disabled"),
            !!invalidMessage && pcn<CT>(className, "label", "error"),
          )}
        >
          {label}
          {validations && (validations as any)?.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {tip && (
        <small
          className={cn(
            "input-tip",
            props.disabled && "input-tip-disabled",
            pcn<CT>(className, "tip"),
            props.disabled && pcn<CT>(className, "tip", "disabled"),
          )}
        >
          {tip}
        </small>
      )}

      <div
        className={cn(
          "skcontent-container",
          props.disabled && "skcontent-container-disabled",
          !!invalidMessage && "skcontent-container-error",
          pcn<CT>(className, "base"),
          !!invalidMessage && pcn<CT>(className, "base", "error"),
        )}
      >
        <div
          className={cn(
            "skcontent-toolbar",
            pcn<CT>(className, "toolbar"),
          )}
        >
          {(toolbarControl || DEFAULT_TOOLBAR_CONTROLS).map(renderControlItem)}
        </div>

        <div
          ref={(node) => {
            (editorRef as any).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref && "current" in ref) (ref as any).current = node;
          }}
          id={randomId}
          contentEditable={!props.disabled}
          suppressContentEditableWarning
          className={cn(
            "skcontent-editor",
            props.disabled && "skcontent-editor-disabled",
            pcn<CT>(className, "editor"),
          )}
          onInput={() => {
            saveSelection();
            handleEditorChange();
            updateActiveStates();
          }}
          onKeyDown={handleKeyDown}
          onMouseUp={() => {
            saveSelection();
            updateActiveStates();
          }}
          onKeyUp={() => {
            saveSelection();
            updateActiveStates();
          }}
          onFocus={() => {
            inputHandler.setFocus(true);
            setShowColorPicker(false);
          }}
          onBlur={() => {
            setTimeout(() => inputHandler.setFocus(false), 150);
          }}
          data-placeholder={props.placeholder || "Write content..."}
        />
      </div>

      {invalidMessage && (
        <small
          className={cn(
            "input-error-message",
            pcn<CT>(className, "error"),
          )}
        >
          {invalidMessage}
        </small>
      )}
    </div>
  );
}
