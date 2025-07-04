import { useState, useEffect, useCallback, useRef } from 'react';
import { ReadingCard, SpreadType } from '../types/tarot';

export type RevealState = 'idle' | 'shuffling' | 'drawing' | 'revealing' | 'complete';

interface UseCardRevealOptions {
  // Time in ms for the shuffle animation
  shuffleDuration?: number;
  // Time in ms before cards start appearing after shuffle
  drawingDelay?: number;
  // Time in ms between each card reveal
  revealInterval?: number;
  // Whether to automatically start revealing cards after drawing
  autoReveal?: boolean;
  // Optional callback when all cards are revealed
  onComplete?: () => void;
  // Whether to enable hover effects on revealed cards
  enableHoverEffects?: boolean;
}

interface UseCardRevealReturn {
  // Current state of the card reveal animation
  revealState: RevealState;
  // Array of booleans indicating which cards have been revealed
  isRevealed: boolean[];
  // Current card being revealed (during 'revealing' state)
  currentCardIndex: number;
  // Start the reveal process
  startRevealing: (cards: ReadingCard[]) => void;
  // Manually reveal a specific card by index
  revealCard: (index: number) => void;
  // Reveal all cards immediately
  revealAllCards: () => void;
  // Reset the reveal state
  resetReveal: () => void;
  // Animation ref to attach to the deck element
  deckRef: React.RefObject<HTMLDivElement>;
  // Get style props for a card based on its reveal state
  getCardStyle: (index: number, spreadType: SpreadType) => React.CSSProperties;
  // Check if a specific card is currently being revealed
  isCurrentlyRevealing: (index: number) => boolean;
}

export const useCardReveal = (options: UseCardRevealOptions = {}): UseCardRevealReturn => {
  // Default options
  const {
    shuffleDuration = 2000,
    drawingDelay = 1500,
    revealInterval = 800,
    autoReveal = true,
    onComplete = () => {},
    enableHoverEffects = true,
  } = options;

  // State for tracking revealed cards
  const [isRevealed, setIsRevealed] = useState<boolean[]>([]);
  // State for tracking the current animation state
  const [revealState, setRevealState] = useState<RevealState>('idle');
  // State for tracking the current card being revealed
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  // Store the cards for internal use
  const [cards, setCards] = useState<ReadingCard[]>([]);
  // Ref for the deck element (used for animations)
  const deckRef = useRef<HTMLDivElement>(null);
  // Ref for tracking if the component is mounted (prevent memory leaks)
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Start the reveal process
  const startRevealing = useCallback((newCards: ReadingCard[]) => {
    setCards(newCards);
    setIsRevealed(new Array(newCards.length).fill(false));
    setCurrentCardIndex(0);
    setRevealState('shuffling');

    // Simulate shuffling with a timeout
    setTimeout(() => {
      if (!isMounted.current) return;
      
      setRevealState('drawing');
      
      // Start revealing cards after a delay if autoReveal is enabled
      if (autoReveal) {
        setTimeout(() => {
          if (!isMounted.current) return;
          setRevealState('revealing');
        }, drawingDelay);
      }
    }, shuffleDuration);
  }, [shuffleDuration, drawingDelay, autoReveal]);

  // Reveal a specific card
  const revealCard = useCallback((index: number) => {
    if (index < 0 || index >= isRevealed.length) return;
    
    setIsRevealed(prev => {
      const newIsRevealed = [...prev];
      newIsRevealed[index] = true;
      return newIsRevealed;
    });
  }, [isRevealed]);

  // Reveal all cards immediately
  const revealAllCards = useCallback(() => {
    setIsRevealed(prev => prev.map(() => true));
    setCurrentCardIndex(cards.length);
    setRevealState('complete');
  }, [cards.length]);

  // Reset the reveal state
  const resetReveal = useCallback(() => {
    setCards([]);
    setIsRevealed([]);
    setCurrentCardIndex(0);
    setRevealState('idle');
  }, []);

  // Check if a specific card is currently being revealed
  const isCurrentlyRevealing = useCallback((index: number) => {
    return revealState === 'revealing' && currentCardIndex === index;
  }, [revealState, currentCardIndex]);

  // Get style props for a card based on its reveal state
  const getCardStyle = useCallback((index: number, spreadType: SpreadType): React.CSSProperties => {
    const position = spreadType.layout[index];
    const revealed = isRevealed[index];
    const isRevealing = isCurrentlyRevealing(index);
    
    // Base position from the layout
    const style: React.CSSProperties = {
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: `translate(-50%, -50%) rotate(${position.rotation || 0}deg)`,
      transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
      opacity: 0,
      scale: '0.9',
      position: 'absolute',
    };
    
    // Style for different states
    if (revealState === 'idle') {
      // Initial state, cards are hidden
      style.opacity = 0;
      style.scale = '0.8';
    } else if (revealState === 'shuffling') {
      // Shuffling animation, cards are briefly visible in a scattered state
      style.opacity = 0.1;
      style.scale = '0.8';
      style.filter = 'blur(4px)';
    } else if (revealState === 'drawing') {
      // Cards are positioned but not revealed
      style.opacity = 0.6;
      style.scale = '0.9';
      style.filter = 'blur(2px)';
    } else if (revealed) {
      // Card is revealed
      style.opacity = 1;
      style.scale = '1';
      style.zIndex = 10 + index;
      style.filter = 'blur(0px)';
      
      // Add subtle float animation if enabled
      if (enableHoverEffects) {
        style.animation = 'cardFloat 6s ease-in-out infinite';
      }
    } else if (isRevealing) {
      // Card is in the process of being revealed
      style.opacity = 0.8;
      style.scale = '0.95';
      style.filter = 'blur(1px)';
      style.animation = 'cardFlip 0.8s forwards';
    } else {
      // Card is not yet revealed
      style.opacity = 0.5;
      style.scale = '0.9';
      style.filter = 'blur(2px)';
    }
    
    return style;
  }, [isRevealed, revealState, currentCardIndex, enableHoverEffects, isCurrentlyRevealing]);

  // Progress through revealing cards
  useEffect(() => {
    if (revealState === 'revealing' && currentCardIndex < cards.length) {
      const timer = setTimeout(() => {
        if (!isMounted.current) return;
        
        revealCard(currentCardIndex);
        setCurrentCardIndex(prev => prev + 1);
        
        // If all cards are revealed, set state to complete
        if (currentCardIndex === cards.length - 1) {
          setRevealState('complete');
          onComplete();
        }
      }, revealInterval);
      
      return () => clearTimeout(timer);
    }
  }, [revealState, currentCardIndex, cards.length, revealCard, revealInterval, onComplete]);

  return {
    revealState,
    isRevealed,
    currentCardIndex,
    startRevealing,
    revealCard,
    revealAllCards,
    resetReveal,
    deckRef,
    getCardStyle,
    isCurrentlyRevealing,
  };
};
