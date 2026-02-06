// src/router/RouterManager.jsx

import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Spin } from "antd";

const HomePage = lazy(() => import("../pages/HomePage"));
const CatalogPage = lazy(() => import("../pages/CatalogPage"));
const Page404 = lazy(() => import("../pages/Page404"));

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Spin size="large" />
  </div>
);

export const RouterManager = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="*" element={<Page404 />} />

          {/* Rutas con MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};
