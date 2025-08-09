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
  Box as MuiBox,
  Button,
  Modal,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

type Store = {
  id: number;
  name: string;
  module_name: string;
  is_core: boolean;
  created_at: string;
  product_count: number;
  products: Product[]; 
};

type Product = {
  id: number;
  name: string;
  price: number;
  image: string; 
  color: string; 
};

const StoresPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const fetchStores = () => {
    axios.get(`${import.meta.env.VITE_API_URL}api/stores/`).then((res) => {
      setStores(res.data); // دریافت فروشگاه‌ها به همراه محصولات
    });
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const toggleStoreIsCore = (id: number) => {
    axios
      .post(`${import.meta.env.VITE_API_URL}api/stores/${id}/toggle-core/`)
      .then(() => {
        fetchStores();
      })
      .catch((err) => {
        console.error("Error toggling is_core:", err);
      });
  };

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store); // انتخاب فروشگاه برای نمایش محصولات
    setOpenModal(true); // باز کردن مدال
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedStore(null); // پاک کردن فروشگاه انتخابی
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
                <TableCell align="center">تعداد محصولات</TableCell>
                <TableCell align="center">تاریخ ثبت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((store) => (
                <TableRow
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                >
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
                  <TableCell align="center">{store.product_count}</TableCell>
                  <TableCell align="center">
                    {new Date(store.created_at).toLocaleDateString("fa-IR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Modal open={openModal} onClose={handleCloseModal} style={{direction: "rtl", top: "5%"}}>
        <MuiBox
          sx={{
            p: 4,
            maxWidth: 800,
            maxHeight: "80vh",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: 3,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            animation: "fadeIn 0.3s ease-out",
            overflowY: "auto",  
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2} align="center">
            نمایش محصولات فروشگاه: {selectedStore?.name}
          </Typography>

          <Table sx={{ minWidth: 500, marginBottom: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  نام محصول
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  قیمت
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  تصویر
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedStore?.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell align="center"><Link to={"/products/" + product.id}>{product.name} - {product.color}</Link></TableCell>
                  <TableCell align="center">{product.price} تومان</TableCell>
                  <TableCell align="center">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              onClick={handleCloseModal}
              sx={{
                mt: 2,
                backgroundColor: "#1976d2",
                color: "white",
                padding: "8px 16px",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
              variant="contained"
            >
              بستن
            </Button>
          </Box>
        </MuiBox>
      </Modal>
    </div>
  );
};

export default StoresPage;
