// src/router/RouterManager.jsx

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Page404 } from "../pages/Page404";
import { HomePage } from "../pages/HomePage";
import { CatalogPage } from "../pages/CatalogPage";

export const RouterManager = () => {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Page404 />} />

        {/* Rutas con MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
        </Route>
      </Routes>
    </Router>
  );
};
