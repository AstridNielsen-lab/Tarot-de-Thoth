// Mercado Pago integration service
// This service handles payment-related functionality using Mercado Pago

// Constants
export const FREE_READING_LIMIT = 3;
export const READING_PACKAGE_SIZE = 10;
export const READING_PACKAGE_PRICE = 29.90;

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
    if ((window as any).MercadoPago) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      try {
        (window as any).mp = new (window as any).MercadoPago(MP_PUBLIC_KEY);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = (error) => reject(error);
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
  
  updatePaymentStatus({
    isPaid: true,
    expirationDate,
    readingsAvailable: READING_PACKAGE_SIZE
  });
};

// In a real application, these functions would call a backend API
// that securely communicates with Mercado Pago using your access token

// Create payment preference
export const createPaymentPreference = async (): Promise<PaymentPreference> => {
  try {
    // In a production environment, this would be a call to your backend API
    // The backend would create a preference using the Mercado Pago SDK
    // For demo purposes, we'll simulate a successful response
    
    const preferenceId = `pref_${Date.now()}`;
    
    return {
      id: preferenceId,
      initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`
    };
    
    /* 
    // Example of a real implementation that calls a backend API:
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: getUserId(),
        items: [{
          title: 'Pacote de Leituras de Tarot',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: READING_PACKAGE_PRICE
        }]
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment preference');
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw error;
  }
};

// Check payment status
export const checkPaymentStatus = async (preferenceId: string): Promise<PaymentStatus> => {
  try {
    // In a production environment, this would be a call to your backend API
    // The backend would check the payment status using the Mercado Pago SDK
    // For demo purposes, we'll simulate a successful payment
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful payment
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1); // 1 month validity
    
    const status: PaymentStatus = {
      isPaid: true,
      expirationDate,
      readingsAvailable: READING_PACKAGE_SIZE
    };
    
    // Save payment status to local storage
    updatePaymentStatus(status);
    
    return status;
    
    /*
    // Example of a real implementation that calls a backend API:
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
    updatePaymentStatus(status);
    return status;
    */
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};
