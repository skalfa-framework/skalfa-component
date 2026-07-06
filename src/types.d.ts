declare module "@contexts" {
  export function useToggleContext(): {
    setToggle: (key: string, value?: any) => void;
    toggle: Record<string, any>;
  };
  export function useAppContext(): any;
}
