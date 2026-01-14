import React, { useState } from 'react';
import { Save, X, Camera } from 'lucide-react';
import { Deployment } from '../types'; // Importando do types.ts na raiz
import { STATUS_OPTIONS } from '../constants'; 

interface DeploymentFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

const DeploymentForm: React.FC<DeploymentFormProps> = ({ onSave, onCancel }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Deployment>>({
    type: 'IMPLANTAÇÃO',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    hasSignal: true,
    hasHubBox: false,
    towers: 0,
    floors: 0,
    apartments: 0,
    cdoe: 0,
    // Valores padrão para materiais
    cableSource: 'Rolo 100m',
    cableUsed: 0,
    connectors: 0,
    anchors: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        setFormData(prev => ({ ...prev, photo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-slate-800 min-h-screen pb-20">
      <div className="p-4 border-b border-slate-700 bg-slate-900 sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Nova Implantação</h2>
        <button onClick={onCancel} className="text-slate-400"><X /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        
        {/* Seção 1: Dados do Serviço */}
        <div className="space-y-4">
          <h3 className="text-sky-400 text-xs font-bold uppercase tracking-wider">Dados do Serviço</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs text-slate-400 mb-1">ID (OS)</label>
              <input name="serviceId" type="text" inputMode="numeric" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Responsável</label>
              <input name="responsible" type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Endereço</label>
            <input name="address" type="text" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Data</label>
              <input name="date" type="date" value={formData.date} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Hora</label>
              <input name="time" type="time" value={formData.time} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Seção 2: Produção Técnica */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h3 className="text-sky-400 text-xs font-bold uppercase tracking-wider">Produção</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Qtd. Torres</label>
              <input name="towers" type="number" inputMode="numeric" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Qtd. CDOE</label>
              <input name="cdoe" type="number" inputMode="numeric" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-xs text-slate-400 mb-1">Andares</label>
              <input name="floors" type="number" inputMode="numeric" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Apartamentos</label>
              <input name="apartments" type="number" inputMode="numeric" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Seção 3: Materiais (AQUI ESTÃO OS CAMPOS NOVOS) */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h3 className="text-sky-400 text-xs font-bold uppercase tracking-wider">Materiais Utilizados</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Cabo 04 - Origem</label>
                <select name="cableSource" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange}>
                    <option value="Rolo 100m">Rolo de 100m</option>
                    <option value="Rolo 200m">Rolo de 200m</option>
                    <option value="Rolo 300m">Rolo de 300m</option>
                    <option value="Bobina 1000m">Bobina de 1000m</option>
                    <option value="Bobina 2000m">Bobina de 2000m</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Metros</label>
                <input name="cableUsed" type="number" inputMode="numeric" placeholder="0" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1">Conectores</label>
                <input name="connectors" type="number" inputMode="numeric" placeholder="0" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
             <div>
                <label className="block text-xs text-slate-400 mb-1">Alças</label>
                <input name="anchors" type="number" inputMode="numeric" placeholder="0" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Seção 4: Sinais e Status */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h3 className="text-sky-400 text-xs font-bold uppercase tracking-wider">Sinal e Status</h3>

           <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nível Sinal (dB)</label>
              <input name="signal" type="text" placeholder="-19.00" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
             <div className="flex flex-col gap-2 pt-6">
                 <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={Boolean(formData.hasSignal)} onChange={(e) => handleCheckboxChange('hasSignal', e.target.checked)} className="w-4 h-4 rounded accent-sky-500" />
                    Possui Sinal?
                 </label>
                 <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={Boolean(formData.hasHubBox)} onChange={(e) => handleCheckboxChange('hasHubBox', e.target.checked)} className="w-4 h-4 rounded accent-sky-500" />
                    Hub Box?
                 </label>
            </div>
          </div>

          <div>
             <label className="block text-xs text-slate-400 mb-1">Status Final</label>
             <select name="status" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange}>
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.label}>{opt.label}</option>
                ))}
             </select>
          </div>
        </div>

        {/* Seção 5: Extras */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
             <div>
              <label className="block text-xs text-slate-400 mb-1">Facilidades</label>
              <input name="facilities" type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500" onChange={handleChange} />
            </div>
             <div>
              <label className="block text-xs text-slate-400 mb-1">Observações</label>
              <textarea name="notes" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500 h-20" onChange={handleChange}></textarea>
            </div>
             <div>
              <label className="block text-xs text-slate-400 mb-1">Equipe (Nomes | RE)</label>
              <textarea name="team" placeholder="Técnico 1 | RE&#10;Técnico 2 | RE" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-sky-500 h-20" onChange={handleChange}></textarea>
            </div>
        </div>

        {/* Seção 6: Foto */}
        <div className="pt-4 border-t border-slate-700">
            <label className="block w-full cursor-pointer bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-lg border-2 border-dashed border-slate-600 text-center transition-all">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 text-sky-400" />
                    <span className="text-sm font-medium">Tirar Foto / Anexar</span>
                </div>
            </label>
            
            {photoPreview && (
                <div className="mt-4 relative rounded-lg overflow-hidden border border-slate-600">
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                    <button type="button" onClick={() => setPhotoPreview(null)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg">
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>

        {/* Botões Finais */}
        <div className="flex gap-3 pt-6">
            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800">
                Cancelar
            </button>
            <button type="submit" className="flex-1 py-3 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 shadow-lg flex items-center justify-center gap-2">
                <Save size={18} /> Salvar
            </button>
        </div>
      </form>
    </div>
  );
};

export default DeploymentForm;
