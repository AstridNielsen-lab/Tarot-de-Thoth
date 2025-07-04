import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpreadLayout } from './SpreadLayout';
import { CardInterpretation } from './CardInterpretation';
import { spreads as allSpreads, getSpreadById } from '../../data/spreads';
import { Reading, SpreadType, ReadingCard, TarotCard } from '../../types/tarot';
import { majorArcana } from '../../data/majorArcana';
import { minorArcana } from '../../data/minorArcana';
import { courtCards } from '../../data/courtCards';
import { generateInterpretation } from '../../data/spreads';
import { shuffle } from 'lodash';
import { BookOpen, Save, Eye, HelpCircle, Shuffle, ImageIcon } from 'lucide-react';
import { TarotCardComponent } from '../TarotCard';
import { useSound } from '../../hooks/useSound';
import { CrowleyInterpreter } from './CrowleyInterpreter';

// Guidance text for each spread type
const spreadGuidance = {
  'three-card': "O método de três cartas é uma forma simples mas poderosa de obter clareza. Na visão de Crowley, representa o fluxo da energia através do tempo: passado (causa), presente (manifestação) e futuro (tendência). Concentre-se na questão enquanto as cartas são embaralhadas.",
  'celtic-cross': "A Cruz Celta, na interpretação thelêmica, representa a interação das forças em múltiplos planos. O centro é o cruzamento dos pilares da Árvore da Vida, enquanto as seis cartas ao redor mostram as influências planetárias. Visualize a questão no centro de sua consciência.",
  'tree-of-life': "A Árvore da Vida é o mapa completo do universo segundo a Qabalah. Crowley ensinou que cada Sephirah representa um aspecto da questão, desde sua origem divina (Kether) até sua manifestação material (Malkuth). Esta leitura requer profunda contemplação das correspondências."
};

// Reading states
type ReadingState = 'initial' | 'shuffling' | 'drawing' | 'revealing' | 'complete';

