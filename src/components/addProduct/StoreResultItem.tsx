import React from "react";
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import type { ProductStreamResult, StoreInfo } from "../../types/ProductStreamResult";

interface StoreResultItemProps {
  store: StoreInfo;
  result?: ProductStreamResult;
  overriddenUrl: string;
  loading: boolean;
  onUrlChange: (storeName: string, newUrl: string) => void;
}

const StoreResultItem: React.FC<StoreResultItemProps> = ({
  store,
  result,
  overriddenUrl,
  loading,
  onUrlChange,
}) => {
  const theme = useTheme();
  const error = result?.error;
  const hasUrl = !!(result?.url || overriddenUrl);

  return (
    <Paper
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
        <LinkIcon color={hasUrl && !error ? "success" : "disabled"} />
        <Typography fontWeight={700} color="primary.dark">
          فروشگاه: {store.name} {store.is_core ? "⭐" : ""}
        </Typography>
        {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
        {!loading && hasUrl && !error && (
          <DoneAllIcon color="success" fontSize="small" sx={{ ml: 1 }} />
        )}
        {!loading && error && (
          <ErrorOutlineIcon color="error" fontSize="small" sx={{ ml: 1 }} />
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
            value={overriddenUrl}
            onChange={(e) => onUrlChange(store.name, e.target.value)}
            sx={{ mb: 1, "& input": { direction: "ltr" } }}
          />
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography fontSize="15px">
              <strong>قیمت:</strong>{" "}
              {result?.prices?.length ? (
                result.prices.map((item, index) => (
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
                <span style={{ color: theme.palette.text.secondary }}>—</span>
              )}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default StoreResultItem;