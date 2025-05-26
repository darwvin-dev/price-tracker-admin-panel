import { Card, Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

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
  return (
    <Card elevation={2} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>فروشگاه</InputLabel>
          <Select
            value={selectedStore}
            label="فروشگاه"
            onChange={e => setSelectedStore(e.target.value)}
          >
            <MenuItem value="all">همه فروشگاه‌ها</MenuItem>
            {stores.map((s) => (
              <MenuItem value={s} key={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>نمودار قیمت</Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="checked_at" tickFormatter={d => new Date(d).toLocaleDateString()} />
          <YAxis />
          <Tooltip formatter={v => v.toLocaleString()} labelFormatter={l => `تاریخ: ${new Date(l).toLocaleDateString()}`} />
          <Legend />
          <Line type="monotone" dataKey="price" name="قیمت" stroke="#1976d2" strokeWidth={3} dot />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
