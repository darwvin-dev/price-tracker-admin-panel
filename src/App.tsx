import { CssBaseline, Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import Topbar from "./components/layout/Topbar";
import Sidebar from "./components/layout/Sidebar";
import AppRouter from "./router/AppRouter";
import { getTheme } from "./theme/theme";

const SIDEBAR_WIDTH = 72;
const TOPBAR_HEIGHT = 64;

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as "light" | "dark";
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("theme-mode", next);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  const handleSidebarToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
        }}
      >
        <Box sx={{ height: `${TOPBAR_HEIGHT}px`, flexShrink: 0 }}>
          <Topbar
            onSidebarToggle={handleSidebarToggle}
            toggleTheme={toggleTheme}
            mode={mode}
          />
        </Box>

        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          <Sidebar
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            drawerWidth={SIDEBAR_WIDTH}
            topbarHeight={TOPBAR_HEIGHT}
          />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: { xs: "100%", md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
              height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
              overflow: "auto",
              p: 3,
              [theme.breakpoints.up("md")]: {
                pl: `${SIDEBAR_WIDTH + 10}px`, 
              },
            }}
          >
            <AppRouter />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
