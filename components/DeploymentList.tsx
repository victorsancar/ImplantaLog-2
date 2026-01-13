import React from 'react';
import { Trash2, Share2 } from 'lucide-react';
// IMPORTANTE: O "../" significa "voltar uma pasta" para achar o types.ts na raiz
import { Deployment } from '../types'; 

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

// Converte a foto (texto) para arquivo real
const dataURLtoFile = async (dataUrl: string, filename: string) => {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: 'image/jpeg' });
    } catch (error) {
        console.error("Erro ao converter imagem:", error);
        return null;
    }
};

const DeploymentList: React.FC<DeploymentListProps> = ({ deployments, onDelete }) => {
  
  const handleShare = async (deployment: Deployment) => {
    // Monta o texto bonito
    const text = `
*RELATÓRIO DE IMPLANTAÇÃO - NETBONUS*
-------------------------
*OS:* ${deployment.serviceId}
*DATA:* ${new Date(deployment.executionDate).toLocaleDateString('pt-BR')}
*ENDEREÇO:* ${deployment.address}
-------------------------
✅ TORRES: ${deployment.towerCount}
📡 SINAL: ${deployment.signalStrength}
📶 POSSUI SINAL: ${deployment.hasSignal ? 'SIM' : 'NÃO'}
-------------------------
*STATUS:* ${deployment.status || 'Finalizado'}
*FACILIDADES:* ${deployment.facilities || 'Nenhuma'}
    `.trim();

    // Tenta compartilhar pelo celular (Foto + Texto)
    if (navigator.share) {
        try {
            const shareData: any = {
                title: 'Relatório Implantação',
                text: text
            };

            // Se tiver foto, converte e anexa
            if (deployment.photoUrl) {
                const file = await dataURLtoFile(deployment.photoUrl, 'servico.jpg');
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }
            }

            await navigator.share(shareData);
            return; // Se funcionou, para aqui
        } catch (error) {
            console.log('Share nativo cancelado ou falhou. Tentando link...');
        }
    }

    // Se falhar o nativo, abre o WhatsApp Web (Só texto)
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (deployments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p>Nenhuma implantação registrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {deployments.map((item) => (
        <div key={item.id} className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700 relative overflow-hidden text-slate-100">
          
          {/* Barra lateral colorida */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.hasSignal ? 'bg-green-500' : 'bg-red-500'}`}></div>

          <div className="pl-2">
            <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">OS: {item.serviceId}</h3>
                  <p className="text-xs text-slate-400">
                      {new Date(item.executionDate).toLocaleDateString('pt-BR')} • {item.executionTime}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.hasSignal ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {item.hasSignal ? 'Com Sinal' : 'Sem Sinal'}
                </div>
            </div>

            <div className="text-sm text-slate-300 space-y-1 mb-3">
                <p><b>End:</b> {item.address}</p>
                <div className="flex gap-4">
                    <p><b>Torres:</b> {item.towerCount}</p>
                    <p><b>Sinal:</b> {item.signalStrength}</p>
                </div>
            </div>

            {/* VISUALIZAÇÃO DA FOTO */}
            {item.photoUrl ? (
                <div className="mb-3 rounded-lg overflow-hidden h-40 bg-black border border-slate-600">
                    <img 
                      src={item.photoUrl} 
                      alt="Foto do Serviço" 
                      className="w-full h-full object-cover" 
                    />
                </div>
            ) : (
                <div className="mb-3 text-xs text-slate-500 italic">Sem foto registrada</div>
            )}

            <div className="flex gap-3">
                <button 
                    onClick={() => handleShare(item)}
                    className="flex-1 bg-green-600 active:bg-green-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                >
                    <Share2 size={16} /> WhatsApp
                </button>
                <button 
                    onClick={() => onDelete(item.id)}
                    className="w-10 bg-slate-700 text-red-400 rounded-lg flex items-center justify-center"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeploymentList;
