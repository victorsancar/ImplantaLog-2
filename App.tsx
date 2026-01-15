import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Save, X, Camera, MapPin, Signal, Wrench, Trash2, Share2 } from 'lucide-react';

// --- DEFINIÇÃO DOS DADOS ---
interface Deployment {
  id: string;
  createdAt: number;
  type?: string;
  serviceId: string;
  address: string;
  responsible: string;
  date: string;
  time: string;
  towers: number;
  floors: string | number;
  apartments: string | number;
  cdoe: string | number;
  signal: string;
  hasSignal: boolean;
  hasHubBox: boolean;
  // NOVOS CAMPOS DE MATERIAIS
  cableSource?: string;
  cableUsed?: number;
  connectors?: number;
  anchors?: number;
  status: string;
  notes?: string;
  facilities?: string;
  team?: string;
  photo?: string;
}

const STATUS_OPTIONS = [
  { value: 'IMPLANTADO', label: 'Implantado OK' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

// --- COMPONENTE: FORMULÁRIO ---
const DeploymentForm = ({ onSave, onCancel }: any) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Deployment>>({
    type: 'IMPLANTAÇÃO',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    hasSignal: true, hasHubBox: false,
    towers: 1, cdoe: 0, floors: 0, apartments: 0,
    cableSource: 'Rolo 100m', cableUsed: 0, connectors: 0, anchors: 0
  });

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handlePhotoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-800 min-h-screen pb-24">
      <div className="p-4 bg-slate-900 sticky top-0 z-10 flex justify-between items-center shadow-md">
        <h2 className="text-xl font-bold text-white">Nova OS</h2>
        <button onClick={onCancel} className="text-slate-400"><X /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-6">
        
        {/* DADOS */}
        <div className="space-y-3">
          <h3 className="text-sky-400 text-xs font-bold uppercase">Serviço</h3>
          <input name="serviceId" placeholder="ID da OS" inputMode="numeric" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          <input name="address" placeholder="Endereço" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          <input name="responsible" placeholder="Responsável" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          <div className="grid grid-cols-2 gap-3">
             <input name="date" type="date" value={formData.date} className="bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
             <input name="time" type="time" value={formData.time} className="bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          </div>
        </div>

        {/* PRODUÇÃO & MATERIAIS */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <h3 className="text-sky-400 text-xs font-bold uppercase">Produção</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400">Torres</label><input name="towers" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><label className="text-xs text-slate-400">CDOE</label><input name="cdoe" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
          </div>
          
          <div className="bg-slate-900/50 p-3 rounded mt-3 border border-slate-700">
             <label className="text-xs text-sky-400 font-bold uppercase mb-2 block">Materiais Utilizados</label>
             <select name="cableSource" className="w-full bg-slate-800 border border-slate-600 rounded p-3 mb-2 text-white" onChange={handleChange}>
                <option value="Rolo 100m">Rolo de 100m</option>
                <option value="Rolo 200m">Rolo de 200m</option>
                <option value="Bobina 1000m">Bobina 1000m</option>
             </select>
             <div className="grid grid-cols-3 gap-2">
                <div><label className="text-[10px] text-slate-400">Metros</label><input name="cableUsed" type="number" placeholder="0" className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" onChange={handleChange} /></div>
                <div><label className="text-[10px] text-slate-400">Conect.</label><input name="connectors" type="number" placeholder="0" className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" onChange={handleChange} /></div>
                <div><label className="text-[10px] text-slate-400">Alças</label><input name="anchors" type="number" placeholder="0" className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" onChange={handleChange} /></div>
             </div>
          </div>
        </div>

        {/* STATUS & FOTO */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
           <input name="signal" placeholder="Sinal (dB)" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
           <div className="flex gap-4 text-sm">
             <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(formData.hasSignal)} onChange={(e) => setFormData(p => ({...p, hasSignal: e.target.checked}))} className="accent-sky-500 w-5 h-5"/> Com Sinal</label>
             <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(formData.hasHubBox)} onChange={(e) => setFormData(p => ({...p, hasHubBox: e.target.checked}))} className="accent-sky-500 w-5 h-5"/> Hub Box</label>
           </div>
           <select name="status" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange}>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
           </select>
           <textarea name="team" placeholder="Equipe (Nome | RE)" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-20" onChange={handleChange}></textarea>
        </div>

        <label className="block w-full bg-slate-700 p-4 rounded-lg border-2 border-dashed border-slate-500 text-center cursor-pointer">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
            <div className="flex flex-col items-center gap-2"><Camera className="text-sky-400" /><span>Tirar Foto</span></div>
        </label>
        {photoPreview && <img src={photoPreview} className="w-full h-48 object-cover rounded-lg" />}

        <button type="submit" className="w-full py-4 rounded-lg bg-sky-600 text-white font-bold text-lg shadow-lg flex justify-center items-center gap-2"><Save /> SALVAR</button>
      </form>
    </div>
  );
};

