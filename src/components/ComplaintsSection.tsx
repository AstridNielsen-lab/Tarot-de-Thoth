import React, { useState } from 'react';
import { MessageSquare, AlertCircle, HelpCircle, ExternalLink } from 'lucide-react';
import { ChatBot } from './ChatBot';

export const ComplaintsSection: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [hasEscalated, setHasEscalated] = useState(false);
  
  const handleEscalation = () => {
    setHasEscalated(true);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">Central de Atendimento</h2>
        <p className="text-purple-300 max-w-2xl mx-auto">
          Sua satisfação é nossa prioridade. Se você tiver alguma dúvida, problema ou reclamação,
          estamos aqui para ajudar. Utilize nosso assistente virtual ou entre em contato diretamente
          por um de nossos canais de atendimento.
        </p>
      </div>
      
      {/* Complaints Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Chat with Bot */}
        <div className="bg-indigo-950 border border-purple-800 rounded-lg p-6 hover:border-purple-600 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <MessageSquare className="text-purple-500 w-6 h-6 mr-3" />
              <h3 className="text-xl font-semibold text-white">Assistente Virtual</h3>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
            >
              {showChat ? 'Fechar' : 'Abrir Chat'}
            </button>
          </div>
          <p className="text-purple-300 mb-4">
            Converse com nosso assistente virtual que pode ajudar a resolver problemas comuns, responder perguntas e
            direcionar você para o suporte adequado.
          </p>
          
          {showChat && <ChatBot onEscalate={handleEscalation} />}
        </div>
        
        {/* WhatsApp Support */}
        <div className="bg-indigo-950 border border-purple-800 rounded-lg p-6 hover:border-green-600 transition-colors">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 p-2 rounded-full mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Suporte via WhatsApp</h3>
          </div>
          <p className="text-purple-300 mb-4">
            Prefere falar diretamente com nossa equipe? Entre em contato pelo WhatsApp para
            um atendimento rápido e personalizado.
          </p>
          <a
            href="https://wa.me/5511970603441"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Falar pelo WhatsApp
            <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
      
      {/* Reclame Aqui Section */}
      <div className="bg-indigo-950 border border-purple-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="text-yellow-500 w-6 h-6 mr-3" />
          <h3 className="text-xl font-semibold text-white">Reclame Aqui</h3>
        </div>
        <p className="text-purple-300 mb-6">
          Se você já tentou resolver seu problema pelos nossos canais de atendimento e não obteve
          sucesso, você pode registrar uma reclamação formal no Reclame Aqui. No entanto, 
          gostaríamos de ressaltar que estamos comprometidos em resolver seu problema diretamente.
        </p>
        
        <div className="bg-indigo-900/50 p-4 rounded-lg mb-4">
          <h4 className="flex items-center text-white font-semibold mb-2">
            <HelpCircle className="text-yellow-400 w-5 h-5 mr-2" />
            Crie sua reclamação aqui, vamos ajudar a publicar
          </h4>
          <p className="text-purple-200 text-sm mb-4">
            Antes de recorrer ao Reclame Aqui, tente utilizar nosso assistente virtual acima. 
            Na maioria dos casos, conseguimos resolver problemas rapidamente por lá.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowChat(true)}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Falar com Assistente Virtual
            </button>
            <a
              href="https://www.reclameaqui.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Ir para Reclame Aqui
              <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
        
        {hasEscalated && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 text-sm">
              Vimos que você já conversou com nosso assistente virtual. Se o problema persistir,
              recomendamos entrar em contato pelo WhatsApp para um atendimento mais personalizado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
