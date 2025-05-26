import { Card, Avatar, CardContent, Typography, Button, Divider, Box, Chip } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import type { Product } from "../../pages/ProductView";

export default function ProductHeader({
  product,
  loading,
  onUpdateAll,
}: {
  product: Product;
  loading: boolean;
  onUpdateAll: () => void;
}) {
  const allPrices = (product?.price_history || []).map((p) => p.price);
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const lastPrice = allPrices.length ? allPrices[allPrices.length - 1] : null;

  return (
    <Card elevation={5} sx={{ display: "flex", alignItems: "center", p: 2, mb: 3, borderRadius: 4 }}>
      <Avatar
        src={product.image || undefined}
        alt={product.name}
        variant="rounded"
        sx={{ width: 96, height: 96, mr: 3, border: "2px solid #3b82f6" }}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight={900} color="primary">{product.name}</Typography>
        <Typography fontSize="15px" color="text.secondary" mt={1}>
          <strong>تاریخ ثبت:</strong> {new Date(product.created_at).toLocaleDateString()}
        </Typography>
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
          <Chip icon={<TrendingUpIcon color="error" />} label={`بیشترین قیمت: ${maxPrice.toLocaleString()} ریال`} color="error" />
          <Chip icon={<TrendingDownIcon color="success" />} label={`کمترین قیمت: ${minPrice.toLocaleString()} ریال`} color="success" />
          <Chip icon={<AttachMoneyIcon />} label={`آخرین قیمت: ${lastPrice?.toLocaleString() || "—"} ریال`} color="info" />
        </Box>
      </CardContent>
    </Card>
  );
}
