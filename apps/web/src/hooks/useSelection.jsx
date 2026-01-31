// src/hooks/useSelection.jsx
import { useContext, useCallback } from "react";
import { SelectionContext } from "../context/SelectionProvider";

export const useSelection = () => {
  const { selection, setSelection } = useContext(SelectionContext);

  /**
   * Add product to selection or increment quantity if exists
   * @param {Object} product - Product object with id, product (name), price, unit_type, pack_size, url_img
   * @param {number} quantity - Quantity to add (default 1)
   */
  const addToSelection = useCallback((product, quantity = 1) => {
    setSelection((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { 
        id: product.id,
        product: product.product, // product name
        price: product.price,
        url_img: product.url_img,
        unit_type: product.unit_type || 'unit',
        pack_size: product.pack_size || null,
        quantity 
      }];
    });
  }, [setSelection]);

  /**
   * Update quantity for a specific product
   * @param {number} id - Product ID
   * @param {number} quantity - New quantity (must be >= 1)
   */
  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return;
    setSelection((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, [setSelection]);

  /**
   * Remove product from selection
   * @param {number} id - Product ID
   */
  const removeFromSelection = useCallback((id) => {
    setSelection((prev) => prev.filter((item) => item.id !== id));
  }, [setSelection]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  /**
   * Get total number of items (sum of quantities)
   */
  const totalItems = selection.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * Get total price
   */
  const totalPrice = selection.reduce(
    (sum, item) => sum + item.quantity * Number(item.price),
    0
  );

  /**
   * Check if a product is selected
   * @param {number} id - Product ID
   * @returns {Object|undefined} Selected item or undefined
   */
  const getSelectedItem = useCallback((id) => {
    return selection.find((item) => item.id === id);
  }, [selection]);

  return {
    selection,
    addToSelection,
    updateQuantity,
    removeFromSelection,
    clearSelection,
    totalItems,
    totalPrice,
    getSelectedItem,
  };
};
