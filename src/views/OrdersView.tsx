import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { apiFetchMyOrders } from '../api';
import { useAuth } from '../context/AuthContext';
import { Package, Truck, Calendar, Store, CheckCircle, Clock, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

interface OrdersViewProps {
  onContinueShopping: () => void;
  onSelectProductById: (productId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onContinueShopping, onSelectProductById }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await apiFetchMyOrders(user?.id || 'usr_buyer_demo');
      setOrders(res.orders || []);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const stages: OrderStatus[] = [
    'Order Placed',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const getStageIndex = (status: OrderStatus) => {
    const idx = stages.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="orders-view-container">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">My Orders & Tracking</h1>
          <p className="text-xs text-gray-500">Track shipments, view order receipts and delivery updates</p>
        </div>
        <button
          onClick={loadOrders}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Refresh Orders
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-gray-200 p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-gray-900">No Orders Found</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't placed any orders yet. Explore active listings from independent sellers.
          </p>
          <button
            onClick={onContinueShopping}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStageIdx = getStageIndex(order.orderStatus);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs"
                id={`order-card-${order.id}`}
              >
                {/* Order Top Bar */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">ORDER ID</span>
                      <span className="font-bold text-gray-900">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">ORDER DATE</span>
                      <span className="text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">TOTAL AMOUNT</span>
                      <span className="font-extrabold text-blue-900">₹{order.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                      {order.paymentMethod === 'ONLINE_UPI' ? 'Online UPI' : 'Cash on Delivery'} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                {/* Tracking Stepper */}
                <div className="p-5 border-b border-gray-100 bg-white">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-gray-900">Shipment Status:</span>
                      <span className="font-extrabold text-blue-700">{order.orderStatus}</span>
                    </div>
                    {order.trackingInfo.courierName && (
                      <div className="text-[11px] text-gray-600">
                        Courier: <strong>{order.trackingInfo.courierName}</strong> | Tracking ID:{' '}
                        <strong className="font-mono">{order.trackingInfo.trackingNumber}</strong>
                      </div>
                    )}
                  </div>

                  {/* Visual Progress Timeline Stepper */}
                  <div className="relative py-2">
                    <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                      ></div>
                    </div>

                    <div className="grid grid-cols-6 text-center text-[10px]">
                      {stages.map((stage, idx) => {
                        const isDone = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage} className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold mb-1 ${
                                isDone
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`leading-tight ${
                                isCurrent
                                  ? 'font-extrabold text-blue-700'
                                  : isDone
                                  ? 'font-semibold text-gray-800'
                                  : 'text-gray-400'
                              }`}
                            >
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="p-5 divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded-lg bg-gray-100 shrink-0 border border-gray-100 cursor-pointer"
                          onClick={() => onSelectProductById(item.productId)}
                        />
                        <div className="min-w-0">
                          <h4
                            onClick={() => onSelectProductById(item.productId)}
                            className="font-bold text-gray-900 truncate hover:text-blue-600 cursor-pointer"
                          >
                            {item.productName}
                          </h4>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Seller: <span className="font-semibold text-gray-700">{item.sellerName}</span>
                          </div>
                          <div className="text-[11px] text-gray-600 mt-0.5">
                            Quantity: {item.quantity} • Product: ₹{item.price} + Delivery: ₹{item.deliveryFee}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-gray-900 text-sm">
                          ₹{item.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & History Footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-600">
                  <div>
                    <strong>Delivering to:</strong> {order.deliveryAddress?.fullName},{' '}
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.pinCode}
                  </div>
                  {order.trackingInfo.expectedDeliveryDate && (
                    <div className="font-medium text-gray-700">
                      Expected Delivery: <strong>{order.trackingInfo.expectedDeliveryDate}</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
