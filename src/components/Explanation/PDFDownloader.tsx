import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

/**
 * PDFDownloader component redirecting to Amazon for the Thoth Book purchase
 */
export const PDFDownloader: React.FC = () => {
  // Handle redirect to Amazon product page
  const handleRedirectToAmazon = () => {
    window.open('https://www.amazon.com.br/dp/B0FGWCYYHG', '_blank');
  };

  return (
    <div className="mt-8 mb-12">
      <div className="bg-indigo-900/50 rounded-lg p-6 border border-purple-700/30 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-yellow-400 mr-2" />
            <h3 className="text-xl font-bold text-white">O Livro de Thoth - eBook</h3>
          </div>
        </div>
        
        <p className="text-purple-300 mb-6">
          Adquira a versão eBook do "Livro de Thoth" com interpretações detalhadas de todas as 78 cartas do Tarot,
          incluindo simbolismo, correspondências cabalísticas e astrológicas.
        </p>
        
        <button
          onClick={handleRedirectToAmazon}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <span>Ler na Amazon</span>
        </button>
        
        <div className="mt-4 text-xs text-purple-400 text-center">
          O livro completo tem aproximadamente 80 páginas com interpretações detalhadas das 78 cartas.
          Disponível para leitura imediata após a compra.
        </div>
      </div>
    </div>
  );
};

export default PDFDownloader;
