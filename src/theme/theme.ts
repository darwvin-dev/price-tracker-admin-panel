import { createTheme } from "@mui/material/styles";
import { lightPalette, darkPalette } from "./palette";

export const getTheme = (mode: "light" | "dark") => {
  const palette = mode === "light" ? lightPalette : darkPalette;

  return createTheme({
    direction: "rtl",
    palette: {
      mode,
      background: palette.background,
      text: palette.text,
      primary: palette.primary,
      secondary: palette.secondary,
      success: palette.success,
      warning: palette.warning,
      error: palette.error,
      divider: palette.divider,
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: "iransans, Roboto, sans-serif",
      fontSize: 14,
    },
  });
};
