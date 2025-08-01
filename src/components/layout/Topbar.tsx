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
  List,
  Divider,
  Badge,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  onSidebarToggle: () => void;
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const Topbar = ({ onSidebarToggle, toggleTheme, mode }: TopbarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);
  const openNotif = Boolean(anchorElNotif);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotif(event.currentTarget);
    await fetchUnreadAlerts();
    await markAllAsRead();
  };

  const handleCloseMenus = () => {
    setAnchorEl(null);
    setAnchorElNotif(null);
  };

  const fetchUnreadAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}api/alerts/unread/`
      );
      setAlerts(res.data);
    } catch (err) {
      console.error("خطا در دریافت اعلان‌ها", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        alerts.map((alert) =>
          axios.patch(
            `${import.meta.env.VITE_API_URL}api/alerts/${alert.id}/`,
            { read_on_site: true }
          )
        )
      );
    } catch (err) {
      console.error("خطا در علامت‌گذاری اعلان‌ها به عنوان خوانده‌شده", err);
    }
  };

  const unreadCount = alerts.length;

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backdropFilter: "blur(12px)",
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: (t) => t.zIndex.drawer + 1,
        direction: "ltr",
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
            <IconButton
              onClick={onSidebarToggle}
              sx={{ color: theme.palette.text.primary }}
            >
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
            <IconButton
              onClick={toggleTheme}
              sx={{ color: theme.palette.text.primary }}
            >
              {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="اعلان‌ها">
            <IconButton
              onClick={handleNotifClick}
              sx={{ color: theme.palette.text.primary }}
            >
              <Badge
                badgeContent={unreadCount > 0 ? unreadCount : null}
                color="error"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorElNotif}
            open={openNotif}
            onClose={handleCloseMenus}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slots={{ transition: Fade }}
            sx={{
              "& .MuiPaper-root": {
                mt: 1,
                minWidth: 300,
                maxWidth: 360,
                borderRadius: 2,
                backdropFilter: "blur(12px)",
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(30,30,30,0.9)"
                    : "rgba(255,255,255,0.95)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              },
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={20} />
              </Box>
            ) : alerts.length > 0 ? (
              <>
                <List sx={{ maxHeight: 300, overflowY: "auto", px: 1 }}>
                  {alerts.map((alert) => (
                    <Box
                      key={alert.id}
                      component={Paper}
                      elevation={1}
                      sx={{
                        px: 2,
                        py: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "grey.900"
                            : "grey.50",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {alert.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.5}
                      >
                        {new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(alert.created_at))}
                      </Typography>
                    </Box>
                  ))}
                </List>

                <Divider />
                <Box textAlign="center" p={1}>
                  <Button onClick={() => navigate("/alerts")} size="small">
                    نمایش همه اعلان‌ها
                  </Button>
                </Box>
              </>
            ) : (
              <Box px={2} py={1}>
                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                >
                  اعلان جدیدی نیست
                </Typography>
              </Box>
            )}
          </Menu>

          <Tooltip title="تنظیمات">
            <IconButton sx={{ color: theme.palette.text.primary }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="حساب کاربری">
            <IconButton onClick={handleAvatarClick}>
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircleIcon fontSize="small" />
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenus}
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
            <MenuItem onClick={handleCloseMenus}>پروفایل</MenuItem>
            <MenuItem onClick={handleCloseMenus}>تنظیمات</MenuItem>
            <MenuItem onClick={handleCloseMenus}>خروج</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
