// src/components/SearchBar.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const HeaderSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    "🔎 Buscar productos..."
  );
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Resetea la barra de búsqueda cada vez que cambie la ubicación
  useEffect(() => {
    setSearchValue("");
    setShowSuggestions(false);
    setSearchPlaceholder("🔎 Buscar productos...");
  }, [location]);

  // Debounced server search for suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    try {
      setLoadingSuggestions(true);
      const url = `${import.meta.env.VITE_API_URL}/api/products?search=${encodeURIComponent(query)}&limit=5`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      // Support both paginated and array response
      const products = Array.isArray(data) ? data : (data.products || []);
      setSuggestions(products);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Debounce input changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchValue.trim() === "") {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchValue);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue, fetchSuggestions]);

  // Navega al catálogo filtrado por el nombre del producto seleccionado
  const handleSuggestionClick = (productName) => {
    navigate(`/catalog?search=${encodeURIComponent(productName)}`);
    setSearchValue("");
    setShowSuggestions(false);
    setSearchPlaceholder("🔎 Buscar productos...");
  };

  // Navega a la vista de catálogo aplicando el parámetro de búsqueda
  const handleViewCatalog = () => {
    navigate(`/catalog?search=${encodeURIComponent(searchValue)}`);
    setShowSuggestions(false);
  };

  // Al presionar Enter se navega al catálogo
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleViewCatalog();
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  return (
    <div
      className={`relative bg-white p-2 w-full md:w-80 min-h-[44px] flex justify-center items-center ${
        showSuggestions ? "rounded-t-[25px]" : "rounded-full"
      }`}
      ref={containerRef}
    >
      <input
        ref={inputRef}
        type="text"
        value={searchValue}
        placeholder={searchPlaceholder}
        onChange={(e) => {
          setSearchValue(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => {
          if (searchValue.trim() === "") {
            setSearchPlaceholder("");
          }
          if (searchValue.trim() !== "") {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            setShowSuggestions(false);
          }, 150);
          if (searchValue.trim() === "") {
            setSearchPlaceholder("🔎 Buscar productos...");
          }
        }}
        onKeyDown={handleKeyDown}
        className="w-full text-center text-black border-none focus:outline-none focus:ring-0 bg-transparent p-2 text-base"
      />

      {showSuggestions &&
        searchValue.trim() !== "" &&
        (suggestions.length > 0 || loadingSuggestions) && (
          <ul className="absolute z-10 left-0 right-0 top-full bg-white rounded-b-md max-h-60 overflow-y-auto">
            {loadingSuggestions && suggestions.length === 0 ? (
              <li className="px-3 py-3 text-center text-gray-400 text-base">
                Buscando...
              </li>
            ) : (
              suggestions.slice(0, 4).map((product) => (
                <li
                  key={product.id}
                  onMouseDown={() => handleSuggestionClick(product.product)}
                  className="cursor-pointer px-3 py-3 min-h-[44px] flex items-center hover:bg-[#F5E1A4] border-b border-gray-300 last:border-0 truncate whitespace-nowrap overflow-hidden text-base"
                >
                  {product.product}
                </li>
              ))
            )}
            <li
              onMouseDown={handleViewCatalog}
              className="cursor-pointer px-3 py-3 min-h-[44px] flex items-center justify-center text-center font-semibold text-[#262011] bg-gray-200 hover:bg-[#F5E1A4] truncate whitespace-nowrap overflow-hidden text-base"
            >
              Ver coincidencias en Catálogo
            </li>
          </ul>
        )}
    </div>
  );
};
