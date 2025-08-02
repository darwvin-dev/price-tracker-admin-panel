import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  TextField,
  Typography,
  useTheme,
  Fade,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import type {
  ProductStreamResult,
  StoreInfo,
} from "../types/ProductStreamResult";
import type { Category } from "../types/Category";
import CategorySelector from "../components/CategorySelector";
import StoreResultItem from "../components/addProduct/StoreResultItem";

const Alert = MuiAlert as React.ElementType;

const AddProduct = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [productName, setProductName] = useState<string | null>(null);
  const [results, setResults] = useState<ProductStreamResult[]>([]);
  const [connected, setConnected] = useState(false);
  const [urlOverrides, setUrlOverrides] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [loadingStores, setLoadingStores] = useState<StoreInfo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "success" | "info" | "warning" | "error",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productName) return;

    const eventSource = new EventSource(
      `${
        import.meta.env.VITE_API_URL
      }stream/check/?product_name=${encodeURIComponent(productName)}`
    );

    setConnected(false);
    setResults([]);

    eventSource.onopen = () => setConnected(true);
    eventSource.onmessage = async (event) => {
      try {
        const data: ProductStreamResult = JSON.parse(event.data);

        if (data.type === "stores" && data.stores) {
          const frontendStores = data.stores.filter((s) => s.is_frontend);
          const backendStores = data.stores.filter((s) => !s.is_frontend);

          await Promise.all(
            frontendStores.map(async (store) => {
              try {
                const mod = await import(`../crawlers/${store.module}.ts`);
                const url = await mod.get_product_link(productName);
                console.log(url)
                const prices = url ? await mod.get_price(url) : null;

                setResults((prev) => {
                  const others = prev.filter(
                    (r) => r.type !== "result" || r.store?.name !== store.name
                  );
                  return [
                    ...others,
                    {
                      type: "result",
                      store: { name: store.name },
                      url: url || "",
                      prices,
                    },
                  ];
                });
              } catch (err) {
                console.error(`[${store.name}] Crawler failed`, err);
              }
            })
          );

          setLoadingStores([...frontendStores, ...backendStores]);
        }

        if (data.type === "result") {
          setResults((prev) => {
            const others = prev.filter(
              (r) => r.type !== "result" || r.store?.name !== data.store?.name
            );
            return [...others, data];
          });
        }
      } catch (error) {
        console.warn("❌ JSON parse error", error);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [productName]);

  const dataResults = results.filter((res) => res.type === "result");

  const getResultForStore = (store: StoreInfo) =>
    dataResults.find((res) => res.store?.name === store.name);

  const handleCheck = () => {
    if (!input.trim()) {
      setSnackbar({
        open: true,
        message: "⚠️ لطفاً نام محصول را وارد کنید.",
        severity: "warning",
      });
      return;
    }
    setProductName(input);
  };

  const handleUrlChange = async (storeName: string, newUrl: string) => {
    setUrlOverrides((prev) => ({ ...prev, [storeName]: newUrl }));

    if (!newUrl || newUrl.length < 5 || !productName) return;

    const store = loadingStores.find((s) => s.name === storeName);
    if (!store) return;

    try {
      let prices = null;

      if (store.is_frontend) {
        const mod = await import(`../crawlers/${store.module}.ts`);
        prices = await mod.get_price(newUrl);
      } else {
        const formData = new FormData();
        formData.append("store", storeName);
        formData.append("url", newUrl);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}api/storelinks/check-price/`,
          formData
        );
        prices = response.data;
      }

      const updatedResult: ProductStreamResult = {
        type: "result",
        store: { name: storeName },
        url: newUrl,
        prices,
      };

      setResults((prev) => {
        const others = prev.filter(
          (r) => r.type !== "result" || r.store?.name !== storeName
        );
        return [...others, updatedResult];
      });
    } catch (err: any) {
      console.error("❌ قیمت‌گذاری شکست خورد:", err);
      const errorResult: ProductStreamResult = {
        type: "result",
        store: { name: storeName },
        url: newUrl,
        error: err.response?.data?.detail || "خطا در دریافت قیمت",
      };

      setResults((prev) => {
        const others = prev.filter(
          (r) => r.type !== "result" || r.store?.name !== storeName
        );
        return [...others, errorResult];
      });
    }
  };

  const isReadyToSubmit =
    !!productName &&
    loadingStores.length > 0 &&
    loadingStores.some((store) => {
      const result = getResultForStore(store);
      const url = urlOverrides[store.name] ?? result?.url ?? "";
      return url.length > 0 && !!result;
    });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", productName!);
      formData.append(
        "links",
        JSON.stringify(
          loadingStores
            .map((store) => {
              const result = getResultForStore(store);
              const url = urlOverrides[store.name] ?? result?.url ?? "";
              return url && result
                ? {
                    store: store.name,
                    url,
                    price: result.price ?? null,
                    helper: result.helper,
                  }
                : null;
            })
            .filter(Boolean)
        )
      );

      if (image) formData.append("image", image);
      selectedCategories.forEach((cat) => {
        formData.append("categories[]", cat.id.toString());
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}api/products/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSnackbar({
        open: true,
        message: "✅ محصول با موفقیت ثبت شد.",
        severity: "success",
      });
      navigate(`/products`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setSnackbar({
        open: true,
        message: "خطا در ثبت محصول. لطفاً دوباره تلاش کنید.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fade in>
      <Card
        elevation={4}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 85%, ${theme.palette.primary.main}0F 100%)`,
          maxWidth: 670,
          mx: "auto",
          mt: 5,
          mb: 8,
          borderRadius: 4,
          boxShadow: `0 8px 32px 0 ${theme.palette.primary.main}22`,
          direction: "ltr",
          p: { xs: 2, md: 4 },
        }}
      >
        <CardContent sx={{ px: { xs: 1, md: 4 }, py: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <StorefrontIcon color="primary" sx={{ fontSize: 36 }} />
              <Typography variant="h5" fontWeight={800} color="primary.main">
                افزودن محصول جدید
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap={2}
            mb={2}
          >
            <TextField
              label="نام محصول"
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="مثلاً: آیفون ۱۳ پرو مکس"
              sx={{
                background:
                  theme.palette.mode === "dark" ? "#263043" : "#f9fafc",
                borderRadius: 2,
              }}
              inputProps={{
                style: { fontWeight: 600, letterSpacing: "0.5px" },
              }}
            />
            <Button
              startIcon={<SearchIcon />}
              variant="contained"
              color="primary"
              onClick={handleCheck}
              sx={{
                minWidth: 140,
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 2,
                py: 1.5,
                boxShadow: `0 2px 8px 0 ${theme.palette.primary.main}25`,
              }}
              disabled={connected && !!productName}
            >
              بررسی لینک‌ها
            </Button>
          </Box>

          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PhotoCamera />}
              component="label"
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                py: 1,
                px: 2,
                minWidth: 0,
              }}
            >
              انتخاب عکس (اختیاری)
              <input
                type="file"
                hidden
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </Button>
            {imageUrl && (
              <Box position="relative" display="inline-block">
                <img
                  src={imageUrl}
                  alt="product-preview"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: `1.5px solid ${theme.palette.primary.main}`,
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -8,
                    left: -8,
                    background: "#fff",
                    boxShadow: 1,
                  }}
                  onClick={handleImageRemove}
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
            )}
          </Box>

          <CategorySelector
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
          />

          {productName && (
            <Typography
              fontSize="14px"
              mb={2}
              color={connected ? "success.main" : "warning.main"}
            >
              {connected
                ? "🔗 اتصال برقرار است و نتایج دریافت می‌شوند."
                : "⏳ در حال اتصال..."}
            </Typography>
          )}

          {loadingStores.length > 0 && (
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
                color="secondary"
              >
                نتایج کرالرها ({loadingStores.length} فروشگاه)
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                gap={2}
                mt={1}
              >
                {loadingStores.map((store, index) => {
                  const result = getResultForStore(store);
                  return (
                    <StoreResultItem
                      key={index}
                      store={store}
                      result={result}
                      overriddenUrl={
                        urlOverrides[store.name] ?? result?.url ?? ""
                      }
                      loading={!result}
                      onUrlChange={handleUrlChange}
                    />
                  );
                })}
              </Box>
              {isReadyToSubmit && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: "16px",
                      boxShadow: `0 4px 12px ${theme.palette.success.main}33`,
                    }}
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "افزودن محصول نهایی"
                    )}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%", fontWeight: 600 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Card>
    </Fade>
  );
};

export default AddProduct;
