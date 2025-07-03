import React from 'react';
import { ReadingCard, Position } from '../../types/tarot';
import { Eye, Star } from 'lucide-react';

interface CardInterpretationProps {
  readingCard: ReadingCard | null;
}

export const CardInterpretation: React.FC<CardInterpretationProps> = ({ readingCard }) => {
  if (!readingCard) {
    return (
      <div className="p-6 bg-indigo-950/50 rounded-lg text-center">
        <p className="text-purple-300">Selecione uma carta para ver sua interpretação.</p>
      </div>
    );
  }

  const { card, position, isReversed, interpretation } = readingCard;

  return (
    <div className="p-6 bg-indigo-950/50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">
          {card.name} {isReversed && "(Invertida)"}
        </h3>
        <div className="text-sm text-yellow-400 font-medium px-3 py-1 bg-indigo-900/50 rounded-full">
          {position.name}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Card keywords */}
        <div className="flex flex-wrap gap-2 mb-2">
          {card.keywords.map((keyword, index) => (
            <span 
              key={index} 
              className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Position meaning */}
        <div className="mb-4">
          <h4 className="text-lg text-yellow-400 flex items-center mb-2">
            <Eye className="w-4 h-4 mr-2" />
            Significado na Posição
          </h4>
          <p className="text-purple-200">{position.description}</p>
          <div className="mt-2 pl-4 border-l-2 border-purple-800">
            <p className="text-purple-300 italic text-sm">{position.crowleyInterpretation}</p>
          </div>
        </div>

        {/* Card interpretation in this position */}
        <div className="mb-4">
          <h4 className="text-lg text-yellow-400 flex items-center mb-2">
            <Star className="w-4 h-4 mr-2" />
            Interpretação de Crowley
          </h4>
          <div className="pl-4 border-l-2 border-yellow-700">
            <p className="text-purple-200">{interpretation}</p>
            {isReversed && (
              <p className="mt-2 text-purple-300 italic">
                A inversão da carta intensifica as qualidades desafiadoras ou inverte as energias tradicionais, 
                conforme as correspondências astrológicas opostas descritas por Crowley.
              </p>
            )}
          </div>
        </div>

        {/* Correspondences section */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="p-3 bg-indigo-900/30 rounded-lg">
            <h5 className="text-sm text-yellow-400 mb-1">Correspondências</h5>
            <div className="text-sm text-purple-200">
              {card.element && <div><span className="text-purple-400">Elemento:</span> {card.element}</div>}
              {card.suit && <div><span className="text-purple-400">Naipe:</span> {card.suit}</div>}
              {card.number && <div><span className="text-purple-400">Número:</span> {card.number}</div>}
            </div>
          </div>
          <div className="p-3 bg-indigo-900/30 rounded-lg">
            <h5 className="text-sm text-yellow-400 mb-1">No Livro de Thoth</h5>
            <div className="text-sm text-purple-200">
              <div><span className="text-purple-400">Nome em inglês:</span> {card.englishName}</div>
              <div><span className="text-purple-400">Categoria:</span> {
                card.category === 'major' 
                  ? 'Arcanos Maiores' 
                  : card.category === 'court' 
                    ? 'Cartas da Corte' 
                    : 'Arcanos Menores'
              }</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
