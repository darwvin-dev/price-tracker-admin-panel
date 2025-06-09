import { Box, CircularProgress } from "@mui/material";

const Spinner = ({ size = 48, color = "primary" }: { size?: number; color?: "primary" | "secondary" | "inherit" }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default Spinner;
