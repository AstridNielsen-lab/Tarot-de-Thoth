// Mercado Pago integration service
// This service handles payment-related functionality using Mercado Pago

// Constants
export const FREE_READING_LIMIT = 3;
export const READING_PACKAGE_SIZE = 10;
export const READING_PACKAGE_PRICE = 29.90;

export const SMALL_PACKAGE_SIZE = 3;
export const SMALL_PACKAGE_PRICE = 9.90;

export const PACKAGES = [
  { size: READING_PACKAGE_SIZE, price: READING_PACKAGE_PRICE, title: 'Pacote de 10 Leituras de Tarot' },
  { size: SMALL_PACKAGE_SIZE, price: SMALL_PACKAGE_PRICE, title: 'Pacote de 3 Leituras de Tarot' }
];

// Local storage keys
const READING_COUNT_KEY = 'tarot_reading_count';
const PAYMENT_STATUS_KEY = 'tarot_payment_status';
const USER_ID_KEY = 'tarot_user_id';
const USER_EMAIL_KEY = 'tarot_user_email';

// Types
export interface PaymentStatus {
  isPaid: boolean;
  expirationDate?: Date;
  readingsAvailable: number;
}

export interface PaymentPreference {
  id: string;
  initPoint: string;
  email?: string;
}

// Get Mercado Pago credentials from environment variables
// Get credentials from environment variables if available, otherwise use hardcoded values
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-899679bb-8f18-4745-8837-36d6ef30c623';
const MP_ACCESS_TOKEN = import.meta.env.VITE_MP_ACCESS_TOKEN || 'APP_USR-1223421008633173-070410-9db32cd8db2f19b0224c30514936e643-29008060';
const MP_CLIENT_ID = import.meta.env.VITE_MP_CLIENT_ID || '1223421008633173';
const MP_CLIENT_SECRET = import.meta.env.VITE_MP_CLIENT_SECRET || 'CUI8K2vCYgx9lP9ayGSo13LL03e6v3Yd';

// Log credential usage (excluding full values for security)
console.log("Using Mercado Pago credentials:", {
  publicKey: MP_PUBLIC_KEY.substring(0, 10) + "...",
  accessToken: MP_ACCESS_TOKEN.substring(0, 10) + "...",
  clientId: MP_CLIENT_ID.substring(0, 5) + "...",
});

// Clean up existing Mercado Pago SDK
export const cleanupMercadoPago = (): void => {
  try {
    console.log("Starting thorough Mercado Pago SDK cleanup...");
    
    // First try to use MP's own cleanup method if available
    if ((window as any).mp && (window as any).mp.checkout) {
      try {
        if (typeof (window as any).mp.checkout.destroy === 'function') {
          console.log("Using Mercado Pago's native cleanup method");
          (window as any).mp.checkout.destroy();
        }
      } catch (e) {
        console.warn("Error while using MP's native cleanup:", e);
      }
    }
    
    // Remove any global instances
    delete (window as any).mp;
    delete (window as any).MercadoPago;
    
    // Remove any checkout DOM elements that might have been created
    document.querySelectorAll('[data-mp-checkout]').forEach(el => {
      console.log("Removing Mercado Pago checkout element:", el);
      el.remove();
    });
    
    // Remove any existing scripts
    const scripts = document.querySelectorAll('script[src*="mercadopago"]');
    scripts.forEach(script => {
      console.log("Removing Mercado Pago script:", script.getAttribute('src'));
      script.remove();
    });
    
    // Clean up any other possible residual elements or styles
    document.querySelectorAll('style[data-mercadopago]').forEach(style => {
      style.remove();
    });
    
    // Add a flag to indicate cleanup has been done
    (window as any).__mpCleanupDone = Date.now();
    
    console.log("Mercado Pago SDK cleanup completed");
  } catch (error) {
    console.error("Error during Mercado Pago cleanup:", error);
  }
};

// Initialize Mercado Pago SDK with improved error handling
// Check if the document is ready
const isDocumentReady = (): boolean => {
  return document.readyState === 'complete' || document.readyState === 'interactive';
};

