import React from 'react';
import { Trash2, Share2, ImageOff } from 'lucide-react';
import { Deployment } from '../types';

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

// Função auxiliar: Transforma o texto da imagem em Arquivo Real
const dataURLtoFile = async (dataUrl: string, filename: string) => {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: 'image/jpeg' });
    } catch (error) {
        return null;
    }
};

const DeploymentList: React.FC<DeploymentListProps> = ({ deployments, onDelete }) => {
  
  const handleShare = async (deployment: Deployment) => {
    // 1. Monta o Texto
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

    // 2. Tenta COMPARTILHAMENTO NATIVO (A mágica do PWA)
    // Isso deve abrir o menu do Android com a opção de enviar FOTO + TEXTO
    if (navigator.share) {
        try {
            const shareData: any = {
                title: 'Relatório Implantação',
                text: text
            };

            // Se tiver foto válida, anexa como arquivo
            if (deployment.photoUrl && deployment.photoUrl.startsWith('data:image')) {
                const file = await dataURLtoFile(deployment.photoUrl, 'servico.jpg');
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }
            }

            await navigator.share(shareData);
            return; // Se funcionou, encerra aqui
        } catch (error) {
            console.log("Compartilhamento nativo cancelado/falhou. Usando link...");
        }
    }

    // 3. FALLBACK (Se o nativo falhar ou estiver no PC)
    // Abre o WhatsApp Web (Apenas texto, pois link não suporta imagem)
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (deployments.length === 0) return <div className="p-8 text-center text-slate-500">Sem registros.</div>;

  return (
    <div className="space-y-4 pb-24">
      {deployments.map((item) => (
        <div key={item.id} className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700 relative overflow-hidden text-slate-100">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.hasSignal ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="pl-2">
            <div className="flex justify-between mb-2">
                <h3 className="font-bold">OS: {item.serviceId}</h3>
                <span className="text-xs text-slate-400">{item.executionTime}</span>
            </div>
            
            <p className="text-sm text-slate-300 mb-2 truncate">{item.address}</p>
            <div className="flex gap-4 text-sm mb-3">
                <span>📶 {item.signalStrength}</span>
                <span>🏢 {item.towerCount} Torres</span>
            </div>

            {/* FOTO */}
            {item.photoUrl ? (
                <img src={item.photoUrl} className="w-full h-40 object-cover rounded-lg mb-3 bg-black" alt="Evidência" />
            ) : (
                <div className="flex items-center justify-center p-3 bg-slate-900 text-xs text-slate-500 mb-3 border border-slate-700 border-dashed rounded gap-2">
                    <ImageOff size={14} /> Sem foto
                </div>
            )}

            <div className="flex gap-2">
                <button 
                    onClick={() => handleShare(item)}
                    className="flex-1 bg-green-600 active:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                    <Share2 size={18} /> WhatsApp
                </button>
                <button 
                    onClick={() => onDelete(item.id)}
                    className="px-3 bg-slate-700 active:bg-slate-600 text-red-400 rounded-lg"
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
