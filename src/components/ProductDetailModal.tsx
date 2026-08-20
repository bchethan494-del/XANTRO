import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, Zap, Truck, ShieldCheck, Store, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onOpenTerms?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onBuyNow,
  onOpenTerms
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    const res = addToCart(product, quantity);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else if (res.message) {
      alert(res.message);
    }
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, quantity);
  };

  const itemTotal = (product.price + product.deliveryFee) * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      id="product-detail-modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
        id="product-detail-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-100 text-blue-800 rounded">
              {product.category}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-xs md:max-w-md">
              {product.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-md overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Seller Trust Banner */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                <Store className="w-4 h-4 text-blue-600" />
                <span>Independent Seller: {product.sellerName}</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Products are packaged and dispatched directly by the verified independent seller.
              </p>
            </div>
          </div>

          {/* Right Column: Details & Purchasing */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              {/* Product Title */}
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>

              {/* Rating & reviews */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-600 text-white text-xs font-bold">
                  <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <span className="text-xs text-gray-500">
                  {product.reviewsCount || 24} Verified Ratings • {product.purchaseCount || 10}+ Bought
                </span>
              </div>

              {/* Price Calculation Box */}
              <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-gray-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Delivery Fee: ₹{product.deliveryFee}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800">
                  <span>Total Customer Price (1 unit):</span>
                  <span className="text-sm text-blue-900 font-extrabold">
                    ₹{(product.price + product.deliveryFee).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Availability:</span>
                {product.quantity > 0 ? (
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    In Stock ({product.quantity} units available)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Product Description
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description provided by the seller.'}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Item Total: <strong className="text-gray-900">₹{itemTotal.toLocaleString('en-IN')}</strong>
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs ${
                    added
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                  }`}
                  id="btn-modal-add-to-cart"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNowClick}
                  className="py-2.5 px-4 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-yellow-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs"
                  id="btn-modal-buy-now"
                >
                  <Zap className="w-4 h-4 fill-yellow-950" />
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Standard XANTRO Buyer Protection & Safe Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
