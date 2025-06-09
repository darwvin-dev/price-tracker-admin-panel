import {
  Modal,
  Box,
  Typography,
  IconButton,
  InputBase,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import type { Product } from "../../types/product";

type Props = {
  product: Product;
  open: boolean;
  onClose: () => void;
  setSnackbar: any;
  setProduct: any;
};

export default function AddMissingLinksModal({
  product,
  open,
  onClose,
  setSnackbar,
  setProduct,
}: Props) {
  const [allStores, setAllStores] = useState<any[]>([]);
  const [links, setLinks] = useState<{ [store: string]: string }>({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/stores/")
      .then((res) => res.json())
      .then(setAllStores);
  }, []);

  const missingStores = allStores.filter(
    (store) =>
      !product.store_links.some((link) => link.store === store.name)
  );

  const handleAddLink = async (storeName: string) => {
    const url = links[storeName];
    if (!url) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/storelinks/add/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, store: storeName, url }),
      });

      if (res.ok) {
        const updatedProduct = await fetch(
          `http://127.0.0.1:8000/api/products/${product.id}/`
        ).then((r) => r.json());
        setProduct(updatedProduct);
        setSnackbar({
          open: true,
          message: "لینک با موفقیت افزوده شد.",
          severity: "success",
        });
      } else {
        throw new Error();
      }
    } catch {
      setSnackbar({
        open: true,
        message: "افزودن لینک انجام نشد.",
        severity: "error",
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 3,
          width: 500,
          maxHeight: "80vh",
          overflowY: "auto",
          bgcolor: "#fff",
          borderRadius: 2,
          mx: "auto",
          mt: "10vh",
          boxShadow: 24,
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight={700}>افزودن لینک‌های ناقص</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {missingStores.map((store) => (
          <Box key={store.id} display="flex" alignItems="center" gap={1} mb={2}>
            <Typography sx={{ minWidth: 80 }}>{store.name}</Typography>
            <InputBase
              placeholder="آدرس لینک"
              value={links[store.name] || ""}
              onChange={(e) =>
                setLinks((prev) => ({ ...prev, [store.name]: e.target.value }))
              }
              sx={{
                flex: 1,
                px: 1,
                py: 0.5,
                border: "1px solid #ccc",
                borderRadius: 1,
                fontSize: 14,
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => handleAddLink(store.name)}
            >
              افزودن
            </Button>
          </Box>
        ))}
        {!missingStores.length && (
          <Typography color="text.secondary">همه فروشگاه‌ها لینک دارند.</Typography>
        )}
      </Box>
    </Modal>
  );
}
