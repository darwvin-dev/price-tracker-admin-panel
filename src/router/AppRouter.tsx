import { Routes, Route } from 'react-router-dom';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import ProductView from '../pages/ProductView';

const AppRouter = () => (
  <Routes>
    <Route path="/products" element={<Products />} />
    <Route path="/add-product" element={<AddProduct />} />
    <Route path="/products/:id" element={<ProductView />} />
  </Routes>
);

export default AppRouter;
