import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PromotionalSplashProps {
  onFinished: () => void;
  paymentLink?: string;
}

export const PromotionalSplash: React.FC<PromotionalSplashProps> = ({ 
  onFinished,
  paymentLink = "https://mpago.la/1ajTuwR"
}) => {
  const [opacity, setOpacity] = useState(0);
  const [showComponent, setShowComponent] = useState(true);
  const [randomCards, setRandomCards] = useState<number[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Generate 5 random card numbers (0-77) for the animation
  useEffect(() => {
    const cardNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 78));
    setRandomCards(cardNumbers);
  }, []);
  
  // Handle card animation cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % randomCards.length);
    }, 1200);
    
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900"
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
      
      <div className="container max-w-4xl mx-auto px-6 py-8 text-center relative">
        {/* Animated card background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <img 
            src={`/cards/${currentCard}.jpg`} 
            alt="Carta de Tarot" 
            className="h-full object-contain animate-pulse"
            style={{ 
              animation: 'pulse 2s infinite' 
            }}
          />
        </div>
        
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
      </div>
    </div>
  );
};
