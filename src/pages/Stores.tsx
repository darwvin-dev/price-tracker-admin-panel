import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

type Store = {
  id: number;
  name: string;
  module_name: string;
  is_core: boolean;
  created_at: string;
};

const StoresPage = () => {
  const [stores, setStores] = useState<Store[]>([]);

  const fetchStores = () => {
    axios.get("http://localhost:8000/api/stores/").then((res) => {
      setStores(res.data);
    });
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const toggleStoreIsCore = (id: number) => {
    axios
      .post(`http://localhost:8000/api/stores/${id}/toggle-core/`)
      .then(() => {
        // Option 1: re-fetch
        fetchStores();

        // Option 2 (faster): just update locally
        // setStores(prev =>
        //   prev.map(store =>
        //     store.id === id ? { ...store, is_core: !store.is_core } : store
        //   )
        // );
      })
      .catch((err) => {
        console.error("Error toggling is_core:", err);
      });
  };

  return (
    <div dir="rtl">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          🏪 فهرست فروشگاه‌ها
        </Typography>

        <Paper sx={{ overflowX: "auto", borderRadius: 3 }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center">نام فروشگاه</TableCell>
                <TableCell align="center">نام ماژول</TableCell>
                <TableCell align="center">فروشگاه اصلی</TableCell>
                <TableCell align="center">تاریخ ثبت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell align="center">{store.name}</TableCell>
                  <TableCell align="center">{store.module_name}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={store.is_core ? "بله" : "خیر"}
                      color={store.is_core ? "primary" : "default"}
                      variant="filled"
                      clickable
                      onClick={() => toggleStoreIsCore(store.id)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {new Date(store.created_at).toLocaleDateString("fa-IR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </div>
  );
};

export default StoresPage;
