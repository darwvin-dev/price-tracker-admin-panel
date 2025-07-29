import { Routes, Route } from 'react-router-dom';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import ProductView from '../pages/ProductView';
import StoresPage from '../pages/Stores';
import Alerts from '../pages/AlertsPage';
import Categories from '../pages/Categories';
import CategoryDetail from '../pages/CategoryDetail';
import SettingsPage from '../pages/Settings';
import ExportPage from '../pages/Export';
import ProductGroupManagement from '../pages/ProductGroupManagement';
import ProductGroupDetail from '../pages/ProductGroupDetail';

const AppRouter = () => (
  <Routes>
    <Route path="/products" element={<Products />} />
    <Route path="/product-groups" element={<ProductGroupManagement />} />
    <Route path="/product-groups/:id" element={<ProductGroupDetail />} />
    <Route path="/categories" element={<Categories />} />
    <Route path="/categories/:id" element={<CategoryDetail />} />
    <Route path="/add-product" element={<AddProduct />} />
    <Route path="/stores" element={<StoresPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/export" element={<ExportPage />} />
    <Route path="/products/:id" element={<ProductView />} />
    <Route path="/alerts" element={<Alerts />} />
  </Routes>
);

export default AppRouter;
