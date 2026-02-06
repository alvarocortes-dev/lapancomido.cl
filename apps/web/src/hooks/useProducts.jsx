// src/hooks/useProducts.jsx
import { useEffect, useState } from "react";
import { getProducts } from "../helpers/getProductData.helper";

export const useProducts = (query = "", paginationOptions = {}) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts(query, paginationOptions)
      .then((data) => {
        setProducts(data.products);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, paginationOptions.page, paginationOptions.limit]);

  return { products, pagination, loading };
};
