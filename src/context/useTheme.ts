import { useContext } from "react";
import { ThemeContext, type ThemeContextValue } from "./themeContextDef";

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
