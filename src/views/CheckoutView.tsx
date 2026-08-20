import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { UserAddress, Product, CartItem } from '../types';
import { apiCreateOrder } from '../api';
import { UpiPaymentModal } from '../components/UpiPaymentModal';
import { MapPin, Truck, ShieldCheck, CreditCard, Banknote, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutViewProps {
  directItem?: { product: Product; quantity: number } | null;
  onOrderSuccess: (orderId: string) => void;
  onBackToCart: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  directItem,
  onOrderSuccess,
  onBackToCart
}) => {
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const checkoutItems: CartItem[] = directItem ? [directItem] : cartItems;

  const defaultAddr: UserAddress = user?.addresses && user.addresses.length > 0
    ? user.addresses[0]
    : {
        id: `addr_${Date.now()}`,
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560001',
        isDefault: true
      };

  const [address, setAddress] = useState<UserAddress>(defaultAddr);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_UPI' | 'COD'>('ONLINE_UPI');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = checkoutItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  const deliveryFeeTotal = checkoutItems.reduce((sum, it) => sum + it.product.deliveryFee * it.quantity, 0);
  const grandTotal = subtotal + deliveryFeeTotal;

  const handlePlaceOrder = async () => {
    setError('');
    if (!address.fullName || !address.phone || !address.street || !address.pinCode) {
      setError('Please provide complete shipping details (Full Name, Phone, Street, PIN code).');
      return;
    }

    if (paymentMethod === 'ONLINE_UPI') {
      setShowUpiModal(true);
    } else {
      // COD directly places order
      await executeOrderPlacement('COD');
    }
  };

  const executeOrderPlacement = async (method: 'ONLINE_UPI' | 'COD') => {
    setLoading(true);
    try {
      const res = await apiCreateOrder({
        buyerId: user?.id || 'usr_buyer_guest',
        buyerName: address.fullName,
        buyerEmail: user?.email,
        buyerPhone: address.phone,
        items: checkoutItems,
        deliveryAddress: address,
        paymentMethod: method
      });

      if (!directItem) {
        clearCart();
      }

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      onOrderSuccess(res.order.id);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpiVerified = async (reference: string) => {
    await executeOrderPlacement('ONLINE_UPI');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="checkout-view-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
        <button
          onClick={onBackToCart}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Checkout & Delivery</h1>
          <p className="text-xs text-gray-500">Provide shipping address and select payment method</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Delivery Address & Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                1. Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="Recipient full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Street Address / House No.</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="Flat / House No., Apartment, Street, Landmark"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="e.g. Karnataka"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  value={address.pinCode}
                  onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                  placeholder="e.g. 560001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                2. Select Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* Online UPI Payment Option */}
              <label
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE_UPI'
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="checkout_payment"
                  checked={paymentMethod === 'ONLINE_UPI'}
                  onChange={() => setPaymentMethod('ONLINE_UPI')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">
                      Online Payment (UPI / Google Pay / PhonePe / Cards)
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Fast automated payment verification through secure merchant gateway.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="checkout_payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</span>
                    <Banknote className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Pay with cash or UPI to the courier executive upon shipment delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Order Items Summary & Confirmation */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 uppercase tracking-wider">
              Order Summary
            </h2>

            {/* Item list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {checkoutItems.map((item) => (
                <div key={item.product.id} className="flex items-center gap-2.5 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-cover rounded bg-gray-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-gray-500">
                      Qty: {item.quantity} • ₹{item.product.price} (+ ₹{item.product.deliveryFee} Del.)
                    </p>
                  </div>
                  <div className="font-bold text-gray-900">
                    ₹{((item.product.price + item.product.deliveryFee) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Product Price Total:</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span className="font-semibold text-gray-900">₹{deliveryFeeTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total Customer Price:</span>
                <span className="text-lg font-black text-blue-900">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="button"
              disabled={loading}
              onClick={handlePlaceOrder}
              className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-yellow-950 font-bold rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
              id="btn-confirm-place-order"
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : paymentMethod === 'ONLINE_UPI' ? (
                <span>Pay ₹{grandTotal} & Place Order</span>
              ) : (
                <span>Confirm Cash on Delivery Order</span>
              )}
            </button>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>XANTRO Marketplace Fulfillment</span>
            </div>
            <p>
              Your order is placed directly with the verified independent sellers. You will receive real-time dispatch and courier tracking updates.
            </p>
          </div>
        </div>
      </div>

      {/* Online UPI Gateway Modal */}
      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        title="XANTRO Order Payment"
        subtitle={`Order Payment for ${checkoutItems.length} item(s)`}
        amount={grandTotal}
        paymentType="ORDER_PAYMENT"
        onPaymentSuccess={handleUpiVerified}
      />
    </div>
  );
};
