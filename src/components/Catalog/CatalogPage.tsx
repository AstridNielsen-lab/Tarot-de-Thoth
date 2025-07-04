import React, { useState, useEffect } from 'react';
import { TarotCard } from '../../types/tarot';
import { majorArcana } from '../../data/majorArcana';
import { courtCards } from '../../data/courtCards';
import { minorArcana } from '../../data/minorArcana';
import { TarotCardComponent } from '../TarotCard';
import { CardModal } from '../CardModal';
import { Search } from 'lucide-react';

type CardFilterType = 'all' | 'major' | 'minor' | 'court';

export const CatalogPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CardFilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  
  // Sort cards according to traditional Thoth Tarot order
  const sortedMajorArcana = [...majorArcana].sort((a, b) => {
    // Sort by number (assuming the number is part of the id or available)
    const aNum = parseInt(a.id.replace(/\D/g, ''));
    const bNum = parseInt(b.id.replace(/\D/g, ''));
    return aNum - bNum;
  });

  // Define suit order
  const suitOrder = ["bastoes", "copas", "espadas", "discos"];
  
  // Sort minor arcana by suit and rank
  const sortedMinorArcana = [...minorArcana].sort((a, b) => {
    // First, sort by suit
    const aSuitIndex = suitOrder.indexOf(a.suit?.toLowerCase() || "");
    const bSuitIndex = suitOrder.indexOf(b.suit?.toLowerCase() || "");
    if (aSuitIndex !== bSuitIndex) return aSuitIndex - bSuitIndex;
    
    // Then, sort by rank
    const aRank = a.rank || 0;
    const bRank = b.rank || 0;
    return aRank - bRank;
  });

  // Define court card rank order
  const courtRankOrder = ["cavaleiro", "rainha", "principe", "princesa"];
  
  // Sort court cards by suit and rank
  const sortedCourtCards = [...courtCards].sort((a, b) => {
    // First, sort by suit
    const aSuitIndex = suitOrder.indexOf(a.suit?.toLowerCase() || "");
    const bSuitIndex = suitOrder.indexOf(b.suit?.toLowerCase() || "");
    if (aSuitIndex !== bSuitIndex) return aSuitIndex - bSuitIndex;
    
    // Then, sort by court rank
    const aRankIndex = courtRankOrder.indexOf(a.court?.toLowerCase() || "");
    const bRankIndex = courtRankOrder.indexOf(b.court?.toLowerCase() || "");
    return aRankIndex - bRankIndex;
  });
  
  // Combine all cards
  const allCards: TarotCard[] = [...sortedMajorArcana, ...sortedMinorArcana, ...sortedCourtCards];
  
  const filteredCards = allCards.filter(card => {
    // Filter by category
    const categoryMatch = 
      activeFilter === 'all' || 
      (activeFilter === 'major' && card.category === 'major') ||
      (activeFilter === 'minor' && card.category === 'minor') ||
      (activeFilter === 'court' && card.category === 'court');
    
    // Filter by search term (case insensitive)
    const searchMatch = 
      searchTerm === '' || 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.englishName && card.englishName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  const handleCardClick = (card: TarotCard) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex space-x-2 md:space-x-4">
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'all' 
                ? 'bg-yellow-500 text-gray-900 font-medium' 
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'major' 
                ? 'bg-yellow-500 text-gray-900 font-medium' 
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            }`}
            onClick={() => setActiveFilter('major')}
          >
            Maiores
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'minor' 
                ? 'bg-yellow-500 text-gray-900 font-medium' 
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            }`}
            onClick={() => setActiveFilter('minor')}
          >
            Menores
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'court' 
                ? 'bg-yellow-500 text-gray-900 font-medium' 
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            }`}
            onClick={() => setActiveFilter('court')}
          >
            Corte
          </button>
        </div>
        
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-purple-400" />
          </div>
          <input
            type="text"
            className="w-full md:w-80 pl-10 pr-4 py-2 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Buscar por nome da carta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="mb-6 text-purple-300">
        <p>
          Exibindo {filteredCards.length} de {allCards.length} cartas
          {activeFilter !== 'all' && ` (Filtro: ${
            activeFilter === 'major' ? 'Arcanos Maiores' : 
            activeFilter === 'minor' ? 'Arcanos Menores' : 'Cartas de Corte'
          })`}
          {searchTerm && ` (Busca: "${searchTerm}")`}
        </p>
      </div>
      
      {/* Cards Sections */}
      <div className="space-y-10">
        {/* Major Arcana Section */}
        {filteredCards.some(card => card.category === 'major') && (
          <div>
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">Arcanos Maiores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCards
                .filter(card => card.category === 'major')
                .map((card) => (
                  <TarotCardComponent 
                    key={card.id} 
                    card={card} 
                    onClick={handleCardClick}
                  />
                ))}
            </div>
          </div>
        )}
        
        {/* Minor Arcana Sections - Grouped by Suit */}
        {filteredCards.some(card => card.category === 'minor') && (
          <div>
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">Arcanos Menores</h2>
            
            {/* Bastões Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit?.toLowerCase() === 'bastoes') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Bastões</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit?.toLowerCase() === 'bastoes')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Copas Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit?.toLowerCase() === 'copas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Copas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit?.toLowerCase() === 'copas')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Espadas Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit?.toLowerCase() === 'espadas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Espadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit?.toLowerCase() === 'espadas')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Discos Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit?.toLowerCase() === 'discos') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Discos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit?.toLowerCase() === 'discos')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Court Cards Section */}
        {filteredCards.some(card => card.category === 'court') && (
          <div>
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">Cartas de Corte</h2>
            
            {/* Bastões Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit?.toLowerCase() === 'bastoes') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Bastões</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards
                    .filter(card => card.category === 'court' && card.suit?.toLowerCase() === 'bastoes')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Copas Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit?.toLowerCase() === 'copas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Copas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards
                    .filter(card => card.category === 'court' && card.suit?.toLowerCase() === 'copas')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Espadas Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit?.toLowerCase() === 'espadas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Espadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards
                    .filter(card => card.category === 'court' && card.suit?.toLowerCase() === 'espadas')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Discos Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit?.toLowerCase() === 'discos') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Discos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards
                    .filter(card => card.category === 'court' && card.suit?.toLowerCase() === 'discos')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* No Results Message */}
      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          <p className="text-xl mb-2">Nenhuma carta encontrada</p>
          <p>Tente ajustar seus critérios de busca</p>
        </div>
      )}
      
      {/* Modal */}
      <CardModal card={selectedCard} onClose={handleCloseModal} />
    </div>
  );
};
