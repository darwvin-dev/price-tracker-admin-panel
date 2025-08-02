import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import type { Price } from "../../types/Price";

const coreStores = ["Technolife", "Digikala", "Hamrahtel"];

function calculateAverage(prices: Price[]) {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((acc, p) => acc + p.price, 0);
  return sum / prices.length;
}

function formatDateTime(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("fa-IR") + " " + d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

function getPriceTrendIcon(current: number, previous?: number) {
  if (previous === undefined) return null;
  if (current > previous) return <TrendingUpIcon sx={{ color: "#2e7d32" }} fontSize="small" />;
  if (current < previous) return <TrendingDownIcon sx={{ color: "#c62828" }} fontSize="small" />;
  return <RemoveIcon sx={{ color: "#757575" }} fontSize="small" />;
}

export default function CorePriceComparison({ priceHistory }: { priceHistory: Price[] }) {
  // فیلتر کردن قیمت‌ها
  const corePrices = priceHistory.filter((p) => coreStores.includes(p.store));
  const otherPrices = priceHistory.filter((p) => !coreStores.includes(p.store));

  // میانگین‌ها با دقت بیشتر
  const avgCore = calculateAverage(corePrices);
  const avgOther = calculateAverage(otherPrices);

  const diff = avgCore - avgOther;
  const diffPercent = avgOther > 0 ? ((diff / avgOther) * 100).toFixed(2) : "0";

  // محاسبه بیشترین و کمترین قیمت برای هر دسته
  const maxCore = corePrices.length ? Math.max(...corePrices.map((p) => p.price)) : 0;
  const minCore = corePrices.length ? Math.min(...corePrices.map((p) => p.price)) : 0;
  const maxOther = otherPrices.length ? Math.max(...otherPrices.map((p) => p.price)) : 0;
  const minOther = otherPrices.length ? Math.min(...otherPrices.map((p) => p.price)) : 0;

  // مرتب‌سازی قیمت‌ها بر اساس تاریخ بروزرسانی (جدیدترین اول)
  const sortedCorePrices = [...corePrices].sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());
  const sortedOtherPrices = [...otherPrices].sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());

  // نگه داشتن قیمت قبلی برای نمایش روند قیمت (میانگین قبل از هر مورد)
  const corePrevPrices = sortedCorePrices.map((_, i, arr) => (i < arr.length - 1 ? arr[i + 1].price : undefined));
  const otherPrevPrices = sortedOtherPrices.map((_, i, arr) => (i < arr.length - 1 ? arr[i + 1].price : undefined));

  if (corePrices.length === 0 && otherPrices.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}>
        داده‌ای برای نمایش وجود ندارد.
      </Typography>
    );
  }

  return (
    <Paper sx={{ mt: 4, p: 3, borderRadius: 3, boxShadow: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          تحلیل قیمت فروشگاه‌های Core ⭐
        </Typography>
      </Box>

      <Typography fontSize={14} mb={1}>
        تعداد فروشگاه‌های <strong>منتخب (Core)</strong>: <strong>{corePrices.length}</strong>
      </Typography>
      <Typography fontSize={14} mb={1}>
        میانگین قیمت فروشگاه‌های <strong>منتخب (Core)</strong>:{" "}
        <strong style={{ color: "#2e7d32" }}>{avgCore.toLocaleString(undefined, { maximumFractionDigits: 2 })} ریال</strong>
      </Typography>
      <Typography fontSize={14} mb={1}>
        بیشترین قیمت Core: <strong>{maxCore.toLocaleString()} ریال</strong> - کمترین قیمت Core: <strong>{minCore.toLocaleString()} ریال</strong>
      </Typography>

      <Typography fontSize={14} mb={2}>
        تعداد سایر فروشگاه‌ها: <strong>{otherPrices.length}</strong>
      </Typography>
      <Typography fontSize={14} mb={1}>
        میانگین سایر فروشگاه‌ها:{" "}
        <strong style={{ color: "#c62828" }}>{avgOther.toLocaleString(undefined, { maximumFractionDigits: 2 })} ریال</strong>
      </Typography>
      <Typography fontSize={14} mb={1}>
        بیشترین قیمت سایر فروشگاه‌ها: <strong>{maxOther.toLocaleString()} ریال</strong> - کمترین قیمت سایر فروشگاه‌ها:{" "}
        <strong>{minOther.toLocaleString()} ریال</strong>
      </Typography>

      <Typography fontSize={14} mb={2}>
        تفاوت:{" "}
        <strong style={{ color: diff >= 0 ? "#2e7d32" : "#c62828" }}>
          {Math.abs(diff).toLocaleString()} ریال، {diffPercent}%
        </strong>
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* جدول فروشگاه‌های Core */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        فروشگاه‌های Core
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>فروشگاه</TableCell>
            <TableCell>قیمت</TableCell>
            <TableCell>آخرین بروزرسانی</TableCell>
            <TableCell>روند قیمت</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCorePrices.map((price, index) => (
            <TableRow key={`core-${index}`}>
              <TableCell>{price.store}</TableCell>
              <TableCell style={{ color: "#2e7d32", fontWeight: 700 }}>
                {price?.price?.toLocaleString()} <small>ریال</small>
              </TableCell>
              <TableCell>{formatDateTime(price.checked_at)}</TableCell>
              <TableCell>
                <Tooltip title="روند قیمت نسبت به بروزرسانی قبلی">
                  {getPriceTrendIcon(price.price, corePrevPrices[index]) ?? <></>}
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* جدول سایر فروشگاه‌ها */}
      {otherPrices.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            سایر فروشگاه‌ها
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>فروشگاه</TableCell>
                <TableCell>قیمت</TableCell>
                <TableCell>آخرین بروزرسانی</TableCell>
                <TableCell>روند قیمت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedOtherPrices.map((price, index) => (
                <TableRow key={`other-${index}`}>
                  <TableCell>{price.store}</TableCell>
                  <TableCell style={{ color: "#c62828", fontWeight: 700 }}>
                    {price.price?.toLocaleString()} <small>ریال</small>
                  </TableCell>
                  <TableCell>{formatDateTime(price.checked_at)}</TableCell>
                  <TableCell>
                    <Tooltip title="روند قیمت نسبت به بروزرسانی قبلی">
                      {getPriceTrendIcon(price.price, otherPrevPrices[index]) || <></>}
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  );
}