export const ReadingPage: React.FC = () => {
  const [spreadType, setSpreadType] = useState<SpreadType>(getSpreadById('three-card'));
  const [reading, setReading] = useState<Reading | null>(null);
  const [selectedCard, setSelectedCard] = useState<ReadingCard | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean[]>([]);
  const [readingState, setReadingState] = useState<ReadingState>('initial');
  const [question, setQuestion] = useState<string>('');
  const [savedReadings, setSavedReadings] = useState<Reading[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  
  // Refs for animations
  const deckRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();
  
  const allCards: TarotCard[] = [...majorArcana, ...courtCards, ...minorArcana];

  // Function to collect user info before starting reading
  const initiateReading = () => {
    if (!question.trim()) {
      alert("Por favor, insira uma questão antes de começar a leitura.");
      return;
    }

    // Show user info modal
    setShowUserInfoModal(true);
  };

  // Function to start the reading process after collecting user info
  const startReading = () => {
    // Close modal
    setShowUserInfoModal(false);
    
    // Begin shuffling animation
    setReadingState('shuffling');
    playSound('shuffle');
    
    // Simulate shuffling with a timeout
    setTimeout(() => {
      const shuffledDeck = shuffle(allCards);
      const newReadingCards = spreadType.positions.map((position, index) => {
        const card = shuffledDeck[index];
        const isReversed = Math.random() < 0.25;
        return {
          card,
          position,
          isReversed,
          interpretation: generateInterpretation(card.id, position.id)
        };
      }) as ReadingCard[];

      const newReading = {
        id: `reading-${Date.now()}`,
        date: new Date(),
        spreadType: spreadType.id,
        question: question,
        cards: newReadingCards,
        userName: userName,
        birthDate: birthDate
      };

      setReading(newReading);
      setIsRevealed(new Array(newReadingCards.length).fill(false));
      setCurrentCardIndex(0);
      setReadingState('drawing');
      
      // Start revealing cards after a delay
      setTimeout(() => {
        setReadingState('revealing');
      }, 2500); // Changed from 1500 to 2500 for a more dramatic pause before revealing
    }, 2000);
  };

  // Reveal cards progressively
  useEffect(() => {
    if (readingState === 'revealing' && reading && currentCardIndex < reading.cards.length) {
      const timer = setTimeout(() => {
        revealCard(currentCardIndex);
        setCurrentCardIndex(prev => prev + 1);
        
        // If all cards are revealed, set state to complete
        if (currentCardIndex === reading.cards.length - 1) {
          setReadingState('complete');
        }
      }, 2000); // Changed from 800 to 2000 for slower, more dramatic reveal
      
      return () => clearTimeout(timer);
    }
  }, [readingState, currentCardIndex, reading]);

  // Reveal a specific card
  const revealCard = (index: number) => {
    if (!reading) return;
    
    playSound('reveal');
    const newIsRevealed = [...isRevealed];
    newIsRevealed[index] = true;
    setIsRevealed(newIsRevealed);
  };
  
  // Save the current reading
  const saveReading = () => {
    if (!reading) return;
    
    const updatedSavedReadings = [...savedReadings, reading];
    setSavedReadings(updatedSavedReadings);
    
    // Save to localStorage
    try {
      localStorage.setItem('savedTarotReadings', JSON.stringify(updatedSavedReadings));
      alert('Leitura salva com sucesso!');
    } catch (error) {
      console.error('Error saving reading:', error);
      alert('Erro ao salvar a leitura.');
    }
  };
  
  // Load saved readings on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('savedTarotReadings');
      if (savedData) {
        setSavedReadings(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading saved readings:', error);
    }
  }, []);
  
  // Reset reading
  const resetReading = () => {
    setReading(null);
    setSelectedCard(null);
    setIsRevealed([]);
    setReadingState('initial');
    setCurrentCardIndex(0);
    // Keep user info for next reading
  };

  // Render user info modal
  const renderUserInfoModal = () => {
    if (!showUserInfoModal) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-indigo-950/90 p-4">
        <div className="bg-indigo-900 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
            Informações para Leitura
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-purple-300 mb-2">Seu Nome:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-300"
              />
            </div>
            
            <div>
              <label className="block text-purple-300 mb-2">Data de Nascimento:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-300"
              />
            </div>
            
            <p className="text-purple-400 text-xs mt-2">
              "Estas informações serão usadas para personalizar sua leitura de Tarot."
            </p>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button 
              className="flex-1 px-4 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition"
              onClick={() => setShowUserInfoModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="flex-1 px-4 py-2 bg-purple-800 text-white rounded-md hover:bg-purple-700 transition"
              onClick={startReading}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render shuffle animation
  const renderShuffleAnimation = () => {
    if (readingState !== 'shuffling') return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-indigo-950/80">
        <div className="text-center">
          <div className="relative w-32 h-48 mx-auto mb-4">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-24 h-36 bg-indigo-800 border-2 border-yellow-500 rounded-lg shadow-lg animate-shuffle"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${Math.random() * 10 - 5}deg) translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`
                }}
              />
            ))}
            <Shuffle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 w-12 h-12 animate-pulse" />
          </div>
          <p className="text-yellow-400 text-xl font-medium">Embaralhando...</p>
          <p className="text-purple-300 mt-2">Concentre-se em sua questão</p>
        </div>
      </div>
    );
  };

  // Render instructions modal
  const renderInstructions = () => {
    if (!showInstructions) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-indigo-950/90 p-4">
        <div className="bg-indigo-900 p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Instruções de Leitura Segundo Crowley
          </h2>
          
          <div className="space-y-4 text-purple-200">
            <p>
              Aleister Crowley desenvolveu o Tarot de Thoth como um sistema completo de iniciação mágica. 
              Ao realizar uma leitura, siga estas orientações para obter resultados mais profundos:
            </p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>Concentre-se em sua Vontade Verdadeira (Thelema) ao formular a pergunta.</li>
              <li>Visualize a questão como uma força que se manifesta através do Aeon de Horus.</li>
              <li>Pense nas cartas como reflexos da sua consciência, não como forças externas.</li>
              <li>Estude as correspondências astrológicas, cabalísticas e elementais de cada carta.</li>
              <li>Observe os padrões e relacionamentos entre as cartas, não apenas seus significados isolados.</li>
            </ol>
            
            <div className="pt-4 border-t border-purple-800">
              <h3 className="text-xl text-yellow-400 mb-2">Preparação Ritual</h3>
              <p>
                "O ato de embaralhar as cartas deve ser executado com plena consciência mágica. 
                Os resultados não são 'sorte', mas a manifestação das forças sutis que atravessam o véu da matéria."
                <span className="block mt-1 text-right">— Aleister Crowley, O Livro de Thoth</span>
              </p>
            </div>
          </div>
          
          <button 
            className="mt-6 px-4 py-2 bg-purple-800 text-white rounded-md hover:bg-purple-700 transition w-full"
            onClick={() => setShowInstructions(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderShuffleAnimation()}
      {renderInstructions()}
      {renderUserInfoModal()}
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Realizar Leitura de Tarot</h1>
        <p className="text-purple-300 text-sm mt-2">
          Selecione um método de leitura e faça sua pergunta. Clique em "Começar Leitura"
          para visualizar as cartas e suas interpretações.
        </p>
        <div className="flex items-center justify-center space-x-4 mt-4">
          <button 
            className="px-3 py-2 bg-indigo-900/70 text-yellow-400 text-sm flex items-center rounded-md border border-purple-700/50 hover:bg-indigo-800 transition-colors shadow-md"
            onClick={() => setShowInstructions(true)}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Instruções de Leitura Segundo Crowley
          </button>
          <a 
            href="https://juliocamposmachado.my.canva.site/tarot-de-thoth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-2 bg-indigo-900/70 text-yellow-400 text-sm flex items-center rounded-md border border-purple-700/50 hover:bg-indigo-800 transition-colors shadow-md"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Galeria Completa do Baralho
          </a>
        </div>
      </div>
      
      {readingState === 'initial' && (
        <div className="max-w-2xl mx-auto bg-indigo-950/50 p-6 rounded-lg mb-8">
          <div className="mb-6">
            <label className="block text-purple-300 mb-2">Método de Leitura:</label>
            <select 
              value={spreadType.id} 
              onChange={(e) => setSpreadType(getSpreadById(e.target.value as 'three-card' | 'celtic-cross' | 'tree-of-life'))}
              className="w-full p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-400"
            >
              {allSpreads.map(spread => (
                <option key={spread.id} value={spread.id}>{spread.name}</option>
              ))}
            </select>
            
            {/* Guidance text for selected spread */}
            <div className="mt-3 p-4 bg-indigo-900/50 rounded-lg">
              <p className="text-purple-300 text-sm italic">
                {spreadGuidance[spreadType.id]}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-purple-300 mb-2">Sua Questão:</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Formule sua questão com clareza e intenção..."
              className="w-full p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-300 min-h-[100px]"
            />
            <p className="text-purple-400 text-xs mt-2">
              "A pergunta clara é a metade da resposta." — Adaptado de Crowley
            </p>
          </div>
          
          <button 
            className="w-full px-4 py-3 text-white rounded-md transition flex items-center justify-center bg-purple-800 hover:bg-purple-700"
            onClick={initiateReading}
          >
            <Eye className="w-5 h-5 mr-2" />
            Começar Leitura
          </button>
        </div>
      )}
      
      {reading && readingState !== 'initial' && (
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl text-white font-medium">{spreadType.name}</h2>
            {userName && <p className="text-yellow-400 text-sm">Consulente: {userName}</p>}
            <p className="text-purple-300 text-sm italic">"{question}"</p>
          </div>
          
          <div className="flex space-x-2">
            {readingState === 'complete' && (
              <button
                className="px-3 py-1 bg-indigo-800 text-yellow-400 rounded-md hover:bg-indigo-700 transition flex items-center text-sm"
                onClick={saveReading}
              >
                <Save className="w-4 h-4 mr-1" />
                Salvar Leitura
              </button>
            )}
            
            <button
              className="px-3 py-1 bg-purple-800 text-white rounded-md hover:bg-purple-700 transition text-sm"
              onClick={resetReading}
            >
              Nova Leitura
            </button>
          </div>
        </div>
      )}

      {reading && readingState !== 'initial' && (
        <div className="flex flex-col gap-6">
          {/* Card Interpretation - Now at the top */}
          <div className="w-full bg-indigo-950/30 p-4 rounded-lg border border-purple-800/30">
            <CardInterpretation readingCard={selectedCard} />
            
            {readingState === 'complete' && !selectedCard && (
              <div className="mt-4 p-4 bg-indigo-900/50 rounded-lg text-center">
                <p className="text-purple-300">
                  Clique em uma carta para ver sua interpretação detalhada.
                </p>
              </div>
            )}
          </div>

          {/* Spread Layout */}
          <div className="w-full relative">
            <div className="bg-indigo-950/30 p-4 rounded-lg border border-purple-800/30">
              <h3 className="text-xl font-medium text-indigo-200 mb-4 text-center">
                {spreadType.id === 'celtic-cross' ? 'Celtic Cross Spread' : 
                 spreadType.id === 'tree-of-life' ? 'Tree of Life Spread' : 'Three-Card Spread'}
              </h3>
              
              {/* Table-based layout for spreads */}
              <div className={`grid ${
                spreadType.id === 'tree-of-life' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                  : spreadType.id === 'three-card'
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              } gap-6 mb-6`}>
                {reading.cards.map((card, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-900/50 transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="w-32 sm:w-36 md:w-40 lg:w-44 xl:w-48 mx-auto aspect-[2/3]">
                      <TarotCardComponent 
                        card={card.card} 
                        onClick={() => {}} 
                        isReversed={card.isReversed}
                      />
                    </div>
                    <div className="mt-2 text-center w-full">
                      <div className="text-yellow-300 text-sm font-medium truncate px-1">{card.position.name}</div>
                      <div className="text-purple-300 text-xs mt-1 truncate px-1 text-center w-full">{card.card.name}{card.isReversed ? " (Invertida)" : ""}</div>
                    </div>
                    {/* Position number indicator */}
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-700 text-yellow-300 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Info about the spread */}
              <div className="text-center text-indigo-300 text-xs mt-2 px-4 py-2 bg-indigo-900/20 rounded-lg">
                <p>
                  {spreadType.id === 'tree-of-life' 
                    ? 'Visualização em tabela da Árvore da Vida, com as Sephiroth em ordem numérica.'
                    : spreadType.id === 'celtic-cross'
                    ? 'Visualização em tabela da Cruz Celta, com as posições em ordem numérica.'
                    : 'Visualização em tabela das cartas de passado, presente e futuro.'}
                </p>
              </div>
            </div>
            
            {readingState === 'revealing' && currentCardIndex < reading.cards.length && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-900/80 px-6 py-3 rounded-full text-yellow-400 text-sm shadow-lg shadow-purple-500/20 animate-pulse border border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Revelando carta {currentCardIndex + 1} de {reading.cards.length}...
                </div>
              </div>
            )}
          </div>
          
          {/* Crowley's Esoteric Interpretation */}
          <CrowleyInterpreter reading={reading} readingState={readingState} />

        </div>
      )}
      
      {/* Contribution Section */}
      {readingState === 'complete' && (
        <div className="mt-8 p-6 bg-indigo-900/40 rounded-lg border border-purple-800/30">
          <div className="text-center">
            <h3 className="text-xl text-yellow-400 font-medium mb-2">Contribua com o Projeto</h3>
            <p className="text-purple-300 mb-4">
              Se esta leitura foi útil e trouxe insights valiosos para você, considere fazer uma contribuição para ajudar a manter e melhorar este projeto.
            </p>
            <a 
              href="https://mpago.li/2JBdyqJ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm0 12a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 6a1 1 0 011 1v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H7a1 1 0 110-2h2V7a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Contribuir via Mercado Pago
            </a>
          </div>
        </div>
      )}
      
      {/* Saved Readings Section */}
      {savedReadings.length > 0 && readingState === 'initial' && (
        <div className="mt-8 border-t border-purple-800/50 pt-6">
          <h2 className="text-xl text-white font-medium mb-4">Leituras Salvas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReadings.map((savedReading) => (
              <div 
                key={savedReading.id}
                className="p-4 bg-indigo-900/40 rounded-lg hover:bg-indigo-900/60 transition cursor-pointer"
                onClick={() => {
                  setReading(savedReading);
                  setSpreadType(getSpreadById(savedReading.spreadType));
                  setQuestion(savedReading.question || '');
                  setUserName(savedReading.userName || '');
                  setBirthDate(savedReading.birthDate || '');
                  setIsRevealed(new Array(savedReading.cards.length).fill(true));
                  setReadingState('complete');
                  setSelectedCard(null);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-yellow-400 font-medium">
                      {allSpreads.find(s => s.id === savedReading.spreadType)?.name}
                    </h3>
                    <p className="text-purple-300 text-xs">
                      {new Date(savedReading.date).toLocaleDateString()}
                    </p>
                  </div>
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-purple-300 text-sm line-clamp-2 italic">
                  "{savedReading.question}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
