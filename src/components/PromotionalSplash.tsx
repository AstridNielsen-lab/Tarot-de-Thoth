import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PromotionalSplashProps {
  onFinished: () => void;
  paymentLink?: string;
}

export const PromotionalSplash: React.FC<PromotionalSplashProps> = ({ 
  onFinished,
  paymentLink = "https://mpago.la/393thoth"
}) => {
  const [opacity, setOpacity] = useState(0);
  const [showComponent, setShowComponent] = useState(true);
  const [randomCards, setRandomCards] = useState<number[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Generate cards for animation - Major Arcana (3-24) and the deck back
  useEffect(() => {
    // Major Arcana cards (3-24) and the back of the deck (0)
    const majorArcana = Array.from({ length: 22 }, (_, i) => i + 3);
    const deckBack = 0;
    
    // Select 6 random cards from Major Arcana
    const selectedCards = [];
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * majorArcana.length);
      selectedCards.push(majorArcana[randomIndex]);
    }
    
    // Add the deck back as the first card
    setRandomCards([deckBack, ...selectedCards]);
  }, []);
  
  // Handle card animation cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % randomCards.length);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [randomCards]);
  
  // Handle fade in animation
  useEffect(() => {
    const fadeInTimeout = setTimeout(() => {
      setOpacity(1);
    }, 100);
    
    return () => clearTimeout(fadeInTimeout);
  }, []);
  
  // Handle automatic timeout after 8 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFinish();
    }, 8000);
    
    return () => clearTimeout(timeoutId);
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
  
  const currentCard = randomCards[currentCardIndex] || 0;
  
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
        <div className="relative z-10">
          <h2 className="text-yellow-400 text-4xl md:text-5xl font-bold mb-6 animate-pulse">
            Baralho Impresso do Tarot de Thoth
          </h2>
          
          <div className="mb-8 bg-indigo-900/50 p-6 rounded-lg border border-purple-700/50 shadow-lg">
            <p className="text-purple-200 text-xl mb-4">
              Adquira agora o baralho físico com todas as 78 cartas em impressão de alta qualidade
            </p>
            
            <div className="text-yellow-400 text-5xl font-bold mb-6 animate-pulse">
              R$ 393,93
            </div>
            
            <a 
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-yellow-500 text-indigo-900 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors shadow-lg"
            >
              Comprar Baralho
            </a>
          </div>
          
          <p className="text-purple-300 text-lg">
            Experimente a energia única das cartas físicas em suas leituras
          </p>
        </div>
        
        {/* Card animation below the promotional content */}
        <div className="mt-8 flex justify-center">
          <div className="relative w-[240px] h-[384px]">
            <style>
              {`
                @keyframes float {
                  0%, 100% {
                    transform: translateY(0) rotate(${Math.random() * 4 - 2}deg);
                  }
                  50% {
                    transform: translateY(-15px) rotate(${Math.random() * 4 - 2}deg);
                  }
                }
              `}
            </style>
            <img 
              src={`/cards/${currentCard}.jpg`} 
              alt="Carta de Tarot" 
              className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-[0_0_25px_rgba(255,223,0,0.8)]"
              style={{ 
                transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                animation: 'float 3s ease-in-out infinite'
              }}
          </div>
        </div>
      </div>
    </div>
  );
};
