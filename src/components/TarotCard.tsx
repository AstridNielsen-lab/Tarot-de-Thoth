import React, { useState } from 'react';
import { TarotCard } from '../types/tarot';
import { Star, Crown, Sword, Coins, Wand, Heart, Eye, AlertCircle } from 'lucide-react';

interface TarotCardProps {
  card: TarotCard;
  onClick: (card: TarotCard) => void;
  isReversed?: boolean;
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

// Maps card ID to correct image file number, accounting for covers and description pages
const getImageId = (card: TarotCard): number => {
  // Images 1 and 2 are covers, so Major Arcana starts at image 3
  // Images 25, 36, 47, 58 and 70 are description pages that should be skipped
  
  // Major Arcana: images 3-24 (skipping covers 1-2)
  if (card.category === 'major') {
    // Convert roman numerals or '0' to numbers 3-24
    if (card.number === '0') return 3; // The Fool
    if (card.number === 'I') return 4; // The Magus
    if (card.number === 'II') return 5; // The Priestess
    if (card.number === 'III') return 6; // The Empress
    if (card.number === 'IV') return 7; // The Emperor
    if (card.number === 'V') return 8; // The Hierophant
    if (card.number === 'VI') return 9; // The Lovers
    if (card.number === 'VII') return 10; // The Chariot
    if (card.number === 'VIII') return 11; // Adjustment
    if (card.number === 'IX') return 12; // The Hermit
    if (card.number === 'X') return 13; // Fortune
    if (card.number === 'XI') return 14; // Lust
    if (card.number === 'XII') return 15; // The Hanged Man
    if (card.number === 'XIII') return 16; // Death
    if (card.number === 'XIV') return 17; // Art
    if (card.number === 'XV') return 18; // The Devil
    if (card.number === 'XVI') return 19; // The Tower
    if (card.number === 'XVII') return 20; // The Star
    if (card.number === 'XVIII') return 21; // The Moon
    if (card.number === 'XIX') return 22; // The Sun
    if (card.number === 'XX') return 23; // The Aeon
    if (card.number === 'XXI') return 24; // The Universe
  }
  
  // Minor Arcana with adjustments for description pages
  if (card.category === 'minor') {
    // Base image index for minor arcana (after major arcana ends)
    const baseIndex = 24;
    
    // Description pages to skip: 25, 36, 47, 58
    const getAdjustedIndex = (baseIdx: number, rankValue: number) => {
      let adjustedIdx = baseIdx + rankValue;
      
      // Skip description pages
      if (adjustedIdx >= 25) adjustedIdx++; // Skip image 25 (Wands description)
      if (adjustedIdx >= 36) adjustedIdx++; // Skip image 36 (Cups description)
      if (adjustedIdx >= 47) adjustedIdx++; // Skip image 47 (Swords description)
      if (adjustedIdx >= 58) adjustedIdx++; // Skip image 58 (Disks description)
      
      return adjustedIdx;
    };
    
    // Add rank value (Ace = 1, numbers are as is)
    let rankValue = 0;
    if (card.number === 'Ás') {
      rankValue = 1;
    } else {
      // Convert string numbers to integers
      rankValue = parseInt(card.number || '0', 10);
    }
    
    // Handle each suit with their base indices
    if (card.suit === 'Bastões') { // Wands: 26-35 (after skipping description at 25)
      return getAdjustedIndex(baseIndex, rankValue);
    } else if (card.suit === 'Copas') { // Cups: 37-46 (after skipping description at 36)
      return getAdjustedIndex(baseIndex + 10, rankValue);
    } else if (card.suit === 'Espadas') { // Swords: 48-57 (after skipping description at 47)
      return getAdjustedIndex(baseIndex + 20, rankValue);
    } else if (card.suit === 'Discos') { // Disks: 59-68 (after skipping description at 58)
      return getAdjustedIndex(baseIndex + 30, rankValue);
    }
  }
  
  // Court Cards: images 71-86 (after skipping description at 70)
  if (card.category === 'court') {
    // Skip image 70 which is a description page
    const baseIndex = 70;
    
    const suitOffset = {
      'Bastões': 0,  // Wands: 0 offset
      'Copas': 4,    // Cups: +4 offset
      'Espadas': 8,  // Swords: +8 offset
      'Discos': 12   // Disks: +12 offset
    };
    
    const courtRankOffset = {
      'knight': 0,   // Knight: 0 offset
      'queen': 1,    // Queen: +1 offset
      'prince': 2,   // Prince: +2 offset
      'princess': 3  // Princess: +3 offset
    };
    
    // Extract court rank from id (e.g., 'knight-wands' -> 'knight')
    const courtRank = card.id.split('-')[0];
    
    // Get offsets
    const sOffset = card.suit ? suitOffset[card.suit] : 0;
    const rOffset = courtRankOffset[courtRank] || 0;
    
    // Image number is 70 (base for courts after skipping description) + suit offset + rank offset + 1
    return baseIndex + sOffset + rOffset + 1;
  }
  
  // Fallback: Return 3 (first actual card) if we can't determine the image ID
  return 3;
};

export const TarotCardComponent: React.FC<TarotCardProps> = ({ card, onClick, isReversed = false }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const imageId = getImageId(card);
  const imagePath = `/cards/${imageId}.png`;
  
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 border border-purple-700/50"
      onClick={() => onClick(card)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ aspectRatio: '3/5', width: '100%', maxWidth: '280px' }}
    >
      {/* Card Image */}
      <div 
        className={`w-full h-full transition-transform duration-700 ${isReversed ? 'rotate-180' : ''}`}
      >
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-purple-900/80">
            <AlertCircle className="w-12 h-12 text-yellow-400 mb-2" />
            <h3 className="text-lg font-bold text-white text-center">{card.name}</h3>
            <p className="text-purple-200 text-sm text-center">{card.englishName}</p>
          </div>
        ) : (
          <img 
            src={imagePath} 
            alt={card.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Hover Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-purple-900/80 to-indigo-900/90 p-4 flex flex-col transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
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
        
        <div className="text-center flex-grow flex flex-col justify-between">
          <div className="mx-auto max-w-full px-2">
            <h3 className="text-xl font-bold text-white mb-1 text-center">{card.name}</h3>
            <p className="text-purple-200 text-sm mb-2 text-center">{card.englishName}</p>
            {card.element && (
              <p className="text-yellow-400 text-xs mb-2 font-semibold text-center">{card.element}</p>
            )}
          </div>
          
          <div className="mx-auto max-w-full px-2">
            <p className="text-purple-100 text-xs leading-relaxed mb-3 line-clamp-3 text-center">
              {card.description}
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {card.keywords.slice(0, 3).map((keyword, index) => (
                <span 
                  key={index} 
                  className="bg-purple-700/70 text-purple-200 px-2 py-0.5 rounded-full text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};