import React, { useState, useRef } from 'react';
import { Camera, Save, X, Loader2 } from 'lucide-react';
import { Deployment } from '../types';

interface DeploymentFormProps {
  onSave: (data: Omit<Deployment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const DeploymentForm: React.FC<DeploymentFormProps> = ({ onSave, onCancel }) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    address: '',
    responsible: '',
    executionDate: new Date().toISOString().split('T')[0],
    executionTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    towerCount: 0,
    floorCount: 0,
    apartmentCount: 0,
    cdoeCount: 0,
    signalStrength: '',
    hasHubBox: false,
    hasSignal: true,
    status: 'IMPLANTADO',
    notes: '',
    facilities: '',
    team: '',
    photoUrl: '' 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;
    else if (type === 'number') finalValue = Number(value);
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // --- COMPRESSÃO DE IMAGEM OTIMIZADA PARA PWA ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // 800px é perfeito: dá zoom bom e fica leve (kb)
          const MAX_WIDTH = 800; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Qualidade 0.7 (70%) - Ótimo para 4G
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
      };
    });
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, photoUrl: compressedBase64 }));
      } catch (error) {
        alert("Erro ao processar foto.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        onSave(formData);
    } catch (error) {
        alert("Memória cheia! Tente excluir itens antigos do histórico.");
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen pb-20">
      <div className="bg-slate-800 p-4 sticky top-0 z-10 border-b border-slate-700 flex justify-between items-center shadow-md">
        <h2 className="text-white font-bold text-lg">Nova Implantação</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
          <h3 className="text-blue-400 text-xs font-bold uppercase mb-2">Dados do Serviço</h3>
          <div>
            <label className="text-slate-400 text-xs">ID / OS</label>
            <input type="text" name="serviceId" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" value={formData.serviceId} onChange={handleChange} />
          </div>
          <div>
            <label className="text-slate-400 text-xs">Endereço</label>
            <input type="text" name="address" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" value={formData.address} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <input type="date" name="executionDate" required className="bg-slate-900 border border-slate-600 rounded p-3 text-white" value={formData.executionDate} onChange={handleChange} />
             <input type="time" name="executionTime" required className="bg-slate-900 border border-slate-600 rounded p-3 text-white" value={formData.executionTime} onChange={handleChange} />
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
          <h3 className="text-green-400 text-xs font-bold uppercase mb-2">Produção</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs">Qtd. Torres</label>
              <input type="number" name="towerCount" className="w-full bg-slate-900 border-green-500 border rounded p-3 text-white font-bold text-center" value={formData.towerCount} onChange={handleChange} />
            </div>
            <div>
              <label className="text-slate-400 text-xs">Sinal (dB)</label>
              <input type="text" name="signalStrength" className="w-full bg-slate-900 border-slate-600 border rounded p-3 text-white text-center" value={formData.signalStrength} onChange={handleChange} />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
             <label className="flex items-center gap-2 bg-slate-900 p-3 rounded-lg flex-1 justify-center"><input type="checkbox" name="hasSignal" checked={formData.hasSignal} onChange={handleChange} /> <span className="text-slate-300 text-sm">Tem Sinal</span></label>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-purple-400 text-xs font-bold uppercase mb-2">Evidência (Foto)</h3>
          
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 mt-2">
            {isCompressing ? (
                <div className="flex flex-col items-center text-yellow-400">
                    <Loader2 className="animate-spin mb-2" />
                    <span>Processando...</span>
                </div>
            ) : formData.photoUrl ? (
              <img src={formData.photoUrl} alt="Preview" className="h-40 object-contain rounded-lg" />
            ) : (
              <>
                <Camera size={40} className="text-slate-400 mb-2" />
                <span className="text-slate-400 text-sm">Toque para FOTO</span>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handlePhotoCapture} />
          </div>
        </div>

        <button type="submit" disabled={isCompressing} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg mt-6">
          <Save size={24} /> {isCompressing ? 'AGUARDE...' : 'SALVAR'}
        </button>
      </form>
    </div>
  );
};

export default DeploymentForm;
