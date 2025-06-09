import { Snackbar, Alert as MuiAlert } from "@mui/material";

export default function ProductSnackbar({
  snackbar,
  setSnackbar,
}: {
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  };
  setSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: "success" | "error" | "info" | "warning";
    }>
  >;
}) {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <MuiAlert
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </MuiAlert>
    </Snackbar>
  );
}
