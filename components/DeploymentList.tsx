import React from 'react';
import { Trash2, Share2 } from 'lucide-react';
import { Deployment } from '../types';

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

// Converter DataURL para Arquivo
const dataURLtoFile = async (dataUrl: string, filename: string) => {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: 'image/jpeg' });
    } catch (error) {
        console.error("Erro conversão:", error);
        return null;
    }
};

const DeploymentList: React.FC<DeploymentListProps> = ({ deployments, onDelete }) => {
  
  const handleShare = async (deployment: Deployment) => {
    // Monta texto
    const text = `*RELATÓRIO NETBONUS*\nOS: ${deployment.serviceId}\nEND: ${deployment.address}\nTORRES: ${deployment.towerCount}\nSINAL: ${deployment.signalStrength}\nSTATUS: ${deployment.status || 'OK'}`;

    // Tenta compartilhar
    if (navigator.share) {
        try {
            const shareData: any = { title: 'Relatório', text: text };
            
            // Verifica se tem foto E se ela é válida
            if (deployment.photoUrl && deployment.photoUrl.startsWith('data:image')) {
                const file = await dataURLtoFile(deployment.photoUrl, 'servico.jpg');
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }
            }

            await navigator.share(shareData);
        } catch (error) {
            // Se cair aqui, é porque o navegador do celular cancelou ou deu erro
            // Vamos forçar abrir o WhatsApp Web como plano B
            // alert("Compartilhamento nativo falhou. Abrindo WhatsApp Web (apenas texto).");
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    } else {
        // Se estiver no PC
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
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
            
            <p className="text-sm text-slate-300 mb-2">{item.address}</p>
            <div className="flex gap-4 text-sm mb-3">
                <span>📶 {item.signalStrength}</span>
                <span>🏢 {item.towerCount} Torres</span>
            </div>

            {/* PREVIEW DA FOTO */}
            {item.photoUrl ? (
                <img src={item.photoUrl} className="w-full h-40 object-cover rounded-lg mb-3 bg-black" alt="Evidência" />
            ) : (
                <div className="p-2 bg-slate-900 text-xs text-slate-500 text-center mb-3 rounded">Sem foto salva</div>
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
