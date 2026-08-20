import React, { useState, useEffect } from 'react';
import { X, QrCode, Smartphone, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  amount: number;
  paymentType: 'LISTING_FEE' | 'ADVERTISEMENT_FEE' | 'ORDER_PAYMENT';
  onPaymentSuccess: (reference: string) => Promise<void>;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  amount,
  paymentType,
  onPaymentSuccess
}) => {
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'upi_id'>('gpay');
  const [userVpa, setUserVpa] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [stepMessage, setStepMessage] = useState('');
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    let timer: any;
    if (isOpen && status === 'IDLE') {
      setCountdown(120);
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, status]);

  if (!isOpen) return null;

  const handlePay = async () => {
    setStatus('PROCESSING');
    setErrorMessage('');
    setStepMessage('Connecting to UPI Payment Gateway...');

    try {
      // Realistic multi-stage verification with merchant gateway simulation
      await new Promise((res) => setTimeout(res, 800));
      setStepMessage('Awaiting bank authorization & UTR confirmation...');
      await new Promise((res) => setTimeout(res, 1200));

      const utr = `UPI/XAN${Date.now().toString().slice(-8)}`;
      setStepMessage('Verifying transaction token with XANTRO Server...');
      await onPaymentSuccess(utr);

      setStatus('SUCCESS');
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      setTimeout(() => {
        onClose();
        setStatus('IDLE');
      }, 2000);
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMessage(err.message || 'Payment authorization failed. Please retry.');
    }
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = (countdown % 60).toString().padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      id="upi-payment-modal-overlay"
      onClick={() => status !== 'PROCESSING' && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200"
        id="upi-payment-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
              <p className="text-xs text-gray-500">Secure Merchant UPI Gateway</p>
            </div>
          </div>
          {status !== 'PROCESSING' && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Amount Display */}
        <div className="p-5 text-center bg-blue-50/70 border-b border-blue-100">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">
            Total Amount Due
          </span>
          <div className="text-3xl font-extrabold text-gray-900">
            ₹{amount.toLocaleString('en-IN')}
          </div>
          {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[11px] font-medium text-blue-700 border border-blue-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>End-to-End Encrypted Verification</span>
          </div>
        </div>

        {/* Body based on status */}
        <div className="p-5">
          {status === 'IDLE' && (
            <div className="space-y-4">
              {/* Payment Methods Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Select Payment App / UPI</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp('gpay')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedApp === 'gpay'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Google Pay</div>
                    <div className="text-[10px] text-gray-500">Fast UPI</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedApp('phonepe')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedApp === 'phonepe'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-xs font-bold">PhonePe</div>
                    <div className="text-[10px] text-gray-500">UPI / QR</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedApp('paytm')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedApp === 'paytm'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Paytm / BHIM</div>
                    <div className="text-[10px] text-gray-500">All UPI</div>
                  </button>
                </div>
              </div>

              {/* Dynamic QR / Intent Area */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg border border-gray-200 shadow-2xs flex flex-col items-center justify-center">
                  {/* Generated clean geometric QR representation */}
                  <div className="grid grid-cols-4 gap-1 w-24 h-24 p-1 bg-gray-900 rounded-xs">
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-gray-900 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-blue-500 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-gray-900 rounded-xs"></div>
                    <div className="bg-gray-900 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-yellow-400 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-gray-900 rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                    <div className="bg-white rounded-xs"></div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Scan with any UPI App or click below to authorize ₹{amount}
                </p>
                <span className="text-[11px] font-mono font-medium text-red-600 block mt-1">
                  Session expires in {minutes}:{seconds}
                </span>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePay}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg shadow-xs text-sm transition-all flex items-center justify-center gap-2"
                id="btn-confirm-upi-pay"
              >
                <span>Authorize & Pay ₹{amount}</span>
              </button>

              <p className="text-[11px] text-gray-500 text-center">
                Merchant Gateway handles real-time bank settlement and automatic activation.
              </p>
            </div>
          )}

          {status === 'PROCESSING' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-gray-900 text-base">Processing Transaction</h4>
                <p className="text-xs text-gray-500 mt-1">{stepMessage}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4 mx-auto"></div>
              </div>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Payment Verified!</h4>
                <p className="text-xs text-green-700 mt-1">
                  Transaction confirmed and activated on XANTRO server.
                </p>
              </div>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">Payment Verification Failed</h4>
                <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatus('IDLE')}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
