import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import type { Category } from "../types/Category";
// import ProductsTable from "../components/ProductsTable"; 

const CategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}api/categories/${id}/`).then((res) => {
      setCategory(res.data);
    });
  }, [id]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3} fontWeight={700}>
        📁 دسته‌بندی: {category?.name}
      </Typography>
      {/* <ProductsTable products={products} /> */}
    </Box>
  );
};

export default CategoryDetail;