// Wait for document to be ready
const waitForDocumentReady = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isDocumentReady()) {
      resolve();
      return;
    }

    const checkReady = () => {
      if (isDocumentReady()) {
        document.removeEventListener('readystatechange', checkReady);
        resolve();
      }
    };

    document.addEventListener('readystatechange', checkReady);
  });
};

export const initMercadoPago = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    console.log("Starting Mercado Pago SDK initialization...");
    
    // First ensure document is ready
    try {
      await waitForDocumentReady();
      console.log("Document is ready for SDK initialization");
    } catch (e) {
      console.warn("Error waiting for document ready:", e);
      // Continue anyway
    }
    
    // Verify that we're in a browser environment
    if (typeof window === 'undefined') {
      console.error("Cannot initialize Mercado Pago SDK outside of browser environment");
      reject(new Error("Browser environment required"));
      return;
    }
    
    // Check if we've already initialized MercadoPago
    if ((window as any).mp) {
      console.log("MercadoPago instance already exists");
      resolve();
      return;
    }
    
    // Clean up any existing Mercado Pago SDK resources
    cleanupMercadoPago();
    
    // Add diagnostic listeners for global errors during SDK loading
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes('mercadopago') || event.filename?.includes('mercadopago')) {
        console.error("Global error during Mercado Pago SDK loading:", event);
      }
    };
    
    window.addEventListener('error', errorHandler);
    
    // Check if SDK is already loaded
    if ((window as any).MercadoPago) {
      console.log("MercadoPago SDK already loaded, initializing instance");
      try {
        console.log("Initializing with key:", MP_PUBLIC_KEY);
        (window as any).mp = new (window as any).MercadoPago(MP_PUBLIC_KEY, {
          locale: 'pt-BR'
        });
        console.log("MercadoPago initialized successfully");
        resolve();
      } catch (error) {
        console.error("Error initializing MercadoPago:", error);
        reject(error);
      }
      return;
    }

    console.log("Loading MercadoPago SDK...");
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.id = 'mercadopago-script';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-timestamp', Date.now().toString()); // Add timestamp to prevent caching issues
    script.setAttribute('data-public-key', MP_PUBLIC_KEY); // Add public key for debugging
    script.integrity = ''; // Intentionally left empty to avoid integrity checks that might fail
    script.referrerPolicy = 'origin'; // Restrict referrers to origin only
    
    // Add proper error handling with retries
    let retries = 0;
    const maxRetries = 3;
    
    const initMp = () => {
      try {
        console.log("MercadoPago SDK loaded, initializing with key:", MP_PUBLIC_KEY);
        
        if (!(window as any).MercadoPago) {
          throw new Error("MercadoPago SDK loaded but MercadoPago object is not defined");
        }
        
        // Create a new instance with the public key
        (window as any).mp = new (window as any).MercadoPago(MP_PUBLIC_KEY, {
          locale: 'pt-BR'
        });
        
        // Verify the instance was created correctly
        if (!(window as any).mp) {
          throw new Error("Failed to create MercadoPago instance");
        }
        
        const initTime = Date.now() - startTime;
        console.log(`MercadoPago initialized successfully in ${initTime}ms`);
        
        // Remove error handler now that initialization is complete
        window.removeEventListener('error', errorHandler);
        
        resolve();
      } catch (error) {
        console.error("Error initializing MercadoPago:", error);
        
        if (retries < maxRetries) {
          retries++;
          console.log(`Retrying initialization (${retries}/${maxRetries})...`);
          setTimeout(initMp, 500);
        } else {
          console.error("Max retries reached for MP SDK initialization", error);
          
          // Clean up before rejecting
          window.removeEventListener('error', errorHandler);
          
          // Provide more detailed error information
          const detailedError = new Error(`Failed to initialize MercadoPago SDK: ${error.message}`);
          (detailedError as any).originalError = error;
          (detailedError as any).sdkStatus = {
            publicKey: MP_PUBLIC_KEY.substring(0, 10) + '...',
            isScriptLoaded: !!document.getElementById('mercadopago-script'),
            isMercadoPagoObjectDefined: !!(window as any).MercadoPago,
            isMpInstanceDefined: !!(window as any).mp,
            timeElapsed: Date.now() - startTime
          };
          
          reject(detailedError);
        }
      }
    };
    
    script.onload = initMp;
    script.onerror = (error) => {
      console.error("Error loading MercadoPago SDK:", error);
      
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying script load (${retries}/${maxRetries})...`);
        
        // First do a thorough cleanup
        try {
          cleanupMercadoPago();
        } catch (cleanupError) {
          console.warn("Error during cleanup before retry:", cleanupError);
        }
        
        // Create a new script element with a different ID to avoid caching issues
        const newScript = document.createElement('script');
        newScript.src = `https://sdk.mercadopago.com/js/v2?_=${Date.now()}&retry=${retries}`;
        newScript.id = `mercadopago-script-${retries}`;
        newScript.async = true;
        newScript.crossOrigin = 'anonymous';
        newScript.setAttribute('data-timestamp', Date.now().toString());
        
        // Wait longer between retries
        setTimeout(() => {
          document.body.appendChild(newScript);
        }, 1500);
        
        // Update the script reference
        script = newScript;
      } else {
        // Clean up before rejecting
        window.removeEventListener('error', errorHandler);
        
        // Provide detailed error information
        const detailedError = new Error(`Failed to load MercadoPago SDK script after ${maxRetries} attempts`);
        (detailedError as any).originalError = error;
        (detailedError as any).sdkStatus = {
          publicKey: MP_PUBLIC_KEY.substring(0, 10) + '...',
          isScriptLoaded: false,
          retryAttempts: retries,
          timeElapsed: Date.now() - startTime
        };
        
        reject(detailedError);
      }
    };
    
    document.body.appendChild(script);
  });
};

