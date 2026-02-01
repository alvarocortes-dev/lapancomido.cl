// src/api/categories.js
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
 * Get all categories (public endpoint)
 */
export async function getCategories() {
  const response = await fetch(`${API_URL}/api/categories`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar categorías');
  }
  return response.json();
}

/**
 * Create a new category (admin only)
 */
export async function createCategory(token, name) {
  const response = await fetch(`${API_URL}/api/admin/categories`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify({ category: name }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear categoría');
  }
  return response.json();
}

/**
 * Update a category (admin only)
 */
export async function updateCategory(token, id, name) {
  const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify({ category: name }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar categoría');
  }
  return response.json();
}

/**
 * Delete a category (admin only)
 */
export async function deleteCategory(token, id) {
  const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar categoría');
  }
  return response.json();
}

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
