import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

interface AppSetting {
  key: string;
  value: string;
}

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState<string>("");

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
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}api/settings/`, [
        {
          key: "auto_update_interval_minutes",
          value: interval,
        },
      ]);
      alert("✅ تنظیمات ذخیره شد.");
    } catch (err) {
      console.error("خطا در ذخیره:", err);
      alert("❌ خطا در ذخیره تنظیمات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Box p={3} dir="rtl">
      <Typography variant="h5" fontWeight={700} mb={2}>
        ⚙️ تنظیمات سیستم
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 400 }}>
        {loading ? (
          <CircularProgress />
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
              onClick={saveSettings}
              fullWidth
            >
              ذخیره تنظیمات
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SettingsPage;
