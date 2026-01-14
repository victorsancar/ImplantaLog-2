import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Save, X, Camera, MapPin, Signal, Wrench, Trash2, Share2 } from 'lucide-react';

// --- 1. DEFINIÇÃO DOS DADOS (TYPES) ---
interface Deployment {
  id: string;
  createdAt: number;
  type?: string;
  serviceId: string;
  address: string;
  responsible: string;
  date: string;
  time: string;
  
  // Produção
  towers: number;
  floors: string | number;
  apartments: string | number;
  cdoe: string | number;
  
  // Sinais
  signal: string;
  hasSignal: boolean;
  hasHubBox: boolean;
  
  // MATERIAIS (NOVOS)
  cableSource?: string;
  cableUsed?: number;
  connectors?: number;
  anchors?: number;

  // Status
  status: string;
  notes?: string;
  facilities?: string;
  team?: string;
  photo?: string;
}

type UserRole = 'AUXILIAR' | 'OFICIAL';
type ViewState = 'DASHBOARD' | 'LIST' | 'FORM';

const STATUS_OPTIONS = [
  { value: 'IMPLANTADO', label: 'Implantado OK' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

// --- 2. COMPONENTE: FORMULÁRIO ---
const DeploymentForm = ({ onSave, onCancel }: { onSave: (data: any) => void, onCancel: () => void }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Deployment>>({
    type: 'IMPLANTAÇÃO',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    hasSignal: true,
    hasHubBox: false,
    towers: 1, cdoe: 0, floors: 0, apartments: 0,
    cableSource: 'Rolo 100m', cableUsed: 0, connectors: 0, anchors: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-slate-800 min-h-screen pb-24">
      <div className="p-4 bg-slate-900 sticky top-0 z-10 flex justify-between items-center shadow-md">
        <h2 className="text-xl font-bold text-white">Nova OS</h2>
        <button onClick={onCancel} className="text-slate-400"><X /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* DADOS BÁSICOS */}
        <div className="space-y-3">
          <h3 className="text-sky-400 text-xs font-bold uppercase">Dados do Serviço</h3>
          <input name="serviceId" type="text" placeholder="ID da OS" inputMode="numeric" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          <input name="address" type="text" placeholder="Endereço Completo" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          <input name="responsible" type="text" placeholder="Nome do Responsável" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          <div className="grid grid-cols-2 gap-3">
            <input name="date" type="date" value={formData.date} className="bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
            <input name="time" type="time" value={formData.time} className="bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          </div>
        </div>

        {/* PRODUÇÃO */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <h3 className="text-sky-400 text-xs font-bold uppercase">Produção</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400">Torres</label><input name="towers" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><label className="text-xs text-slate-400">CDOE</label><input name="cdoe" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><label className="text-xs text-slate-400">Andares</label><input name="floors" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><label className="text-xs text-slate-400">Aptos</label><input name="apartments" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
          </div>
        </div>

        {/* MATERIAIS */}
        <div className="space-y-3 pt-4 border-t border-slate-700 bg-slate-900/30 p-3 rounded">
          <h3 className="text-sky-400 text-xs font-bold uppercase">Materiais Gastos</h3>
          <label className="text-xs text-slate-400">Origem do Cabo</label>
          <select name="cableSource" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange}>
            <option value="Rolo 100m">Rolo de 100m</option>
            <option value="Rolo 200m">Rolo de 200m</option>
            <option value="Rolo 300m">Rolo de 300m</option>
            <option value="Bobina 1000m">Bobina de 1000m</option>
            <option value="Bobina 2000m">Bobina de 2000m</option>
          </select>
          <div className="grid grid-cols-3 gap-3">
             <div><label className="text-xs text-slate-400">Metros</label><input name="cableUsed" type="number" placeholder="0" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
             <div><label className="text-xs text-slate-400">Conectores</label><input name="connectors" type="number" placeholder="0" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
             <div><label className="text-xs text-slate-400">Alças</label><input name="anchors" type="number" placeholder="0" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
          </div>
        </div>

        {/* FINALIZAÇÃO */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
           <input name="signal" type="text" placeholder="Sinal (ex: -19.00)" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
           <div className="flex gap-4">
             <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(formData.hasSignal)} onChange={(e) => handleCheckboxChange('hasSignal', e.target.checked)} className="accent-sky-500 w-5 h-5"/> Possui Sinal?</label>
             <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(formData.hasHubBox)} onChange={(e) => handleCheckboxChange('hasHubBox', e.target.checked)} className="accent-sky-500 w-5 h-5"/> Hub Box?</label>
           </div>
           <select name="status" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange}>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
           </select>
           <input name="facilities" type="text" placeholder="Facilidades (ex: Escada)" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
           <textarea name="team" placeholder="Equipe (Nome | RE)" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-20" onChange={handleChange}></textarea>
        </div>

        {/* FOTO */}
        <label className="block w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg border-2 border-dashed border-slate-500 text-center cursor-pointer">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
            <div className="flex flex-col items-center gap-2"><Camera className="w-8 h-8 text-sky-400" /><span>Tirar Foto</span></div>
        </label>
        {photoPreview && <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-slate-600" />}

        <button type="submit" className="w-full py-4 rounded-lg bg-sky-600 text-white font-bold text-lg shadow-lg flex justify-center items-center gap-2"><Save /> SALVAR</button>
      </form>
    </div>
  );
};

// --- 3. COMPONENTE: LISTA DE HISTÓRICO ---
const DeploymentList = ({ deployments, onDelete }: { deployments: Deployment[], onDelete: (id: string) => void }) => {
  const handleShare = async (deployment: Deployment) => {
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
*FACILIDADES:* ${deployment.facilities || '-'}
*EQUIPE:* ${deployment.team || '-'}
`.trim();

    const tryShare = async () => {
       if (navigator.share) {
        try {
            let filesArray: File[] = [];
            if (deployment.photo) {
                const res = await fetch(deployment.photo);
                const blob = await res.blob();
                const file = new File([blob], `os_${deployment.serviceId}.jpg`, { type: 'image/jpeg' });
                filesArray = [file];
            }
            if (filesArray.length > 0 && navigator.canShare && navigator.canShare({ files: filesArray })) {
                await navigator.share({ text: text, files: filesArray });
            } else {
                await navigator.share({ text: text, title: "Relatório" });
            }
        } catch (e) { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
       } else { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
    };
    tryShare();
  };

  if (deployments.length === 0) return <div className="text-center p-10 text-slate-500">Nenhum registro.</div>;

  return (
    <div className="space-y-4 pb-24">
      {deployments.map((item) => (
        <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
          <div className={`p-3 flex justify-between items-center ${item.hasSignal ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
            <h3 className="font-bold text-white">OS: {item.serviceId}</h3>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.hasSignal ? 'text-green-400 bg-green-900/50' : 'text-red-400 bg-red-900/50'}`}>{item.hasSignal ? 'SINAL OK' : 'SEM SINAL'}</span>
          </div>
          <div className="p-4 space-y-3">
             <div className="flex items-center gap-2 text-sm text-slate-300"><MapPin size={16} className="text-sky-400"/> {item.address}</div>
             <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-600"><div className="text-xs text-slate-500 flex gap-1"><Signal size={12}/> TORRES</div><div className="text-lg font-mono">{item.towers}</div></div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-600"><div className="text-xs text-slate-500 flex gap-1"><Wrench size={12}/> CABO</div><div className="text-sm font-mono">{item.cableUsed || 0}m</div></div>
             </div>
             <div className="text-xs text-slate-400 p-2 bg-slate-900/30 rounded">
                <p><strong>Materiais:</strong> {item.connectors} Conectores | {item.anchors} Alças</p>
                <p><strong>Status:</strong> {item.status}</p>
             </div>
             {item.photo && <img src={item.photo} className="w-full h-32 object-cover rounded border border-slate-600 mt-2" />}
             <div className="flex gap-3 mt-4 pt-3 border-t border-slate-700">
                <button onClick={() => handleShare(item)} className="flex-1 bg-green-600 py-2 rounded text-white text-sm font-bold flex justify-center items-center gap-2"><Share2 size={16}/> WhatsApp</button>
                <button onClick={() => onDelete(item.id)} className="w-12 bg-slate-700 py-2 rounded text-red-400 flex justify-center"><Trash2 size={16}/></button>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- 4. COMPONENTE: DASHBOARD ---
const Dashboard = ({ deployments, onAddNew, userRole }: any) => {
  const currentMonth = new Date().getMonth();
  const validTowers = deployments.reduce((acc: number, curr: Deployment) => {
    // Lógica simplificada: Conta tudo. Em produção, filtrar por data.
    return acc + (curr.hasSignal ? curr.towers : 0);
  }, 0);

  let prize = 0;
  if (validTowers >= 17 && validTowers <= 22) prize = validTowers * (userRole === 'AUXILIAR' ? 30 : 60);
  else if (validTowers >= 23) prize = validTowers * (userRole === 'AUXILIAR' ? 50 : 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700 shadow-lg">
           <div className="text-3xl font-bold text-sky-400">{validTowers}</div>
           <div className="text-xs text-slate-400 uppercase tracking-wider">Torres Válidas</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700 shadow-lg">
           <div className="text-3xl font-bold text-green-400">R$ {prize}</div>
           <div className="text-xs text-slate-400 uppercase tracking-wider">Prêmio Estimado</div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 p-6 rounded-xl border border-sky-700/50 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Vamos produzir?</h3>
        <p className="text-sky-200 text-sm mb-4">Registre suas ordens de serviço agora.</p>
        <button onClick={onAddNew} className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-sky-900/50 transition-transform active:scale-95">Nova Implantação</button>
      </div>
    </div>
  );
};

// --- 5. APP PRINCIPAL ---
const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('AUXILIAR');

  useEffect(() => {
    const saved = localStorage.getItem('netbonus_deployments');
    if (saved) setDeployments(JSON.parse(saved));
  }, []);

  useEffect(() => { localStorage.setItem('netbonus_deployments', JSON.stringify(deployments)); }, [deployments]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col">
      {view !== 'FORM' && (
        <header className="bg-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center border-b border-slate-700">
          <h1 className="font-bold text-lg text-white tracking-tight">NetBonus</h1>
          <button onClick={() => setUserRole(prev => prev === 'AUXILIAR' ? 'OFICIAL' : 'AUXILIAR')} className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">{userRole}</button>
        </header>
      )}

      <main className={`flex-1 p-4 ${view === 'FORM' ? 'p-0' : ''}`}>
        {view === 'DASHBOARD' && <Dashboard deployments={deployments} onAddNew={() => setView('FORM')} userRole={userRole} />}
        {view === 'LIST' && <DeploymentList deployments={deployments} onDelete={(id) => setDeployments(prev => prev.filter(d => d.id !== id))} />}
        {view === 'FORM' && <DeploymentForm onSave={(data) => { setDeployments(prev => [{...data, id: crypto.randomUUID(), createdAt: Date.now()}, ...prev]); setView('DASHBOARD'); }} onCancel={() => setView('DASHBOARD')} />}
      </main>

      {view !== 'FORM' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800 border-t border-slate-700 px-6 py-3 flex justify-between items-center z-20">
          <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' ? 'text-sky-400' : 'text-slate-500'}`}><Home className="w-6 h-6" /><span className="text-[10px]">Início</span></button>
          <button onClick={() => setView('FORM')} className="bg-sky-600 text-white p-4 rounded-full -mt-12 shadow-lg border-4 border-slate-900"><Plus className="w-8 h-8" /></button>
          <button onClick={() => setView('LIST')} className={`flex flex-col items-center gap-1 ${view === 'LIST' ? 'text-sky-400' : 'text-slate-500'}`}><List className="w-6 h-6" /><span className="text-[10px]">Histórico</span></button>
        </nav>
      )}
    </div>
  );
};

export default App;
