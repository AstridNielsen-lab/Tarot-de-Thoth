import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
interface PromotionalSplashProps {
  onFinished: () => void;
  paymentLink?: string;
}

export const PromotionalSplash: React.FC<PromotionalSplashProps> = ({ 
  onFinished,
  paymentLink = "https://mpago.la/1ajTuwR" // Updated Mercado Pago payment link
}) => {
  const [opacity, setOpacity] = useState(0);
  const [showComponent, setShowComponent] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0
  });
  
  // Initialize and update countdown timer
  useEffect(() => {
    // Set initial end time (24 hours from now)
    const endTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    
    // Update timer every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = endTime - now;
      
      if (difference <= 0) {
        // Timer ended
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        // Calculate remaining time
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle fade in animation
  useEffect(() => {
    const fadeInTimeout = setTimeout(() => {
      setOpacity(1);
    }, 100);
    
    return () => clearTimeout(fadeInTimeout);
  }, []);

  // Auto-close after 10 seconds
  // Auto-close functionality is still active but without visual display
  
  useEffect(() => {
    const autoCloseTimeout = setTimeout(() => {
      handleFinish();
    }, 10000); // 10 seconds
    
    return () => {
      clearTimeout(autoCloseTimeout);
    };
  }, []);
  
  // Handle fade out and component unmounting
  const handleFinish = () => {
    setOpacity(0);
    setTimeout(() => {
      setShowComponent(false);
      onFinished();
    }, 1000); // match transition duration
  };
  
  if (!showComponent) return null;
  
  // Format the countdown display
  const formatTime = (value: number) => value.toString().padStart(2, '0');
  
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900"
      style={{ 
        opacity, 
        transition: 'opacity 1s ease-in-out'
      }}
    >
      <button 
        onClick={handleFinish}
        className="absolute top-4 right-4 text-purple-300 hover:text-yellow-400 transition-colors"
        aria-label="Pular promoção"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="container max-w-4xl mx-auto px-6 py-6 text-center relative">
          <h2 className="text-yellow-400 text-4xl md:text-5xl font-bold mb-6 animate-pulse">
            Baralho Impresso do Tarot de Thoth
          </h2>
          
          <div className="mb-8 bg-indigo-900/50 p-6 rounded-lg border border-purple-700/50 shadow-lg">
            <p className="text-purple-200 text-xl mb-4">
              Adquira agora o baralho físico com todas as 78 cartas em impressão de alta qualidade
            </p>
            
            <p className="text-purple-300 text-lg mb-4">
              Experimente a energia única das cartas físicas em suas leituras.
            </p>
            
            {/* Countdown Timer */}
            <div className="mb-6">
              <p className="text-purple-200 text-lg mb-3">Oferta especial termina em:</p>
              <div className="flex justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-indig.replaceo-800 border border-purple-500 rounded-lg w-20 h-20 flex items-center justify-center shadow-lg">
                    <span className="text-yellow-400 text-4xl font-bold">{formatTime(timeLeft.hours)}</span>
                  </div>
                  <span className="text-purple-200 text-sm mt-1">Horas</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-indigo-800 border border-purple-500 rounded-lg w-20 h-20 flex items-center justify-center">
                    <span className="text-yellow-400 text-5xl font-bold">{formatTime(timeLeft.minutes)}</span>
                  </div>
                  <span className="text-purple-200 text-sm mt-1">Minutos</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-indigo-800 border border-purple-500 rounded-lg w-20 h-20 flex items-center justify-center">
                    <span className="text-yellow-400 text-4xl font-bold">{formatTime(timeLeft.seconds)}</span>
                  </div>
                  <span className="text-purple-200 text-sm mt-1">Segundos</span>
                </div>
              </div>
            </div>
            
            <div className="text-yellow-400 text-5xl font-bold mb-6 animate-pulse">
              R$ 393,93
            </div>
            
            <a 
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-yellow-500 text-indigo-900 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors shadow-lg"
            >
              Comprar Baralho Impresso
            </a>
          </div>
        </div>
        
        {/* Delivery message at bottom */}
        <div className="mb-4">
          <p className="text-yellow-300 text-xl">
            ✨ Entregamos em todo planeta ✨
          </p>
        </div>
    </div>
  );
};
