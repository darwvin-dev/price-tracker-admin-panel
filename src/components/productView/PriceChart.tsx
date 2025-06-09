import {
  Card,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useTheme,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ReferenceLine,
} from "recharts";
import { useState, useCallback, useRef } from "react";

type Price = {
  checked_at: string;
  price: number;
};

export default function PriceChart({
  stores,
  selectedStore,
  setSelectedStore,
  chartData,
}: {
  stores: string[];
  selectedStore: string;
  setSelectedStore: (s: string) => void;
  chartData: Price[];
}) {
  const theme = useTheme();

  const [zoomRange, setZoomRange] = useState<[number, number]>([0, chartData.length - 1]);
  const chartRef = useRef<HTMLDivElement | null>(null);

  const handleScrollZoom = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      const rangeSize = zoomRange[1] - zoomRange[0];
      const zoomStep = Math.max(2, Math.floor(rangeSize * 0.1));

      if (delta > 0 && rangeSize > 10) {
        // Zoom In
        setZoomRange(([start, end]) => [start + zoomStep, end - zoomStep]);
      } else if (delta < 0) {
        // Zoom Out
        setZoomRange(([start, end]) => [
          Math.max(0, start - zoomStep),
          Math.min(chartData.length - 1, end + zoomStep),
        ]);
      }
    },
    [zoomRange, chartData.length]
  );

  const handleResetZoom = () => {
    setZoomRange([0, chartData.length - 1]);
  };

  const displayedData = chartData.slice(zoomRange[0], zoomRange[1] + 1);
  const latestPrice = chartData?.[chartData.length - 1]?.price;

  return (
    <Card elevation={3} sx={{ mb: 4, p: 3, borderRadius: 4 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="store-select-label">فروشگاه</InputLabel>
          <Select
            labelId="store-select-label"
            value={selectedStore}
            label="فروشگاه"
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            <MenuItem value="all">همه فروشگاه‌ها</MenuItem>
            {stores.map((s) => (
              <MenuItem value={s} key={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
          نمودار قیمت (ریال)
        </Typography>

        {zoomRange[0] !== 0 || zoomRange[1] !== chartData.length - 1 ? (
          <Button size="small" onClick={handleResetZoom} variant="outlined" color="secondary">
            بازنشانی بزرگ‌نمایی
          </Button>
        ) : null}
      </Box>

      <Box onWheel={handleScrollZoom} ref={chartRef}>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={displayedData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="checked_at"
              tickFormatter={(d) => new Date(d).toLocaleDateString("fa-IR")}
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              tickFormatter={(v) => `${v.toLocaleString()} ریال`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.default,
                borderColor: theme.palette.divider,
                borderRadius: 8,
              }}
              labelStyle={{
                color: theme.palette.text.primary,
                fontWeight: 'bold',
              }}
              itemStyle={{
                color: theme.palette.text.secondary,
                fontSize: 13,
              }}
              formatter={(value: number) =>
                `${value.toLocaleString()} ریال`
              }
              labelFormatter={(label) =>
                `تاریخ: ${new Date(label).toLocaleDateString("fa-IR")}`
              }
            />
            <Legend wrapperStyle={{ fontSize: 13, color: theme.palette.text.secondary }} />
            <Line
              type="monotone"
              dataKey="price"
              name="قیمت به ریال"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={{
                r: 4,
                fill: theme.palette.primary.light,
                stroke: theme.palette.primary.main,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                stroke: theme.palette.secondary.main,
                fill: theme.palette.secondary.light,
              }}
            />
            {latestPrice && (
              <ReferenceLine
                y={latestPrice}
                stroke={theme.palette.success.main}
                strokeDasharray="4 4"
                label={{
                  value: `آخرین قیمت: ${latestPrice.toLocaleString()} ریال`,
                  position: "right",
                  fontSize: 12,
                  fill: theme.palette.success.main,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
