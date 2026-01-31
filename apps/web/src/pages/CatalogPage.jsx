// src/pages/CatalogPage.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Categories } from "../components/Categories";
import { useProducts } from "../hooks/useProducts";
import { FaTimes } from "react-icons/fa";
import { Dropdown, Button, Spin } from "antd";
import { ProductCard } from "../components/catalog/ProductCard";
import { SelectionBar } from "../components/selection/SelectionBar";

export const CatalogPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Se le pasa location.search directamente para que el hook haga el fetch con esos parámetros
  const { products, loading } = useProducts(location.search);
  const [orderedProducts, setOrderedProducts] = useState([]);

  // Para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Store config and quotation modal state
  const [storeConfig, setStoreConfig] = useState({ show_prices: true });
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);

  // Fetch store config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/store/config`
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

  // Lógica de ordenamiento (se realiza en el frontend sobre los datos ya filtrados)
  useEffect(() => {
    // Al recibir productos del backend ya filtrados, se guardan en orderedProducts
    setOrderedProducts(products);
    setCurrentPage(1);
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
    setCurrentPage(1);
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

  const totalPages = Math.ceil(orderedProducts.length / itemsPerPage);
  const displayedProducts = orderedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        Filtrando por: "{categoryQuery}" <FaTimes className="ml-1" />
      </div>
    );
  } else if (searchQuery) {
    activeFilterTag = (
      <div
        className="flex items-center bg-[#262011] text-[#f5e1a4] px-3 py-1 rounded-full cursor-pointer"
        onClick={() => navigate("/catalog")}
      >
        Filtrando por: "{searchQuery}" <FaTimes className="ml-1" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 pb-24">
      <h2 className="text-3xl font-semibold">Catálogo de Productos</h2>
      <Categories />
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center gap-4">
          <div
            style={{
              backgroundColor: "#fff2d2",
              color: "#000",
              borderColor: "#ffcc00",
              fontSize: "16px",
              height: "3rem",
            }}
            className="bg-gray-300 p-2 border border-black rounded-md flex items-center"
          >
            Resultados: {orderedProducts.length} productos
          </div>
          {activeFilterTag}
        </div>
        <Dropdown menu={menuProps} placement="bottomRight" trigger={["click"]}>
          <Button
            style={{
              backgroundColor: "#fff2d2",
              color: "#000",
              borderColor: "#ffcc00",
              fontSize: "16px",
              height: "3rem",
            }}
            className="bg-gray-300 p-2 border-black"
          >
            Ordenar
          </Button>
        </Dropdown>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center">
            <Spin tip="Cargando productos de la tienda...">
              <div style={{ width: "350px", height: "150px" }} />
            </Spin>
          </div>
        ) : (
          displayedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              showPrices={storeConfig.show_prices}
            />
          ))
        )}
      </div>
      <div className="flex justify-center mt-8 space-x-2">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 border border-black ${
              currentPage === index + 1
                ? "bg-[#262011] text-[#f5e1a4]"
                : "bg-[#f5e1a4] text-[#262011]"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Selection Bar */}
      <SelectionBar 
        onQuoteClick={() => setQuotationModalOpen(true)}
        showPrices={storeConfig.show_prices}
      />
    </div>
  );
};
