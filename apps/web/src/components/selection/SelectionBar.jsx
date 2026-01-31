// src/components/selection/SelectionBar.jsx
import { useState } from "react";
import { Button } from "antd";
import { UpOutlined, DownOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelection } from "../../hooks/useSelection";
import { formatCLP } from "../../helpers/formatPrice.helper";
import { QuantityControl } from "../catalog/QuantityControl";

/**
 * Sticky bottom bar showing selection summary
 * @param {function} onQuoteClick - Called when Cotizar button is clicked
 * @param {boolean} showPrices - Whether to display prices (from store config)
 */
export const SelectionBar = ({ onQuoteClick, showPrices = true }) => {
  const { 
    selection, 
    totalItems, 
    totalPrice, 
    clearSelection,
    updateQuantity,
    removeFromSelection 
  } = useSelection();
  const [expanded, setExpanded] = useState(false);

  // Don't render if no items selected
  if (selection.length === 0) {
    return null;
  }

  const handleQuoteClick = (e) => {
    e.stopPropagation();
    onQuoteClick?.();
  };

  const handleClearClick = (e) => {
    e.stopPropagation();
    clearSelection();
    setExpanded(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50">
      {/* Expanded product list */}
      {expanded && (
        <div className="max-h-[40vh] overflow-y-auto p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Productos seleccionados</h3>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleClearClick}
              size="small"
            >
              Limpiar
            </Button>
          </div>
          <div className="space-y-3">
            {selection.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white p-2 rounded-lg"
              >
                <img
                  src={item.url_img}
                  alt={item.product}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product}</p>
                  {showPrices && (
                    <p className="text-sm text-gray-600">
                      {formatCLP(item.price)} c/u
                    </p>
                  )}
                </div>
                <QuantityControl
                  quantity={item.quantity}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  onRemove={() => removeFromSelection(item.id)}
                  size="small"
                />
                {showPrices && (
                  <p className="font-semibold min-w-[70px] text-right">
                    {formatCLP(item.quantity * Number(item.price))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main bar */}
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={expanded ? <DownOutlined /> : <UpOutlined />}
            size="small"
          />
          <div>
            <span className="font-semibold">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
            {showPrices && (
              <span className="ml-2 text-gray-600">
                {formatCLP(totalPrice)}
              </span>
            )}
          </div>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={handleQuoteClick}
          className="!bg-green-600 !border-green-600 hover:!bg-green-700"
        >
          Cotizar
        </Button>
      </div>
    </div>
  );
};
