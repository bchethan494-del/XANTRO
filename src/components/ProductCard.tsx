import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Truck, Check, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onBuyNow }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } else if (result.message) {
      alert(result.message);
    }
  };

  const totalPrice = product.price + product.deliveryFee;

  return (
    <div
      onClick={() => onSelect(product)}
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group"
      id={`product-card-${product.id}`}
    >
      {/* Product Image */}
      <div className="relative w-full pt-[85%] bg-gray-50 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category tag */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-gray-800 rounded shadow-2xs">
            {product.category}
          </span>
        </div>

        {/* Rating pill */}
        {product.rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-600 text-white text-[10px] font-bold shadow-2xs">
            <span>{product.rating.toFixed(1)}</span>
            <Star className="w-2.5 h-2.5 fill-white" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller Name */}
          <div className="text-[11px] font-medium text-gray-500 truncate mb-0.5">
            Sold by: <span className="font-semibold text-gray-700">{product.sellerName}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-2">
            {product.name}
          </h3>
        </div>

        {/* Pricing breakdown */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
              <Truck className="w-3 h-3 text-gray-400" />
              Delivery ₹{product.deliveryFee}
            </span>
          </div>

          <div className="text-[10px] text-gray-500 mt-0.5">
            Total: <span className="font-bold text-gray-800">₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              }`}
              id={`btn-add-to-cart-${product.id}`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
