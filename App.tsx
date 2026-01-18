import React, { useState, useEffect, useRef } from 'react';
import { Home, List, Plus, Save, X, Camera, MapPin, Trash2, Share2, Loader2, Image as ImageIcon, Wrench } from 'lucide-react';

// --- DEFINIÇÃO DOS DADOS ---
interface Deployment {
  id: string;
  createdAt: number;
  serviceId: string;
  address: string;
  responsible: string;
  date: string;
  time: string;
  
  // Dados Técnicos
  towers: number;
  cdoe: number;
  floors: number;
  apartments: number;
  signal: string;
  hasSignal: boolean;
  hasHubBox: boolean;
  
  // MATERIAIS (NOVOS CAMPOS)
  cableSource?: string; // Qual rolo/bobina
  cableUsed?: number;   // Metros gastos
  connectors?: number;  // Quantidade
  anchors?: number;     // Quantidade

  status: string;
  team?: string;
  facilities?: string;
  notes?: string;
  photo?: string;
}

const STATUS_OPTIONS = [
  { value: 'IMPLANTADO', label: 'Implantado OK' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

// --- FORMULÁRIO ---
const DeploymentForm = ({ onSave, onCancel }: any) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Deployment>>({
    date: new Date().toLocaleDateString('pt-BR'),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    hasSignal: true, hasHubBox: false,
    towers: 1, cdoe: 0, floors: 0, apartments: 0,
    // Valores padrão dos materiais
    cableSource: 'Rolo de 100m', cableUsed: 0, connectors: 0, anchors: 0,
    address: '', status: 'IMPLANTADO OK'
  });

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("GPS desligado");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const addr = data.address ? `${data.address.road || ''}, ${data.address.suburb || ''} - ${data.address.city || ''}` : `Lat:${pos.coords.latitude}`;
          setFormData(p => ({ ...p, address: addr }));
        } catch { setFormData(p => ({ ...p, address: `GPS: ${pos.coords.latitude}, ${pos.coords.longitude}` })); }
        finally { setIsLocating(false); }
      },
      () => { alert("Erro ao buscar GPS"); setIsLocating(false); }
    );
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
    <div className="bg-slate-900 min-h-screen pb-24 text-slate-100">
      <div className="p-4 bg-slate-800 sticky top-0 z-10 flex justify-between items-center shadow-md border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Nova Implantação</h2>
        <button onClick={onCancel} className="text-slate-400"><X /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-6">
        
        {/* DADOS PRINCIPAIS */}
        <div className="space-y-3">
          <label className="text-sky-400 text-xs font-bold uppercase">Dados do Serviço</label>
          <input name="serviceId" placeholder="ID da OS" inputMode="numeric" required className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white focus:border-sky-500 outline-none" onChange={handleChange} />
          
          <div className="flex gap-2">
              <input name="address" value={formData.address} placeholder="Endereço" className="flex-1 bg-slate-800 border border-slate-600 rounded p-3 text-white focus:border-sky-500 outline-none" onChange={handleChange} />
              <button type="button" onClick={handleGetLocation} className="bg-sky-600 text-white px-4 rounded">{isLocating ? <Loader2 className="animate-spin"/> : <MapPin />}</button>
          </div>
          
          <input name="responsible" placeholder="Responsável" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          <div className="grid grid-cols-2 gap-3">
             <input name="date" type="date" value={formData.date} className="bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
             <input name="time" type="time" value={formData.time} className="bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          </div>
        </div>

        {/* DADOS TÉCNICOS */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <label className="text-sky-400 text-xs font-bold uppercase">Dados Técnicos</label>
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-[10px] text-slate-400">Torres</span><input name="towers" type="number" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><span className="text-[10px] text-slate-400">CDOE</span><input name="cdoe" type="number" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><span className="text-[10px] text-slate-400">Andares</span><input name="floors" type="number" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><span className="text-[10px] text-slate-400">Aptos</span><input name="apartments" type="number" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div><span className="text-[10px] text-slate-400">Sinal (dB)</span><input name="signal" placeholder="-19.00" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
             <div className="flex items-center pt-4 justify-between px-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(formData.hasHubBox)} onChange={(e) => setFormData(p => ({...p, hasHubBox: e.target.checked}))} className="w-5 h-5 accent-sky-500"/> Hub Box?</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(formData.hasSignal)} onChange={(e) => setFormData(p => ({...p, hasSignal: e.target.checked}))} className="w-5 h-5 accent-sky-500"/> Sinal?</label>
             </div>
          </div>
        </div>

        {/* MATERIAIS DE REDE (NOVA SEÇÃO) */}
        <div className="space-y-3 pt-4 border-t border-slate-700 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <label className="text-sky-400 text-xs font-bold uppercase">Materiais de Rede</label>
            </div>
            
            {/* Tipo de Cabo */}
            <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Cabo 04 - Origem</label>
                <select name="cableSource" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white outline-none focus:border-sky-500" onChange={handleChange}>
                    <option value="Rolo de 100m">Rolo de 100m</option>
                    <option value="Rolo de 200m">Rolo de 200m</option>
                    <option value="Rolo de 300m">Rolo de 300m</option>
                    <option value="Bobina de 1000m">Bobina de 1000m</option>
                    <option value="Bobina de 2000m">Bobina de 2000m</option>
                </select>
            </div>

            {/* Inputs de Quantidade */}
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-[10px] text-slate-400 mb-1 block">Metros Usados</label>
                    <input name="cableUsed" type="number" placeholder="0" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white text-center" onChange={handleChange} />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 mb-1 block">Conectores</label>
                    <input name="connectors" type="number" placeholder="0" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white text-center" onChange={handleChange} />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 mb-1 block">Alças</label>
                    <input name="anchors" type="number" placeholder="0" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white text-center" onChange={handleChange} />
                </div>
            </div>
        </div>

        {/* STATUS FINAL */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
           <label className="text-sky-400 text-xs font-bold uppercase">Conclusão</label>
           <select name="status" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange}>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
           </select>
           <input name="facilities" placeholder="Facilidades Utilizadas" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
           <textarea name="team" placeholder="Equipe (Nome | RE)" className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white h-20" onChange={handleChange}></textarea>
        </div>

        {/* FOTO - DUPLA OPÇÃO */}
        <div className="pt-4 border-t border-slate-700">
            <span className="text-sky-400 text-xs font-bold uppercase mb-2 block">Evidência Fotográfica</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handlePhotoChange} />
            <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handlePhotoChange} />

            <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 border-2 border-slate-600 active:scale-95 transition-all">
                    <Camera className="text-sky-400 w-8 h-8" />
                    <span className="font-bold text-white text-sm">CÂMERA</span>
                </button>
                <button type="button" onClick={() => galleryInputRef.current?.click()} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 border-2 border-slate-600 active:scale-95 transition-all">
                    <ImageIcon className="text-green-400 w-8 h-8" />
                    <span className="font-bold text-white text-sm">GALERIA</span>
                </button>
            </div>
            {photoPreview && <img src={photoPreview} className="mt-4 w-full h-auto rounded-lg border border-slate-600" />}
        </div>

        <button type="submit" className="w-full py-4 rounded-lg bg-sky-600 text-white font-bold text-lg shadow-lg mt-4 mb-10">SALVAR RELATÓRIO</button>
      </form>
    </div>
  );
};

