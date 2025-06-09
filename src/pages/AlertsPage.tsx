import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Alert } from "../types/alert.ts";

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const theme = useTheme();

  const fetchAlerts = () => {
    axios.get("http://localhost:8000/api/alerts/").then((res) => {
      setAlerts(res.data);
      setLoading(false);
    });
  };

  const markAsRead = (id: number) => {
    setUpdatingId(id);
    axios
      .patch(`http://localhost:8000/api/alerts/${id}/`, { read_on_site: true })
      .then(() => fetchAlerts())
      .finally(() => setUpdatingId(null));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <Box
      sx={{
        textAlign: "right",
        direction: "rtl",
        p: { xs: 2, md: 3 },
        bgcolor: theme.palette.background.default,
      }}
    >
      <Typography variant="h5" fontWeight={700} mb={3} color="text.primary">
        🔔 هشدارهای قیمت
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : alerts.length === 0 ? (
        <Typography color="text.secondary">هشداری یافت نشد.</Typography>
      ) : (
        <Stack spacing={2}>
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              elevation={2}
              sx={{
                backgroundColor: alert.read_on_site
                  ? theme.palette.action.hover
                  : theme.palette.background.paper,
                borderRight: alert.read_on_site ? "none" : "4px solid #facc15",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <WarningAmberIcon color="warning" />
                    <Box>
                      <Typography fontWeight={600} color="text.primary">
                        {alert.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                      <Chip
                        label={`اختلاف ${alert.threshold_percent}%`}
                        size="small"
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Stack>

                  {alert.read_on_site ? (
                    <Chip
                      label="خوانده شده"
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <IconButton
                      color="success"
                      onClick={() => markAsRead(alert.id)}
                      sx={{
                        backgroundColor: theme.palette.success.main,
                        color: "#fff",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.success.dark ||
                            theme.palette.success.main,
                        },
                      }}
                    >
                      {updatingId === alert.id ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <CheckCircleIcon />
                      )}
                    </IconButton>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Alerts;
