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
  Stack,
  IconButton,
  Paper,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Checkbox,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "../types/product";
import CategorySelector from "../components/CategorySelector";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const theme = useTheme();
  const navigate = useNavigate();

  const handleAddProduct = () => navigate("/add-product");

  useEffect(() => {
    const fetchProducts = () => {
      const params = new URLSearchParams();

      selectedCategories.forEach((id) =>
        params.append("category", id.toString())
      );

      if (minPrice.trim() !== "") params.append("min_price", minPrice);
      if (maxPrice.trim() !== "") params.append("max_price", maxPrice);

      axios
        .get(
          `${import.meta.env.VITE_API_URL}api/products/?${params.toString()}`
        )
        .then((res) => setProducts(res.data));
    };

    fetchProducts();
  }, [selectedCategories, minPrice, maxPrice]);

  const handleOpenDeleteModal = (id: number) => setDeleteId(id);
  const handleCloseDeleteModal = () => setDeleteId(null);

  const handleDelete = () => {
    if (deleteId === null) return;

    if (deleteId === -1) {
      axios
        .post(`${import.meta.env.VITE_API_URL}api/products/bulk-delete/`, {
          ids: selectedIds,
        })
        .then(() => {
          setProducts(products.filter((p) => !selectedIds.includes(p.id)));
          setSelectedIds([]);
          setDeleteId(null);
        });
    } else {
      axios
        .delete(
          `${import.meta.env.VITE_API_URL}api/products/${deleteId}/delete/`
        )
        .then(() => {
          setProducts(products.filter((p) => p.id !== deleteId));
          setDeleteId(null);
        });
    }
  };

  const handleUpdatePrices = (id: number) => {
    setUpdating(true);
    axios
      .post(`${import.meta.env.VITE_API_URL}api/products/${id}/update-prices/`)
      .then(() => {
        axios
          .get(`${import.meta.env.VITE_API_URL}api/products/`)
          .then((res) => setProducts(res.data));
      })
      .finally(() => setUpdating(false));
  };

  const iconButtonStyle = {
    width: 36,
    height: 36,
    borderRadius: 2,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: theme.palette.background.default,
        direction: "ltr",
        p: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700} color="text.primary">
          📦 لیست محصولات
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <CategorySelector
            selectedCategories={selectedCategories.map((id) => ({
              id,
              name: "",
            }))}
            onChange={(cats) => setSelectedCategories(cats.map((c) => c.id))}
          />

          <TextField
            label="حداقل قیمت (ریال)"
            value={Number(minPrice).toLocaleString()}
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, "");
              if (/^\d*$/.test(raw)) setMinPrice(raw);
            }}
            size="small"
            sx={{ width: 150 }}
            inputProps={{ inputMode: "numeric" }}
          />

          <TextField
            label="حداکثر قیمت (ریال)"
            value={Number(maxPrice).toLocaleString()}
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, "");
              if (/^\d*$/.test(raw)) setMaxPrice(raw);
            }}
            size="small"
            sx={{ width: 150 }}
            inputProps={{ inputMode: "numeric" }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor:
                  theme.palette.primary.dark || theme.palette.primary.main,
              },
            }}
          >
            افزودن محصول جدید
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteId(-1)}
          >
            حذف دسته‌ای ({selectedIds.length})
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          overflowX: "auto",
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 950 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < products.length
                  }
                  checked={
                    products.length > 0 &&
                    selectedIds.length === products.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(products.map((p) => p.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </TableCell>
              {[
                "تصویر",
                "نام محصول",
                "کمترین قیمت",
                "بیشترین قیمت",
                "اختلاف قیمت",
                "عملیات",
              ].map((col, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    whiteSpace: "nowrap",
                    fontSize: "0.95rem",
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody style={{ direction: "rtl" }}>
            {products.map((p) => {
              const diff = p.max_price - p.min_price;
              const diffPercent = Number(
                ((diff / p.min_price) * 100).toFixed(1)
              );
              const isLargeDiff = diffPercent > 20;

              return (
                <TableRow
                  key={p.id}
                  hover
                  sx={{
                    transition: "background 0.2s",
                    "&:hover": { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => {
                        setSelectedIds((prev) =>
                          prev.includes(p.id)
                            ? prev.filter((id) => id !== p.id)
                            : [...prev, p.id]
                        );
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Avatar
                      variant="rounded"
                      src={p.image || ""}
                      alt={p.name}
                      sx={{
                        width: 56,
                        height: 56,
                        mx: "auto",
                        border: `2px solid ${theme.palette.divider}`,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        maxWidth: 300,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: theme.palette.text.primary,
                      }}
                    >
                      {p.name} {p.color} {p.is_core ? "⭐" : ""}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {p.min_price.toLocaleString()} ریال
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {p.max_price.toLocaleString()} ریال
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${diff.toLocaleString()} ریال (${diffPercent}٪)`}
                      color={isLargeDiff ? "error" : "warning"}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => navigate(`/products/${p.id}`)}
                        sx={{
                          ...iconButtonStyle,
                          backgroundColor: theme.palette.primary.main,
                          "&:hover": {
                            backgroundColor:
                              theme.palette.primary.dark ||
                              theme.palette.primary.main,
                          },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleOpenDeleteModal(p.id)}
                        sx={{
                          ...iconButtonStyle,
                          backgroundColor: theme.palette.error.main,
                          "&:hover": {
                            backgroundColor:
                              theme.palette.error.dark ||
                              theme.palette.error.main,
                          },
                        }}
                      >
                        🗑
                      </IconButton>

                      <IconButton
                        color="secondary"
                        size="small"
                        onClick={() => handleUpdatePrices(p.id)}
                        sx={{
                          ...iconButtonStyle,
                          backgroundColor: theme.palette.secondary.main,
                          "&:hover": {
                            backgroundColor:
                              theme.palette.secondary.dark ||
                              theme.palette.secondary.main,
                          },
                        }}
                      >
                        {updating ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          "🔄"
                        )}
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={deleteId !== null}
        onClose={handleCloseDeleteModal}
        dir="rtl"
      >
        <DialogTitle>حذف محصول</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟ این عملیات قابل
            بازگشت نیست.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="inherit">
            انصراف
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            حذف کن
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
