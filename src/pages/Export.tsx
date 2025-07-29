import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import type { Product } from "../types/product";
import type { ExportFormat } from "../types/export.types";

const EXPORT_FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "excel", label: "Excel (.xlsx)" },
  { value: "pdf", label: "PDF" },
];

export default function ExportPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [includePrices, setIncludePrices] = useState(true);
  const [includeProducts, setIncludeProducts] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products/?page_size=1000`)
      .then((res) => setProducts(res.data || []))
      .catch(() => alert("❌ خطا در دریافت لیست محصولات"));
  }, []);

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products);
    }
  };

  const handleExport = async () => {
    if (!includePrices && !includeProducts) {
      alert("حداقل یک گزینه برای خروجی باید فعال باشد.");
      return;
    }

    setLoading(true);

    const payload = {
      format,
      product_ids: selectedProducts.map((p) => p.id),
      date_from: fromDate || null,
      date_to: toDate || null,
      include: [
        ...(includeProducts ? ["products"] : []),
        ...(includePrices ? ["prices"] : []),
      ],
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}api/export/custom/`, payload, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export.${format === "excel" ? "xlsx" : "pdf"}`;
      link.click();
      window.URL.revokeObjectURL(url);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("خطا در خروجی گرفتن");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }} dir="rtl">
      <Typography variant="h5" gutterBottom>
        📤 خروجی گرفتن از داده‌ها
      </Typography>

      {/* فرمت خروجی */}
      <Box mt={2}>
        <Typography variant="subtitle1">فرمت خروجی</Typography>
        <Select
          value={format}
          onChange={(e) => setFormat(e.target.value as ExportFormat)}
          fullWidth
        >
          {EXPORT_FORMATS.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* انتخاب محصولات با جستجو و Select All */}
      <Box mt={2}>
        <Typography variant="subtitle1" mb={1} display="flex" justifyContent="space-between" alignItems="center">
          محصولات
          <Button size="small" onClick={handleSelectAll}>
            {selectedProducts.length === products.length ? "لغو انتخاب همه" : "انتخاب همه"}
          </Button>
        </Typography>

        <Autocomplete
          multiple
          options={products}
          getOptionLabel={(option) => `${option.name} ${option.color}`}
          value={selectedProducts}
          onChange={(_, newValue) => setSelectedProducts(newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => <TextField {...params} placeholder="جستجو و انتخاب محصول..." />}
        />
      </Box>

      {/* بازه زمانی */}
      <Box mt={2}>
        <TextField
          fullWidth
          type="date"
          label="از تاریخ"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </Box>
      <Box mt={2}>
        <TextField
          fullWidth
          type="date"
          label="تا تاریخ"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </Box>

      {/* نوع اطلاعات */}
      <Box mt={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeProducts}
              onChange={() => setIncludeProducts((prev) => !prev)}
            />
          }
          label="اطلاعات محصول"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includePrices}
              onChange={() => setIncludePrices((prev) => !prev)}
            />
          }
          label="قیمت‌ها"
        />
      </Box>

      {/* دکمه خروجی */}
      <Box mt={3}>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "📥 دریافت خروجی"}
        </Button>
      </Box>
    </Container>
  );
}
