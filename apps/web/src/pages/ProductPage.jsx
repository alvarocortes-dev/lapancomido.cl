// frontend/src/pages/ProductPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Spin } from "antd";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCLP } from "../helpers/formatPrice.helper";
import { showUniqueToast } from "../helpers/showUniqueToast.helper";
import "react-toastify/dist/ReactToastify.css";

export const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [imageArray, setImageArray] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const { session } = useAuth();

  // Reinicia la cantidad al cambiar de producto
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  // Cargar detalles del producto
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener el producto");
        }
        const data = await response.json();
        setProduct(data);
        setImageArray(data.images && data.images.length > 0 ? data.images : []);
        if (data.related && data.related.length > 0) {
          const shuffled = data.related.sort(() => 0.5 - Math.random());
          setRelatedProducts(shuffled.slice(0, 4));
        }
      } catch (error) {
        console.error(error);
        showUniqueToast.error("Error al cargar el producto", {
          position: "bottom-right",
        });
      }
    };

    fetchProductDetail();
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center items-center mt-10 min-h-[50vh]">
        <Spin tip="Cargando producto...">
          <div className="w-[200px] h-[100px] sm:w-[350px] sm:h-[150px]" />
        </Spin>
      </div>
    );
  }

  const mainImage = imageArray[0];
  const thumbnails = imageArray.slice(1, 4);

  const handleQuantityChange = (newQuantity) => {
    const stock = Number(product.stock);
    if (newQuantity < 1) return;
    if (newQuantity > stock) {
      showUniqueToast.warning("No hay más unidades disponibles para agregar", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      setQuantity(stock);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      showUniqueToast.warning("Producto no disponible, sin stock", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    if (quantity > product.stock) {
      showUniqueToast.warning("No hay suficientes unidades disponibles", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    addToCart(product, quantity);
    showUniqueToast.success("Producto agregado al carro", {
      position: "bottom-right",
      autoClose: 3000,
      theme: "dark",
    });
    setQuantity(1);
  };

  const handleThumbnailClick = (index) => {
    const newArray = [...imageArray];
    const temp = newArray[0];
    newArray[0] = newArray[index + 1];
    newArray[index + 1] = temp;
    setImageArray(newArray);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-2">
      {/* Breadcrumb */}
      <div className="p-2 text-sm sm:text-base md:text-xl mb-4 sm:mb-8 md:mb-12 overflow-x-auto">
        <span className="whitespace-nowrap">
          <Link to="/catalog" className="hover:underline">
            CATÁLOGO
          </Link>{" "}
          /{" "}
          {product.categories && product.categories.length > 0 && (
            <>
              <Link
                to={`/catalog?category=${encodeURIComponent(
                  product.categories[0]
                )}`}
                className="hover:underline"
              >
                {product.categories[0].toUpperCase()}
              </Link>{" "}
              /{" "}
            </>
          )}
          <span className="font-medium">{product.product}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Imagen principal */}
        <div className="flex justify-center">
          <div className="w-full max-w-md md:max-w-none aspect-square p-2 sm:p-4">
            <img
              src={mainImage}
              alt={product.product}
              className="object-cover rounded-md shadow-2xl w-full h-full transition-transform duration-300 ease-in-out transform hover:scale-105"
            />
          </div>
        </div>

        {/* Información del producto */}
        <div className="px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold">{product.product}</h1>
          <div className="pt-3 sm:pt-4">
            <h3 className="text-base sm:text-lg font-semibold">Ingredientes</h3>
            <ul className="text-gray-600 mt-2 list-disc pl-5 text-sm sm:text-base">
              {product.ingredients.split("\n").map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <p
            className={`mt-3 sm:mt-4 font-semibold text-sm sm:text-base ${
              product.stock > 0 ? "text-green-600" : "text-gray-600"
            }`}
          >
            {product.stock > 0 ? "En stock" : "Sin stock"}
          </p>
          <p className="text-xl sm:text-2xl font-bold mt-2">{formatCLP(product.price)}</p>

          {/* Quantity controls */}
          <div className="flex flex-wrap items-center mt-4 gap-2">
            <div className="flex items-center">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="bg-gray-300 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1 border border-black flex items-center justify-center text-lg min-h-[44px] min-w-[44px]"
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                onBlur={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                className="w-12 h-10 sm:h-auto text-center border border-black text-base min-h-[44px]"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="bg-gray-300 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1 border border-black flex items-center justify-center text-lg min-h-[44px] min-w-[44px]"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`bg-black text-white px-4 py-2 rounded-md transition-colors duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 min-h-[44px] text-sm sm:text-base ${
                product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              AGREGAR
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex mt-4 sm:mt-6 gap-2 sm:gap-4 overflow-x-auto pb-2">
            {thumbnails.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 flex-shrink-0 object-cover rounded-md shadow-lg cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105"
                onClick={() => handleThumbnailClick(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sección de descripción e información nutricional */}
      <div className="grid grid-cols-1 md:grid-cols-2 mt-8 sm:mt-12 gap-6 sm:gap-8">
        <div className="pr-0 md:pr-8">
          <h2 className="text-lg sm:text-xl font-bold">Descripción del producto</h2>
          <p className="text-gray-600 mt-2 whitespace-pre-wrap text-sm sm:text-base">
            {product.description}
          </p>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Información Nutricional</h2>
          <div className="mt-2 p-3 sm:p-4 border border-gray-300 rounded overflow-x-auto">
            <table className="w-full text-gray-700 text-sm sm:text-base">
              <tbody>
                {product.nutrition.split("\n").map((line, idx) => {
                  const [label, ...rest] = line.split(":");
                  const value = rest.join(":").trim();
                  return (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="font-bold py-1 pr-2">{label.trim()}:</td>
                      <td className="py-1">{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sección de productos relacionados */}
      {relatedProducts.length > 0 && (
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-bold">Productos similares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
            {relatedProducts.map((item) => {
              const relatedMainImage =
                item.url_img ||
                (item.images && item.images.length > 0
                  ? typeof item.images[0] === "string"
                    ? item.images[0]
                    : item.images[0].secure_url ||
                      item.images[0].url ||
                      item.images[0].url_img ||
                      ""
                  : "");
              return (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="relative rounded-md overflow-hidden group aspect-square"
                >
                  <div className="w-full h-full">
                    {relatedMainImage ? (
                      <img
                        src={relatedMainImage}
                        alt={item.product}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 sm:p-2">
                    <p className="text-white text-center text-xs sm:text-sm truncate">
                      {item.product}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
