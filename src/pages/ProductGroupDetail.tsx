import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Link,
  CircularProgress,
  Tooltip,
  Avatar,
  Button,
  Grid,
  Skeleton,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StoreIcon from "@mui/icons-material/Store";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";

type StoreLink = {
  id: number;
  store: string;
  url: string;
};

type Product = {
  id: number;
  name: string;
  image: string | null;
  color: string;
  min_price: number;
  max_price: number;
  price_diff: number;
  price_diff_percent: number;
  store_links: StoreLink[];
  is_core: boolean;
  created_at: string;
};

type ProductGroup = {
  id: number;
  name: string;
  created_at: string;
  products: Product[];
};

const formatPrice = (price: number) => {
  const formatted = new Intl.NumberFormat("fa-IR").format(price);
  return `${formatted} ریال`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ProductGroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ProductGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  useEffect(() => {
    setLoading(true);
    setError(false);
    axios
      .get(`${import.meta.env.VITE_API_URL}api/product-groups/${id}/`)
      .then((res) => {
        setGroup(res.data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="70vh"
        p={2}
        textAlign="center"
      >
        <Typography variant="h6" color="error" gutterBottom>
          گروه مورد نظر یافت نشد
        </Typography>
        <Typography color="text.secondary" mb={3}>
          ممکن است گروه حذف شده یا آدرس نادرست باشد
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          بازگشت به لیست گروه‌ها
        </Button>
      </Box>
    );
  }

  const renderProductCard = (prod: Product) => (
    <Paper
      key={prod.id}
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-4px)",
          borderLeft: `4px solid ${theme.palette.primary.main}`,
        },
      }}
    >
      <Grid container spacing={2}>
        {/* Product Image */}
        <Grid item xs={12} sm="auto">
          <Box
            display="flex"
            justifyContent="center"
            sx={{ position: "relative" }}
          >
            <Avatar
              variant="rounded"
              src={prod.image || undefined}
              alt={prod.name}
              sx={{
                width: 100,
                height: 100,
                bgcolor: prod.image ? "transparent" : "grey.100",
                fontSize: 24,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              {!prod.image && prod.name.charAt(0)}
            </Avatar>
            {prod.is_core && (
              <Tooltip title="محصول فروشگاه Core" arrow placement="top">
                <Box
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: "gold",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                  }}
                >
                  <StarIcon
                    sx={{ color: "black", fontSize: 16, stroke: "black" }}
                  />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} sm>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {prod.name}
              <Chip
                label={prod.color}
                size="small"
                sx={{
                  fontWeight: "bold",
                  fontSize: 12,
                  px: 0.5,
                  height: 22,
                }}
                color="primary"
                variant="outlined"
              />
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              color="text.secondary"
              mb={1}
            >
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="caption">
                ایجاد شده: {formatDate(prod.created_at)}
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Price Info */}
          <Box mb={2}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              color="primary.main"
              mb={1}
            >
              <PriceChangeIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                اطلاعات قیمت
              </Typography>
            </Stack>

            <Grid container spacing={1}>
              <Grid item xs={6} md={3}>
                <Box bgcolor="rgba(33, 150, 243, 0.08)" p={1} borderRadius={1}>
                  <Typography variant="caption" color="text.secondary">
                    کمترین
                  </Typography>
                  <Typography fontWeight={600} fontSize={14}>
                    {formatPrice(prod.min_price)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box bgcolor="rgba(33, 150, 243, 0.08)" p={1} borderRadius={1}>
                  <Typography variant="caption" color="text.secondary">
                    بیشترین
                  </Typography>
                  <Typography fontWeight={600} fontSize={14}>
                    {formatPrice(prod.max_price)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  bgcolor={
                    prod.price_diff_percent > 20
                      ? "rgba(244, 67, 54, 0.1)"
                      : "rgba(255, 152, 0, 0.1)"
                  }
                  p={1}
                  borderRadius={1}
                >
                  <Typography variant="caption" color="text.secondary">
                    اختلاف قیمت
                  </Typography>
                  <Typography
                    fontWeight={600}
                    fontSize={14}
                    color={
                      prod.price_diff_percent > 20 ? "error.main" : "warning.main"
                    }
                  >
                    {formatPrice(prod.price_diff)} ({prod.price_diff_percent.toFixed(1)}٪)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Store Links */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              color="primary.main"
              mb={1}
            >
              <StoreIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                لینک‌های فروشگاه
              </Typography>
            </Stack>

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{ maxHeight: 100, overflowY: "auto" }}
            >
              {prod.store_links.map((link) => (
                <Chip
                  key={link.id}
                  icon={<OpenInNewIcon fontSize="small" />}
                  label={link.store}
                  component="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener"
                  clickable
                  size="small"
                  variant="outlined"
                  sx={{
                    px: 1,
                    "& .MuiChip-label": { fontWeight: 500 },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Action Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              endIcon={<OpenInNewIcon />}
              onClick={() => navigate(`/products/${prod.id}`)}
              sx={{ mt: 1 }}
            >
              مشاهده جزئیات محصول
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Skeleton
            variant="rectangular"
            height={isMobile ? 320 : 380}
            sx={{ borderRadius: 3 }}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 3 },
        maxWidth: 1400,
        mx: "auto",
        minHeight: "100vh",
      }}
      dir="rtl"
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 2, alignSelf: "flex-start" }}
        size={isMobile ? "small" : "medium"}
      >
        بازگشت
      </Button>

      {loading ? (
        <>
          <Skeleton variant="text" width={300} height={60} sx={{ mx: "auto" }} />
          <Skeleton variant="text" width={200} height={40} sx={{ mx: "auto" }} />
          {renderSkeleton()}
        </>
      ) : group ? (
        <>
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              px: { xs: 1, md: 0 },
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              {group.name}
            </Typography>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
              color="text.secondary"
            >
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">
                ایجاد شده: {formatDate(group.created_at)}
              </Typography>
              <Chip
                label={`${group.products.length} محصول`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Box>

          {group.products.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="50vh"
              textAlign="center"
              p={3}
            >
              <StarBorderIcon
                sx={{
                  fontSize: 80,
                  color: "grey.400",
                  mb: 2,
                }}
              />
              <Typography variant="h6" gutterBottom color="text.secondary">
                این گروه هنوز محصولی ندارد
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                می‌توانید از بخش مدیریت گروه‌ها محصولات را به این گروه اضافه کنید
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
              >
                بازگشت به مدیریت گروه‌ها
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {group.products.map(renderProductCard)}
            </Grid>
          )}
        </>
      ) : null}
    </Box>
  );
};

export default ProductGroupDetail;