import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Save, X, Camera, MapPin, Trash2, Share2, Loader2 } from 'lucide-react';

// --- DEFINIÇÃO DOS DADOS ---
interface Deployment {
  id: string;
  createdAt: number;
  serviceId: string;
  address: string;
  responsible: string;
  date: string;
  time: string;
  towers: number;
  cdoe: number;
  signal: string;
  hasSignal: boolean;
  hasHubBox: boolean;
  cableSource?: string;
  cableUsed?: number;
  connectors?: number;
  anchors?: number;
  status: string;
  team?: string;
  photo?: string;
}

const STATUS_OPTIONS = [
  { value: 'IMPLANTADO', label: 'Implantado OK' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

// --- FUNÇÃO CARIMBO (TIMESTAMP) ---
const addWatermark = (file: File, info: { date: string, time: string, address: string, os: string }): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Fundo preto transparente no rodapé
        const fontSize = Math.max(30, canvas.width / 25);
        const padding = fontSize;
        const lineHeight = fontSize * 1.3;
        const boxHeight = (lineHeight * 3) + (padding * 2);
        const yStart = canvas.height - boxHeight;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, yStart, canvas.width, boxHeight);

        // Textos
        ctx.textBaseline = 'top';
        let textY = yStart + padding;
        const textX = padding;

        // 1. Data e Hora (Amarelo)
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`📅 ${info.date} • ${info.time}`, textX, textY);
        
        // 2. Endereço (Branco)
        textY += lineHeight;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${fontSize}px sans-serif`;
        let addr = `📍 ${info.address || 'Local não definido'}`;
        if (addr.length > 55) addr = addr.substring(0, 55) + '...';
        ctx.fillText(addr, textX, textY);

        // 3. OS (Branco)
        textY += lineHeight;
        ctx.fillText(`🆔 OS: ${info.os || 'N/A'}`, textX, textY);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// --- FORMULÁRIO ---
const DeploymentForm = ({ onSave, onCancel }: any) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState<Partial<Deployment>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    hasSignal: true, hasHubBox: false,
    towers: 1, cdoe: 0,
    cableSource: 'Rolo 100m', cableUsed: 0, connectors: 0, anchors: 0,
    address: ''
  });

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("GPS não suportado.");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          let addr = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
          if (data.address) {
             const street = data.address.road || '';
             const sub = data.address.suburb || data.address.neighbourhood || '';
             const city = data.address.city || data.address.town || '';
             addr = `${street}, ${sub} - ${city}`;
          }
          setFormData(p => ({ ...p, address: addr }));
        } catch (e) {
          setFormData(p => ({ ...p, address: `GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}` }));
        } finally { setIsLocating(false); }
      },
      () => { alert("Erro no GPS. Ative a localização."); setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!formData.address && !confirm("Sem endereço no GPS. A foto ficará sem local. Continuar?")) {
        e.target.value = ''; return;
      }
      setIsProcessing(true);
      const watermark = await addWatermark(file, {
        date: new Date().toLocaleDateString('pt-BR'),
        time: formData.time || '',
        address: formData.address || '',
        os: formData.serviceId || ''
      });
      setPhotoPreview(watermark);
      setFormData(p => ({ ...p, photo: watermark }));
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-800 min-h-screen pb-24">
      <div className="p-4 bg-slate-900 sticky top-0 z-10 flex justify-between items-center shadow-md">
        <h2 className="text-xl font-bold text-white">Nova OS</h2>
        <button onClick={onCancel} className="text-slate-400"><X /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-6">
        
        <div className="space-y-3">
          <label className="text-sky-400 text-xs font-bold uppercase">ID e Localização</label>
          <input name="serviceId" placeholder="Número da OS" inputMode="numeric" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          
          <div className="flex gap-2">
              <input name="address" value={formData.address} placeholder="Endereço (Clique no GPS 👉)" className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
              <button type="button" onClick={handleGetLocation} disabled={isLocating} className="bg-sky-600 text-white px-4 rounded flex items-center justify-center">
                {isLocating ? <Loader2 className="animate-spin"/> : <MapPin />}
              </button>
          </div>
          
          <input name="responsible" placeholder="Responsável" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          <div className="grid grid-cols-2 gap-3">
             <input name="date" type="date" value={formData.date} className="bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
             <input name="time" type="time" value={formData.time} className="bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-700">
          <label className="text-sky-400 text-xs font-bold uppercase">Produção</label>
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-xs text-slate-400">Torres</span><input name="towers" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><span className="text-xs text-slate-400">CDOE</span><input name="cdoe" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
          </div>
          
          <div className="bg-slate-900/50 p-3 rounded border border-slate-700 mt-2">
             <span className="text-xs text-sky-400 font-bold block mb-2">MATERIAIS</span>
             <select name="cableSource" className="w-full bg-slate-800 border border-slate-600 rounded p-2 mb-2 text-white" onChange={handleChange}>
                <option value="Rolo 100m">Rolo 100m</option>
                <option value="Rolo 200m">Rolo 200m</option>
                <option value="Bobina 1000m">Bobina 1000m</option>
             </select>
             <div className="grid grid-cols-3 gap-2">
                <input name="cableUsed" type="number" placeholder="Metros" className="bg-slate-800 border border-slate-600 rounded p-2 text-white" onChange={handleChange} />
                <input name="connectors" type="number" placeholder="Conec." className="bg-slate-800 border border-slate-600 rounded p-2 text-white" onChange={handleChange} />
                <input name="anchors" type="number" placeholder="Alças" className="bg-slate-800 border border-slate-600 rounded p-2 text-white" onChange={handleChange} />
             </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-700">
           <input name="signal" placeholder="Sinal (dB)" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
           <div className="flex gap-4 text-sm text-slate-300">
             <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(formData.hasSignal)} onChange={(e) => setFormData(p => ({...p, hasSignal: e.target.checked}))} className="w-5 h-5"/> Com Sinal</label>
             <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(formData.hasHubBox)} onChange={(e) => setFormData(p => ({...p, hasHubBox: e.target.checked}))} className="w-5 h-5"/> Hub Box</label>
           </div>
           <select name="status" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange}>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
           </select>
           <textarea name="team" placeholder="Equipe (Nome | RE)" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-20" onChange={handleChange}></textarea>
        </div>

        <div className="pt-4 border-t border-slate-700">
            <label className={`block w-full p-6 rounded-lg border-2 border-dashed text-center cursor-pointer ${formData.address ? 'border-sky-500 bg-slate-800' : 'border-slate-600 bg-slate-800'}`}>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} disabled={isProcessing} />
                <div className="flex flex-col items-center gap-2">
                    <Camera className={isProcessing ? "animate-spin text-sky-400" : "text-sky-400"} />
                    <span className="font-bold text-white">{isProcessing ? 'PROCESSANDO...' : 'TIRAR FOTO COM CARIMBO'}</span>
                    {!formData.address && <span className="text-xs text-red-400 block mt-1">⚠️ Use o GPS antes da foto!</span>}
                </div>
            </label>
            {photoPreview && <img src={photoPreview} className="mt-4 w-full h-auto rounded-lg border border-slate-600" />}
        </div>

        <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-lg bg-sky-600 text-white font-bold text-lg shadow-lg">SALVAR</button>
      </form>
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

  const handleDelete = (id: string) => setDeployments(p => p.filter(d => d.id !== id));
  
  const handleShare = async (d: Deployment) => {
     const text = `*RELATÓRIO NETBONUS*\nOS: ${d.serviceId}\nEND: ${d.address}\nDATA: ${d.date}\n---\nTORRES: ${d.towers}\nCABO: ${d.cableUsed || 0}m\nMATERIAIS: ${d.connectors} Conectores, ${d.anchors} Alças\nSINAL: ${d.signal}\nSTATUS: ${d.status}`;
     if (navigator.share) {
         try {
             if (d.photo) {
                 const res = await fetch(d.photo);
                 const blob = await res.blob();
                 const file = new File([blob], `OS_${d.serviceId}.jpg`, { type: 'image/jpeg' });
                 await navigator.share({ text, files: [file] });
             } else { await navigator.share({ text }); }
         } catch { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
     } else { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
  };

  const totalTowers = deployments.reduce((acc, curr) => acc + (curr.hasSignal ? curr.towers : 0), 0);
  let prize = 0;
  if (totalTowers >= 17 && totalTowers <= 22) prize = totalTowers * (role === 'AUXILIAR' ? 30 : 60);
  else if (totalTowers >= 23) prize = totalTowers * (role === 'AUXILIAR' ? 50 : 100);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans max-w-md mx-auto shadow-2xl relative flex flex-col">
      {view !== 'FORM' && (
        <header className="bg-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center border-b border-slate-700">
          <h1 className="font-bold text-lg text-white">NetBonus <span className="text-xs text-sky-400">GPS v2.0</span></h1>
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
             <button onClick={() => setView('FORM')} className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg">NOVA IMPLANTAÇÃO</button>
          </div>
        )}

        {view === 'LIST' && (
           <div className="space-y-4 pb-20">
             {!deployments.length && <div className="text-center text-slate-500 mt-10">Sem registros.</div>}
             {deployments.map(d => (
               <div key={d.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                  <div className="p-3 bg-slate-900/50 flex justify-between"><span className="font-bold">OS: {d.serviceId}</span><span className="text-xs text-slate-400">{d.date}</span></div>
                  <div className="p-4 space-y-2">
                     <div className="text-sm flex gap-2"><MapPin size={16} className="text-sky-400 shrink-0"/> <span className="truncate">{d.address}</span></div>
                     <div className="text-sm">Torres: {d.towers} | Cabo: {d.cableUsed || 0}m</div>
                     {d.photo && <img src={d.photo} className="w-full h-32 object-cover rounded mt-2 border border-slate-600" />}
                     <div className="flex gap-2 mt-2 pt-2 border-t border-slate-700">
                        <button onClick={() => handleShare(d)} className="flex-1 bg-green-600 py-2 rounded text-white text-sm font-bold flex justify-center gap-2"><Share2 size={16}/> Zap</button>
                        <button onClick={() => handleDelete(d.id)} className="w-10 bg-slate-700 py-2 rounded text-red-400 flex justify-center"><Trash2 size={16}/></button>
                     </div>
                  </div>
               </div>
             ))}
           </div>
        )}

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
