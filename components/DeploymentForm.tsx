import React, { useState, useRef } from 'react';
import { Camera, Save, X } from 'lucide-react';
import { Deployment } from '../types';

interface DeploymentFormProps {
  onSave: (data: Omit<Deployment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const DeploymentForm: React.FC<DeploymentFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    serviceId: '',
    address: '',
    responsible: '',
    executionDate: new Date().toISOString().split('T')[0], // Hoje
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
    photoUrl: '' // Campo importante!
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Manipula mudanças nos inputs de texto/número
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Tratamento especial para checkboxes e números
    let finalValue: any = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // Manipula a foto (Converte para Base64)
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Cria preview imediato
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Converte para Base64 para salvar no JSON
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Envia os dados para o App.tsx salvar
    onSave(formData);
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
        
        {/* Seção 1: Dados do Serviço */}
        <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Dados do Serviço</h3>
          
          <div>
            <label className="block text-slate-400 text-xs mb-1">ID do Serviço / OS</label>
            <input
              type="text"
              name="serviceId"
              required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              placeholder="Ex: 123456"
              value={formData.serviceId}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Endereço</label>
            <input
              type="text"
              name="address"
              required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              placeholder="Rua, Número, Bairro"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Responsável</label>
            <input
              type="text"
              name="responsible"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              value={formData.responsible}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Data</label>
              <input
                type="date"
                name="executionDate"
                required
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                value={formData.executionDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Hora</label>
              <input
                type="time"
                name="executionTime"
                required
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                value={formData.executionTime}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Produção Técnica */}
        <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Métricas Técnicas</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Qtd. Torres</label>
              <input
                type="number"
                name="towerCount"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 outline-none font-bold text-lg text-center"
                value={formData.towerCount}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Sinal (dB)</label>
              <input
                type="text" // Texto para permitir "-19.00"
                name="signalStrength"
                placeholder="-00.00"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 outline-none text-center"
                value={formData.signalStrength}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Andares</label>
              <input type="number" name="floorCount" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white" value={formData.floorCount} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Aptos</label>
              <input type="number" name="apartmentCount" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white" value={formData.apartmentCount} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">CDOE</label>
              <input type="number" name="cdoeCount" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white" value={formData.cdoeCount} onChange={handleChange} />
            </div>
          </div>

          {/* Checkboxes / Selects */}
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 bg-slate-900 p-3 rounded-lg border border-slate-600 flex-1 justify-center cursor-pointer">
              <input
                type="checkbox"
                name="hasHubBox"
                checked={formData.hasHubBox}
                onChange={handleChange}
                className="w-5 h-5 accent-blue-500"
              />
              <span className="text-sm text-slate-300">Hub Box</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-900 p-3 rounded-lg border border-slate-600 flex-1 justify-center cursor-pointer">
              <input
                type="checkbox"
                name="hasSignal"
                checked={formData.hasSignal}
                onChange={handleChange}
                className="w-5 h-5 accent-green-500"
              />
              <span className="text-sm text-slate-300">Tem Sinal</span>
            </label>
          </div>
        </div>

        {/* Seção 3: Finalização e Foto */}
        <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Finalização</h3>
          
          <div>
            <label className="block text-slate-400 text-xs mb-1">Facilidades Utilizadas</label>
            <input
              type="text"
              name="facilities"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
              placeholder="Ex: Nenhuma"
              value={formData.facilities}
              onChange={handleChange}
            />
          </div>

          {/* Botão de Câmera */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 hover:border-slate-500 transition-colors mt-4"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-40 object-contain rounded-lg" />
            ) : (
              <>
                <Camera size={40} className="text-slate-400 mb-2" />
                <span className="text-slate-400 text-sm">Toque para adicionar foto</span>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment" // Abre a câmera traseira no celular
              onChange={handlePhotoCapture}
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <button 
          type="submit"
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/50 flex items-center justify-center gap-2 text-lg mt-6"
        >
          <Save size={24} />
          SALVAR REGISTRO
        </button>

      </form>
    </div>
  );
};

export default DeploymentForm;
