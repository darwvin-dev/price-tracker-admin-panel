import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Fade,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useState } from "react";

interface TopbarProps {
  onSidebarToggle: () => void;
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const Topbar = ({ onSidebarToggle, toggleTheme, mode }: TopbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backdropFilter: "blur(12px)",
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: { xs: 2, sm: 4 },
          minHeight: 64,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton onClick={onSidebarToggle} sx={{color: theme.palette.text.primary}}>
              <MenuIcon />
            </IconButton>
          </Box>
          <Typography
            variant="h6"
            sx={{
              display: { xs: "none", sm: "block" },
              fontWeight: 600,
              fontSize: "1.05rem",
              color: theme.palette.text.primary,
            }}
          >
            داشبورد
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
          <Tooltip title="تغییر تم">
            <IconButton onClick={toggleTheme} sx={{color: theme.palette.text.primary}}>
              {mode === "light" ? (
                <Brightness4Icon fontSize="small" />
              ) : (
                <Brightness7Icon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="اعلان‌ها">
            <IconButton sx={{color: theme.palette.text.primary}}>
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="تنظیمات">
            <IconButton sx={{color: theme.palette.text.primary}}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="حساب کاربری">
            <IconButton onClick={handleAvatarClick}>
              <Avatar
                src="https://i.pravatar.cc/300"
                alt="User"
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slots={{ transition: Fade }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{
              "& .MuiPaper-root": {
                mt: 1,
                minWidth: 160,
                borderRadius: 2,
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
              },
            }}
          >
            <MenuItem onClick={handleClose}>پروفایل</MenuItem>
            <MenuItem onClick={handleClose}>تنظیمات</MenuItem>
            <MenuItem onClick={handleClose}>خروج</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
