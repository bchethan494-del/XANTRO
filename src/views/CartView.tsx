import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, Truck, ShieldCheck, ArrowRight, Store, AlertCircle } from 'lucide-react';

interface CartViewProps {
  onProceedToCheckout: () => void;
  onOpenAuth: (mode?: 'login' | 'signup', role?: 'buyer' | 'seller') => void;
  onContinueShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  onProceedToCheckout,
  onOpenAuth,
  onContinueShopping
}) => {
  const { items, totalItemsCount, subtotal, deliveryFeeTotal, grandTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center" id="empty-cart-view">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
          Explore products from independent sellers and add items to your cart to begin shopping.
        </p>
        <button
          onClick={onContinueShopping}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs inline-flex items-center gap-2"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Group items by seller for multi-seller clarity
  const itemsBySeller: { [sellerId: string]: typeof items } = {};
  items.forEach((item) => {
    const sellerKey = item.product.sellerId || 'unknown';
    if (!itemsBySeller[sellerKey]) {
      itemsBySeller[sellerKey] = [];
    }
    itemsBySeller[sellerKey].push(item);
  });

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      onOpenAuth('login', 'buyer');
    } else {
      onProceedToCheckout();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="cart-view-container">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Shopping Cart</h1>
          <p className="text-xs text-gray-500">
            {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''} in your cart (Max 100 items allowed)
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items grouped by seller */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => {
            const sellerName = sellerItems[0]?.product.sellerName || 'Independent Seller';
            return (
              <div
                key={sellerId}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs"
              >
                {/* Seller Group Header */}
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-gray-800">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span>Fulfillment by Seller: {sellerName}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {sellerItems.length} product{sellerItems.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items in this seller's package */}
                <div className="divide-y divide-gray-100 p-4 space-y-4">
                  {sellerItems.map((item) => {
                    const itemTotal = (item.product.price + item.product.deliveryFee) * item.quantity;
                    return (
                      <div
                        key={item.product.id}
                        className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        id={`cart-item-${item.product.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 object-cover rounded-lg bg-gray-100 shrink-0 border border-gray-100"
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-gray-900 truncate">
                              {item.product.name}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span className="font-bold text-gray-900">
                                ₹{item.product.price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                                <Truck className="w-3 h-3 text-gray-400" />
                                Delivery ₹{item.product.deliveryFee}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              Unit Total: ₹{(item.product.price + item.product.deliveryFee).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          {/* Quantity Controller */}
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-xs font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const res = updateQuantity(item.product.id, item.quantity + 1);
                                if (!res.success && res.message) alert(res.message);
                              }}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                            >
                              +
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[80px]">
                            <div className="text-xs font-extrabold text-gray-900">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </div>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary Box */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 uppercase tracking-wider">
              Price Details
            </h2>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Product Price Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Delivery Charges:</span>
                <span className="font-semibold text-gray-900">₹{deliveryFeeTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-gray-900">Total Customer Price:</span>
              <span className="text-lg font-black text-blue-900">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckoutClick}
              className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-yellow-950 font-bold rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 uppercase tracking-wide"
              id="btn-cart-proceed-checkout"
            >
              <span>{isAuthenticated ? 'Proceed to Checkout' : 'Login to Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isAuthenticated && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                <span>You can browse as guest. Please login or sign up to finalize your delivery address & order.</span>
              </div>
            )}
          </div>

          {/* Guarantee Note */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-500 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-gray-700">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>Safe & Encrypted Transactions</span>
            </div>
            <p>
              Your delivery and payment details are processed under strict XANTRO marketplace security protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
