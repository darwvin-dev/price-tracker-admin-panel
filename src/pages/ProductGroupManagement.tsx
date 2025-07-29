import {
  Box,
  Button,
  Typography,
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
  Checkbox,
  TextField,
  Stack,
  Autocomplete,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VisibilityRounded } from "@mui/icons-material";
import type { Product } from "../types/product";

type ProductGroup = {
  id: number;
  name: string;
  created_at: string;
  products: Product[];
};

const ProductGroupManagement = () => {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [editGroupId, setEditGroupId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
    fetchProducts();
  }, []);

  const fetchGroups = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}api/product-groups/`)
      .then((res) => setGroups(res.data))
      .finally(() => setLoading(false));
  };

  const fetchProducts = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}api/products/`)
      .then((res) => setProducts(res.data));
  };

  const openEditForm = (group?: ProductGroup) => {
    if (group) {
      setEditGroupId(group.id);
      setGroupName(group.name);
      setSelectedProducts(
        products.filter((p) => group.products.some((gp) => gp.id === p.id))
      );
    } else {
      setEditGroupId(null);
      setGroupName("");
      setSelectedProducts([]);
    }
  };

  const closeEditForm = () => {
    setEditGroupId(null);
    setGroupName("");
    setSelectedProducts([]);
  };

  const handleSave = () => {
    if (!groupName.trim()) {
      alert("نام گروه را وارد کنید");
      return;
    }
    setSaving(true);
    const payload = {
      name: groupName,
      product_ids: selectedProducts.map((p) => p.id),
    };

    const request = editGroupId
      ? axios.put(
          `${import.meta.env.VITE_API_URL}api/product-groups/${editGroupId}/`,
          payload
        )
      : axios.post(
          `${import.meta.env.VITE_API_URL}api/product-groups/`,
          payload
        );

    request
      .then(() => {
        fetchGroups();
        closeEditForm();
      })
      .finally(() => setSaving(false));
  };

  const handleDelete = (id: number) => {
    axios
      .delete(`${import.meta.env.VITE_API_URL}api/product-groups/${id}/`)
      .then(() => {
        setGroups((prev) => prev.filter((g) => g.id !== id));
        if (bulkDeleteIds.includes(id)) {
          setBulkDeleteIds((prev) => prev.filter((bid) => bid !== id));
        }
      });
  };

  const handleBulkDelete = () => {
    Promise.all(
      bulkDeleteIds.map((id) =>
        axios.delete(`${import.meta.env.VITE_API_URL}api/product-groups/${id}/`)
      )
    ).then(() => {
      setGroups((prev) => prev.filter((g) => !bulkDeleteIds.includes(g.id)));
      setBulkDeleteIds([]);
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setBulkDeleteIds(groups.map((g) => g.id));
    } else {
      setBulkDeleteIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    if (bulkDeleteIds.includes(id)) {
      setBulkDeleteIds((prev) => prev.filter((bid) => bid !== id));
    } else {
      setBulkDeleteIds((prev) => [...prev, id]);
    }
  };

  return (
    <Box p={2} dir="rtl" sx={{ direction: "rtl" }}>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        flexDirection="row-reverse"
        gap={2}
        sx={{ direction: "rtl" }}
      >
        <Typography variant="h5" fontWeight={700} color="text.primary">
          مدیریت گروه محصولات
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openEditForm()}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          افزودن گروه جدید
        </Button>

        {bulkDeleteIds.length > 0 && (
          <Button variant="outlined" color="error" onClick={handleBulkDelete}>
            حذف گروه‌های انتخاب شده ({bulkDeleteIds.length})
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ overflowX: "auto", borderRadius: 3 }}>
        <Table
          stickyHeader
          style={{ direction: "rtl" }}
          size="small"
          sx={{ minWidth: 700 }}
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    bulkDeleteIds.length > 0 &&
                    bulkDeleteIds.length < groups.length
                  }
                  checked={
                    groups.length > 0 && bulkDeleteIds.length === groups.length
                  }
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                نام گروه
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                تعداد محصولات
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                تاریخ ایجاد
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                عملیات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={bulkDeleteIds.includes(group.id)}
                    onChange={() => toggleSelectOne(group.id)}
                  />
                </TableCell>
                <TableCell align="center">{group.name}</TableCell>
                <TableCell align="center">{group.products.length}</TableCell>
                <TableCell align="center">
                  {new Date(group.created_at).toLocaleDateString("fa-IR")}
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      color="primary"
                      onClick={() => openEditForm(group)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="info"
                      size="small"
                      onClick={() => navigate(`/product-groups/${group.id}`)}
                    >
                      <VisibilityRounded fontSize="small" />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => setDeleteId(group.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  گروهی برای نمایش وجود ندارد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        dir="rtl"
      >
        <DialogTitle>حذف گروه محصول</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از حذف این گروه مطمئن هستید؟ این عملیات قابل بازگشت نیست.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            انصراف
          </Button>
          <Button
            onClick={() => {
              if (deleteId !== null) {
                handleDelete(deleteId);
                setDeleteId(null);
              }
            }}
            variant="contained"
            color="error"
          >
            حذف کن
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editGroupId !== null || groupName !== ""}
        onClose={closeEditForm}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <DialogTitle>
          {editGroupId ? "ویرایش گروه محصول" : "افزودن گروه جدید"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="نام گروه"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Autocomplete
            multiple
            options={products}
            getOptionLabel={(option) => option.name}
            value={selectedProducts}
            onChange={(_, newValue) => setSelectedProducts(newValue)}
            renderTags={(value: Product[], getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={
                    <span>
                      {option.name}{" "}
                      {option.color && (
                        <span
                          style={{ color: option.color, fontWeight: "bold" }}
                        >
                          ({option.color})
                        </span>
                      )}
                    </span>
                  }
                  {...getTagProps({ index })}
                />
              ))
            }
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Typography
                  component="span"
                  sx={{
                    mr: 1,
                    fontWeight: "bold",
                    color: option.color || "inherit",
                  }}
                >
                  ■
                </Typography>
                {option.name} {option.color ? `(${option.color})` : ""}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="انتخاب محصولات"
                placeholder="محصولات..."
              />
            )}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditForm} startIcon={<CancelIcon />}>
            انصراف
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductGroupManagement;
