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
  simulateSuccessfulPayment,
  setUserEmail,
  getUserEmail
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
  // Find the package with the smaller size (3 readings)
  const smallPackage = PACKAGES.find(pkg => pkg.size === SMALL_PACKAGE_SIZE);
  const [selectedPackage, setSelectedPackage] = useState(smallPackage || PACKAGES[0]); // Default to small package
  const [email, setEmail] = useState(getUserEmail() || '');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailValidated, setEmailValidated] = useState(false); // Track if email has been validated
  const [buttonRenderAttempts, setButtonRenderAttempts] = useState(0);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [sdkInitAttempts, setSdkInitAttempts] = useState(0);
  const [isButtonContainerVisible, setIsButtonContainerVisible] = useState(true);
  const [containerInitialized, setContainerInitialized] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'validating' | 'preparing' | 'rendering' | 'checking'>('idle');

  // Validate email on mount
  useEffect(() => {
    const storedEmail = getUserEmail();
    if (storedEmail) {
      // Set and validate the email
      setEmail(storedEmail);
      const isValid = /\S+@\S+\.\S+/.test(storedEmail);
      setIsEmailValid(isValid);
      setEmailValidated(isValid);
      console.log("Using stored email:", storedEmail, "Valid:", isValid);
    }
    
    // Initialize button container
    initializeButtonContainer();
  }, []);

  // Function to initialize/reset the button container with improved reliability
  const initializeButtonContainer = () => {
    try {
      console.log("Initializing button container with improved reliability");
      
      // First, clean up any existing Mercado Pago resources to avoid conflicts
      if (typeof window !== 'undefined') {
        console.log("Cleaning up existing Mercado Pago resources before initializing button container");
        try {
          // Use our improved cleanup function
          cleanupMercadoPago();
        } catch (cleanupError) {
          console.error("Error cleaning up Mercado Pago checkout:", cleanupError);
        }
      }
      
      // Wait for a short moment to ensure cleanup is complete
      setTimeout(() => {
        try {
      
      // Create a completely new container to avoid any DOM-related issues
      const parent = document.querySelector('.checkout-button-container');
      if (!parent) {
        console.error("Parent container not found");
        
        // Try to create the parent container if it doesn't exist
        const paymentSection = document.querySelector('.space-y-4');
        if (paymentSection) {
          const newParent = document.createElement('div');
          newParent.className = 'checkout-button-container';
          paymentSection.prepend(newParent);
          console.log("Created new parent container");
          
          // Now try to get it again
          const createdParent = document.querySelector('.checkout-button-container');
          if (createdParent) {
            initializeButtonContainer(); // Try again with the new parent
            return;
          }
        }
        return;
      }
      
      // Clear the parent container
      parent.innerHTML = '';
      
      // Create a new container
      const newContainer = document.createElement('div');
      newContainer.id = 'mp-checkout-container';
      newContainer.className = 'checkout-button mb-4 flex justify-center';
      newContainer.style.minHeight = '60px';
      newContainer.style.background = 'rgba(67, 56, 202, 0.1)';
      newContainer.style.borderRadius = '8px';
      newContainer.style.padding = '10px';
      newContainer.style.border = '1px dashed rgba(126, 34, 206, 0.3)';
      newContainer.style.display = 'flex';
      newContainer.style.justifyContent = 'center';
      newContainer.style.alignItems = 'center';
      
      // Add a loading indicator
      newContainer.innerHTML = '<div class="flex items-center justify-center py-2"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div><span class="ml-2 text-sm text-yellow-500">Preparando botão de pagamento...</span></div>';
      
      // Append the new container to the parent
      parent.appendChild(newContainer);
      
      console.log("Button container initialized with ID:", newContainer.id);
      setContainerInitialized(true);
      setIsButtonContainerVisible(true);
        } catch (innerError) {
          console.error("Error in delayed button container initialization:", innerError);
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing button container:", error);
    }
  };
  
  // Initialize payment when modal opens
  useEffect(() => {
    // Function to initialize the Mercado Pago SDK
    const initializeSdk = async () => {
      try {
        console.log("Initializing Mercado Pago SDK...");
        setLoadingState('preparing');
        
        // Make sure the container is ready before SDK initialization
        if (!containerInitialized) {
          initializeButtonContainer();
        }
        
        // Add a small delay before SDK initialization to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 300));
        await initMercadoPago();
        setIsSdkReady(true);
        console.log("Mercado Pago SDK initialized successfully");
        
        // Reset any button-related issues
        setIsButtonContainerVisible(true);
        setButtonRenderAttempts(0);
        return true;
      } catch (err) {
        console.error('Mercado Pago SDK initialization error:', err);
        if (sdkInitAttempts < 2) {
          // Try again if we haven't reached the maximum attempts
          setSdkInitAttempts(prev => prev + 1);
          setTimeout(initializeSdk, 1000);
          return false;
        } else {
          setError('Não foi possível inicializar o sistema de pagamento. Por favor, tente novamente mais tarde ou use o link alternativo.');
          
          // Show alternate payment option if SDK keeps failing
          if (preferenceId && paymentUrl) {
            const alternativeButton = document.querySelector('.alternative-payment-button');
            if (alternativeButton) {
              (alternativeButton as HTMLElement).style.display = 'flex';
            }
          }
          return false;
        }
      }
    };
    
    if (isOpen) {
      // Reset state when modal opens
      setSdkInitAttempts(0);
      setButtonRenderAttempts(0);
      setError(null);
      setIsButtonContainerVisible(true);
      setLoadingState('idle');
      setContainerInitialized(false);
      
      // First make sure any previous SDK instance is completely cleared
      cleanupMercadoPago(); // Use the improved cleanup function from mercadoPago.ts
      
      // Add special check for browser readiness
      const documentState = document.readyState;
      console.log(`Current document state: ${documentState}`);
      
      // Wait for document to be ready before initializing
      if (documentState !== 'complete') {
        console.log("Document not fully loaded yet, adding load event listener");
        
        // Add event listener for document load completion
        const handleDocumentLoad = () => {
          console.log("Document load complete, initializing payment flow");
          window.removeEventListener('load', handleDocumentLoad);
          initializeButtonContainer();
          
          setTimeout(() => {
            initializeSdk().then(success => {
              if (success) {
                initializePayment();
              }
            });
          }, 500);
        };
        
        window.addEventListener('load', handleDocumentLoad);
        return;
      }
      
      // Initialize the button container
      initializeButtonContainer();
      
      // Use a more reliable approach to ensure DOM readiness
      const waitAndInitialize = () => {
        // Check if document is ready
        if (document.readyState === 'complete') {
          console.log("Document is fully loaded, proceeding with SDK initialization");
          
          // Force a browser reflow to ensure DOM is stable
          document.body.getBoundingClientRect();
          
          // Wait for DOM to be ready before initializing SDK
          setTimeout(() => {
            // Try to initialize the SDK with better error handling
            initializeSdk()
              .then(success => {
                if (success) {
                  initializePayment();
                }
              })
              .catch(err => {
                console.error("SDK initialization failed in modal:", err);
                setError('Falha ao inicializar o sistema de pagamento. Por favor, tente novamente ou use o método alternativo.');
                
                // Show alternative payment method as fallback
                if (preferenceId && paymentUrl) {
                  setIsButtonContainerVisible(false);
                  const alternativeButton = document.querySelector('.alternative-payment-button');
                  if (alternativeButton) {
                    (alternativeButton as HTMLElement).style.display = 'flex';
                  }
                }
              });
          }, 500); // Increased delay for better reliability
        } else {
          console.log("Document not fully loaded yet, waiting...");
          // Wait for document to be ready
          setTimeout(waitAndInitialize, 200);
        }
      };
      
      // Start the initialization process
      waitAndInitialize();
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
    // If we have a stored email, use it, otherwise clear it
    const storedEmail = getUserEmail();
    setEmail(storedEmail || '');
    
    // Validate email if it exists
    if (storedEmail) {
      setIsEmailValid(/\S+@\S+\.\S+/.test(storedEmail));
    } else {
      setIsEmailValid(true);
    }
    setPaymentStatus(getPaymentStatus());
    setButtonRenderAttempts(0);
    
    // We already initialized the SDK at modal open, so just complete initialization
    setIsLoading(false);
  };

  // Validate email
  const validateEmail = (emailToValidate: string): boolean => {
    if (!emailToValidate.trim()) {
      setIsEmailValid(false);
      setEmailValidated(false);
      setError('Por favor, insira seu email para continuar.');
      return false;
    }
    
    // Validate email format
    const isValid = /\S+@\S+\.\S+/.test(emailToValidate);
    setIsEmailValid(isValid);
    setEmailValidated(isValid);
    
    if (!isValid) {
      setError('Por favor, insira um email válido.');
    } else {
      setError(null);
      // Store the valid email
      setUserEmail(emailToValidate);
    }
    
    return isValid;
  };
  
  // Process payment after email is provided
  const processPayment = async () => {
    setLoadingState('validating');
    
    // Validate the email first
    if (!validateEmail(email)) {
      setLoadingState('idle');
      return;
    }

    setIsLoading(true);
    setLoadingState('preparing');
    setError(null);
    
    // Ensure button container is initialized
    if (!containerInitialized) {
      initializeButtonContainer();
    }
    
    try {
      // Store the email for verification before creating the payment preference
      setUserEmail(email);
      console.log("Email stored for verification:", email);
      
      // Email is valid, create payment preference with the email
      console.log("Creating payment preference for package:", selectedPackage, "with email:", email);
      
      try {
        const preference = await createPaymentPreference(selectedPackage, email);
      setPaymentUrl(preference.initPoint);
      setPreferenceId(preference.id);

      // Reset button render attempts and make container visible
      setButtonRenderAttempts(0);
      setIsButtonContainerVisible(true);
      
      // Give more time for the DOM to update before rendering the button
      setLoadingState('rendering');
      
      // Reinitialize the button container to ensure a clean state
      initializeButtonContainer();
      
      // More reliable approach for button rendering
      const renderWithDelay = () => {
        // First check if SDK is still ready
        if (!(window as any).mp) {
          console.log("MP SDK not available before rendering, reinitializing...");
          initMercadoPago().then(() => {
            setTimeout(() => {
              renderMercadoPagoButton(preference.id);
            }, 1000);
          }).catch(err => {
            console.error("Failed to reinitialize SDK before rendering:", err);
            // Show alternative payment option
            setIsButtonContainerVisible(false);
            const alternativeButton = document.querySelector('.alternative-payment-button');
            if (alternativeButton) {
              (alternativeButton as HTMLElement).style.display = 'flex';
            }
          });
        } else {
          // SDK is ready, proceed with rendering
          setTimeout(() => {
            renderMercadoPagoButton(preference.id);
          }, 1500); // 1500ms delay to ensure DOM is fully ready
        }
      };
      
      // Use requestAnimationFrame to align with browser's rendering cycle
      requestAnimationFrame(() => {
        renderWithDelay();
      });
      } catch (prefError) {
        console.error('Error creating payment preference:', prefError);
        setError('Erro ao criar preferência de pagamento. Por favor, tente novamente.');
        setLoadingState('idle');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Não foi possível inicializar o pagamento. Por favor, tente novamente mais tarde.');
      setLoadingState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check payment status
  const handleCheckStatus = async () => {
    if (!preferenceId) return;
    
    setIsLoading(true);
    setLoadingState('checking');
    setError(null);
    
    try {
      // Make sure we're using the most up-to-date email
      const verificationEmail = email || getUserEmail();
      
      if (!verificationEmail) {
        setError('Email não encontrado para verificação. Por favor, forneça seu email.');
        setIsLoading(false);
        setLoadingState('idle');
        return;
      }
      
      console.log(`Verifying payment with email: ${verificationEmail}`);
      
      // Use the email for payment verification
      const status = await checkPaymentStatus(preferenceId, verificationEmail);
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
      setLoadingState('idle');
    }
  };

  // Function to render the Mercado Pago checkout button with retry logic
  const renderMercadoPagoButton = (preferenceId: string) => {
    console.log(`Attempting to render Mercado Pago button, attempt ${buttonRenderAttempts + 1}`);
    
    // Make sure we have a clean button container
    if (!containerInitialized) {
      initializeButtonContainer();
    }
    
    // Ensure the container is properly prepared
    let container = document.getElementById('mp-checkout-container');
    if (!container) {
      console.log("Container not found, reinitializing...");
      initializeButtonContainer();
      
      // Wait for container initialization to complete
      setTimeout(() => {
        container = document.getElementById('mp-checkout-container');
        
        if (!container) {
          console.error("Checkout button container not found even after reinitialization");
          setError('Não foi possível encontrar o container para os botões de pagamento.');
          setLoadingState('idle');
          
          // Show alternative payment method as last resort
          if (paymentUrl) {
            const alternativeButton = document.querySelector('.alternative-payment-button');
            if (alternativeButton) {
              (alternativeButton as HTMLElement).style.display = 'flex';
            }
          }
          return;
        }
        
        // Container found, continue with render attempt
        continueWithRender(container);
      }, 300);
      
      return;
    }
    
    // Container exists, proceed with rendering
    continueWithRender(container);
  };
  
  // Helper function to continue with rendering once container is confirmed
  const continueWithRender = (container: HTMLElement) => {
    const mp = (window as any).mp;
    
    if (!mp) {
      console.warn("MercadoPago not defined, cannot render checkout.");
      
      // If SDK is not ready and we haven't tried too many times, try initializing again
      if (buttonRenderAttempts < 3) {
        console.log(`Attempt ${buttonRenderAttempts + 1} to initialize MP SDK`);
        setButtonRenderAttempts(prev => prev + 1);
        
        // Try to initialize again after a delay
        setTimeout(async () => {
          try {
            console.log(`Retry ${buttonRenderAttempts + 1}: Initializing Mercado Pago SDK...`);
            
            // Use the dedicated cleanup function for better reliability
            cleanupMercadoPago();
            
            // Add a diagnostic marker to the document for debugging
            const debugMarker = document.createElement('div');
            debugMarker.id = `mp-debug-attempt-${buttonRenderAttempts}`;
            debugMarker.style.display = 'none';
            debugMarker.dataset.timestamp = Date.now().toString();
            document.body.appendChild(debugMarker);
            
            // Reinitialize button container with a delay to ensure DOM stability
            setTimeout(() => {
              initializeButtonContainer();
              
              // Force a browser reflow before continuing
              document.body.getBoundingClientRect();
              
              // Initialize with a delay for better browser readiness
              setTimeout(async () => {
                try {
                  await initMercadoPago();
                  setIsSdkReady(true);
                  console.log(`Retry ${buttonRenderAttempts + 1}: SDK initialized, attempting to render button`);
            
                  // Give a longer delay before attempting to render
                  setTimeout(() => {
                    renderMercadoPagoButton(preferenceId);
                  }, 800);
                } catch (innerError) {
                  console.error(`Inner SDK initialization error on attempt ${buttonRenderAttempts}:`, innerError);
                  setError('Problema persistente com a inicialização do SDK. Use o link alternativo abaixo.');
                  setLoadingState('idle');
                  
                  // Show alternative payment method right away
                  if (paymentUrl) {
                    setIsButtonContainerVisible(false);
                    const alternativeButton = document.querySelector('.alternative-payment-button');
                    if (alternativeButton) {
                      (alternativeButton as HTMLElement).style.display = 'flex';
                    }
                  }
                }
              }, 500);
            }, 200);
          } catch (err) {
            console.error('Retry failed to initialize Mercado Pago SDK:', err);
            setError('Problema ao carregar os botões de pagamento. Tente recarregar a página.');
            setLoadingState('idle');
            
            // If we've tried multiple times, show the alternative payment method
            if (buttonRenderAttempts >= 1 && paymentUrl) {
              const alternativeButton = document.querySelector('.alternative-payment-button');
              if (alternativeButton) {
                (alternativeButton as HTMLElement).style.display = 'flex';
              }
            }
          }
        }, 1500); // Longer delay for retry attempts
      } else {
        setError('Não foi possível carregar os botões de pagamento do Mercado Pago. Por favor, use o link alternativo abaixo.');
        setIsButtonContainerVisible(false); // Hide the button container since it's not working
      }
      return;
    }
    
    try {
      // Check if container exists
      const container = document.querySelector('.checkout-button');
      if (!container) {
        console.error("Checkout button container not found");
        setError('Não foi possível renderizar os botões de pagamento. Por favor, use o link alternativo.');
        return;
      }
      
      // Create a clean slate for the button container
      try {
        // First, remove the container to reset any potential DOM issues
        const existingContainer = document.getElementById('mp-checkout-container');
        if (existingContainer) {
          const parent = existingContainer.parentElement;
          if (parent) {
            const newContainer = document.createElement('div');
            newContainer.id = 'mp-checkout-container';
            newContainer.className = 'checkout-button mb-4 flex justify-center';
            newContainer.style.minHeight = '60px';
            newContainer.style.background = 'rgba(67, 56, 202, 0.1)';
            newContainer.style.borderRadius = '8px';
            newContainer.style.padding = '10px';
            
            // Replace the old container with a fresh one
            parent.replaceChild(newContainer, existingContainer);
            container = newContainer;
          }
        }
        
        // Clear previous button if it exists
        container.innerHTML = '';
        
        // Add a loading indicator while the button is being rendered
        container.innerHTML = '<div class="flex items-center justify-center py-2"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div><span class="ml-2 text-sm text-yellow-500">Carregando botão de pagamento...</span></div>';
      } catch (innerError) {
        console.error("Error clearing or preparing button container:", innerError);
      }
      
      // Get a direct reference to the container
      const mpContainer = document.getElementById('mp-checkout-container');
      if (!mpContainer) {
        throw new Error('MP container not found even after initialization');
      }
      
      // Add diagnostic information to container for debugging
      mpContainer.dataset.sdkReady = String(!!mp);
      mpContainer.dataset.renderAttempt = String(buttonRenderAttempts);
      mpContainer.dataset.timestamp = Date.now().toString();
      
      // Make sure the container is visible and ready
      mpContainer.style.display = 'flex';
      mpContainer.style.justifyContent = 'center';
      mpContainer.style.alignItems = 'center';
      mpContainer.style.minHeight = '60px';
      
      // Configure and render the checkout button
      mp.checkout({
        preference: {
          id: preferenceId
        },
        render: {
          container: '#' + container.id, // Use the confirmed container ID for more reliable targeting
          label: 'Pagar com Mercado Pago',
          type: 'wallet', // Using wallet button type for better recognition
        },
        theme: {
          headerColor: '#4338ca', // Match the indigo-700 color
          elementsColor: '#7e22ce', // Match the purple-700 color
          elementsColorTheme: 'default'
        },
        callbacks: {
          onReady: () => {
            console.log("Mercado Pago button is ready");
            setLoadingState('idle');
            
            // Force show button container if it was hidden
            setIsButtonContainerVisible(true);
            const buttonContainer = document.getElementById('mp-checkout-container');
            if (buttonContainer) {
              buttonContainer.style.display = 'flex';
              buttonContainer.style.opacity = '1';
              buttonContainer.style.visibility = 'visible';
              buttonContainer.dataset.status = 'ready';
              
              // Add success class for better visual feedback
              buttonContainer.classList.add('mp-button-loaded');
              buttonContainer.style.borderColor = 'rgba(126, 34, 206, 0.8)';
            }
            
            // Clear any error related to button rendering
            if (error && error.includes('botão de pagamento')) {
              setError(null);
            }
          },
          onError: (error: any) => {
            console.error("Mercado Pago button error:", error);
            
            // Try to capture more diagnostic information
            const diagnosticInfo = {
              error: error,
              timestamp: new Date().toISOString(),
              containerExists: !!document.getElementById('mp-checkout-container'),
              sdkLoaded: !!(window as any).MercadoPago,
              mpInitialized: !!(window as any).mp,
              preferenceId: preferenceId
            };
            console.log("Mercado Pago diagnostic info:", diagnosticInfo);
            
            setError('Erro ao carregar o botão de pagamento. Por favor, use o link alternativo abaixo.');
            setLoadingState('idle');
            
            // Hide the button container and show alternative button
            setIsButtonContainerVisible(false);
            
            // Show alternative button when there's an error
            const alternativeButton = document.querySelector('.alternative-payment-button');
            if (alternativeButton) {
              (alternativeButton as HTMLElement).style.display = 'flex';
            }
          }
        }
      });
      console.log("Mercado Pago checkout button rendered successfully");
        } catch (renderError) {
          console.error("Error rendering checkout button:", renderError);
          
          // Add debugging info
          const diagnosticInfo = {
            error: renderError,
            container: mpContainer ? {
              id: mpContainer.id,
              isVisible: mpContainer.style.display !== 'none',
              hasMpButton: !!mpContainer.querySelector('button'),
              datasets: mpContainer.dataset
            } : 'Container not found',
            sdkInfo: {
              mpDefined: !!(window as any).mp,
              mercadoPagoDefined: !!(window as any).MercadoPago,
              preferenceId: preferenceId
            }
          };
          console.log("Render error diagnostic info:", diagnosticInfo);
          
          // Try again if we haven't exceeded maximum attempts
          if (buttonRenderAttempts < 2) { // Reduced maximum attempts to get to alternative payment faster
            console.log(`Render attempt ${buttonRenderAttempts + 1} failed, retrying...`);
            setButtonRenderAttempts(prev => prev + 1);
        
        // Try rendering again after a delay
        setTimeout(() => {
          // Reinitialize button container completely
          initializeButtonContainer();
          
          // Wait for next animation frame to ensure DOM is ready
          requestAnimationFrame(() => {
            // Add a delay to ensure browser has time to process DOM changes
            setTimeout(() => {
              console.log("Attempting to render button after container reinitialization");
              renderMercadoPagoButton(preferenceId);
            }, 800);
          });
            } catch (cleanupError) {
              console.error("Error replacing container:", cleanupError);
            }
          }
          
          renderMercadoPagoButton(preferenceId);
        }, 1500); // Increased delay to give more time for SDK to be ready
      } else {
        setError('Falha ao carregar os botões de pagamento. Por favor, use o link alternativo abaixo.');
        setLoadingState('idle');
        // Hide the button container
        setIsButtonContainerVisible(false);
        
        // Force show the alternate payment button
        const alternativeButton = document.querySelector('.alternative-payment-button');
        if (alternativeButton) {
          (alternativeButton as HTMLElement).style.display = 'flex';
        }
      }
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
          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`px-4 py-2 bg-indigo-900 border ${isEmailValid ? 'border-purple-700' : 'border-red-700'} rounded-lg w-full text-white placeholder-purple-400 focus:outline-none`}
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => {
                const newEmail = e.target.value;
                setEmail(newEmail);
                setIsEmailValid(true); // Reset validation on change
                setError(null); // Clear any previous errors
              }}
              onBlur={(e) => {
                // Validate email when focus leaves the field
                validateEmail(e.target.value);
              }}
              required
            />
            {!isEmailValid && (
              <p className="text-red-500 text-sm mt-1">
                Por favor, insira um email válido.
              </p>
            )}
            <p className="text-purple-300 text-xs mt-1">
              Seu email é necessário para verificação do pagamento e será salvo localmente.
            </p>
            {emailValidated && isEmailValid && (
              <p className="text-green-400 text-xs mt-1 flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                Email válido e pronto para pagamento
              </p>
            )}
          </div>

          {/* Content */}
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
                      {[...PACKAGES].sort((a, b) => a.size - b.size).map((pkg, index) => (
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
                      <div>
                        <p className="text-red-300 text-sm">{error}</p>
                        {buttonRenderAttempts >= 3 && (
                          <p className="text-yellow-300 text-xs mt-1">
                            Use o botão alternativo abaixo para continuar com o pagamento.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="w-full py-3 bg-yellow-500 text-indigo-900 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {loadingState === 'validating' && 'Validando email...'}
                        {loadingState === 'preparing' && 'Preparando pagamento...'}
                        {loadingState === 'rendering' && 'Carregando botões...'}
                        {loadingState === 'checking' && 'Verificando pagamento...'}
                        {loadingState === 'idle' && 'Carregando...'}
                      </div>
                    ) : (
                      <>
                        {!preferenceId ? (
                          <button
                            onClick={processPayment}
                            disabled={isLoading || !isSdkReady || (email.trim() !== '' && !isEmailValid)}
                            className="bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center disabled:opacity-75"
                          >
                            {!isSdkReady ? 'Carregando...' : 
                             email.trim() !== '' && !isEmailValid ? 'Verifique seu email' : 
                             'Continuar para Pagamento'}
                          </button>
                        ) : (
                          <>
                            {/* Container for checkout button */}
                            <div className="checkout-button-container">
                              {isButtonContainerVisible && (
                                <div 
                                  className="checkout-button mb-4 flex justify-center" 
                                  id="mp-checkout-container" 
                                  style={{ 
                                    minHeight: '60px',
                                    background: 'rgba(67, 56, 202, 0.1)',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    border: '1px dashed rgba(126, 34, 206, 0.3)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative', // For absolute positioning of children
                                    overflow: 'visible'  // Allow button to overflow if needed
                                  }}
                                  data-testid="mp-button-container"
                                >
                                  {/* Fallback loading indicator */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-pulse text-yellow-500 text-xs">
                                      Carregando botões de pagamento...
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Show loading status */}
                            {(loadingState === 'rendering' || (buttonRenderAttempts > 0 && isButtonContainerVisible && !error)) && (
                              <div className="flex items-center justify-center mb-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
                                <p className="text-yellow-300 text-xs text-center">
                                  Carregando botões de pagamento... {buttonRenderAttempts > 0 ? `Tentativa ${buttonRenderAttempts}/3` : ''}
                                </p>
                              </div>
                            )}
                            
                            {/* Debug info in development mode */}
                            {import.meta.env.DEV && (
                              <div className="text-xs text-purple-400 mb-2 text-center">
                                SDK: {isSdkReady ? '✓' : '✗'} | 
                                Container: {containerInitialized ? '✓' : '✗'} | 
                                Attempts: {buttonRenderAttempts}/3
                              </div>
                            )}
                            
                            {(!isButtonContainerVisible || buttonRenderAttempts >= 2) && (
                              <div className="text-center mb-4">
                                <p className="text-yellow-300 text-sm">
                                  Utilize o botão alternativo abaixo para realizar o pagamento
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                  Você será redirecionado para a página segura do Mercado Pago
                                </p>
                              </div>
                            )}
                            
                            {paymentUrl && (
                              <>
                                {/* Fallback button in case the SDK button fails */}
                                <button 
                                  onClick={() => window.open(paymentUrl, '_blank', 'noopener,noreferrer')}
                                  className="alternative-payment-button bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center mt-2"
                                  style={{ 
                                    display: (buttonRenderAttempts >= 2 || !isButtonContainerVisible || !(window as any).mp) ? 'flex' : 'none' 
                                  }}
                                >
                                  Pagar pelo Mercado Pago
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </button>
                                
                                <button
                                  onClick={handleCheckStatus}
                                  disabled={isLoading}
                                  className="bg-purple-700 hover:bg-purple-600 text-white py-3 px-6 rounded-lg w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                  {isLoading ? 'Verificando...' : 'Já realizei o pagamento'}
                        </button>
                      </>
                    )}
                    
                    {/* For development/demo purposes only */}
                    {import.meta.env.DEV && (
                      <>
                        <button
                          onClick={handleSimulatePayment}
                          className="bg-green-700 hover:bg-green-600 text-white py-2 px-6 rounded-lg w-full text-sm mt-2"
                        >
                          Simular Pagamento (Apenas Demo)
                        </button>
                        
                        {/* Developer debug buttons */}
                        <div className="mt-2 p-2 border border-gray-700 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">Developer Tools:</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => cleanupMercadoPago()}
                              className="bg-red-900 text-white text-xs px-2 py-1 rounded"
                            >
                              Clean SDK
                            </button>
                            <button
                              onClick={() => initMercadoPago().then(() => console.log("SDK reinitialized"))}
                              className="bg-blue-900 text-white text-xs px-2 py-1 rounded"
                            >
                              Reinit SDK
                            </button>
                            <button
                              onClick={() => initializeButtonContainer()}
                              className="bg-purple-900 text-white text-xs px-2 py-1 rounded"
                            >
                              Reset Container
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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
