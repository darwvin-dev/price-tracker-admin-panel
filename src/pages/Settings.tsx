import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import axios from "axios";

interface AppSetting {
  key: string;
  value: string;
}

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interval, setInterval] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchSettings = async () => {
    try {
      const res = await axios.get<AppSetting[]>(
        `${import.meta.env.VITE_API_URL}api/settings/`
      );
      const intervalSetting = res.data.find(
        (s) => s.key === "auto_update_interval_minutes"
      );
      setInterval(intervalSetting?.value || "30");
    } catch (err) {
      console.error("خطا در دریافت تنظیمات:", err);
      setSnackbar({
        open: true,
        message: "خطا در دریافت تنظیمات",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (isNaN(Number(interval)) || Number(interval) <= 0) {
      setSnackbar({
        open: true,
        message: "مقدار وارد شده معتبر نیست.",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}api/settings/`, [
        {
          key: "auto_update_interval_minutes",
          value: interval,
        },
      ]);
      setSnackbar({
        open: true,
        message: "تنظیمات با موفقیت ذخیره شد.",
        severity: "success",
      });
    } catch (err) {
      console.error("خطا در ذخیره:", err);
      setSnackbar({
        open: true,
        message: "خطا در ذخیره تنظیمات",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Box p={3} dir="rtl" display="flex" justifyContent="center">
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ⚙️ تنظیمات سیستم
          </Typography>

          {loading ? (
            <>
              <Skeleton height={56} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={40} />
            </>
          ) : (
            <>
              <TextField
                label="فاصله بروزرسانی قیمت‌ها (دقیقه)"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                type="number"
                fullWidth
                margin="normal"
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={saveSettings}
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{ mt: 1 }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : "ذخیره تنظیمات"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
