import React, { useState, useEffect, useRef } from 'react';
import { ReadingCard } from '../../types/tarot';
import { getInterpretation } from '../../services/geminiService';
import { Sparkles, Send, Volume2, VolumeX } from 'lucide-react';

interface Props {
  reading: {
    cards: ReadingCard[];
    spreadType: string;
    question: string;
  } | null;
  readingState: string;
}

export const CrowleyInterpreter: React.FC<Props> = ({ reading, readingState }) => {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'crowley', text: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthesis = window.speechSynthesis;

  // Function to speak text
  const speakText = (text: string) => {
    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9; // Slightly slower for mystical effect
    utterance.pitch = 0.9; // Slightly deeper voice

    // Get available voices and select a Portuguese one if available
    const voices = synthesis.getVoices();
    const portugueseVoice = voices.find(voice => voice.lang.includes('pt'));
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    synthesis.cancel();
    setIsSpeaking(false);
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    if (reading && readingState === 'complete' && messages.length === 0) {
      handleInitialInterpretation();
    }
    return () => {
      synthesis.cancel(); // Cleanup speech when component unmounts
    };
  }, [reading, readingState]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInitialInterpretation = async () => {
    setIsLoading(true);
    const interpretation = await getInterpretation({
      cards: reading!.cards.map(c => ({
        name: c.card.name,
        position: c.position.name,
        isReversed: c.isReversed
      })),
      spreadType: reading!.spreadType,
      question: reading!.question || "Qual é a revelação do universo?"
    });
    
    setMessages([{ type: 'crowley', text: interpretation }]);
    setIsLoading(false);
    speakText(interpretation);
  };
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !reading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);
    stopSpeaking(); // Stop any ongoing speech

    try {
      const response = await getInterpretation({
        cards: reading.cards.map(c => ({
          name: c.card.name,
          position: c.position.name,
          isReversed: c.isReversed
        })),
        spreadType: reading.spreadType,
        question: userMessage
      });

      setMessages(prev => [...prev, { type: 'crowley', text: response }]);
      speakText(response); // Speak the new response
    } catch (error) {
      console.error('Error in chat response:', error);
      const errorMessage = 'Os mistérios estão temporariamente velados. Tente novamente em breve.';
      setMessages(prev => [...prev, { type: 'crowley', text: errorMessage }]);
      speakText(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!reading || readingState !== 'complete') {
    return null;
  }

  return (
    <div className="bg-indigo-950/50 p-6 rounded-lg border border-purple-800/30 mt-6">
      <h3 className="text-xl text-yellow-400 mb-4 font-medium flex items-center">
        <Sparkles className="w-5 h-5 mr-2" />
        Interpretação Mística - Aleister Crowley
      </h3>

      {/* Message component with speak button */}
      <div className="bg-indigo-900/30 rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div className="flex items-start gap-2">
              {message.type === 'crowley' && (
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(message.text)}
                  className="mt-2 p-1 rounded-full hover:bg-purple-700/50 transition-colors"
                  title="Ouvir mensagem"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-yellow-400" />
                  )}
                </button>
              )}
              <div
                className={`inline-block rounded-lg p-3 max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-purple-700/50 text-purple-100'
                    : 'bg-indigo-800/50 text-yellow-200'
                }`}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-yellow-400 animate-pulse flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce mr-1"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Faça uma pergunta sobre sua leitura..."
          className="flex-1 bg-indigo-900/30 border border-purple-700/30 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-yellow-500 text-indigo-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
