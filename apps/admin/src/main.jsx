// src/main.jsx
import ReactDOM from "react-dom/client";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProductsPage from "./pages/ProductsPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import ProductEditPage from "./pages/ProductEditPage";
import CategoriesPage from "./pages/CategoriesPage";
import ConsultationsPage from "./pages/ConsultationsPage";
import SiteContentPage from "./pages/SiteContentPage";
import "./index.css";

function AdminContent() {
  const { isAuthenticated, loading, user, logout, isDeveloper } = useAuth();
  const [currentPage, setCurrentPage] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8E8]">
        <div className="text-[#262011]">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  function handleEditProduct(product) {
    setEditingProduct(product);
    setCurrentPage('product-edit');
  }

  function handleCreateProduct() {
    setCurrentPage('product-create');
  }

  function handleProductSaved() {
    setEditingProduct(null);
    setCurrentPage('products');
  }

  function handleBack() {
    setEditingProduct(null);
    setCurrentPage('products');
  }

  // Determine which pages are "active" for nav styling
  const isProductsActive = ['products', 'product-create', 'product-edit'].includes(currentPage);

  return (
    <div className="min-h-screen bg-[#FDF8E8]">
      <header className="bg-[#262011] text-[#F5E1A4] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">La Pan Comido - Admin</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentPage('settings')}
              className="text-sm opacity-80 hover:opacity-100"
            >
              {user?.username}
            </button>
            <button
              onClick={logout}
              className="px-3 py-1 bg-[#F5E1A4] text-[#262011] rounded text-sm font-medium hover:bg-[#F5E1A4]/90 min-h-[36px]"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto">
          <button
            onClick={() => setCurrentPage('products')}
            className={`py-3 px-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              isProductsActive 
                ? 'border-[#262011] text-[#262011]' 
                : 'border-transparent text-[#262011]/60 hover:text-[#262011]'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setCurrentPage('categories')}
            className={`py-3 px-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              currentPage === 'categories' 
                ? 'border-[#262011] text-[#262011]' 
                : 'border-transparent text-[#262011]/60 hover:text-[#262011]'
            }`}
          >
            Categorías
          </button>
          <button
            onClick={() => setCurrentPage('consultations')}
            className={`py-3 px-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              currentPage === 'consultations' 
                ? 'border-[#262011] text-[#262011]' 
                : 'border-transparent text-[#262011]/60 hover:text-[#262011]'
            }`}
          >
            Historial
          </button>
          <button
            onClick={() => setCurrentPage('site-content')}
            className={`py-3 px-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              currentPage === 'site-content' 
                ? 'border-[#262011] text-[#262011]' 
                : 'border-transparent text-[#262011]/60 hover:text-[#262011]'
            }`}
          >
            Contenido
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`py-3 px-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              currentPage === 'settings' 
                ? 'border-[#262011] text-[#262011]' 
                : 'border-transparent text-[#262011]/60 hover:text-[#262011]'
            }`}
          >
            Configuración
          </button>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {currentPage === 'products' && (
          <ProductsPage 
            onEdit={handleEditProduct}
            onCreate={handleCreateProduct}
          />
        )}
        
        {currentPage === 'product-create' && (
          <ProductCreatePage 
            onBack={handleBack}
            onSuccess={handleProductSaved}
          />
        )}
        
        {currentPage === 'product-edit' && editingProduct && (
          <ProductEditPage 
            product={editingProduct}
            onBack={handleBack}
            onSuccess={handleProductSaved}
          />
        )}

        {currentPage === 'categories' && <CategoriesPage />}

        {currentPage === 'consultations' && <ConsultationsPage />}

        {currentPage === 'site-content' && <SiteContentPage />}
        
        {currentPage === 'settings' && <SettingsPage />}
      </main>

      {/* Developer badge */}
      {isDeveloper && (
        <div className="fixed bottom-4 right-4 px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
          DEV
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
