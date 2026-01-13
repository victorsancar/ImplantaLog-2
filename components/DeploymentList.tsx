import React from 'react';
import { Trash2, Share2, Image as ImageIcon } from 'lucide-react';
import { Deployment } from '../types';

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

// 1. Função Auxiliar: Converte a foto (Base64) em Arquivo real para o WhatsApp aceitar
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
    // 2. Monta o texto formatado do relatório
    const text = `
*RELATÓRIO DE IMPLANTAÇÃO - NETBONUS*
-------------------------
*TIPO:* ${deployment.type || 'IMPLANTAÇÃO'}
*ID:* ${deployment.serviceId}
*ENDEREÇO:* ${deployment.address}
*DATA:* ${new Date(deployment.date).toLocaleDateString('pt-BR')} às ${deployment.time}
*RESPONSÁVEL:* ${deployment.responsible}
-------------------------
*PRODUÇÃO:*
✅ TORRES: ${deployment.towers}
🏢 ANDARES: ${deployment.floors} | APTOS: ${deployment.apartments}
🔌 CDOE: ${deployment.cdoe}
📡 SINAL: ${deployment.signal}
📶 POSSUI SINAL: ${deployment.hasSignal ? 'SIM' : 'NÃO'}
📦 HUB BOX: ${deployment.hasHubBox ? 'SIM' : 'NÃO'}
-------------------------
*STATUS:* ${deployment.status}
*OBS:* ${deployment.notes || 'Nenhuma'}
*FACILIDADES:* ${deployment.facilities || 'Nenhuma'}
*EXECUTANTES:* ${deployment.team || 'Não informado'}
    `.trim();

    // 3. Tenta Compartilhamento Nativo (Celular)
    if (navigator.share) {
        try {
            const shareData: any = {
                title: 'Relatório de Implantação',
                text: text
            };

            // Se tiver foto, converte e anexa
            if (deployment.photo) {
                const file = await dataURLtoFile(deployment.photo, 'servico.jpg');
                // Verifica se o navegador suporta envio de arquivos
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }
            }

            await navigator.share(shareData);
        } catch (error) {
            console.log('Compartilhamento nativo falhou ou cancelado, tentando WhatsApp Web...');
            // Fallback 1: Tenta abrir o WhatsApp Web só com texto
             const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
             window.open(whatsappUrl, '_blank');
        }
    } else {
        // 4. Fallback 2: PC / Desktop (Abre WhatsApp Web direto)
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
    <div className="space-y-4 pb-24"> {/* Padding bottom extra para não esconder atrás do menu */}
      {deployments.map((item) => (
        <div key={item.id} className="bg-dark-800 rounded-xl p-4 shadow-lg border border-dark-700 relative overflow-hidden">
          {/* Indicador lateral de status (Verde/Vermelho) */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.hasSignal ? 'bg-green-500' : 'bg-red-500'}`}></div>

          <div className="pl-2">
            <div className="flex justify-between items-start mb-3">
                <div>
                <h3 className="font-bold text-white text-lg">OS: {item.serviceId}</h3>
                <p className="text-xs text-slate-400 font-mono">{new Date(item.date).toLocaleDateString('pt-BR')} • {item.time}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.hasSignal ? 'bg-green-900/40 text-green-400 border border-green-900' : 'bg-red-900/40 text-red-400 border border-red-900'}`}>
                    {item.hasSignal ? 'Com Sinal' : 'Sem Sinal'}
                </div>
            </div>

            <div className="text-sm text-slate-300 space-y-2 mb-4">
                <p className="truncate"><span className="text-slate-500 text-xs uppercase font-bold mr-2">Endereço:</span>{item.address}</p>
                <div className="grid grid-cols-2 gap-2">
                    <p><span className="text-slate-500 text-xs uppercase font-bold mr-2">Torres:</span> {item.towers}</p>
                    <p><span className="text-slate-500 text-xs uppercase font-bold mr-2">Sinal:</span> {item.signal}</p>
                </div>
                <p><span className="text-slate-500 text-xs uppercase font-bold mr-2">Status:</span> {item.status}</p>
            </div>

            {/* Preview da Foto */}
            {item.photo && (
                <div className="mb-4 rounded-lg overflow-hidden h-32 w-full bg-dark-900 border border-dark-700">
                    <img src={item.photo} alt="Evidência" className="w-full h-full object-cover" />
                </div>
            )}

            <div className="flex gap-3 mt-2">
                <button 
                    onClick={() => handleShare(item)}
                    className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                >
                    <Share2 size={18} /> <span>WhatsApp</span>
                </button>
                <button 
                    onClick={() => onDelete(item.id)}
                    className="w-12 bg-dark-700 hover:bg-red-900/20 text-red-400 border border-dark-600 rounded-lg flex items-center justify-center transition-all"
                    aria-label="Excluir"
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
