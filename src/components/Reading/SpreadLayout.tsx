import React from 'react';
import { ReadingCard, SpreadType } from '../../types/tarot';
import { TarotCardComponent } from '../TarotCard';
import { HelpCircle } from 'lucide-react';

interface SpreadLayoutProps {
  spread: SpreadType;
  readingCards: ReadingCard[];
  isRevealed: boolean[];
  onCardClick: (card: ReadingCard) => void;
}

export const SpreadLayout: React.FC<SpreadLayoutProps> = ({ 
  spread, 
  readingCards, 
  isRevealed,
  onCardClick 
}) => {
  const getCardForPosition = (positionId: string): ReadingCard | null => {
    return readingCards.find(rc => rc.position.id === positionId) || null;
  };

  // Tree of Life connecting lines for the Kabbalah spread
  const renderTreeOfLifeConnections = () => {
    if (spread.id !== 'tree-of-life') return null;
    
    return (
      <svg className="absolute inset-0 w-full h-full z-0" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#9370db" strokeWidth="1" strokeDasharray="5,3" opacity="0.5">
          {/* Pillar of Mercy: Kether-Chokmah-Chesed-Netzach */}
          <path d="M 50% 0% L 15% 10% L 15% 30% L 15% 60%" />
          
          {/* Pillar of Severity: Kether-Binah-Geburah-Hod */}
          <path d="M 50% 0% L 85% 10% L 85% 30% L 85% 60%" />
          
          {/* Middle Pillar: Kether-Tiphareth-Yesod-Malkuth */}
          <path d="M 50% 0% L 50% 40% L 50% 80% L 50% 100%" />
          
          {/* Horizontal Connections */}
          <path d="M 15% 10% L 85% 10%" /> {/* Chokmah-Binah */}
          <path d="M 15% 30% L 85% 30%" /> {/* Chesed-Geburah */}
          <path d="M 15% 60% L 85% 60%" /> {/* Netzach-Hod */}
          
          {/* Diagonal Connections */}
          <path d="M 15% 10% L 50% 40%" /> {/* Chokmah-Tiphareth */}
          <path d="M 85% 10% L 50% 40%" /> {/* Binah-Tiphareth */}
          <path d="M 15% 30% L 50% 40%" /> {/* Chesed-Tiphareth */}
          <path d="M 85% 30% L 50% 40%" /> {/* Geburah-Tiphareth */}
          <path d="M 15% 60% L 50% 80%" /> {/* Netzach-Yesod */}
          <path d="M 85% 60% L 50% 80%" /> {/* Hod-Yesod */}
          <path d="M 50% 40% L 15% 60%" /> {/* Tiphareth-Netzach */}
          <path d="M 50% 40% L 85% 60%" /> {/* Tiphareth-Hod */}
        </g>
      </svg>
    );
  };

  // Celtic Cross connecting lines
  const renderCelticCrossConnections = () => {
    if (spread.id !== 'celtic-cross') return null;
    
    return (
      <svg className="absolute inset-0 w-full h-full z-0" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#9370db" strokeWidth="1" strokeDasharray="5,3" opacity="0.3">
          {/* Vertical line */}
          <path d="M 50% 0% L 50% 100%" />
          
          {/* Horizontal line */}
          <path d="M 0% 50% L 100% 50%" />
          
          {/* Staff connecting line */}
          <path d="M 100% 50% L 150% 0% L 150% 75%" />
        </g>
      </svg>
    );
  };

  return (
    <div className="relative min-h-[500px] w-full">
      {/* Connection lines based on spread type */}
      {spread.id === 'tree-of-life' && renderTreeOfLifeConnections()}
      {spread.id === 'celtic-cross' && renderCelticCrossConnections()}
      
      {/* Position the cards according to the layout */}
      {spread.layout.map((position, index) => {
        const readingCard = getCardForPosition(position.id);
        const revealed = isRevealed[index];
        
        return (
          <div 
            key={position.id}
            className="absolute transition-all duration-500"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) rotate(${position.rotation || 0}deg)`,
              zIndex: revealed ? (10 + index) : 5,
              opacity: revealed ? 1 : 0.7,
              scale: revealed ? '1' : '0.95'
            }}
          >
            {readingCard && revealed ? (
              <div 
                onClick={() => onCardClick(readingCard)}
                className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
              >
                <TarotCardComponent 
                  card={readingCard.card} 
                  onClick={() => {}} 
                  isReversed={readingCard.isReversed}
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-900/70 text-yellow-400 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  {position.name}
                </div>
              </div>
            ) : (
              <div className="w-40 h-60 bg-indigo-900/50 rounded-lg border border-purple-800/50 flex items-center justify-center">
                <HelpCircle className="w-12 h-12 text-purple-500/30" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
