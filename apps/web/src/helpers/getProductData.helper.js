// src/helpers/getProductData.helper.js
export const getProducts = async (query = "") => {
  try {
    // Asegurarse de que si hay query, incluya el símbolo de interrogación (la URL ya lo incluye en location.search)
    const url = `${import.meta.env.VITE_API_URL}/api/products${query}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener productos");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/categories`
    );
    if (!response.ok) {
      throw new Error("Error al obtener categorías");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }
};

export const getSiteContent = async (key) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/site-content/${key}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener contenido del sitio");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener contenido del sitio:", error);
    return null;
  }
};

export const getAllSiteContent = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/site-content`
    );
    if (!response.ok) {
      throw new Error("Error al obtener contenido del sitio");
    }
    // API returns array of {key, value} - convert to object
    const data = await response.json();
    const result = {};
    for (const item of data) {
      result[item.key] = item.value;
    }
    return result;
  } catch (error) {
    console.error("Error al obtener contenido del sitio:", error);
    return {};
  }
};
