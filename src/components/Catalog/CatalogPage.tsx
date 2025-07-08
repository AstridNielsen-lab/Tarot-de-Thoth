import React, { useState, useEffect } from 'react';
import { TarotCard } from '../../types/tarot';
import { majorArcana } from '../../data/majorArcana';
import { courtCards } from '../../data/courtCards';
import { minorArcana } from '../../data/minorArcana';
import { TarotCardComponent } from '../TarotCard';
import { CardModal } from '../CardModal';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

type CardFilterType = 'all' | 'major' | 'minor' | 'court';

export const CatalogPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CardFilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  
  // Collapse state for each section (true = collapsed)
  const [isMajorCollapsed, setIsMajorCollapsed] = useState<boolean>(true);
  const [isMinorCollapsed, setIsMinorCollapsed] = useState<boolean>(true);
  const [isCourtCollapsed, setIsCourtCollapsed] = useState<boolean>(true);
  
  
  // Sort cards according to traditional Thoth Tarot order
  const sortedMajorArcana = [...majorArcana].sort((a, b) => {
    // Sort by number (assuming the number is part of the id or available)
    const aNum = parseInt(a.id.replace(/\D/g, ''));
    const bNum = parseInt(b.id.replace(/\D/g, ''));
    return aNum - bNum;
  });

  // Define suit order - using actual case as in data files
  const suitOrder = ["Bastões", "Copas", "Espadas", "Discos"];
  
  // Sort minor arcana by suit and rank
  const sortedMinorArcana = [...minorArcana].sort((a, b) => {
    // First, sort by suit - use actual case
    const aSuitIndex = suitOrder.indexOf(a.suit || "");
    const bSuitIndex = suitOrder.indexOf(b.suit || "");
    if (aSuitIndex !== bSuitIndex) return aSuitIndex - bSuitIndex;
    
    // Then, sort by rank
    const aRank = a.rank || 0;
    const bRank = b.rank || 0;
    return aRank - bRank;
  });

  // Define standard court card rank order
  const courtRankOrder = ["king", "queen", "prince", "princess"];
  
  // Define specific rank order for Cups
  const cupsRankOrder = ["knight", "queen", "prince", "princess"];
  
  // Sort court cards by suit and rank
  const sortedCourtCards = [...courtCards].sort((a, b) => {
    // First, sort by suit - use actual case
    const aSuitIndex = suitOrder.indexOf(a.suit || "");
    const bSuitIndex = suitOrder.indexOf(b.suit || "");
    if (aSuitIndex !== bSuitIndex) return aSuitIndex - bSuitIndex;
    
    // Then, sort by court rank - extract rank from id (e.g., 'king-wands' -> 'king')
    const aRank = a.id.split('-')[0] || '';
    const bRank = b.id.split('-')[0] || '';
    
    // Use different rank orders based on suit
    if (a.suit === 'Copas' && b.suit === 'Copas') {
      // Both cards are Cups, use Cups-specific rank order
      const aRankIndex = cupsRankOrder.indexOf(aRank);
      const bRankIndex = cupsRankOrder.indexOf(bRank);
      if (aRankIndex === -1) console.warn(`Unrecognized Cups rank: ${aRank} for card ${a.id}`);
      if (bRankIndex === -1) console.warn(`Unrecognized Cups rank: ${bRank} for card ${b.id}`);
      return aRankIndex - bRankIndex;
    } else {
      // Use standard rank order for other suits
      const aRankIndex = courtRankOrder.indexOf(aRank);
      const bRankIndex = courtRankOrder.indexOf(bRank);
      if (aRankIndex === -1) console.warn(`Unrecognized rank: ${aRank} for card ${a.id}`);
      if (bRankIndex === -1) console.warn(`Unrecognized rank: ${bRank} for card ${b.id}`);
      return aRankIndex - bRankIndex;
    }
  });
  
  // Combine all cards
  const allCards: TarotCard[] = [...sortedMajorArcana, ...sortedMinorArcana, ...sortedCourtCards];
  
  // Debug logging for court cards
  console.log('Court cards:', courtCards.filter(card => card.category === 'court'));
  const wandsCourtCards = courtCards.filter(card => card.category === 'court' && card.suit === 'Bastões');
  console.log('Wands court cards:', wandsCourtCards);
  
  // Log each Wands court card in detail
  wandsCourtCards.forEach(card => {
    const rank = card.id.split('-')[0];
    console.log(`Wands court card: ${card.name}, ID: ${card.id}, Rank: ${rank}, Expected order position: ${courtRankOrder.indexOf(rank)}`);
  });
  
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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-purple-300">
            Exibindo {filteredCards.length} de {allCards.length} cartas
            {activeFilter !== 'all' && ` (Filtro: ${
              activeFilter === 'major' ? 'Arcanos Maiores' : 
              activeFilter === 'minor' ? 'Arcanos Menores' : 'Cartas de Corte'
            })`}
            {searchTerm && ` (Busca: "${searchTerm}")`}
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsMajorCollapsed(false);
                setIsMinorCollapsed(false);
                setIsCourtCollapsed(false);
              }}
              className="text-xs py-1 px-2 rounded bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 transition-colors"
            >
              Expandir Tudo
            </button>
            <button
              onClick={() => {
                setIsMajorCollapsed(true);
                setIsMinorCollapsed(true);
                setIsCourtCollapsed(true);
              }}
              className="text-xs py-1 px-2 rounded bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 transition-colors"
            >
              Recolher Tudo
            </button>
          </div>
        </div>
      </div>
      
      {/* Cards Sections */}
      <div className="space-y-10">
        {/* Major Arcana Section */}
        {filteredCards.some(card => card.category === 'major') && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-500">Arcanos Maiores</h2>
              <button 
                onClick={() => setIsMajorCollapsed(!isMajorCollapsed)}
                className="p-1.5 rounded-full bg-purple-900/50 text-yellow-400 hover:bg-purple-800/50 transition-colors"
                aria-label={isMajorCollapsed ? "Expandir Arcanos Maiores" : "Recolher Arcanos Maiores"}
              >
                {isMajorCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
            <div 
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid overflow-hidden transition-all duration-500 ease-in-out ${
                isMajorCollapsed ? 'max-h-0 opacity-0 mt-0 mb-0' : 'max-h-[5000px] opacity-100 mt-4 mb-6'
              }`}
            >
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-500">Arcanos Menores</h2>
              <button 
                onClick={() => setIsMinorCollapsed(!isMinorCollapsed)}
                className="p-1.5 rounded-full bg-purple-900/50 text-yellow-400 hover:bg-purple-800/50 transition-colors"
                aria-label={isMinorCollapsed ? "Expandir Arcanos Menores" : "Recolher Arcanos Menores"}
              >
                {isMinorCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isMinorCollapsed ? 'max-h-0 opacity-0 mt-0 mb-0' : 'max-h-[5000px] opacity-100 mt-4 mb-6'
            }`}>
            
            {/* Bastões Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit === 'Bastões') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Bastões</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit === 'Bastões')
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
            {filteredCards.some(card => card.category === 'minor' && card.suit === 'Copas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Copas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit === 'Copas')
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
            {filteredCards.some(card => card.category === 'minor' && card.suit === 'Espadas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Espadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit === 'Espadas')
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
            {filteredCards.some(card => card.category === 'minor' && card.suit === 'Discos') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Discos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit === 'Discos')
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
          </div>
        )}
        
        {/* Court Cards Section */}
        {filteredCards.some(card => card.category === 'court') && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-500">Cartas de Corte</h2>
              <button 
                onClick={() => setIsCourtCollapsed(!isCourtCollapsed)}
                className="p-1.5 rounded-full bg-purple-900/50 text-yellow-400 hover:bg-purple-800/50 transition-colors"
                aria-label={isCourtCollapsed ? "Expandir Cartas de Corte" : "Recolher Cartas de Corte"}
              >
                {isCourtCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isCourtCollapsed ? 'max-h-0 opacity-0 mt-0 mb-0' : 'max-h-[5000px] opacity-100 mt-4 mb-6'
            }`}>
            
            {/* Bastões Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit === 'Bastões') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Bastões</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {(() => {
                    // Get Wands court cards
                    const wandsCourtCards = filteredCards.filter(card => 
                      card.category === 'court' && card.suit === 'Bastões'
                    );
                    
                    console.log('Rendering Wands court cards section, found:', wandsCourtCards.length, 'cards');
                    
                    // Log details before sorting
                    wandsCourtCards.forEach(card => {
                      const rank = card.id.split('-')[0];
                      console.log(`Pre-sort: ${card.name}, ID: ${card.id}, Rank: ${rank}`);
                    });
                    
                    // Correctly use the same rank order as defined above
                    const sortedWandsCards = [...wandsCourtCards].sort((a, b) => {
                      const aRank = a.id.split('-')[0];
                      const bRank = b.id.split('-')[0];
                      const aIndex = courtRankOrder.indexOf(aRank);
                      const bIndex = courtRankOrder.indexOf(bRank);
                      
                      // Log any cards with unrecognized ranks
                      if (aIndex === -1) console.error(`Unrecognized rank for card: ${a.name}, ID: ${a.id}, extracted rank: ${aRank}`);
                      if (bIndex === -1) console.error(`Unrecognized rank for card: ${b.name}, ID: ${b.id}, extracted rank: ${bRank}`);
                      
                      return aIndex - bIndex;
                    });
                    
                    // Log details after sorting
                    console.log('Sorted Wands court cards:');
                    sortedWandsCards.forEach((card, index) => {
                      const rank = card.id.split('-')[0];
                      console.log(`Post-sort [${index}]: ${card.name}, ID: ${card.id}, Rank: ${rank}`);
                    });
                    
                    // Render the 4 court cards
                    const renderedCards = sortedWandsCards.map((card) => {
                      console.log(`Rendering Wands court card: ${card.name}, ID: ${card.id}`);
                      return (
                        <TarotCardComponent 
                          key={card.id} 
                          card={card} 
                          onClick={handleCardClick}
                        />
                      );
                    });
                    
                    return renderedCards;
                  })()}
                </div>
              </div>
            )}
            
            {/* Copas Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit === 'Copas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Copas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {(() => {
                    // Get Cups court cards
                    const cupsCourtCards = filteredCards.filter(card => 
                      card.category === 'court' && card.suit === 'Copas'
                    );
                    
                    console.log('Rendering Cups court cards section, found:', cupsCourtCards.length, 'cards');
                    
                    // Log details before sorting
                    cupsCourtCards.forEach(card => {
                      const rank = card.id.split('-')[0];
                      console.log(`Cups pre-sort: ${card.name}, ID: ${card.id}, Rank: ${rank}`);
                    });
                    
                    // Sort using Cups-specific rank order
                    const sortedCupsCards = [...cupsCourtCards].sort((a, b) => {
                      const aRank = a.id.split('-')[0];
                      const bRank = b.id.split('-')[0];
                      const aIndex = cupsRankOrder.indexOf(aRank);
                      const bIndex = cupsRankOrder.indexOf(bRank);
                      
                      // Log any cards with unrecognized ranks
                      if (aIndex === -1) console.error(`Unrecognized rank for Cups card: ${a.name}, ID: ${a.id}, extracted rank: ${aRank}`);
                      if (bIndex === -1) console.error(`Unrecognized rank for Cups card: ${b.name}, ID: ${b.id}, extracted rank: ${bRank}`);
                      
                      return aIndex - bIndex;
                    });
                    
                    // Log details after sorting
                    console.log('Sorted Cups court cards:');
                    sortedCupsCards.forEach((card, index) => {
                      const rank = card.id.split('-')[0];
                      console.log(`Cups post-sort [${index}]: ${card.name}, ID: ${card.id}, Rank: ${rank}`);
                    });
                    
                    // Render the 4 court cards
                    const renderedCards = sortedCupsCards.map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ));
                    
                    return renderedCards;
                  })()}
                </div>
              </div>
            )}
            
            {/* Espadas Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit === 'Espadas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Espadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {(() => {
                    // Get Swords court cards
                    const swordsCourtCards = filteredCards.filter(card => 
                      card.category === 'court' && card.suit === 'Espadas'
                    );
                    
                    // Sort using standard rank order
                    const sortedSwordsCards = [...swordsCourtCards].sort((a, b) => {
                      const aRank = a.id.split('-')[0];
                      const bRank = b.id.split('-')[0];
                      const aIndex = courtRankOrder.indexOf(aRank);
                      const bIndex = courtRankOrder.indexOf(bRank);
                      return aIndex - bIndex;
                    });
                    
                    // Render the 4 court cards
                    const renderedCards = sortedSwordsCards.map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ));
                    
                    return renderedCards;
                  })()}
                </div>
              </div>
            )}
            
            {/* Discos Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit === 'Discos') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Discos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {(() => {
                    // Get Disks court cards
                    const disksCourtCards = filteredCards.filter(card => 
                      card.category === 'court' && card.suit === 'Discos'
                    );
                    
                    // Sort using standard rank order
                    const sortedDisksCards = [...disksCourtCards].sort((a, b) => {
                      const aRank = a.id.split('-')[0];
                      const bRank = b.id.split('-')[0];
                      const aIndex = courtRankOrder.indexOf(aRank);
                      const bIndex = courtRankOrder.indexOf(bRank);
                      return aIndex - bIndex;
                    });
                    
                    // Render the 4 court cards
                    const renderedCards = sortedDisksCards.map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ));
                    
                    return renderedCards;
                  })()}
                </div>
              </div>
            )}
            </div>
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
