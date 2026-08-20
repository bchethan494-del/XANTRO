import React, { useState } from 'react';
import { X, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'general' | 'buyer' | 'seller' | 'privacy';
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, defaultTab = 'general' }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'buyer' | 'seller' | 'privacy'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      id="terms-modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200"
        id="terms-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">XANTRO Platform Terms & Policies</h2>
              <p className="text-xs text-gray-500">Official legal agreement for buyers, sellers, and visitors (v1.0)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Marketplace Role & Terms
          </button>
          <button
            onClick={() => setActiveTab('buyer')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'buyer'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Buyer Responsibilities
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'seller'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Seller Responsibilities & 1% Fee
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 space-y-4">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs leading-relaxed">
                <strong className="block font-bold text-sm mb-1">XANTRO Platform Role Notice</strong>
                XANTRO operates solely as a multi-vendor marketplace platform and technology provider connecting independent sellers and buyers. XANTRO provides listing tools, search infrastructure, order management, and payment mediation, but does not manufacture, own, or ship the products listed by independent sellers. Transactions and product quality remain the mutual responsibility of the respective buyer and seller in accordance with published terms and applicable consumer protection laws.
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">1. Acceptance of Terms</h3>
                <p className="text-gray-600 leading-relaxed">
                  By accessing, browsing, or registering an account on XANTRO, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">2. Marketplace Transactions</h3>
                <p className="text-gray-600 leading-relaxed">
                  When a buyer purchases an item on XANTRO, a direct contractual relationship is established between the buyer and the seller. XANTRO provides the technological gateway to facilitate checkout, calculate transparent item pricing and delivery charges, and coordinate order status tracking.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">3. Governing Law & Dispute Resolution</h3>
                <p className="text-gray-600 leading-relaxed">
                  Platform usage and transactions are governed in accordance with applicable e-commerce and consumer protection statutes. XANTRO facilitates dispute resolution channels between buyers and sellers to ensure fair resolution of order inquiries, delivery delays, or refund requests.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'buyer' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-green-50 border border-green-200 rounded-lg text-green-900 text-xs">
                <strong className="block font-bold text-sm mb-1">Buyer Guidelines & Responsibilities</strong>
                Ensure smooth orders by providing verified contact details and checking item descriptions before confirming purchase.
              </div>

              <ul className="space-y-2.5 text-gray-600 list-none">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>Accurate Information:</strong> Buyers must provide accurate delivery addresses, valid mobile numbers, and reachable recipient details.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>Reviewing Product Details:</strong> Buyers must verify product specifications, prices, delivery fees, and estimated transit times before placing orders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>Payment Compliance:</strong> Buyers must fulfill chosen payment methods (Online UPI or Cash on Delivery upon shipment arrival).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>Return & Refund Procedures:</strong> Buyers agree to report discrepancies or transit damage within the prescribed inspection window with supporting unboxing media.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'seller' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-xs">
                <strong className="block font-bold text-sm mb-1">Seller Responsibilities & 1% Listing Activation Fee</strong>
                Sellers are independent merchants committed to genuine product listings, prompt dispatch, and lawful trade.
              </div>

              <div className="space-y-3 text-gray-600">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                  <strong className="text-gray-900 font-bold block mb-1">Automated 1% Listing Fee Requirement</strong>
                  To maintain marketplace listing quality and prevent spam, XANTRO requires an automated 1% listing activation fee calculated from the product price (e.g. ₹10 for a ₹1,000 product). Products remain in <span className="font-semibold text-yellow-700">PAYMENT PENDING</span> state until the 1% fee is verified via secure UPI.
                </div>

                <ul className="space-y-2 text-xs list-none">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Product Accuracy & Genuine Photos:</strong> Every product must have at least one genuine, clear product photo. Misleading specifications or counterfeit items are strictly prohibited.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Inventory & Pricing:</strong> Sellers must maintain real stock quantities and clearly declare visible delivery fees.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Prompt Dispatch & Valid Tracking:</strong> Sellers must securely package products and update valid courier tracking numbers upon dispatch.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Returns & Customer Support:</strong> Sellers must handle buyer inquiries, replacements, or refunds according to XANTRO policies and consumer statutes.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs">
                <strong className="block font-bold text-sm mb-1">Privacy & Financial Security Commitment</strong>
                XANTRO protects the privacy of buyers, sellers, and platform administrators with strict access controls.
              </div>

              <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
                <p>
                  <strong>Private Financial Details:</strong> Seller bank accounts, seller UPI IDs, and the platform Owner UPI ID are strictly protected on the backend and are never displayed publicly to visitors or across unauthorized APIs.
                </p>
                <p>
                  <strong>Customer Delivery Privacy:</strong> Buyer addresses and contact information are disclosed strictly to the specific seller fulfilling that customer's order for shipping purposes.
                </p>
                <p>
                  <strong>Data Security:</strong> User passwords are encrypted with industry-standard bcrypt hashing. Sessions and checkout states are safeguarded.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Version 1.0 • Effective August 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