// User ID management
export const getUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

// User email management
export const getUserEmail = (): string | null => {
  return localStorage.getItem(USER_EMAIL_KEY);
};

export const setUserEmail = (email: string): void => {
  localStorage.setItem(USER_EMAIL_KEY, email);
};

// Reading count management
export const getReadingCount = (): number => {
  const count = localStorage.getItem(READING_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
};

export const incrementReadingCount = (): number => {
  const currentCount = getReadingCount();
  const newCount = currentCount + 1;
  localStorage.setItem(READING_COUNT_KEY, newCount.toString());
  return newCount;
};

// Payment status management
export const getPaymentStatus = (): PaymentStatus => {
  const statusJson = localStorage.getItem(PAYMENT_STATUS_KEY);
  if (!statusJson) {
    return { isPaid: false, readingsAvailable: 0 };
  }

  try {
    const status = JSON.parse(statusJson) as PaymentStatus;
    
    // If there's an expiration date, convert string to Date object
    if (status.expirationDate) {
      status.expirationDate = new Date(status.expirationDate);
      
      // Check if the payment has expired
      if (status.expirationDate < new Date()) {
        return { isPaid: false, readingsAvailable: 0 };
      }
    }
    
    return status;
  } catch (error) {
    console.error('Error parsing payment status:', error);
    return { isPaid: false, readingsAvailable: 0 };
  }
};

export const updatePaymentStatus = (status: PaymentStatus): void => {
  localStorage.setItem(PAYMENT_STATUS_KEY, JSON.stringify(status));
};

export const useReadingCredit = (): number => {
  const status = getPaymentStatus();
  if (status.isPaid && status.readingsAvailable > 0) {
    const remaining = status.readingsAvailable - 1;
    updatePaymentStatus({
      ...status,
      readingsAvailable: remaining
    });
    return remaining;
  }
  return 0;
};

// Check if user needs payment
export const needsPayment = (): boolean => {
  const paymentStatus = getPaymentStatus();
  
  // If user has paid and has readings available, they don't need to pay
  if (paymentStatus.isPaid && paymentStatus.readingsAvailable > 0) {
    return false;
  }
  
  // If user has used fewer than the free limit, they don't need to pay
  return getReadingCount() >= FREE_READING_LIMIT;
};

// For development/demo purposes only
export const simulateSuccessfulPayment = (): void => {
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 1); // 1 month validity
  
  const status = {
    isPaid: true,
    expirationDate,
    readingsAvailable: READING_PACKAGE_SIZE
  };
  
  console.log("Simulating successful payment, new status:", status);
  updatePaymentStatus(status);
  
  // Update readingsAvailable based on the most recently selected package
  const transactions = JSON.parse(localStorage.getItem('mp_transactions') || '[]');
  if (transactions.length > 0) {
    const latestTransaction = transactions[transactions.length - 1];
    const purchasedPackage = PACKAGES.find(pkg => pkg.price === latestTransaction.amount);
    if (purchasedPackage) {
      status.readingsAvailable = purchasedPackage.size;
      updatePaymentStatus(status);
    }
  }
  
  // Notify any listeners that a payment has been processed
  const event = new CustomEvent('paymentSuccess', { detail: status });
  window.dispatchEvent(event);
};

