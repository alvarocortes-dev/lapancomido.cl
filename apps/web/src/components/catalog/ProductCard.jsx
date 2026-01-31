// src/components/catalog/ProductCard.jsx
import { Link } from "react-router-dom";
import { Button } from "antd";
import { FaHeart } from "react-icons/fa";
import { useSelection } from "../../hooks/useSelection";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../hooks/useAuth";
import { QuantityControl } from "./QuantityControl";
import { formatCLP } from "../../helpers/formatPrice.helper";

/**
 * Product card for catalog grid with selection controls
 * @param {Object} product - Product data
 * @param {boolean} showPrices - Whether to display prices (from store config)
 */
export const ProductCard = ({ product, showPrices = true }) => {
  const { session } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToSelection, updateQuantity, removeFromSelection, getSelectedItem } = useSelection();
  
  const selectedItem = getSelectedItem(product.id);
  const isSelected = !!selectedItem;
  const isFavorite = favorites.some((fav) => fav.id === product.id);
  const isOutOfStock = !product.available;

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToSelection(product, 1);
  };

  const handleIncrease = () => {
    updateQuantity(product.id, selectedItem.quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(product.id, selectedItem.quantity - 1);
  };

  const handleRemove = () => {
    removeFromSelection(product.id);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  // Out of stock product rendering
  if (isOutOfStock) {
    return (
      <div className="p-4 opacity-50 grayscale cursor-not-allowed">
        <div className="relative bg-white w-full h-68 flex items-center justify-center border-10 border-white rounded-2xl">
          <div
            className="w-full h-full rounded-2xl bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url(${product.url_img})` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 px-2">
          <p className="font-semibold text-lg">{product.product}</p>
          <span className="text-gray-500 text-sm font-medium">Agotado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 hover:bg-gray-100 transition duration-200 rounded-2xl">
      <Link to={`/product/${product.id}`}>
        <div className="relative bg-white w-full h-68 flex items-center justify-center border-10 border-white rounded-2xl">
          {/* Favorites icon */}
          {session?.token && (
            <div
              className="absolute top-4 right-4 z-10 cursor-pointer active:scale-90 transition-transform"
              onClick={handleFavoriteClick}
              style={{
                transform: "scale(1.3)",
                filter: "drop-shadow(0 0 2px rgba(0,0,0,0.4))",
              }}
            >
              <FaHeart className={isFavorite ? "text-red-500" : "text-white"} />
            </div>
          )}
          <div
            className="w-full h-full rounded-2xl bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url(${product.url_img})` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 px-2">
          <p className="font-semibold text-lg">{product.product}</p>
          {showPrices && <p className="text-black ml-4">{formatCLP(product.price)}</p>}
        </div>
      </Link>
      
      {/* Selection controls */}
      <div className="mt-3 flex justify-center" onClick={(e) => e.stopPropagation()}>
        {isSelected ? (
          <QuantityControl
            quantity={selectedItem.quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
            size="middle"
          />
        ) : (
          <Button
            type="primary"
            onClick={handleAddClick}
            className="!bg-[#262011] !border-[#262011] hover:!bg-[#3d3018] w-full"
          >
            Agregar
          </Button>
        )}
      </div>
    </div>
  );
};
