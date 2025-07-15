import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Category } from "../types/Category";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const navigate = useNavigate();
  const theme = useTheme();

  const fetchCategories = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}api/categories/`)
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = () => {
    if (deleteId === null) return;
    axios
      .delete(`${import.meta.env.VITE_API_URL}api/categories/${deleteId}/delete/`)
      .then(() => {
        setCategories(categories.filter((cat) => cat.id !== deleteId));
        setDeleteId(null);
      });
  };

  return (
    <Box p={{ xs: 2, md: 3 }} dir="rtl">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          📚 دسته‌بندی‌ها
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/categories/create")}
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
          افزودن دسته‌بندی
        </Button>
      </Box>

      {/* Table */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflowX: "auto",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography color="text.secondary">
              هیچ دسته‌بندی‌ای هنوز ثبت نشده است.
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>نام</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>تعداد محصولات</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  عملیات
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow
                  key={cat.id}
                  hover
                  sx={{
                    transition: "background 0.2s",
                    "&:hover": { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.product_count || 0}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => navigate(`/categories/${cat.id}`)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => navigate(`/categories/${cat.id}/edit`)}
                      color="secondary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => setDeleteId(cat.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} dir="rtl">
        <DialogTitle>حذف دسته‌بندی</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از حذف این دسته‌بندی اطمینان دارید؟ این عملیات قابل بازگشت نیست.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">
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

export default Categories;
