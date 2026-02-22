import { createContext } from "react";

export type Theme = "light" | "dark" | "system";
export type ActualTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  actualTheme: ActualTheme;
  setTheme: (theme: Theme) => Promise<void>;
  isLoading: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);
