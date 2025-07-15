import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Box,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  Store,
  Notifications,
  BarChart,
  Settings,
  Category
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  drawerWidth: number;
  topbarHeight: number;
}

const navItems = [
  { icon: <ShoppingCart />, to: '/products', label: 'محصولات' },
  { icon: <Store />, to: '/stores', label: 'فروشگاه‌ها' },
  { icon: <Category />, to: '/categories', label: 'دسته‌بندی‌ها' },
  { icon: <Notifications />, to: '/alerts', label: 'هشدارها' },
  { icon: <BarChart />, to: '/export', label: 'خروجی' },
  { icon: <Settings />, to: '/settings', label: 'تنظیمات' },
];

const Sidebar = ({
  mobileOpen,
  onClose,
  drawerWidth,
  topbarHeight,
}: SidebarProps) => {
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const drawerContent = (
    <Box mt={3} display="flex" flexDirection="column" alignItems="center">
      <List sx={{ width: '100%' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <Tooltip
              title={item.label}
              placement="right"
              arrow
              key={item.to}
              enterDelay={300}
            >
              <ListItem disablePadding sx={{ justifyContent: 'center' }}>
                <ListItemButton
                  component={Link}
                  to={item.to}
                  selected={isActive}
                  sx={{
                    justifyContent: 'center',
                    mx: 'auto',
                    my: 0.5,
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    backgroundColor: isActive
                      ? (isDark ? 'rgba(59,130,246,0.1)' : '#e0f2fe')
                      : 'transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : '#f0f4f8',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      color: 'inherit',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* دسکتاپ */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            top: `${topbarHeight}px`,
            height: `calc(100% - ${topbarHeight}px)`,
            borderRight: '1px solid',
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 0 8px rgba(0,0,0,0.03)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* موبایل */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