// --- LISTA ---
const DeploymentList = ({ deployments, onDelete }: any) => {
  const handleShare = async (d: Deployment) => {
    const text = `
*RELATÓRIO NETBONUS*
-------------------------
*OS:* ${d.serviceId}
*END:* ${d.address}
*DATA:* ${d.date} às ${d.time}
*RESP:* ${d.responsible}
-------------------------
*PRODUÇÃO:*
✅ TORRES: ${d.towers}
🏢 ANDARES: ${d.floors} | APTOS: ${d.apartments}
🔌 CDOE: ${d.cdoe}
📡 SINAL: ${d.signal} (${d.hasSignal ? 'OK' : 'SEM'})
📦 HUB BOX: ${d.hasHubBox ? 'SIM' : 'NÃO'}
-------------------------
*MATERIAIS:*
➰ CABO 04: ${d.cableUsed || 0}m (${d.cableSource || '-'})
🔩 CONECTORES: ${d.connectors || 0}
🔗 ALÇAS: ${d.anchors || 0}
-------------------------
*STATUS:* ${d.status}
*FACILIDADES:* ${d.facilities || '-'}
*EQUIPE:* ${d.team || '-'}
`.trim();

    if (navigator.share) {
        try {
            let shareData: any = { text: text };
            if (d.photo) {
                const res = await fetch(d.photo);
                const blob = await res.blob();
                const file = new File([blob], `OS_${d.serviceId}.jpg`, { type: 'image/jpeg' });
                shareData.files = [file];
            }
            await navigator.share(shareData);
        } catch (e) { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
    } else { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
  };

  if (!deployments.length) return <div className="text-center p-10 text-slate-500">Sem registros.</div>;

  return (
    <div className="space-y-4 pb-24 text-slate-100">
      {deployments.map((item: any) => (
        <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
          <div className="p-3 bg-slate-900/50 flex justify-between"><span className="font-bold">OS: {item.serviceId}</span><span className="text-xs text-slate-400">{item.date}</span></div>
          <div className="p-4 space-y-2">
             <div className="text-sm flex gap-2"><MapPin size={16} className="text-sky-400 shrink-0"/> <span className="truncate">{item.address}</span></div>
             
             {/* Exibição Resumida dos Materiais no Card */}
             <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/30 p-2 rounded border border-slate-700">
                <span>Torres: <b className="text-white">{item.towers}</b></span>
                <span>Cabo: <b className="text-white">{item.cableUsed || 0}m</b></span>
                <span>Conectores: <b className="text-white">{item.connectors || 0}</b></span>
                <span>Alças: <b className="text-white">{item.anchors || 0}</b></span>
             </div>

             {item.photo && <img src={item.photo} className="w-full h-48 object-cover rounded mt-2 border border-slate-600 bg-black" />}
             
             <div className="flex gap-2 mt-2 pt-2 border-t border-slate-700">
                <button onClick={() => handleShare(item)} className="flex-1 bg-green-600 py-3 rounded text-white font-bold flex justify-center gap-2 items-center active:bg-green-700"><Share2 size={18}/> Compartilhar</button>
                <button onClick={() => onDelete(item.id)} className="w-12 bg-slate-700 py-3 rounded text-red-400 flex justify-center items-center active:bg-slate-600"><Trash2 size={18}/></button>
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

  const totalTowers = deployments.reduce((acc, curr) => acc + (curr.hasSignal ? curr.towers : 0), 0);
  let prize = 0;
  if (totalTowers >= 17 && totalTowers <= 22) prize = totalTowers * (role === 'AUXILIAR' ? 30 : 60);
  else if (totalTowers >= 23) prize = totalTowers * (role === 'AUXILIAR' ? 50 : 100);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans max-w-md mx-auto shadow-2xl relative flex flex-col">
      {view !== 'FORM' && (
        <header className="bg-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center border-b border-slate-700">
          <h1 className="font-bold text-lg text-white">NetBonus <span className="text-xs text-sky-400">v1.9</span></h1>
          <button onClick={() => setRole(r => r === 'AUXILIAR' ? 'OFICIAL' : 'AUXILIAR')} className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700 border border-slate-600">{role}</button>
        </header>
      )}

      <main className="flex-1 p-4">
        {view === 'DASHBOARD' && (
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700"><div className="text-3xl font-bold text-sky-400">{totalTowers}</div><div className="text-xs text-slate-400">TORRES</div></div>
                <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700"><div className="text-3xl font-bold text-green-400">R$ {prize}</div><div className="text-xs text-slate-400">PRÊMIO</div></div>
             </div>
             <button onClick={() => setView('FORM')} className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">NOVA IMPLANTAÇÃO</button>
          </div>
        )}

        {view === 'LIST' && <DeploymentList deployments={deployments} onDelete={(id: string) => setDeployments(p => p.filter(d => d.id !== id))} />}
        
        {view === 'FORM' && <DeploymentForm onSave={(data: any) => { setDeployments(p => [{...data, id: crypto.randomUUID(), createdAt: Date.now()}, ...p]); setView('DASHBOARD'); }} onCancel={() => setView('DASHBOARD')} />}
      </main>

      {view !== 'FORM' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800 border-t border-slate-700 px-6 py-3 flex justify-between items-center z-20">
          <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' ? 'text-sky-400' : 'text-slate-500'}`}><Home className="w-6 h-6"/><span className="text-[10px]">Início</span></button>
          <button onClick={() => setView('FORM')} className="bg-sky-600 text-white p-3 rounded-full -mt-12 shadow-lg border-4 border-slate-900"><Plus className="w-8 h-8"/></button>
          <button onClick={() => setView('LIST')} className={`flex flex-col items-center gap-1 ${view === 'LIST' ? 'text-sky-400' : 'text-slate-500'}`}><List className="w-6 h-6"/><span className="text-[10px]">Lista</span></button>
        </nav>
      )}
    </div>
  );
};

export default App;
