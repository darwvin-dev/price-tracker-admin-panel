import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Avatar,
  Skeleton,
  IconButton,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LaunchIcon from '@mui/icons-material/Launch';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';

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
  new Intl.NumberFormat('fa-IR').format(price) + " ریال";

const PriceRangeBar = ({ diffPercent }: { diffPercent: number }) => {
  const percentage = Math.min(100, Math.max(0, diffPercent));
  return (
    <Box position="relative" height={8} bgcolor="divider" borderRadius={4} overflow="hidden" mt={1}>
      <Box 
        position="absolute" 
        height="100%" 
        width={`${percentage}%`} 
        bgcolor={diffPercent > 50 ? "error.main" : diffPercent > 20 ? "warning.main" : "success.main"}
      />
    </Box>
  );
};

const LoadingSkeleton = () => (
  <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
    {[...Array(3)].map((_, index) => (
      <Paper key={index} elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: 'center',
          gap: 2 
        }}>
          <Box>
            <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 2 }} />
          </Box>
          <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} />
            <Box display="flex" gap={1} mt={1}>
              <Skeleton variant="rectangular" width={80} height={32} />
              <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: 200 } }}>
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="100%" height={24} />
          </Box>
        </Box>
      </Paper>
    ))}
  </Box>
);

const ProductGroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ProductGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}api/product-groups/${id}/`)
      .then((res) => setGroup(res.data))
      .catch(() => setGroup(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (!group) {
    return (
      <Box textAlign="center" mt={8} p={3}>
        <Typography variant="h5" color="text.secondary" mb={2}>
          گروه محصول یافت نشد
        </Typography>
        <Chip 
          label="بازگشت به صفحه اصلی" 
          onClick={() => navigate('/')} 
          color="primary"
          variant="outlined"
          clickable
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 3 } }}>
      <Stack direction="row" alignItems="center" mb={3} spacing={2}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ p: 1, transform: 'rotate(180deg)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700} color="primary">
          {group.name}
        </Typography>
        <Chip 
          label={`${group.products.length} محصول`} 
          color="info" 
          variant="outlined"
          size={isMobile ? "small" : "medium"}
        />
      </Stack>

      {group.products.length === 0 ? (
        <Box textAlign="center" p={8} bgcolor="background.paper" borderRadius={3}>
          <StoreIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            هنوز محصولی به این گروه اضافه نشده است
          </Typography>
          <Chip 
            label="مشاهده سایر گروه‌ها" 
            onClick={() => navigate('/')} 
            color="primary"
            sx={{ mt: 3 }}
            clickable
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {group.products.map((prod) => (
            <Paper
              key={prod.id}
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[6]
                },
                borderRight: `4px solid ${theme.palette.primary.main}`
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2,
                alignItems: { sm: 'center' }
              }}>
                {/* Product Image */}
                <Box sx={{ 
                  position: 'relative',
                  flexShrink: 0,
                  alignSelf: { xs: 'center', sm: 'flex-start' }
                }}>
                  <Box 
                    position="relative"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${prod.id}`)}
                  >
                    <Avatar
                      variant="rounded"
                      src={prod.image || undefined}
                      alt={prod.name}
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: prod.image ? 'transparent' : 'grey.100',
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: 24,
                      }}
                    >
                      {!prod.image && prod.name.charAt(0)}
                    </Avatar>
                    {prod.is_core && (
                      <Box 
                        position="absolute" 
                        top={-8} 
                        left={-8} 
                        bgcolor="gold" 
                        borderRadius="50%" 
                        p={0.5}
                        boxShadow={2}
                      >
                        <StarIcon fontSize="small" sx={{ color: 'white' }} />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Product Info */}
                <Box sx={{ 
                  flexGrow: 1, 
                  minWidth: 0,
                  width: { xs: '100%', sm: 'auto' } 
                }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      onClick={() => navigate(`/products/${prod.id}`)}
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    >
                      {prod.name}
                    </Typography>
                    <Chip
                      label={prod.color}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: 12 }}
                      color="primary"
                    />
                  </Stack>
                  
                  <Stack direction="row" spacing={1} mt={1} alignItems="center">
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(prod.created_at).toLocaleDateString('fa-IR')}
                    </Typography>
                  </Stack>
                  
                  {/* Store Links */}
                  <Box mt={2} sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiChip-root': { 
                      ml: 0,
                      mr: 1,
                      mb: 1 
                    }
                  }}>
                    {prod.store_links.map((link) => (
                      <Chip
                        key={link.id}
                        icon={<LaunchIcon fontSize="small" />}
                        label={link.store}
                        component="a"
                        href={link.url}
                        target="_blank"
                        rel="noopener"
                        clickable
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Pricing Info */}
                <Box sx={{ 
                  flexShrink: 0, 
                  width: { xs: '100%', sm: 250 },
                  alignSelf: { xs: 'stretch', sm: 'auto' }
                }}>
                  <Box bgcolor="grey.50" borderRadius={2} p={2} height="100%">
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          کمترین قیمت:
                        </Typography>
                        <Typography fontWeight={600} color="success.main">
                          {formatPrice(prod.min_price)}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          بیشترین قیمت:
                        </Typography>
                        <Typography fontWeight={600} color="error.main">
                          {formatPrice(prod.max_price)}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PriceChangeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            اختلاف:
                          </Typography>
                        </Stack>
                        <Chip
                          label={`${formatPrice(prod.price_diff)} (${prod.price_diff_percent.toFixed(1)}٪)`}
                          size="small"
                          sx={{ fontWeight: 700 }}
                          color={prod.price_diff_percent > 50 ? "error" : prod.price_diff_percent > 20 ? "warning" : "success"}
                        />
                      </Stack>
                      
                      <PriceRangeBar 
                        diffPercent={prod.price_diff_percent} 
                      />
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductGroupDetail;