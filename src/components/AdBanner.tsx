import React from 'react';
import { Advertisement, Product } from '../types';
import { Sparkles, ArrowRight, Truck } from 'lucide-react';

interface AdBannerProps {
  advertisements: Advertisement[];
  onSelectProduct: (productId: string) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ advertisements, onSelectProduct }) => {
  if (!advertisements || advertisements.length === 0) return null;

  return (
    <div className="w-full bg-blue-50/60 border-y border-blue-200 py-3 mb-6" id="xantro-ad-banner-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 rounded-xs">
              ADVERTISEMENT
            </span>
            <span className="text-xs font-semibold text-gray-700">
              Sponsored Featured Listings by Verified Sellers
            </span>
          </div>
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            Promoted via XANTRO ₹100 Ad System
          </span>
        </div>

        {/* Ad Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
          {advertisements.slice(0, 2).map((ad) => (
            <div
              key={ad.id}
              onClick={() => onSelectProduct(ad.productId)}
              className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group"
              id={`ad-card-${ad.id}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={ad.productImage}
                  alt={ad.productName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-md bg-gray-100 shrink-0 border border-gray-100"
                />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                    {ad.sellerName}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {ad.productName}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-sm font-extrabold text-gray-900">
                      ₹{ad.productPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                      <Truck className="w-3 h-3 text-gray-400" />
                      Delivery ₹{ad.deliveryFee}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(ad.productId);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
