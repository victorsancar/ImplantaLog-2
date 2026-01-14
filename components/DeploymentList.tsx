import React from 'react';
import { Trash2, Share2, MapPin, Signal, Wrench } from 'lucide-react';
import { Deployment } from '../types';

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File | null> => {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: 'image/jpeg' });
    } catch (error) {
        console.error("Erro na conversão da imagem:", error);
        return null;
    }
};

const DeploymentList: React.FC<DeploymentListProps> = ({ deployments, onDelete }) => {
  
  const handleShare = async (deployment: Deployment) => {
    // Texto do WhatsApp atualizado com Materiais
    const text = `
*RELATÓRIO NETBONUS*
-------------------------
*OS:* ${deployment.serviceId}
*END:* ${deployment.address}
*DATA:* ${new Date(deployment.date).toLocaleDateString('pt-BR')} às ${deployment.time}
*RESP:* ${deployment.responsible}
-------------------------
*PRODUÇÃO:*
✅ TORRES: ${deployment.towers}
🏢 ANDARES: ${deployment.floors} | APTOS: ${deployment.apartments}
🔌 CDOE: ${deployment.cdoe}
📡 SINAL: ${deployment.signal}
📶 COM SINAL: ${deployment.hasSignal ? 'SIM' : 'NÃO'}
-------------------------
*MATERIAIS:*
➰ CABO 04: ${deployment.cableUsed || 0}m (${deployment.cableSource || '-'})
🔩 CONECTORES: ${deployment.connectors || 0}
🔗 ALÇAS: ${deployment.anchors || 0}
📦 HUB BOX: ${deployment.hasHubBox ? 'SIM' : 'NÃO'}
-------------------------
*STATUS:* ${deployment.status}
*OBS:* ${deployment.notes || '-'}
*FACILIDADES:* ${deployment.facilities || '-'}
*EQUIPE:* ${deployment.team || '-'}
    `.trim();

    if (navigator.share) {
        try {
            let filesArray: File[] = [];
            if (deployment.photo) {
                const file = await dataURLtoFile(deployment.photo, `os_${deployment.serviceId}.jpg`);
                if (file) filesArray = [file];
            }

            if (filesArray.length > 0 && navigator.canShare && navigator.canShare({ files: filesArray })) {
                await navigator.share({ text: text, files: filesArray });
            } else {
                await navigator.share({ text: text, title: "Relatório de Implantação" });
            }
        } catch (error) {
            console.log('Erro no share nativo, tentando fallback...', error);
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        }
    } else {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    }
  };

  if (deployments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center px-4">
        <p>Nenhuma implantação registrada.</p>
        <p className="text-xs mt-2">Clique no botão "+" para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {deployments.map((item) => (
        <div key={item.id} className="bg-dark-800 rounded-xl overflow-hidden shadow-lg border border-dark-700">
          
          <div className={`p-3 flex justify-between items-center ${item.hasSignal ? 'bg-green-900/20 border-b border-green-900/30' : 'bg-red-900/20 border-b border-red-900/30'}`}>
            <div>
                <h3 className="font-bold text-white text-lg">OS: {item.serviceId}</h3>
                <span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString('pt-BR')} • {item.time}</span>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.hasSignal ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'}`}>
                {item.hasSignal ? 'Com Sinal' : 'Sem Sinal'}
            </span>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2 text-slate-300 text-sm">
                <MapPin size={16} className="text-brand-400 mt-1 shrink-0" />
                <span>{item.address}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-dark-900/50 p-2 rounded border border-dark-600">
                    <div className="text-slate-500 text-xs font-bold mb-1 flex items-center gap-1"><Signal size={12}/> TORRES</div>
                    <div className="text-white font-mono text-lg">{item.towers}</div>
                </div>
                <div className="bg-dark-900/50 p-2 rounded border border-dark-600">
                    <div className="text-slate-500 text-xs font-bold mb-1 flex items-center gap-1"><Wrench size={12}/> CABO 04</div>
                    <div className="text-white font-mono text-sm">{item.cableUsed || 0}m <span className="text-xs text-slate-500 block">{item.cableSource}</span></div>
                </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1 bg-dark-900/30 p-2 rounded border border-dark-700">
                <p><strong>Materiais:</strong> {item.connectors || 0} Conectores | {item.anchors || 0} Alças</p>
                <p><strong>Status:</strong> <span className="text-white">{item.status}</span></p>
            </div>

            {item.photo && (
                <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-1 font-bold">EVIDÊNCIA:</p>
                    <div className="rounded-lg overflow-hidden border border-dark-600 bg-black h-48 w-full relative">
                         <img src={item.photo} alt="Evidência" className="w-full h-full object-contain" />
                    </div>
                </div>
            )}

            <div className="flex gap-3 mt-4 pt-3 border-t border-dark-700">
                <button onClick={() => handleShare(item)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Share2 size={18} /> Compartilhar
                </button>
                <button onClick={() => onDelete(item.id)} className="w-12 bg-dark-700 hover:bg-red-900/20 text-red-400 border border-dark-600 rounded-lg flex items-center justify-center transition-colors">
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
