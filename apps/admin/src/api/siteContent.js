// src/api/siteContent.js
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
 * Get all site content
 */
export async function getAllContent(token) {
  const response = await fetch(`${API_URL}/api/site-content`, {
    method: 'GET',
    headers: getAuthHeaders(token),
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar contenido del sitio');
  }
  return response.json();
}

/**
 * Get specific site content by key
 */
export async function getContent(token, key) {
  const response = await fetch(`${API_URL}/api/site-content/${key}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar contenido');
  }
  return response.json();
}

/**
 * Update site content by key
 */
export async function updateContent(token, key, value) {
  const response = await fetch(`${API_URL}/api/admin/site-content/${key}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify({ value }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al guardar contenido');
  }
  return response.json();
}

export default {
  getAllContent,
  getContent,
  updateContent,
};
