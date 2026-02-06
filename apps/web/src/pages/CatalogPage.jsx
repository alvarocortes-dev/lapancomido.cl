// src/pages/CatalogPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Categories } from "../components/Categories";
import { useProducts } from "../hooks/useProducts";
import { FaTimes } from "react-icons/fa";
import { Dropdown, Button, Spin } from "antd";
import { ProductCard } from "../components/catalog/ProductCard";
import { ProductModal } from "../components/catalog/ProductModal";
import { SelectionBar } from "../components/selection/SelectionBar";
import { QuotationModal } from "../components/selection/QuotationModal";

const ITEMS_PER_PAGE = 12;

const CatalogPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const paginationOptions = useMemo(
    () => ({ page: currentPage, limit: ITEMS_PER_PAGE }),
    [currentPage],
  );

  const { products, pagination, loading } = useProducts(
    location.search,
    paginationOptions,
  );
  const [orderedProducts, setOrderedProducts] = useState([]);

  // Store config and modal states
  const [storeConfig, setStoreConfig] = useState({ show_prices: true });
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Fetch store config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/store/config`,
        );
        if (response.ok) {
          const data = await response.json();
          setStoreConfig(data);
        }
      } catch (error) {
        console.error("Failed to fetch store config:", error);
      }
    };
    fetchConfig();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [location.search]);

  // Sync products from hook
  useEffect(() => {
    setOrderedProducts(products);
  }, [products]);

  const handleMenuClick = ({ key }) => {
    let sorted = [...orderedProducts];
    switch (key) {
      case "a-z":
        sorted.sort((a, b) => a.product.localeCompare(b.product));
        break;
      case "z-a":
        sorted.sort((a, b) => b.product.localeCompare(a.product));
        break;
      case "max-min":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "min-max":
        sorted.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }
    setOrderedProducts(sorted);
  };

  // Handle product click to open modal
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleProductModalClose = () => {
    setProductModalOpen(false);
    setSelectedProduct(null);
  };

  // Usamos la nueva API de Dropdown: definimos menuProps
  const menuProps = {
    items: [
      { key: "a-z", label: "Ordenar de A a Z" },
      { key: "z-a", label: "Ordenar de Z a A" },
      { key: "max-min", label: "Ordenar de Mayor a Menor $" },
      { key: "min-max", label: "Ordenar de Menor a Mayor $" },
    ],
    onClick: handleMenuClick,
  };

  const totalPages = pagination ? pagination.pages : 1;
  const totalProducts = pagination ? pagination.total : orderedProducts.length;

  // Para mostrar el filtro activo: se extrae la query (category o search)
  const params = new URLSearchParams(location.search);
  const categoryQuery = params.get("category");
  const searchQuery = params.get("search");

  let activeFilterTag = null;
  if (categoryQuery) {
    activeFilterTag = (
      <div
        className="flex items-center bg-[#262011] text-[#f5e1a4] px-3 py-1 rounded-full cursor-pointer"
        onClick={() => navigate("/catalog")}
      >
        Filtrando por: &quot;{categoryQuery}&quot; <FaTimes className="ml-1" />
      </div>
    );
  } else if (searchQuery) {
    activeFilterTag = (
      <div
        className="flex items-center bg-[#262011] text-[#f5e1a4] px-3 py-1 rounded-full cursor-pointer"
        onClick={() => navigate("/catalog")}
      >
        Filtrando por: &quot;{searchQuery}&quot; <FaTimes className="ml-1" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4">
      <h2 className="text-2xl sm:text-3xl font-semibold">
        Catálogo de Productos
      </h2>
      <Categories />
      <div className="flex flex-row justify-between items-center gap-3 my-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div
            style={{
              backgroundColor: "#fff2d2",
              color: "#000",
            }}
            className="text-sm sm:text-base px-3 py-2 rounded-full flex items-center h-10 sm:h-12"
          >
            {totalProducts} productos
          </div>
          {activeFilterTag}
        </div>
        <Dropdown menu={menuProps} placement="bottomRight" trigger={["click"]}>
          <Button
            style={{
              backgroundColor: "#fff2d2",
              color: "#000",
            }}
            className="text-sm sm:text-base px-3 py-2 h-10 sm:h-12"
          >
            Ordenar
          </Button>
        </Dropdown>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Spin
              size="large"
              tip={
                <span className="text-[#262011] text-lg mt-4">
                  Cargando productos...
                </span>
              }
            >
              <div style={{ width: "400px", height: "200px" }} />
            </Spin>
          </div>
        ) : (
          orderedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showPrices={storeConfig.show_prices}
              onProductClick={handleProductClick}
            />
          ))
        )}
      </div>
      <div className="flex justify-center mt-8 gap-1 sm:gap-2 flex-wrap">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`min-w-[44px] min-h-[44px] px-3 sm:px-4 py-2 border border-black text-sm sm:text-base transition-colors rounded-full ${
              currentPage === index + 1
                ? "bg-[#262011] text-[#f5e1a4]"
                : "bg-[#f5e1a4] text-[#262011] hover:bg-[#e6d294]"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Selection Bar - sticky container */}
      <div className="sticky bottom-0 mt-8 -mx-3 sm:-mx-4 px-3 sm:px-4 pb-4">
        <SelectionBar
          onQuoteClick={() => setQuotationModalOpen(true)}
          showPrices={storeConfig.show_prices}
        />
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        open={productModalOpen}
        onClose={handleProductModalClose}
        showPrices={storeConfig.show_prices}
      />

      {/* Quotation Modal */}
      <QuotationModal
        open={quotationModalOpen}
        onClose={() => setQuotationModalOpen(false)}
        storeConfig={storeConfig}
      />
    </div>
  );
};

export default CatalogPage;
