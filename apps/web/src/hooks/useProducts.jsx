// src/hooks/useProducts.jsx
import { useEffect, useState } from "react";
import { getProducts } from "../helpers/getProductData.helper";

export const useProducts = (query = "") => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se vuelve a hacer fetch cada vez que cambie la query (por ejemplo, ?category=...)
    setLoading(true);
    getProducts(query)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, [query]);

  return { products, loading };
};