// --- COMPONENTE: LISTA ---
const DeploymentList = ({ deployments, onDelete }: any) => {
  const handleShare = async (d: Deployment) => {
    const text = `*RELATÓRIO NETBONUS*\nOS: ${d.serviceId}\nEND: ${d.address}\nDATA: ${d.date}\n---\nTORRES: ${d.towers}\nCABO: ${d.cableUsed || 0}m (${d.cableSource})\nCONECTORES: ${d.connectors || 0}\nALÇAS: ${d.anchors || 0}\nSINAL: ${d.signal} (${d.hasSignal ? 'OK' : 'SEM'})\n---\nSTATUS: ${d.status}\nEQUIPE: ${d.team || '-'}`;
    
    if (navigator.share) {
        try {
            let filesArray: File[] = [];
            if (d.photo) {
                const res = await fetch(d.photo);
                const blob = await res.blob();
                filesArray = [new File([blob], "relatorio.jpg", { type: 'image/jpeg' })];
            }
            if (filesArray.length && navigator.canShare({ files: filesArray })) await navigator.share({ text, files: filesArray });
            else await navigator.share({ text });
        } catch (e) { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
    } else { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
  };

  if (!deployments.length) return <div className="text-center p-10 text-slate-500">Sem registros.</div>;

  return (
    <div className="space-y-4 pb-24">
      {deployments.map((item: any) => (
        <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
          <div className={`p-3 flex justify-between ${item.hasSignal ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
            <h3 className="font-bold text-white">OS: {item.serviceId}</h3>
            <span className="text-xs font-bold text-slate-300">{item.date}</span>
          </div>
          <div className="p-4 space-y-2">
             <div className="flex gap-2 text-sm text-slate-300"><MapPin size={16} className="text-sky-400"/> {item.address}</div>
             <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-600"><div className="text-xs text-slate-500">TORRES</div><div className="text-lg font-mono text-white">{item.towers}</div></div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-600"><div className="text-xs text-slate-500">CABO</div><div className="text-sm font-mono text-white">{item.cableUsed || 0}m</div></div>
             </div>
             <div className="text-xs text-slate-400 p-2 bg-slate-900/50 rounded border border-slate-700">
                Materiais: {item.connectors} Conectores, {item.anchors} Alças
             </div>
             {item.photo && <img src={item.photo} className="w-full h-32 object-cover rounded mt-2" />}
             <div className="flex gap-3 mt-4 pt-3 border-t border-slate-700">
                <button onClick={() => handleShare(item)} className="flex-1 bg-green-600 py-2 rounded text-white font-bold flex justify-center gap-2"><Share2 size={16}/> WhatsApp</button>
                <button onClick={() => onDelete(item.id)} className="w-12 bg-slate-700 py-2 rounded text-red-400 flex justify-center"><Trash2 size={16}/></button>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- APP PRINCIPAL ---
const App = () => {
  const [view, setView] = useState('DASHBOARD');
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [role, setRole] = useState('AUXILIAR');

  useEffect(() => {
    const saved = localStorage.getItem('netbonus_deployments');
    if (saved) setDeployments(JSON.parse(saved));
  }, []);

  useEffect(() => { localStorage.setItem('netbonus_deployments', JSON.stringify(deployments)); }, [deployments]);

  // Cálculo de Prêmio
  const totalTowers = deployments.reduce((acc, curr) => acc + (curr.hasSignal ? curr.towers : 0), 0);
  let prize = 0;
  if (totalTowers >= 17 && totalTowers <= 22) prize = totalTowers * (role === 'AUXILIAR' ? 30 : 60);
  else if (totalTowers >= 23) prize = totalTowers * (role === 'AUXILIAR' ? 50 : 100);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans max-w-md mx-auto shadow-2xl relative flex flex-col">
      {view !== 'FORM' && (
        <header className="bg-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center border-b border-slate-700">
          <h1 className="font-bold text-lg text-white">NetBonus</h1>
          <button onClick={() => setRole(r => r === 'AUXILIAR' ? 'OFICIAL' : 'AUXILIAR')} className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700 border border-slate-600">{role}</button>
        </header>
      )}

      <main className={`flex-1 p-4 ${view === 'FORM' ? 'p-0' : ''}`}>
        {view === 'DASHBOARD' && (
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700"><div className="text-3xl font-bold text-sky-400">{totalTowers}</div><div className="text-xs text-slate-400 uppercase">Torres</div></div>
                <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700"><div className="text-3xl font-bold text-green-400">R$ {prize}</div><div className="text-xs text-slate-400 uppercase">Prêmio</div></div>
             </div>
             <button onClick={() => setView('FORM')} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg">NOVA IMPLANTAÇÃO</button>
          </div>
        )}
        {view === 'LIST' && <DeploymentList deployments={deployments} onDelete={(id: string) => setDeployments(p => p.filter(d => d.id !== id))} />}
        {view === 'FORM' && <DeploymentForm onSave={(data: any) => { setDeployments(p => [{...data, id: crypto.randomUUID(), createdAt: Date.now()}, ...p]); setView('DASHBOARD'); }} onCancel={() => setView('DASHBOARD')} />}
      </main>

      {view !== 'FORM' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800 border-t border-slate-700 px-6 py-3 flex justify-between items-center z-20">
          <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' ? 'text-sky-400' : 'text-slate-500'}`}><Home className="w-6 h-6" /><span className="text-[10px]">Início</span></button>
          <button onClick={() => setView('FORM')} className="bg-sky-600 text-white p-3 rounded-full -mt-12 shadow-lg border-4 border-slate-900"><Plus className="w-8 h-8" /></button>
          <button onClick={() => setView('LIST')} className={`flex flex-col items-center gap-1 ${view === 'LIST' ? 'text-sky-400' : 'text-slate-500'}`}><List className="w-6 h-6" /><span className="text-[10px]">Histórico</span></button>
        </nav>
      )}
    </div>
  );
};

export default App;
