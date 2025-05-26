import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Paper,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const products = [
  {
    id: 1,
    title: "گوشی سامسونگ Galaxy A54",
    image:
      "https://dkstatics-public.digikala.com/digikala-products/2e64a6b0.jpg",
    category: "موبایل",
    minPrice: 12700000,
    maxPrice: 14200000,
  },
  {
    id: 2,
    title: "لپ‌تاپ لنوو IdeaPad 3",
    image:
      "https://dkstatics-public.digikala.com/digikala-products/1c11aa6f.jpg",
    category: "لپ‌تاپ",
    minPrice: 22800000,
    maxPrice: 26500000,
  },
];

const Products = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate("/add-product");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        direction: "ltr",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" fontWeight={600} color="text.primary">
          📦 لیست محصولات
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          افزودن محصول
        </Button>
      </Box>

      {/* Table */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Paper elevation={0} sx={{ borderRadius: 0 }}>
          <Table
            stickyHeader
            size="small"
            sx={{ minWidth: 900, direction: "rtl" }}
          >
            <TableHead>
              <TableRow>
                {[
                  "عملیات",
                  "اختلاف",
                  "بیشترین قیمت",
                  "کمترین قیمت",
                  "دسته‌بندی",
                  "نام محصول",
                  "تصویر",
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      fontWeight: 600,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => {
                const diff = p.maxPrice - p.minPrice;
                const diffPercent = Number(
                  ((diff / p.minPrice) * 100).toFixed(1)
                );

                return (
                  <TableRow key={p.id} hover sx={{ height: 72 }}>
                    {/* عملیات */}
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <IconButton color="primary" size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="secondary" size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>

                    {/* اختلاف */}
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        color={diffPercent > 20 ? "error.main" : "warning.main"}
                      >
                        {diff.toLocaleString()} تومان ({diffPercent}%)
                      </Typography>
                    </TableCell>

                    {/* قیمت‌ها */}
                    <TableCell align="center">
                      {p.maxPrice.toLocaleString()} تومان
                    </TableCell>
                    <TableCell align="center">
                      {p.minPrice.toLocaleString()} تومان
                    </TableCell>

                    {/* دسته‌بندی */}
                    <TableCell align="center">
                      <Chip
                        label={p.category}
                        size="small"
                        sx={{
                          bgcolor:
                            theme.palette.mode === "light"
                              ? theme.palette.info.light
                              : theme.palette.info.dark,
                          color: theme.palette.info.contrastText,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>

                    {/* نام */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {p.title}
                      </Typography>
                    </TableCell>

                    {/* تصویر */}
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={p.image}
                        alt={p.title}
                        sx={{ width: 56, height: 56 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
};

export default Products;
