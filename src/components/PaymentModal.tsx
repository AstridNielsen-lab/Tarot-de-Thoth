import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { 
  FREE_READING_LIMIT, 
  READING_PACKAGE_SIZE,
  READING_PACKAGE_PRICE,
  SMALL_PACKAGE_SIZE,
  SMALL_PACKAGE_PRICE,
  PACKAGES,
  getReadingCount,
  getPaymentStatus,
  createPaymentPreference,
  checkPaymentStatus,
  initMercadoPago,
  simulateSuccessfulPayment
} from '../services/mercadoPago';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onPaymentComplete 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [readingCount, setReadingCount] = useState(getReadingCount());
  const [paymentStatus, setPaymentStatus] = useState(getPaymentStatus());
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]); // Default to 10 readings package

  // Initialize payment when modal opens
  useEffect(() => {
    if (isOpen) {
      (async () => {
        await initializePayment();
      })();
    }
    
    // Listen for payment success events (for demo/development mode)
    const handlePaymentSuccess = () => {
      setIsPaymentCompleted(true);
      onPaymentComplete();
    };
    
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    
    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
    };
  }, [isOpen, onPaymentComplete]);
  
  // Initialize payment process
  const initializePayment = async () => {
    setIsLoading(true);
    setError(null);
    setPaymentUrl(null);
    setPreferenceId(null);
    setIsPaymentCompleted(false);
    setReadingCount(getReadingCount());
    setPaymentStatus(getPaymentStatus());
    
    try {
      // First initialize Mercado Pago SDK
      await initMercadoPago();
      
      // Then create a payment preference with the selected package
      console.log("Creating payment preference for package:", selectedPackage);
      const preference = await createPaymentPreference(selectedPackage);
      setPaymentUrl(preference.initPoint);
      setPreferenceId(preference.id);
      
      // Render the checkout button after the component has updated with the preference ID
      // This is better than using setTimeout as it relies on the React lifecycle
      requestAnimationFrame(() => {
        renderMercadoPagoButton(preference.id);
      });
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Não foi possível inicializar o pagamento. Por favor, tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check payment status
  const handleCheckStatus = async () => {
    if (!preferenceId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const status = await checkPaymentStatus(preferenceId);
      setPaymentStatus(status);
      
      if (status.isPaid) {
        setIsPaymentCompleted(true);
        onPaymentComplete();
      } else {
        setError('O pagamento ainda não foi concluído. Por favor, conclua o pagamento ou tente novamente mais tarde.');
      }
    } catch (err) {
      console.error('Payment status check error:', err);
      setError('Não foi possível verificar o status do pagamento. Por favor, tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the Mercado Pago checkout button
  const renderMercadoPagoButton = (preferenceId: string) => {
    const mp = (window as any).mp;
    if (!mp) {
      console.warn("MercadoPago not defined, cannot render checkout.");
      return;
    }
    
    try {
      // Clear previous button if it exists
      const container = document.querySelector('.checkout-button');
      if (container) {
        container.innerHTML = '';
      }
      
      // Configure and render the checkout button
      mp.checkout({
        preference: {
          id: preferenceId
        },
        render: {
          container: '.checkout-button',
          label: 'Pagar com Mercado Pago',
          type: 'wallet', // Using wallet button type for better recognition
        },
        theme: {
          headerColor: '#4338ca', // Match the indigo-700 color
          elementsColor: '#7e22ce' // Match the purple-700 color
        }
      });
      console.log("Mercado Pago checkout button rendered successfully");
    } catch (renderError) {
      console.error("Error rendering checkout button:", renderError);
    }
  };

  // For development/demo purposes only
  const handleSimulatePayment = () => {
    simulateSuccessfulPayment();
    setPaymentStatus(getPaymentStatus());
    setIsPaymentCompleted(true);
    onPaymentComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-indigo-950 border border-purple-800 rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 flex items-center">
          <CreditCard className="text-yellow-400 w-6 h-6 mr-3" />
          <h2 className="text-xl font-bold text-white">Limite de Leituras Atingido</h2>
        </div>
        
        {/* Content */}
        <div className="p-6">
              {isPaymentCompleted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Pagamento Confirmado!</h3>
                  <p className="text-purple-300 mb-4">
                    Você agora tem acesso a {paymentStatus.readingsAvailable} leituras adicionais.
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-6 rounded-lg transition"
                  >
                    Continuar para Leitura
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-yellow-400">Leituras Realizadas</h3>
                      <span className="text-white font-bold bg-purple-800 px-3 py-1 rounded-full">
                        {readingCount}/{FREE_READING_LIMIT}
                      </span>
                    </div>
                    <p className="text-purple-300 text-sm">
                      Você atingiu o limite de leituras gratuitas. Para continuar, adquira um pacote de leituras adicionais.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-900/50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Escolha seu Pacote</h3>
                    
                    <div className="flex gap-4 mb-4">
                      {PACKAGES.map((pkg, index) => (
                        <div 
                          key={index}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`flex-1 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedPackage === pkg 
                              ? 'bg-yellow-500 text-indigo-900 border-2 border-yellow-300' 
                              : 'bg-indigo-800/50 text-purple-200 border-2 border-indigo-800 hover:bg-indigo-800'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`font-bold text-lg ${selectedPackage === pkg ? 'text-indigo-900' : 'text-white'}`}>
                              {pkg.size} Leituras
                            </div>
                            <div className={`font-bold text-xl mt-1 ${selectedPackage === pkg ? 'text-indigo-900' : 'text-yellow-400'}`}>
                              R$ {pkg.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <ul className="space-y-2 text-purple-300 mb-4">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{selectedPackage.size} leituras adicionais</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Válido por 30 dias</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Acesso a todas as funcionalidades</span>
                      </li>
                    </ul>
                    
                    <div className="bg-purple-900/80 p-3 rounded-lg flex items-center justify-between">
                      <span className="text-purple-300">Preço</span>
                      <span className="text-white font-bold text-xl">R$ {selectedPackage.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-6 flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="w-full py-3 bg-yellow-500 text-indigo-900 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Carregando...
                      </div>
                    ) : (
                      <>
                        <div className="checkout-button mb-4 flex justify-center"></div>
                        
                        {paymentUrl && (
                          <>
                            {/* Fallback button in case the SDK button fails */}
                            <button 
                              onClick={() => window.open(paymentUrl, '_blank', 'noopener,noreferrer')}
                              className="bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center mt-2"
                            >
                              Abrir Checkout no Navegador
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </button>
                            
                            <button
                              onClick={handleCheckStatus}
                              disabled={isLoading}
                              className="bg-purple-700 hover:bg-purple-600 text-white py-3 px-6 rounded-lg w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? 'Verificando...' : 'Já realizei o pagamento'}
                            </button>
                          </>
                        )}
                        
                        {/* For development/demo purposes only */}
                        {import.meta.env.DEV && (
                          <button
                            onClick={handleSimulatePayment}
                            className="bg-green-700 hover:bg-green-600 text-white py-2 px-6 rounded-lg w-full text-sm"
                          >
                            Simular Pagamento (Apenas Demo)
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
        </div>
      </div>
    </div>
  );
};
