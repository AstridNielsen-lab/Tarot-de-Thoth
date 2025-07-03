import React from 'react';
import { TarotCard } from '../types/tarot';
import { Star, Crown, Sword, Coins, Wand, Heart, Eye } from 'lucide-react';

interface TarotCardProps {
  card: TarotCard;
  onClick: (card: TarotCard) => void;
}

const getSuitIcon = (suit: string) => {
  switch (suit) {
    case 'Bastões':
      return <Wand className="w-6 h-6" />;
    case 'Copas':
      return <Heart className="w-6 h-6" />;
    case 'Espadas':
      return <Sword className="w-6 h-6" />;
    case 'Discos':
      return <Coins className="w-6 h-6" />;
    default:
      return <Star className="w-6 h-6" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'major':
      return <Crown className="w-5 h-5" />;
    case 'court':
      return <Eye className="w-5 h-5" />;
    default:
      return <Star className="w-5 h-5" />;
  }
};

export const TarotCardComponent: React.FC<TarotCardProps> = ({ card, onClick }) => {
  return (
    <div 
      className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 border border-purple-700/50"
      onClick={() => onClick(card)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {card.category === 'major' && (
            <div className="text-yellow-400">
              <Crown className="w-5 h-5" />
            </div>
          )}
          {card.suit && (
            <div className="text-purple-300">
              {getSuitIcon(card.suit)}
            </div>
          )}
          {card.number && (
            <span className="text-yellow-400 font-bold text-lg">
              {card.number}
            </span>
          )}
        </div>
        <div className="text-purple-300">
          {getCategoryIcon(card.category)}
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">{card.name}</h3>
        <p className="text-purple-200 text-sm mb-3">{card.englishName}</p>
        {card.element && (
          <p className="text-yellow-400 text-xs mb-3 font-semibold">{card.element}</p>
        )}
        <p className="text-purple-100 text-sm leading-relaxed mb-4 line-clamp-3">
          {card.description}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {card.keywords.slice(0, 3).map((keyword, index) => (
            <span 
              key={index} 
              className="bg-purple-700/50 text-purple-200 px-2 py-1 rounded-full text-xs"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};