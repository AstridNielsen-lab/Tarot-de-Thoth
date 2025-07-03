import React, { useState, useEffect } from 'react';
import { TarotCard } from './types/tarot';
import { majorArcana } from './data/majorArcana';
import { courtCards } from './data/courtCards';
import { minorArcana } from './data/minorArcana';
import { TarotCardComponent } from './components/TarotCard';
import { CardModal } from './components/CardModal';
import { Navigation } from './components/Navigation';
import { SplashScreen } from './components/SplashScreen';
import { Eye, Star, Sparkles, ExternalLink, Phone } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'major' | 'court' | 'minor'>('major');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const getCards = () => {
    switch (activeTab) {
      case 'major':
        return majorArcana;
      case 'court':
        return courtCards;
      case 'minor':
        return minorArcana;
      default:
        return majorArcana;
    }
  };

  const handleCardClick = (card: TarotCard) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-yellow-400">
              <Eye className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-bold text-white">Tarot de Thoth</h1>
            <div className="text-yellow-400">
              <Sparkles className="w-12 h-12" />
            </div>
          </div>
          <p className="text-purple-200 text-xl max-w-3xl mx-auto leading-relaxed">
            O sistema completo do Tarot de Thoth conforme apresentado por Aleister Crowley em 
            "O Livro de Thoth". Explore os 78 arcanos do novo Aeon de Horus através da perspectiva 
            de Thelema, Qabalah e magia cerimonial.
          </p>
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="text-center">
              <div className="text-yellow-400 text-2xl font-bold">78</div>
              <div className="text-purple-300 text-sm">Cartas Totais</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 text-2xl font-bold">4</div>
              <div className="text-purple-300 text-sm">Naipes</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 text-2xl font-bold">22</div>
              <div className="text-purple-300 text-sm">Atus</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getCards().map((card) => (
            <TarotCardComponent 
              key={card.id} 
              card={card} 
              onClick={handleCardClick}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-purple-800/50">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <p className="text-purple-300 text-lg">
              "Do que se fala não se pode dizer. Do que se pode dizer não se fala."
            </p>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-purple-400 text-sm mb-6">
            Baseado no sistema de Aleister Crowley • Tarot de Thoth • 93
          </p>
          
          {/* Company Information */}
          <div className="flex flex-col items-center space-y-2 mb-4">
            <p className="text-yellow-400 font-semibold">Like Look Solutions</p>
            <div className="flex items-center space-x-2">
              <a 
                href="https://likelook.wixsite.com/solutions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-purple-300 hover:text-yellow-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                <span>likelook.wixsite.com/solutions</span>
              </a>
            </div>
            <div className="flex items-center text-purple-300">
              <Phone className="w-4 h-4 mr-1" />
              <span>WhatsApp: +55 11 97060-3441</span>
            </div>
          </div>
          <p className="text-purple-400 text-xs">
            Desenvolvido por Julio Campos Machado &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Modal */}
      <CardModal card={selectedCard} onClose={handleCloseModal} />
      </div>
    </>
  );
}

export default App;