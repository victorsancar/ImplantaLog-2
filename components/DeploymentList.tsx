import React from 'react';
import { Deployment } from '../types';
import { SignalIcon, AlertIcon, TrashIcon, ShareIcon, CameraIcon } from './ui/Icons';
import { dataURLtoFile } from '../utils/calculations';

interface DeploymentListProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

const DeploymentList: React.FC<DeploymentListProps> = ({ deployments, onDelete }) => {
  
  const sortedDeployments = [...deployments].sort((a, b) => {
    return new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime();
  });

  const handleShare = async (item: Deployment) => {
    // 1. Format String exactly as requested
    const text = `
TIPO: ${item.type}
ID: ${item.serviceId}
Endereço: ${item.address}
Responsável: ${item.responsible || 'N/D'}
HORÁRIO: ${item.executionTime}
DATA: ${item.executionDate.split('-').reverse().join('/')}
----------------
PRODUÇÃO:
QUANT Torres: ${item.towerCount}
QUANT andar: ${item.floorCount}
Apartamentos: ${item.apartmentCount}
QUANT CDOE: ${item.cdoeCount}
SINAL: ${item.signalStrength}
POSSUI HUB BOX: ${item.hasHubBox ? 'SIM' : 'NÃO'}
POSSUI SINAL: ${item.hasSignal ? 'SIM' : 'NÃO'}
----------------
COMENTÁRIO: ${item.comments || 'Sem obs'}
STATUS: ${item.statusFinal}
FACILIDADES: ${item.facilities || 'N/A'}
EXECUTANTES: ${item.teamMember1 || ''} / ${item.teamMember2 || ''}
`.trim();

    // 2. Prepare Data
    const shareData: ShareData = {
        title: `Relatório OS ${item.serviceId}`,
        text: text
    };

    // 3. Handle File Conversion for Sharing
    try {
        if (item.photoUrl && navigator.canShare) {
            // Convert Base64 back to Blob/File
            const file = dataURLtoFile(item.photoUrl, `OS_${item.serviceId}.jpg`);
            
            // Check if browser supports file sharing
            if (navigator.canShare({ files: [file] })) {
                shareData.files = [file];
            }
        }
        
        await navigator.share(shareData);
        
    } catch (err) {
        console.warn("Share API error or cancelled:", err);
        // Fallback: Copy to clipboard if sharing fails (optional UX improvement)
        try {
            await navigator.clipboard.writeText(text);
            alert("Texto copiado para a área de transferência (Envio de imagem falhou ou não suportado).");
        } catch (clipboardErr) {
            alert("Não foi possível compartilhar.");
        }
    }
  };

  if (sortedDeployments.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <p>Nenhum registro encontrado.</p>
          </div>
      )
  }

  return (
    <div className="space-y-4 pb-20">
      {sortedDeployments.map(item => (
        <div key={item.id} className="bg-dark-800 rounded-xl p-4 shadow-sm border border-dark-700 relative group">
          <div className="flex justify-between items-start">
            <div>
               <div className="flex items-center gap-2 mb-1">
                   <span className="text-xs font-bold text-brand-400 bg-brand-900/50 px-2 py-0.5 rounded border border-brand-800">
                       {new Date(item.executionDate).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}
                   </span>
                   <span className="text-xs text-slate-400">ID: {item.serviceId}</span>
               </div>
               <h3 className="font-semibold text-slate-200 line-clamp-1">{item.address}</h3>
               <p className="text-xs text-slate-500 line-clamp-1">{item.responsible}</p>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                    <span className="font-bold text-lg text-white">{item.towerCount}</span>
                    <span className="text-xs text-slate-400">Torres</span>
                </div>
                {item.hasSignal ? (
                    <div className="flex items-center text-green-400 text-xs gap-1">
                        <SignalIcon className="w-3 h-3" />
                        <span>Com Sinal</span>
                    </div>
                ) : (
                    <div className="flex items-center text-red-400 text-xs gap-1 font-medium">
                        <AlertIcon className="w-3 h-3" />
                        <span>Sem Sinal</span>
                    </div>
                )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-dark-700 flex justify-between items-center">
              <div className="flex gap-2">
                 <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                    item.statusFinal === 'IMPLANTADO' ? 'bg-green-900/30 text-green-400 border-green-800' :
                    item.statusFinal === 'PENDENTE' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' :
                    'bg-red-900/30 text-red-400 border-red-800'
                }`}>
                    {item.statusFinal}
                </span>
                {item.photoUrl && (
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 flex items-center gap-1">
                        <CameraIcon className="w-3 h-3" /> Foto
                    </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                    onClick={() => handleShare(item)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
                >
                    <ShareIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">Compartilhar</span>
                </button>

                <div className="w-px h-4 bg-dark-600 mx-1"></div>

                <button 
                    onClick={() => {
                        if(window.confirm('Tem certeza que deseja excluir?')) onDelete(item.id);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeploymentList;