import { createContext } from "react";

export const ThemeContext = createContext({
    ready: false,
    theme: null,
    mode: 'system',           
    effectiveScheme: 'light', 
    isDark: false,
    setMode: () => {},
    toggle: () => {},
    followSystem: () => {},
})