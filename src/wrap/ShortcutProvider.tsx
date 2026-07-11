"use client"

import { useEffect, Fragment } from "react";
import { shortcut } from "@utils"
import { useToggleContext } from "@contexts"
import { ModalComponent } from "../modal/Modal.component";
import { useLang } from "@skalfa/skalfa-lang";

export function ShortcutProvider() {
  const l = useLang();
  const { setToggle, toggle } = useToggleContext();
  const shortcuts = shortcut.list()

  useEffect(() => {
    shortcut.init()
  }, [])

  useEffect(() => {
    shortcut.register("ctrl+/", () => {
      setToggle("MODAL_SHORTCUT_HELP")
    }, l.base.shortcutList ? l.base.shortcutList() : "")
  }, [])

  function formatShortcutKey(key: string) {
    return key
      .split("+")
      .map(k => {
        if (k === "ctrl") return "Ctrl"
        if (k === "shift") return "Shift"
        if (k === "alt") return "Alt"
        if (k === "arrowup") return "↑"
        if (k === "arrowdown") return "↓"
        if (k === " ") return "SPACE"
        return k.toUpperCase()
      })
      .join(" + ")
  }

  return (
    <>
      <ModalComponent 
        show={!!toggle["MODAL_SHORTCUT_HELP"]}
        onClose={() => setToggle("MODAL_SHORTCUT_HELP")}
        title={l.base.shortcut ? l.base.shortcut() : ""}
      >
        <div className="shortcut-help-grid">
          {shortcuts.map(({ key, description }) => (
            <Fragment key={key}>
              <kbd className="shortcut-key-badge">
                {formatShortcutKey(key)}
              </kbd>
              <span>: {description}</span>
            </Fragment>
          ))}
        </div>
      </ModalComponent>
    </>
  )
}
