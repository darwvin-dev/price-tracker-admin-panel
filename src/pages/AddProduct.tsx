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
  Paper,
  Fade,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LinkIcon from "@mui/icons-material/Link";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
  }>({ open: false, message: "", severity: "error" });

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
    eventSource.onmessage = (event) => {
      try {
        const data: ProductStreamResult = JSON.parse(event.data);
        if (data.type === "stores" && data.stores)
          setLoadingStores(data.stores);
        console.log(data);
        setResults((prev) => [...prev, data]);
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

  const getResultForStore = (store: StoreInfo) =>
    dataResults.find((res) => res.store?.name === store.name);

  const handleUrlChange = async (storeName: string, newUrl: string) => {
    setUrlOverrides((prev) => ({ ...prev, [storeName]: newUrl }));

    if (!newUrl || newUrl.length < 5 || !productName) return;
    const formData = new FormData();
    formData.append("store", storeName);
    formData.append("url", newUrl);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}api/storelinks/check-price/`,
        formData
      );

      const prices = response.data;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (e.target.files && e.target.files[0]) {
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
              console.log(result);
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
      if (image) {
        formData.append("image", image);
      }
      selectedCategories.forEach((cat) => {
        formData.append("categories[]", cat.id.toString());
      });
      await axios.post(
        `${import.meta.env.VITE_API_URL}api/products/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setSnackbar({
        open: true,
        message: "✅ محصول با موفقیت ثبت شد.",
        severity: "success",
      });
      navigate(`/products`);
    } catch (err) {
      console.log(err);
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
          {/* Header */}
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

          {/* Product Name Input */}
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

          {/* Image Upload */}
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

          {/* Store Results */}
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
                  const overriddenUrl = urlOverrides[store.name] ?? result?.url;
                  const loading = !result;
                  const error = result?.error;
                  const hasUrl = !!(result?.url || overriddenUrl);

                  return (
                    <Paper
                      key={index}
                      elevation={3}
                      sx={{
                        p: 2.5,
                        border: "1.5px solid",
                        borderColor: error
                          ? theme.palette.error.main
                          : hasUrl
                          ? theme.palette.success.main
                          : theme.palette.divider,
                        backgroundColor: error
                          ? `${theme.palette.error.main}11`
                          : hasUrl
                          ? `${theme.palette.success.main}07`
                          : theme.palette.background.paper,
                        borderRadius: 3,
                        transition: "background 0.3s, border 0.3s",
                        minHeight: 164,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow:
                          hasUrl && !error
                            ? `0 2px 8px 0 ${theme.palette.success.main}22`
                            : undefined,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LinkIcon
                          color={hasUrl && !error ? "success" : "disabled"}
                        />
                        <Typography fontWeight={700} color="primary.dark">
                          فروشگاه: {store.name} {store.is_core ? "⭐" : ""}
                        </Typography>
                        {loading && (
                          <CircularProgress size={16} sx={{ ml: 1 }} />
                        )}
                        {!loading && hasUrl && !error && (
                          <DoneAllIcon
                            color="success"
                            fontSize="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                        {!loading && error && (
                          <ErrorOutlineIcon
                            color="error"
                            fontSize="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      {loading ? (
                        <Typography fontSize="15px" color="text.secondary">
                          در حال بررسی...
                        </Typography>
                      ) : (
                        <>
                          <TextField
                            label="لینک محصول"
                            fullWidth
                            value={overriddenUrl ?? ""}
                            onChange={(e) =>
                              handleUrlChange(store.name, e.target.value)
                            }
                            sx={{
                              mb: 1,
                              "& input": { direction: "ltr" },
                            }}
                          />
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Typography fontSize="15px">
                              <strong>قیمت:</strong>{" "}
                              {result?.prices?.length ? (
                                result?.prices?.map((item, index) => (
                                  <span
                                    style={{
                                      color: theme.palette.success.main,
                                      fontWeight: 700,
                                      display: "block",
                                    }}
                                    key={`PRICE_RESULT_${item.color}_${index}`}
                                  >
                                    {item.color}: {item?.price.toLocaleString()}{" "}
                                    <small>ریال</small>
                                  </span>
                                ))
                              ) : (
                                <span
                                  style={{
                                    color: theme.palette.text.secondary,
                                  }}
                                >
                                  —
                                </span>
                              )}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Paper>
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
