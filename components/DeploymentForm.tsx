import React, { useState } from 'react';
import { Deployment } from '../types';
import { STATUS_OPTIONS } from '../constants';
import { CameraIcon, TrashIcon } from './ui/Icons';
import { resizeImage } from '../utils/calculations';

interface DeploymentFormProps {
  onSave: (data: Omit<Deployment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const DeploymentForm: React.FC<DeploymentFormProps> = ({ onSave, onCancel }) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [formData, setFormData] = useState({
    type: 'IMPLANTAÇÃO',
    serviceId: '',
    address: '',
    responsible: '',
    executionDate: new Date().toISOString().split('T')[0],
    executionTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    
    // Technical Metrics
    towerCount: 1,
    floorCount: 0,
    apartmentCount: 0,
    cdoeCount: 0,
    signalStrength: -19.00,
    hasHubBox: false,
    hasSignal: true,
    facilities: '',
    
    // Team
    teamMember1: '',
    teamMember2: '',
    
    statusFinal: 'IMPLANTADO' as const,
    comments: '',
    photoUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
       setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'hasSignal' || name === 'hasHubBox') {
        // Handle Select for Boolean if using select
        setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else if (type === 'number') {
       setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsCompressing(true);
      try {
        const file = e.target.files[0];
        const resizedBase64 = await resizeImage(file, 600); // Slightly larger for better readability
        setFormData(prev => ({ ...prev, photoUrl: resizedBase64 }));
      } catch (err) {
        alert("Erro ao processar imagem");
        console.error(err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 bg-dark-900 min-h-screen text-slate-100">
      <div className="bg-dark-800 p-4 sticky top-0 z-10 border-b border-dark-700 flex justify-between items-center shadow-md">
        <h2 className="text-lg font-bold text-white">Nova Implantação</h2>
        <button type="button" onClick={onCancel} className="text-slate-400 font-medium hover:text-white">Cancelar</button>
      </div>

      <div className="px-4 space-y-6 pt-4">
        {/* Section 1: Dados do Serviço */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wide border-b border-dark-700 pb-1">Dados do Serviço</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">ID Serviço</label>
              <input 
                required
                type="number" 
                name="serviceId" 
                value={formData.serviceId} 
                onChange={handleChange}
                className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="Ex: 12345"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
              <input 
                readOnly
                type="text" 
                name="type" 
                value={formData.type} 
                className="w-full rounded-lg bg-dark-700 border-dark-600 border p-2 text-sm text-slate-400 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Endereço Completo</label>
            <input 
              required
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="Rua, Número, Bairro"
            />
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">Responsável</label>
             <input 
              type="text" 
              name="responsible" 
              value={formData.responsible} 
              onChange={handleChange}
              className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Data Execução</label>
              <input 
                required
                type="date" 
                name="executionDate" 
                value={formData.executionDate} 
                onChange={handleChange}
                className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                style={{colorScheme: 'dark'}}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Horário</label>
              <input 
                type="time" 
                name="executionTime" 
                value={formData.executionTime} 
                onChange={handleChange}
                className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                style={{colorScheme: 'dark'}}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Métricas Técnicas (Grid Layout) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wide border-b border-dark-700 pb-1">Dados Técnicos</h3>
          
          <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
             <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-white">Quant. Torres</label>
                <input 
                    required
                    type="number" 
                    name="towerCount" 
                    min="0"
                    value={formData.towerCount} 
                    onChange={handleChange}
                    className="w-24 text-center rounded-lg bg-dark-900 border-brand-700 border p-2 text-xl font-bold text-brand-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
             </div>
             
             {/* SINAL SELECT - VISUAL HIGHLIGHT */}
             <div className={`flex items-center justify-between p-3 rounded-lg border ${!formData.hasSignal ? 'bg-red-900/20 border-red-700' : 'bg-dark-900 border-dark-600'}`}>
                <label className={`block text-sm font-bold ${!formData.hasSignal ? 'text-red-400' : 'text-slate-300'}`}>
                    POSSUI SINAL?
                </label>
                <select 
                    name="hasSignal" 
                    value={String(formData.hasSignal)} 
                    onChange={handleChange}
                    className={`rounded-lg border p-1 text-sm font-bold focus:outline-none ${
                        !formData.hasSignal 
                        ? 'bg-red-900 text-red-100 border-red-500' 
                        : 'bg-green-900 text-green-100 border-green-500'
                    }`}
                >
                    <option value="true">SIM</option>
                    <option value="false">NÃO</option>
                </select>
             </div>
             {!formData.hasSignal && (
                 <p className="text-xs text-red-400 mt-2 font-bold text-center animate-pulse">
                    ⚠ IMPLANTAÇÃO SEM SINAL NÃO CONTA PARA META
                 </p>
             )}
          </div>

          {/* Grid Layout for Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Quant. Andar</label>
                <input type="number" name="floorCount" value={formData.floorCount} onChange={handleChange} className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Quant. Aptos</label>
                <input type="number" name="apartmentCount" value={formData.apartmentCount} onChange={handleChange} className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Quant. CDOE</label>
                <input type="number" name="cdoeCount" value={formData.cdoeCount} onChange={handleChange} className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white" />
            </div>
            <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1">Sinal (dB)</label>
                 <input 
                   type="number" 
                   step="0.01"
                   name="signalStrength" 
                   value={formData.signalStrength} 
                   onChange={handleChange}
                   className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white"
                 />
            </div>
          </div>

          <div className="flex items-center justify-between bg-dark-800 p-3 rounded-lg border border-dark-700">
             <label className="block text-sm font-medium text-slate-300">Possui Hub Box?</label>
             <select 
                name="hasHubBox" 
                value={String(formData.hasHubBox)} 
                onChange={handleChange}
                className="bg-dark-900 text-white border border-dark-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-brand-500"
            >
                <option value="true">SIM</option>
                <option value="false">NÃO</option>
            </select>
          </div>
          
           <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Facilidades Utilizadas</label>
            <input 
              type="text" 
              name="facilities" 
              value={formData.facilities} 
              onChange={handleChange}
              className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white"
              placeholder="Ex: Escada, Chaves..."
            />
          </div>
        </div>

        {/* Section: Executantes */}
        <div className="space-y-4 pt-2">
           <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wide border-b border-dark-700 pb-1">Equipe</h3>
           <div className="grid grid-cols-1 gap-3">
               <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Nome Executante 1 / RE</label>
                   <input 
                      type="text" 
                      name="teamMember1" 
                      value={formData.teamMember1} 
                      onChange={handleChange} 
                      className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white"
                    />
               </div>
               <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Nome Executante 2 / RE</label>
                   <input 
                      type="text" 
                      name="teamMember2" 
                      value={formData.teamMember2} 
                      onChange={handleChange} 
                      className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white"
                    />
               </div>
           </div>
        </div>

        {/* Section: Foto do Serviço */}
        <div className="space-y-4 pt-2">
           <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wide border-b border-dark-700 pb-1">Foto do Serviço</h3>
           
           {!formData.photoUrl ? (
             <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dark-600 border-dashed rounded-lg cursor-pointer bg-dark-800 hover:bg-dark-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CameraIcon className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-400"><span className="font-semibold">Tirar Foto</span></p>
                    <p className="text-[10px] text-slate-500">Câmera Traseira</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
             </label>
           ) : (
             <div className="relative w-full rounded-lg overflow-hidden border border-dark-600 bg-black">
                <img src={formData.photoUrl} alt="Preview" className="w-full h-48 object-contain" />
                <button 
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
             </div>
           )}
           {isCompressing && <p className="text-xs text-brand-400 text-center animate-pulse">Otimizando imagem...</p>}
        </div>

        {/* Section: Status Final */}
        <div className="space-y-4 pt-2 pb-6">
           <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wide border-b border-dark-700 pb-1">Conclusão</h3>
           
           <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
            <select 
                name="statusFinal" 
                value={formData.statusFinal} 
                onChange={handleChange}
                className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white"
            >
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
           </div>

           <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Comentário / OBS</label>
            <textarea 
              name="comments" 
              value={formData.comments} 
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg bg-dark-800 border-dark-700 border p-2 text-sm text-white"
              placeholder="Detalhes adicionais..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
            type="submit" 
            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-brand-500 transition-colors fixed bottom-4 left-4 right-4 w-[calc(100%-2rem)] z-50 uppercase tracking-wide"
        >
            Salvar Relatório
        </button>
      </div>
    </form>
  );
};

export default DeploymentForm;