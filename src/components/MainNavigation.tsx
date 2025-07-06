import React from 'react';
import { BookOpen, Eye, MessageCircle, Library } from 'lucide-react';

interface MainNavigationProps {
  activePage: 'catalog' | 'explanation' | 'reading' | 'complaints';
  onPageChange: (page: 'catalog' | 'explanation' | 'reading' | 'complaints') => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  activePage,
  onPageChange
}) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex p-1 rounded-lg bg-indigo-900/50">
        <button
          className={`px-4 py-2 rounded-md transition flex items-center ${
            activePage === 'catalog' 
              ? 'bg-purple-700 text-white shadow-md' 
              : 'text-purple-300 hover:bg-indigo-800'
          }`}
          onClick={() => onPageChange('catalog')}
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Catálogo
        </button>
        <button
          className={`px-4 py-2 rounded-md transition flex items-center ${
            activePage === 'explanation' 
              ? 'bg-purple-700 text-white shadow-md' 
              : 'text-purple-300 hover:bg-indigo-800'
          }`}
          onClick={() => onPageChange('explanation')}
        >
          <Library className="w-5 h-5 mr-2" />
          Livro
        </button>
        <button
          className={`px-4 py-2 rounded-md transition flex items-center ${
            activePage === 'reading' 
              ? 'bg-purple-700 text-white shadow-md' 
              : 'text-purple-300 hover:bg-indigo-800'
          }`}
          onClick={() => onPageChange('reading')}
        >
          <Eye className="w-5 h-5 mr-2" />
          Leitura
        </button>
        <button
          className={`px-4 py-2 rounded-md transition flex items-center ${
            activePage === 'complaints' 
              ? 'bg-purple-700 text-white shadow-md' 
              : 'text-purple-300 hover:bg-indigo-800'
          }`}
          onClick={() => onPageChange('complaints')}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Atendimento
        </button>
      </div>
    </div>
  );
};
