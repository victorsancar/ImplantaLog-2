import React from 'react';
import { Trash2, Share2 } from 'lucide-react';
import { Deployment } from '../types'; // Importando do arquivo types.ts na raiz

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

// Função Auxiliar: Tenta converter Base64 para Arquivo
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
    // 1. Monta o texto
    const text = `
*RELATÓRIO DE IMPLANTAÇÃO - NETBONUS*
-------------------------
*TIPO:* ${deployment.type || 'IMPLANTAÇÃO'}
*ID:* ${deployment.serviceId}
*ENDEREÇO:* ${deployment.address}
*DATA:* ${new Date(deployment.executionDate).toLocaleDateString('pt-BR')} às ${deployment.executionTime}
*RESPONSÁVEL:* ${deployment.responsible}
-------------------------
*PRODUÇÃO:*
✅ TORRES: ${deployment.towerCount}
🏢 ANDARES: ${deployment.floorCount} | APTOS: ${deployment.apartmentCount}
🔌 CDOE: ${deployment.cdoeCount}
📡 SINAL: ${deployment.signalStrength}
📶 POSSUI SINAL: ${deployment.hasSignal ? 'SIM' : 'NÃO'}
📦 HUB BOX: ${deployment.hasHubBox ? 'SIM' : 'NÃO'}
-------------------------
*FACILIDADES:* ${deployment.facilities || 'Nenhuma'}
    `.trim();

    // 2. Tenta o Compartilhamento Nativo (Mobile)
    if (navigator.share) {
        try {
            const shareData: any = {
                title: 'Relatório de Implantação',
                text: text
            };

            // Tenta anexar a foto se existir e for válida
            if (deployment.photoUrl) {
                const file = await dataURLtoFile(deployment.photoUrl, 'servico.jpg');
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }
            }

            await navigator.share(shareData);
            return; // Se deu certo, para aqui.
        } catch (error) {
            console.log('Share nativo falhou ou foi cancelado. Tentando WhatsApp Web...');
        }
    }

    // 3. Fallback: Abre WhatsApp Web (Só texto, pois WA Web não aceita imagem via URL)
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
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
          {/* Barra lateral colorida */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.hasSignal ? 'bg-green-500' : 'bg-red-500'}`}></div>

          <div className="pl-2">
            <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">OS: {item.serviceId}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                      {new Date(item.executionDate).toLocaleDateString('pt-BR')} • {item.executionTime}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.hasSignal ? 'bg-green-900/40 text-green-400 border border-green-900' : 'bg-red-900/40 text-red-400 border border-red-900'}`}>
                    {item.hasSignal ? 'Com Sinal' : 'Sem Sinal'}
                </div>
            </div>

            <div className="text-sm text-slate-300 space-y-2 mb-4">
                <p className="truncate"><span className="text-slate-500 text-xs uppercase font-bold mr-2">Endereço:</span>{item.address}</p>
                <div className="grid grid-cols-2 gap-2">
                    <p><span className="text-slate-500 text-xs uppercase font-bold mr-2">Torres:</span> {item.towerCount}</p>
                    <p><span className="text-slate-500 text-xs uppercase font-bold mr-2">Sinal:</span> {item.signalStrength}</p>
                </div>
            </div>

            {/* --- AQUI ESTAVA O PROBLEMA DO PREVIEW --- */}
            {/* Agora usando item.photoUrl explicitamente */}
            {item.photoUrl && (
                <div className="mb-4 rounded-lg overflow-hidden h-40 w-full bg-slate-900 border border-slate-700">
                    <img 
                      src={item.photoUrl} 
                      alt="Evidência do Serviço" 
                      className="w-full h-full object-cover" 
                    />
                </div>
            )}

            <div className="flex gap-3 mt-2">
                <button 
                    onClick={() => handleShare(item)}
                    className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                    <Share2 size={18} /> <span>WhatsApp</span>
                </button>
                <button 
                    onClick={() => onDelete(item.id)}
                    className="w-12 bg-slate-700 hover:bg-red-900/20 text-red-400 border border-slate-600 rounded-lg flex items-center justify-center transition-all"
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
