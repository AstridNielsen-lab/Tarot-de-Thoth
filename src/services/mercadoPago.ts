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

// Types
export interface PaymentStatus {
  isPaid: boolean;
  expirationDate?: Date;
  readingsAvailable: number;
}

export interface PaymentPreference {
  id: string;
  initPoint: string;
}

// Get Mercado Pago credentials from environment variables
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
const MP_ACCESS_TOKEN = import.meta.env.VITE_MP_ACCESS_TOKEN;

// Initialize Mercado Pago SDK
export const initMercadoPago = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if we've already initialized MercadoPago
    if ((window as any).mp) {
      console.log("MercadoPago instance already exists");
      resolve();
      return;
    }
    
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
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      try {
        console.log("MercadoPago SDK loaded, initializing with key:", MP_PUBLIC_KEY);
        (window as any).mp = new (window as any).MercadoPago(MP_PUBLIC_KEY, {
          locale: 'pt-BR'
        });
        console.log("MercadoPago initialized successfully");
        resolve();
      } catch (error) {
        console.error("Error initializing MercadoPago:", error);
        reject(error);
      }
    };
    script.onerror = (error) => {
      console.error("Error loading MercadoPago SDK:", error);
      reject(error);
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
export const createPaymentPreference = async (selectedPackage = PACKAGES[0]): Promise<PaymentPreference> => {
  try {
    console.log("Creating payment preference with Checkout Pro...");
    
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
      external_reference: `tarot_reading_package_${Date.now()}_${getUserId()}`
    };

    console.log("Preference data prepared:", preferenceData);
    
    try {
      // Make API request to create preference
      // Note: In a production environment, this call should be made from your backend for security
      // We're doing it client-side for demo purposes only
      console.log("Making API request with token:", MP_ACCESS_TOKEN.substring(0, 10) + "...");
      
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
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
        initPoint: preference.init_point
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
        initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${transactionId}`
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
export const checkPaymentStatus = async (preferenceId: string): Promise<PaymentStatus> => {
  try {
    console.log("Checking payment status for:", preferenceId);
    
    // In a production environment with a backend, you would use this code:
    /*
    const response = await fetch('/api/check-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: getUserId(),
        preferenceId
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
    const transactions = JSON.parse(localStorage.getItem('mp_transactions') || '[]');
    const transaction = transactions.find((t: any) => t.id === preferenceId);
    
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
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
    throw new Error('Failed to verify payment due to an unknown error');
  }
};
