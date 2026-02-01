// src/api/products.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get auth headers with token
 */
function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Get all products for admin (with images, stock, categories)
 */
export async function getProducts(token) {
  const response = await fetch(`${API_URL}/api/admin/products`, {
    method: 'GET',
    headers: getAuthHeaders(token),
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar productos');
  }
  return response.json();
}

/**
 * Create a new product
 */
export async function createProduct(token, productData) {
  const response = await fetch(`${API_URL}/api/admin/products`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear producto');
  }
  return response.json();
}

/**
 * Update a product
 */
export async function updateProduct(token, id, productData) {
  const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar producto');
  }
  return response.json();
}

/**
 * Update product stock
 */
export async function updateStock(token, id, stock) {
  const response = await fetch(`${API_URL}/api/admin/products/${id}/stock`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify({ stock }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar stock');
  }
  return response.json();
}

/**
 * Toggle product availability
 */
export async function toggleAvailability(token, id) {
  const response = await fetch(`${API_URL}/api/admin/products/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cambiar disponibilidad');
  }
  return response.json();
}

/**
 * Delete multiple products
 */
export async function deleteProducts(token, productIds) {
  const response = await fetch(`${API_URL}/api/admin/products`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify({ productIds }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar productos');
  }
  return response.json();
}

export default {
  getProducts,
  createProduct,
  updateProduct,
  updateStock,
  toggleAvailability,
  deleteProducts,
};
