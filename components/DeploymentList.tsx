import React from 'react';
import { Trash2, Share2, ImageOff } from 'lucide-react';
import { Deployment } from '../types'; //

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

const DeploymentList: React.FC<DeploymentListProps> = ({ deployments, onDelete }) => {
  
  // Função que gera o texto para cada item
  const getWhatsappLink = (deployment: Deployment) => {
    const text = `
*RELATÓRIO NETBONUS*
-------------------------
*OS:* ${deployment.serviceId}
*END:* ${deployment.address}
*DATA:* ${new Date(deployment.executionDate).toLocaleDateString('pt-BR')}
-------------------------
✅ TORRES: ${deployment.towerCount}
📡 SINAL: ${deployment.signalStrength}
📶 POSSUI SINAL: ${deployment.hasSignal ? 'SIM' : 'NÃO'}
-------------------------
*STATUS:* ${deployment.status}
    `.trim();

    // O SEGREDO: Usar o protocolo direto do WhatsApp
    return `whatsapp://send?text=${encodeURIComponent(text)}`;
  };

  if (deployments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center px-4">
        <p>Nenhuma implantação registrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {deployments.map((item) => (
        <div key={item.id} className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700 relative overflow-hidden text-slate-100">
          
          {/* Faixa lateral de status */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.hasSignal ? 'bg-green-500' : 'bg-red-500'}`}></div>

          <div className="pl-2">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">OS: {item.serviceId}</h3>
                <span className="text-xs text-slate-400 mt-1">{item.executionTime}</span>
            </div>

            <p className="text-sm text-slate-300 mb-2 truncate">{item.address}</p>
            <div className="flex gap-4 text-sm mb-3 text-slate-400">
                <span>📶 {item.signalStrength}</span>
                <span>🏢 {item.towerCount} Torres</span>
            </div>

            {/* VISUALIZAÇÃO DA FOTO */}
            {/* Verifica se existe URL e se ela é uma imagem válida */}
            {item.photoUrl && item.photoUrl.length > 100 ? (
                <div className="mb-3 rounded-lg overflow-hidden h-40 bg-black border border-slate-600">
                    <img 
                      src={item.photoUrl} 
                      className="w-full h-full object-cover" 
                      alt="Evidência"
                      onError={(e) => {
                        // Se a imagem estiver quebrada, esconde ela
                        (e.target as HTMLImageElement).style.display = 'none';
                      }} 
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-xs text-slate-500 mb-3 border border-slate-700 border-dashed rounded">
                    <ImageOff size={16} />
                    <span>Sem foto salva</span>
                </div>
            )}

            <div className="flex gap-2">
                {/* BOTÃO WHATSAPP AGORA É UM LINK DIRETO (<a>) */}
                {/* Isso funciona muito melhor em APKs do que window.open */}
                <a 
                    href={getWhatsappLink(item)}
                    className="flex-1 bg-green-600 active:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors no-underline"
                >
                    <Share2 size={18} /> WhatsApp
                </a>

                <button 
                    onClick={() => onDelete(item.id)}
                    className="w-12 bg-slate-700 active:bg-slate-600 text-red-400 rounded-lg flex items-center justify-center transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeploymentList;
