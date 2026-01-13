import React from 'react';
import { Trash2, Share2 } from 'lucide-react';
import { Deployment } from '../types';

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

const DeploymentList: React.FC<DeploymentListProps> = ({ deployments, onDelete }) => {
  
  const handleShare = async (deployment: Deployment) => {
    // 1. Monta o texto
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

    // 2. Tenta a API Nativa (Se o WebIntoApp suportar, vai com foto)
    if (navigator.share) {
        try {
            const shareData: any = { title: 'Relatório', text: text };
            // Tenta converter e anexar a foto (se houver)
            if (deployment.photoUrl) {
                const blob = await (await fetch(deployment.photoUrl)).blob();
                const file = new File([blob], "servico.jpg", { type: "image/jpeg" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }
            }
            await navigator.share(shareData);
            return; 
        } catch (e) {
            console.log("Share nativo falhou, indo para plano B...");
        }
    }

    // 3. PLANO B (ESPECÍFICO PARA APK/WEBINTOAPP)
    // Usamos 'whatsapp://' em vez de 'https://'. Isso força o Android a abrir o app.
    // Nota: Por esse método, infelizmente só vai o TEXTO. A foto não passa por link.
    window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
  };

  if (deployments.length === 0) return <div className="p-8 text-center text-slate-500">Sem registros.</div>;

  return (
    <div className="space-y-4 pb-24">
      {deployments.map((item) => (
        <div key={item.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 relative text-slate-100 shadow-lg">
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

            {/* FOTO - Se estiver branca/vazia, é permissão da câmera */}
            {item.photoUrl ? (
                <img src={item.photoUrl} className="w-full h-40 object-cover rounded-lg mb-3 bg-black" alt="Evidência" />
            ) : (
                <div className="p-2 bg-slate-900 text-xs text-slate-500 text-center mb-3 border border-slate-700 border-dashed rounded">
                    Sem foto registrada
                </div>
            )}

            <div className="flex gap-2">
                <button onClick={() => handleShare(item)} className="flex-1 bg-green-600 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-sm">
                    <Share2 size={16} /> WhatsApp
                </button>
                <button onClick={() => onDelete(item.id)} className="px-3 bg-slate-700 rounded-lg text-red-400">
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
