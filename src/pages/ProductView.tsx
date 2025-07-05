import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import PriceChart from "../components/productView/PriceChart";
import PriceHistoryTable, {
  type PriceHistoryTableRef,
} from "../components/productView/PriceHistoryTable";
import ProductSnackbar from "../components/productView/ProductSnackbar";
import ProductHeader from "../components/productView/ProductHeader";
import StoreLinksTable from "../components/productView/StoreLinksTable";
import Spinner from "../components/Spinner";
import type { Product } from "../types/product";
import type { Price } from "../types/Price";
import type { Variations } from "../types/variations";

export default function ProductView() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [variations, setVariations] = useState<Variations[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string>("all");

  const priceHistoryRef = useRef<PriceHistoryTableRef>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const [stores, setStores] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("all");

  const [chartData, setChartData] = useState<Price[]>([]);

  const getData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedVariation !== "all") {
      params.append("variation", selectedVariation);
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}api/products/${id}/?${params.toString()}`)
      .then((res) => {
        setProduct(res.data);
        const allStores = Array.from(
          new Set((res.data.price_history as Price[]).map((p) => p.store))
        );
        setStores(allStores);
        priceHistoryRef.current?.refresh();
      })
      .finally(() => setLoading(false));
  }, [id, selectedVariation]);

  useEffect(() => {
    getData();
  }, [id, getData, selectedVariation]);

  useEffect(() => {
    if (!product) return;
    setVariations(product.variations);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    let filtered = product.price_history;

    if (selectedStore !== "all") {
      filtered = filtered.filter((p) => p.store === selectedStore);
    }

    setChartData(
      filtered
        .slice()
        .sort(
          (a, b) =>
            new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
        )
    );
  }, [product, selectedStore, selectedVariation]);

  if (loading || !product || !id) {
    return <Spinner size={64} />;
  }

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}api/products/${id}/update-prices/`
      );
      setSnackbar({
        open: true,
        message: "قیمت‌ها بروزرسانی شدند!",
        severity: "success",
      });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}api/products/${id}/`);
      setProduct(res.data);
    } catch {
      setSnackbar({
        open: true,
        message: "بروزرسانی انجام نشد!",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{ maxWidth: 940, mx: "auto", mt: 4, mb: 8, p: 2, direction: "ltr" }}
    >
      <ProductHeader
        product={product}
        loading={loading}
        onUpdateAll={handleUpdate}
        setSnackbar={setSnackbar}
        selectedVariation={selectedVariation}
        onVariationChange={setSelectedVariation}
        variations={variations}
      />

      <StoreLinksTable
        product={product}
        priceHistory={product.price_history}
        setProduct={setProduct}
        setSnackbar={setSnackbar}
        loading={loading}
        getData={getData}
      />

      <PriceChart
        stores={stores}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        chartData={chartData}
      />

      <PriceHistoryTable
        stores={stores}
        setSnackbar={setSnackbar}
        productId={id}
      />

      <ProductSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
    </Box>
  );
}
