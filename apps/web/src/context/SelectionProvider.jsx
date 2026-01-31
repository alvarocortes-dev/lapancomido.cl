// src/context/SelectionProvider.jsx
import { createContext, useState, useEffect } from "react";

export const SelectionContext = createContext();

const STORAGE_KEY = "PRODUCT_SELECTION";

export const SelectionProvider = ({ children }) => {
  // Initialize from sessionStorage if exists (session persistence, not localStorage)
  const [selection, setSelection] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch (error) {
      console.error("Failed to save selection to sessionStorage:", error);
    }
  }, [selection]);

  return (
    <SelectionContext.Provider value={{ selection, setSelection }}>
      {children}
    </SelectionContext.Provider>
  );
};
