import {
  Card,
  Avatar,
  CardContent,
  Typography,
  Button,
  Divider,
  Box,
  Chip,
  TextField,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useRef, useState } from "react";
import axios from "axios";
import type { Product } from "../../types/product";

export default function ProductHeader({
  product,
  loading,
  onUpdateAll,
  setSnackbar,
}: {
  product: Product;
  loading: boolean;
  onUpdateAll: () => void;
  setSnackbar: (args: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
}) {
  const allPrices = product?.price_history.map((p) => p.price);
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const lastPrice = allPrices.length ? allPrices[allPrices.length - 1] : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [priceDiff, setPriceDiff] = useState<string>(
    product.user_price_diff?.toString() || ""
  );
  const [saving, setSaving] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    setSaving(true);
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}api/products/${product.id}/update/`,
        formData
      );
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handlePriceDiffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceDiff(e.target.value);
  };

  const handlePriceDiffSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("user_price_diff", priceDiff);
      await axios.patch(
        `${import.meta.env.VITE_API_URL}api/products/${product.id}/update/`,
        formData
      );
      setSnackbar({
        open: true,
        message: "اختلاف قیمت ذخیره شد!",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "ذخیره اختلاف قیمت با خطا مواجه شد!",
        severity: "error",
      });
    }
    setSaving(false);
  };

  return (
    <Card
      elevation={5}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        mb: 3,
        borderRadius: 4,
        gap: 2,
      }}
    >
      <Avatar
        src={product.image || undefined}
        alt={product.name}
        variant="rounded"
        sx={{
          width: 96,
          height: 96,
          border: "2px solid #3b82f6",
          cursor: "pointer",
        }}
        onClick={handleImageClick}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />

      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight={900} color="primary">
          {product.name} {product.color}
        </Typography>
        <Typography fontSize="15px" color="text.secondary" mt={1}>
          <strong>تاریخ ثبت:</strong>{" "}
          {new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date(product.created_at))}
        </Typography>

        <Box mt={2} display="flex" alignItems="center" gap={2}>
          <TextField
            label="اختلاف قیمت الارم (%)"
            size="small"
            value={priceDiff}
            onChange={handlePriceDiffChange}
            type="number"
            sx={{ width: 150 }}
          />
          <Button
            variant="outlined"
            onClick={handlePriceDiffSave}
            disabled={saving}
          >
            ذخیره
          </Button>
        </Box>

        <Button
          startIcon={<AutorenewIcon />}
          color="primary"
          variant="contained"
          onClick={onUpdateAll}
          disabled={loading}
          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 180, mt: 2 }}
        >
          {loading ? "در حال بروزرسانی..." : "بروزرسانی قیمت‌ها"}
        </Button>

        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" gap={2} alignItems="center">
          <Chip
            icon={<TrendingUpIcon color="error" />}
            label={`بیشترین قیمت: ${maxPrice.toLocaleString()} ریال`}
            color="error"
          />
          <Chip
            icon={<TrendingDownIcon color="success" />}
            label={`کمترین قیمت: ${minPrice.toLocaleString()} ریال`}
            color="success"
          />
          <Chip
            icon={<AttachMoneyIcon />}
            label={`آخرین قیمت: ${lastPrice?.toLocaleString() || "—"} ریال`}
            color="info"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
