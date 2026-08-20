import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Truck, Scale, Store } from 'lucide-react';

interface FooterProps {
  onOpenTerms: (tab: 'general' | 'buyer' | 'seller' | 'privacy') => void;
  onNavigate: (view: 'home' | 'cart' | 'checkout' | 'orders' | 'profile' | 'seller' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerms, onNavigate }) => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 text-gray-600 text-xs" id="xantro-footer">
      {/* Platform Value Strip */}
      <div className="border-b border-gray-100 bg-gray-50/70 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs">Independent Verified Sellers</h4>
              <p className="text-[11px] text-gray-500">Connecting genuine merchants directly with buyers.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs">Transparent Pricing & Delivery</h4>
              <p className="text-[11px] text-gray-500">Upfront delivery fees and itemized customer pricing.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs">Secure UPI & COD Payments</h4>
              <p className="text-[11px] text-gray-500">Automated listing verification & order safety.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-3 md:col-span-1">
          <Logo size="md" showSubtitle />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            XANTRO is an independent multi-vendor marketplace platform providing high-performance infrastructure for sellers to list products and buyers to explore quality goods.
          </p>
          <div className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} XANTRO. All rights reserved.
          </div>
        </div>

        {/* For Buyers */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">For Customers</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-blue-600">
                Browse Marketplace
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('orders')} className="hover:text-blue-600">
                Track My Orders
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('profile')} className="hover:text-blue-600">
                Customer Profile & Gift Cards
              </button>
            </li>
            <li>
              <button onClick={() => onOpenTerms('buyer')} className="hover:text-blue-600">
                Buyer Responsibilities
              </button>
            </li>
          </ul>
        </div>

        {/* For Sellers */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">RETAIL / Sellers</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button onClick={() => onNavigate('seller')} className="hover:text-blue-600 font-semibold text-blue-700">
                Seller Window
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('seller')} className="hover:text-blue-600">
                Sell a Product (1% Listing Fee)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('seller')} className="hover:text-blue-600">
                Promote with ₹100 Ads
              </button>
            </li>
            <li>
              <button onClick={() => onOpenTerms('seller')} className="hover:text-blue-600">
                Seller Terms & Responsibilities
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Governance */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Legal & Compliance</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button onClick={() => onOpenTerms('general')} className="hover:text-blue-600">
                Terms of Service
              </button>
            </li>
            <li>
              <button onClick={() => onOpenTerms('privacy')} className="hover:text-blue-600">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onOpenTerms('general')} className="hover:text-blue-600">
                Marketplace Platform Role
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin')} className="text-gray-400 hover:text-gray-700">
                Platform Admin Portal
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Platform Disclaimer Note */}
      <div className="bg-gray-100 py-3 px-4 text-center text-[11px] text-gray-500 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <strong>Marketplace Notice:</strong> XANTRO operates as a neutral marketplace platform connecting independent third-party sellers with buyers. Product specifications, quality, fulfillment, and returns are governed by applicable consumer laws and the specific merchant terms.
        </div>
      </div>
    </footer>
  );
};
