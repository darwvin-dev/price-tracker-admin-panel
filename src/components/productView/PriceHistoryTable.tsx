import {
  Card,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import axios from "axios";
import type { Price } from "../../types/Price";

type Props = {
  productId: string;
  stores: string[];
  setSnackbar: React.Dispatch<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>;
};

export type PriceHistoryTableRef = {
  refresh: () => void;
};

const PriceHistoryTable = forwardRef<PriceHistoryTableRef, Props>(
  ({ productId, stores, setSnackbar }, ref) => {
    const [prices, setPrices] = useState<Price[]>([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [selectedStore, setSelectedStore] = useState("all");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDialog, setConfirmDialog] = useState({
      open: false,
      id: null as number | null,
    });

    const PAGE_SIZE = 10;

    const fetchPrices = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}api/products/${productId}/all-price-history/`,
          {
            params: {
              store: selectedStore,
              page,
              page_size: PAGE_SIZE,
            },
          }
        );
        setPrices(res.data.results);
        setCount(Math.ceil(res.data.count / PAGE_SIZE));
      } catch {
        setSnackbar({
          open: true,
          message: "خطا در دریافت قیمت‌ها",
          severity: "error",
        });
      }
      setLoading(false);
    };

    useImperativeHandle(ref, () => ({
      refresh: fetchPrices,
    }));

    useEffect(() => {
      fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId, selectedStore, page]);

    const handleAskDelete = (id: number) =>
      setConfirmDialog({ open: true, id });
    const handleCancelDelete = () =>
      setConfirmDialog({ open: false, id: null });

    const handleConfirmDelete = async () => {
      if (!confirmDialog.id) return;
      setDeletingId(confirmDialog.id);
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}api/delete-price-history/${confirmDialog.id}/`
        );
        setSnackbar({
          open: true,
          message: "رکورد حذف شد!",
          severity: "success",
        });
        fetchPrices();
      } catch {
        setSnackbar({
          open: true,
          message: "خطا در حذف رکورد!",
          severity: "error",
        });
      }
      setDeletingId(null);
      setConfirmDialog({ open: false, id: null });
    };

    const columns: GridColDef[] = [
      { field: "store", headerName: "فروشگاه", width: 140, renderCell: (params) => `${params.row.store} ${params.row.store_info.is_core ? "⭐" : ""}`},
      {
        field: "note",
        headerName: "توضیح",
        width: 140,
        renderCell: (params) => <span>{params.value}</span>,
      },
      {
        field: "price",
        headerName: "قیمت",
        width: 200,
        renderCell: (params) => (
          <Typography fontWeight={500} color="primary">
            {params.value.toLocaleString()} ریال
          </Typography>
        ),
      },
      { field: "checked_at", headerName: "تاریخ ثبت", width: 120 },
      { field: "crawler_name", headerName: "کرالر", width: 120 },
      {
        field: "actions",
        headerName: "عملیات",
        width: 90,
        renderCell: (params: GridRenderCellParams) => (
          <IconButton
            aria-label="حذف"
            color="error"
            size="small"
            onClick={() => handleAskDelete(params.row.id)}
            disabled={deletingId === params.row.id}
          >
            {deletingId === params.row.id ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <DeleteIcon fontSize="small" />
            )}
          </IconButton>
        ),
      },
    ];

    return (
      <Card
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 4,
          maxWidth: "100%",
          overflowX: "auto",
          bgcolor: "#f9fafb",
        }}
      >
        <Typography variant="h6" fontWeight={700} color="secondary" mb={2}>
          تاریخچه قیمت‌ها
        </Typography>

        <Box mb={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setPage(1);
              }}
              displayEmpty
            >
              <MenuItem value="all">همه فروشگاه‌ها</MenuItem>
              {stores.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ width: "100%", minHeight: 400 }}>
          <DataGrid
            rows={prices.map((p) => ({
              ...p,
              checked_at: new Intl.DateTimeFormat("fa-IR", {
                dateStyle: "medium",
              }).format(new Date(p.checked_at)),
            }))}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            sx={{
              borderRadius: 2,
              backgroundColor: "white",
              "& .MuiDataGrid-cell": {
                py: 1,
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f0f4f8",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f9f9f9",
              },
            }}
            disableRowSelectionOnClick
            rowHeight={52}
            hideFooter
            localeText={{
              noRowsLabel: loading ? "در حال بارگذاری..." : "رکوردی یافت نشد",
            }}
          />
        </Box>

        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={count}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="medium"
          />
        </Box>

        <Dialog
          open={confirmDialog.open}
          onClose={handleCancelDelete}
          dir="rtl"
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle fontWeight={700}>تایید حذف قیمت</DialogTitle>
          <DialogContent>
            آیا از حذف این رکورد قیمت مطمئن هستید؟ این عملیات قابل بازگشت نیست.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="inherit">
              انصراف
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              startIcon={
                deletingId === confirmDialog.id ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              حذف
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    );
  }
);

export default PriceHistoryTable;