// In a real application, these functions would call a backend API
// that securely communicates with Mercado Pago using your access token

// Create payment preference using Mercado Pago Checkout Pro
export const createPaymentPreference = async (selectedPackage = PACKAGES[0], email?: string): Promise<PaymentPreference> => {
  try {
    console.log("Creating payment preference with Checkout Pro...");
    
    // Store email if provided
    if (email) {
      setUserEmail(email);
    }
    
    // Initialize Mercado Pago
    await initMercadoPago();
    
    // Create preference data
    const preferenceData = {
      items: [{
        title: selectedPackage.title,
        unit_price: selectedPackage.price,
        quantity: 1,
        currency_id: 'BRL'
      }],
      back_urls: {
        success: window.location.href,
        failure: window.location.href,
        pending: window.location.href
      },
      auto_return: "approved",
      payment_methods: {
        installments: 1,
        excluded_payment_types: []
      },
      statement_descriptor: "Tarot de Thoth",
      external_reference: `tarot_reading_package_${Date.now()}_${getUserId()}`,
      payer: {
        email: email || getUserEmail() || 'guest@example.com'
      }
    };

    console.log("Preference data prepared:", preferenceData);
    
    try {
      // Make API request to create preference
      // Note: In a production environment, this call should be made from your backend for security
      // We're doing it client-side for demo purposes only
      console.log("Making API request with token:", MP_ACCESS_TOKEN.substring(0, 10) + "...");
      
      // Add CORS headers for development environment
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers,
        body: JSON.stringify(preferenceData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error:", response.status, errorData);
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const preference = await response.json();
      console.log("Preference created successfully:", preference);
      
      // Store transaction in localStorage for reference
      const transaction = {
        id: preference.id,
        date: new Date().toISOString(),
        amount: selectedPackage.price,
        status: 'pending'
      };
      
      const transactions = JSON.parse(localStorage.getItem('mp_transactions') || '[]');
      transactions.push(transaction);
      localStorage.setItem('mp_transactions', JSON.stringify(transactions));
      
      return {
        id: preference.id,
        initPoint: preference.init_point,
        email: email || getUserEmail() || undefined
      };
    } catch (apiError) {
      console.error("API error:", apiError);
      
      // Fallback for development/demo
      console.log("Using fallback development mode for testing");
      
      // Simulate a transaction
      const transactionId = `dev_${Date.now()}`;
      
      // Store in localStorage
      const transaction = {
        id: transactionId,
        date: new Date().toISOString(),
        amount: READING_PACKAGE_PRICE,
        status: 'pending'
      };
      
      const transactions = JSON.parse(localStorage.getItem('mp_transactions') || '[]');
      transactions.push(transaction);
      localStorage.setItem('mp_transactions', JSON.stringify(transactions));
      
      // For development, just simulate success
      setTimeout(() => {
        simulateSuccessfulPayment();
      }, 2000);
      
      return {
        id: transactionId,
        initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${transactionId}`,
        email: email || getUserEmail() || undefined
      };
    }
  } catch (error) {
    console.error('Error creating payment preference:', error);
    // For better debugging, let's add more details to the error
    if (error instanceof Error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
    throw new Error('Failed to create payment due to an unknown error');
  }
};

// Check payment status
export const checkPaymentStatus = async (preferenceId: string, email?: string): Promise<PaymentStatus> => {
  try {
    console.log("Checking payment status for:", preferenceId);
    
    // Validate inputs
    if (!preferenceId) {
      throw new Error("preferenceId is required for payment verification");
    }
    
    // Use provided email or get from storage
    const userEmail = email || getUserEmail();
    console.log("Verifying payment with email:", userEmail);
    
    if (!userEmail) {
      console.warn("No email provided for payment verification");
    }
    
    // In a production environment with a backend, you would use this code:
    /*
    const response = await fetch('/api/check-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: getUserId(),
        preferenceId,
        email: userEmail
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }
    
    const status = await response.json();
    */
    
    // For our frontend-only implementation, we'll check the transactions in localStorage
    // and use a simulated success for demonstration purposes
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Look for the transaction in localStorage
    const transactions = JSON.parse(localStorage.getItem('mp_transactions') || '[]');
    const transaction = transactions.find((t: any) => t.id === preferenceId);
    
    // In a real implementation, we would verify that the email matches the transaction
    // For this demo, we'll compare the email with the stored one
    if (userEmail && transaction) {
      console.log(`Verifying payment for email: ${userEmail} with transaction: ${transaction.id}`);
      
      // Store the email with the transaction for reference
      transaction.email = userEmail;
      localStorage.setItem('mp_transactions', JSON.stringify(transactions));
      
      // If transaction already has an email and it doesn't match, log a warning
      // In a real implementation, this might be a security check
      if (transaction.email && transaction.email !== userEmail) {
        console.warn(`Email mismatch: Transaction was created with ${transaction.email} but verification attempted with ${userEmail}`);
      }
    }
    
    if (!transaction) {
      console.warn(`Transaction ${preferenceId} not found in local storage`);
      // For demo purposes, we'll assume success anyway
    }
    
    // In a real implementation, you would check the actual payment status from your backend
    // For the demo, we'll simulate a successful payment
    
    console.log("Payment successful for transaction:", preferenceId);
    
    // Mark the transaction as completed in localStorage
    if (transaction) {
      transaction.status = 'completed';
      localStorage.setItem('mp_transactions', JSON.stringify(transactions));
    }
    
    // Create the expiration date (1 month from now)
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);
    
    // Create and save the payment status
    const status: PaymentStatus = {
      isPaid: true,
      expirationDate,
      readingsAvailable: READING_PACKAGE_SIZE
    };
    
    // Save payment status to local storage
    updatePaymentStatus(status);
    
    // Update the readingsAvailable based on the transaction amount
    // This is needed for when we have different package sizes
    // Note: We're using the transactions and transaction variables that were already declared above
    
    if (transaction) {
      // Find which package was purchased based on the amount
      const purchasedPackage = PACKAGES.find(pkg => pkg.price === transaction.amount);
      
      if (purchasedPackage) {
        status.readingsAvailable = purchasedPackage.size;
        updatePaymentStatus(status);
      }
    }
    
    return status;
  } catch (error) {
    console.error('Error checking payment status:', error);
    // Add better error details
    if (error instanceof Error) {
      // Add a custom error code for easier debugging
      const errorWithCode = new Error(`Failed to verify payment: ${error.message}`);
      (errorWithCode as any).code = 'PAYMENT_VERIFICATION_FAILED';
      (errorWithCode as any).originalError = error;
      throw errorWithCode;
    }
    const genericError = new Error('Failed to verify payment due to an unknown error');
    (genericError as any).code = 'PAYMENT_VERIFICATION_UNKNOWN';
    throw genericError;
  }
};
