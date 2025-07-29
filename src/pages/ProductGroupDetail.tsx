import {
  Box,
  Typography,
  Paper,
  List,
  Stack,
  Chip,
  Link,
  CircularProgress,
  Tooltip,
  Avatar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

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

const formatPrice = (price: number) =>
  price.toLocaleString("fa-IR") + " ریال";

const ProductGroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ProductGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}api/product-groups/${id}/`)
      .then((res) => setGroup(res.data))
      .catch(() => setGroup(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return (
      <Typography mt={4} align="center" color="error">
        گروهی یافت نشد.
      </Typography>
    );
  }

  return (
    <Box p={2} dir="rtl" sx={{ direction: "rtl", maxWidth: 900, mx: "auto" }}>
      <Typography
        variant="h4"
        style={{ direction: "rtl" }}
        fontWeight={700}
        mb={3}
        textAlign="center"
      >
        جزئیات گروه: {group.name}
      </Typography>

      {group.products.length === 0 ? (
        <Typography align="center" color="text.secondary">
          این گروه هنوز محصولی ندارد.
        </Typography>
      ) : (
        <List disablePadding style={{ direction: "rtl" }}>
          {group.products.map((prod) => (
            <Paper
              key={prod.id}
              elevation={2}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 3,
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => navigate(`/products/${prod.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/products/${prod.id}`)}
            >
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                alignItems="center"
                gap={2}
              >
                <Box flexShrink={0}>
                  <Avatar
                    variant="rounded"
                    src={prod.image || undefined}
                    alt={prod.name}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: prod.image ? "transparent" : "grey.300",
                      fontSize: 24,
                      mx: "auto",
                    }}
                  >
                    {!prod.image && prod.name.charAt(0)}
                  </Avatar>
                </Box>

                <Box
                  flex={1}
                  sx={{ textAlign: { xs: "center", sm: "right" } }}
                  minWidth={0}
                >
                  <Typography variant="h6" fontWeight={700}>
                    {prod.name}{" "}
                    <Chip
                      label={prod.color}
                      size="small"
                      sx={{ mr: 1, fontWeight: "bold", fontSize: 14 }}
                      color="primary"
                      variant="outlined"
                    />
                    {prod.is_core && (
                      <Tooltip title="محصول فروشگاه Core" arrow>
                        <Chip
                          label="⭐ Core"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: "bold" }}
                        />
                      </Tooltip>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    ایجاد شده:{" "}
                    {new Date(prod.created_at).toLocaleDateString("fa-IR")}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 1,
                    minWidth: 200,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                    flexWrap="wrap"
                    mb={1}
                  >
                    <Chip
                      label={`کمترین: ${formatPrice(prod.min_price)}`}
                      color="info"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={`بیشترین: ${formatPrice(prod.max_price)}`}
                      color="info"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={`اختلاف: ${formatPrice(
                        prod.price_diff
                      )} (${prod.price_diff_percent.toFixed(1)}٪)`}
                      color={prod.price_diff_percent > 20 ? "error" : "warning"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  {/* لینک‌های فروشگاه */}
                  <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                    <Stack direction="row" spacing={1} flexWrap="nowrap">
                      {prod.store_links.map((link) => (
                        <Link
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            whiteSpace: "nowrap",
                            fontWeight: "bold",
                            color: "primary.main",
                          }}
                        >
                          {link.store}
                        </Link>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ProductGroupDetail;
