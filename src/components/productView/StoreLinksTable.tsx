import {
  Box,
  Card,
  Typography,
  Button,
  InputBase,
  IconButton,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import LinkIcon from "@mui/icons-material/Link";
import { useState } from "react";
import type { StoreLink, Price, Product } from "../../pages/ProductView";

type Props = {
  product: Product;
  priceHistory: Price[];
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: "success" | "error" | "info" | "warning";
    }>
  >;
  loading: boolean;
  getData: () => void
};

type EditableLinkState = {
  [storeId: number]: { editing: boolean; url: string };
};

export default function StoreLinksTable({
  product,
  priceHistory,
  setProduct,
  setSnackbar,
  loading,
  getData
}: Props) {
  const [editableLinks, setEditableLinks] = useState<EditableLinkState>({});

  const handleEditClick = (storeId: number, currentUrl: string) => {
    setEditableLinks((prev) => ({
      ...prev,
      [storeId]: { editing: true, url: currentUrl },
    }));
  };

  const handleLinkChange = (storeId: number, value: string) => {
    setEditableLinks((prev) => ({
      ...prev,
      [storeId]: { ...prev[storeId], url: value },
    }));
  };

  const handleSaveClick = async (storeLink: StoreLink) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/storelinks/${storeLink.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: editableLinks[storeLink.id].url }),
      });
      setProduct((old) =>
        old
          ? {
              ...old,
              store_links: old.store_links.map((link) =>
                link.id === storeLink.id
                  ? { ...link, url: editableLinks[storeLink.id].url }
                  : link
              ),
            }
          : old
      );
      setEditableLinks((prev) => ({
        ...prev,
        [storeLink.id]: { editing: false, url: prev[storeLink.id].url },
      }));
      setSnackbar({
        open: true,
        message: "لینک ذخیره شد!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "ذخیره لینک انجام نشد!",
        severity: "error",
      });
    }
  };

  const handleUpdateStorePrice = async (storeLink: StoreLink) => {
    setSnackbar({
      open: true,
      message: "در حال بروزرسانی قیمت فروشگاه...",
      severity: "info",
    });
    try {
      await fetch(
        `http://127.0.0.1:8000/api/storelinks/${storeLink.id}/update-price/`,
        { method: "POST" }
      );
      setSnackbar({
        open: true,
        message: "قیمت بروزرسانی شد!",
        severity: "success",
      });
      const res = await fetch(
        `http://127.0.0.1:8000/api/products/${product.id}/`
      );
      const data = await res.json();
      setProduct(data);
      getData()
    } catch {
      setSnackbar({
        open: true,
        message: "بروزرسانی انجام نشد!",
        severity: "error",
      });
    }
  };

  if (!product.store_links.length)
    return (
      <Card elevation={2} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
        <Typography color="text.secondary">فرو‌شگاهی ثبت نشده.</Typography>
      </Card>
    );

  return (
    <Card elevation={2} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} color="primary" mb={2}>
        فروشگاه‌ها
      </Typography>
      <Box component="table" sx={{ width: "100%" }}>
        <Box component="thead" sx={{ bgcolor: "#f8fafc" }}>
          <Box component="tr">
            <Box component="th" sx={{ p: 1 }}>
              نام فروشگاه
            </Box>
            <Box component="th" sx={{ p: 1 }}>
              لینک محصول
            </Box>
            <Box component="th" sx={{ p: 1 }}>
              آخرین قیمت
            </Box>
            <Box component="th" sx={{ p: 1 }}>
              عملیات
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {product.store_links.map((storeLink) => {
            const lastStorePrice = (priceHistory || [])
              .filter((p) => p.store === storeLink.store)
              .sort(
                (a, b) =>
                  new Date(b.checked_at).getTime() -
                  new Date(a.checked_at).getTime()
              )[0];
            return (
              <Box
                component="tr"
                key={storeLink.id}
                sx={{ borderBottom: "1px solid #eee" }}
              >
                <Box component="td" sx={{ p: 1 }}>
                  {storeLink.store}
                </Box>
                <Box component="td" sx={{ p: 1 }}>
                  {editableLinks[storeLink.id]?.editing ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <InputBase
                        value={editableLinks[storeLink.id].url}
                        onChange={(e) =>
                          handleLinkChange(storeLink.id, e.target.value)
                        }
                        sx={{
                          flex: 1,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          border: "1px solid #aaa",
                          bgcolor: "#fff",
                          fontSize: 14,
                        }}
                        size="small"
                      />
                      <IconButton
                        color="success"
                        onClick={() => handleSaveClick(storeLink)}
                        sx={{ minWidth: 36, p: 0.5 }}
                        aria-label="ذخیره"
                      >
                        <SaveIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      <a
                        href={storeLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1976d2" }}
                      >
                        <LinkIcon fontSize="small" />
                      </a>
                      <Typography
                        sx={{
                          maxWidth: 190,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {storeLink.url}
                      </Typography>
                      <IconButton
                        color="info"
                        onClick={() =>
                          handleEditClick(storeLink.id, storeLink.url)
                        }
                        sx={{ minWidth: 36, p: 0.5 }}
                        aria-label="ویرایش"
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Box component="td" sx={{ p: 1 }}>
                  {lastStorePrice
                    ? lastStorePrice.price.toLocaleString() + " ریال"
                    : "—"}
                </Box>
                <Box component="td" sx={{ p: 1 }}>
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    startIcon={<AutorenewIcon />}
                    onClick={() => handleUpdateStorePrice(storeLink)}
                    disabled={loading}
                    sx={{ fontWeight: 600, minWidth: 36, p: 0.5 }}
                  >
                    بروزرسانی قیمت
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
}
