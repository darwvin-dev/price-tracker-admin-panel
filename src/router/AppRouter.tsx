import { Routes, Route } from 'react-router-dom';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import ProductView from '../pages/ProductView';
import StoresPage from '../pages/Stores';
import Alerts from '../pages/AlertsPage';

const AppRouter = () => (
  <Routes>
    <Route path="/products" element={<Products />} />
    <Route path="/add-product" element={<AddProduct />} />
    <Route path="/stores" element={<StoresPage />} />
    <Route path="/products/:id" element={<ProductView />} />
    <Route path="/alerts" element={<Alerts />} />
  </Routes>
);

export default AppRouter;
