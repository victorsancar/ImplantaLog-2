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
  floors: number;
  apartments: number;
  signal: string;
  hasSignal: boolean;
  hasHubBox: boolean;
  cableSource?: string;
  cableUsed?: number;
  connectors?: number;
  anchors?: number;
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

// --- FUNÇÃO QUE DESENHA O RELATÓRIO NA FOTO ---
const addWatermark = (file: File, d: Partial<Deployment>): Promise<string> => {
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

        // 1. Desenha a foto original
        ctx.drawImage(img, 0, 0);

        // 2. Cria uma camada escura sobre toda a foto para o texto ficar legível
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // 60% de escuridão
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Configuração da Fonte
        const fontSize = Math.max(24, canvas.width / 35); // Tamanho dinâmico
        const lineHeight = fontSize * 1.5;
        const margin = fontSize;
        
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = '#FFFFFF'; // Texto Branco
        ctx.textBaseline = 'top';
        
        let y = margin; // Começa no topo

        // Função auxiliar para escrever linhas
        const writeLine = (text: string, color = '#FFFFFF', isBold = false) => {
            ctx.font = isBold ? `bold ${fontSize}px sans-serif` : `${fontSize}px sans-serif`;
            ctx.fillStyle = color;
            ctx.fillText(text, margin, y);
            y += lineHeight;
        };

        // --- ESCREVENDO O RELATÓRIO NA IMAGEM ---
        
        writeLine(`TIPO: IMPLANTAÇÃO`, '#FFFFFF', true);
        writeLine(`ID: ${d.serviceId || ''}`);
        writeLine(`END: ${d.address || ''}`);
        writeLine(`RESP: ${d.responsible || ''}`);
        writeLine(`DATA: ${d.date} às ${d.time}`);
        
        y += lineHeight / 2; // Espaço
        writeLine('-------------------------');
        y += lineHeight / 2;

        writeLine(`PRODUÇÃO:`, '#FFD700', true); // Dourado
        writeLine(`TORRES: ${d.towers || 0}`);
        writeLine(`ANDARES: ${d.floors || 0} | APTOS: ${d.apartments || 0}`);
        writeLine(`CDOE: ${d.cdoe || 0}`);
        writeLine(`SINAL: ${d.signal || 'N/A'} (${d.hasSignal ? 'SIM' : 'NÃO'})`);
        writeLine(`HUB BOX: ${d.hasHubBox ? 'SIM' : 'NÃO'}`);
        
        y += lineHeight / 2;
        writeLine('-------------------------');
        y += lineHeight / 2;

        writeLine(`MATERIAIS:`, '#FFD700', true);
        writeLine(`CABO: ${d.cableUsed || 0}m (${d.cableSource || '-'})`);
        writeLine(`CONECTORES: ${d.connectors || 0} | ALÇAS: ${d.anchors || 0}`);

        y += lineHeight / 2;
        writeLine('-------------------------');
        y += lineHeight / 2;

        writeLine(`STATUS: ${d.status}`, '#00FF00', true); // Verde
        writeLine(`FACILIDADES: ${d.facilities || 'N/A'}`);
        
        // Quebra de linha para equipe se for muito grande
        const teamText = `EQUIPE: ${d.team || ''}`;
        if (teamText.length > 40) {
             writeLine(teamText.substring(0, 40));
             writeLine(teamText.substring(40));
        } else {
             writeLine(teamText);
        }

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
    towers: 1, cdoe: 0, floors: 0, apartments: 0,
    cableSource: 'Rolo 100m', cableUsed: 0, connectors: 0, anchors: 0,
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
      () => { alert("Erro GPS"); setIsLocating(false); }
    );
  };

  const handlePhotoChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!formData.serviceId) return alert("Preencha o ID da OS antes da foto!");
      setIsProcessing(true);
      // Gera a foto com o relatório escrito nela
      const watermark = await addWatermark(file, formData);
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
          <label className="text-sky-400 text-xs font-bold uppercase">Dados Principais</label>
          <input name="serviceId" placeholder="ID da OS" inputMode="numeric" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          
          <div className="flex gap-2">
              <input name="address" value={formData.address} placeholder="Endereço" className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
              <button type="button" onClick={handleGetLocation} className="bg-sky-600 text-white px-4 rounded">{isLocating ? <Loader2 className="animate-spin"/> : <MapPin />}</button>
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
            <div><span className="text-[10px] text-slate-400">Torres</span><input name="towers" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><span className="text-[10px] text-slate-400">CDOE</span><input name="cdoe" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><span className="text-[10px] text-slate-400">Andares</span><input name="floors" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            <div><span className="text-[10px] text-slate-400">Aptos</span><input name="apartments" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-700 bg-slate-900/50 p-3 rounded">
            <span className="text-sky-400 text-xs font-bold uppercase">Materiais</span>
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

        <div className="space-y-3 pt-4 border-t border-slate-700">
           <input name="signal" placeholder="Sinal (dB)" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
           <div className="flex gap-4 text-sm text-slate-300">
             <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(formData.hasSignal)} onChange={(e) => setFormData(p => ({...p, hasSignal: e.target.checked}))} className="w-5 h-5"/> Com Sinal</label>
             <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(formData.hasHubBox)} onChange={(e) => setFormData(p => ({...p, hasHubBox: e.target.checked}))} className="w-5 h-5"/> Hub Box</label>
           </div>
           <select name="status" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange}>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
           </select>
           <input name="facilities" placeholder="Facilidades" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
           <textarea name="team" placeholder="Equipe" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-20" onChange={handleChange}></textarea>
        </div>

        <div className="pt-4 border-t border-slate-700">
            <label className={`block w-full p-6 rounded-lg border-2 border-dashed text-center cursor-pointer ${isProcessing ? 'bg-slate-800' : 'bg-slate-700'}`}>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} disabled={isProcessing} />
                <div className="flex flex-col items-center gap-2">
                    <Camera className="text-sky-400" />
                    <span className="font-bold text-white">{isProcessing ? 'GERANDO RELATÓRIO...' : 'TIRAR FOTO DO RELATÓRIO'}</span>
                </div>
            </label>
            {photoPreview && <img src={photoPreview} className="mt-4 w-full h-auto rounded-lg border border-slate-600" />}
        </div>

        <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-lg bg-sky-600 text-white font-bold text-lg shadow-lg">SALVAR</button>
      </form>
    </div>
  );
};

// --- LISTA ---
const DeploymentList = ({ deployments, onDelete }: any) => {
  const handleShare = async (d: Deployment) => {
    // Tenta compartilhar SOMENTE A FOTO, sem texto de legenda
    if (navigator.share && d.photo) {
        try {
             const res = await fetch(d.photo);
             const blob = await res.blob();
             const file = new File([blob], `OS_${d.serviceId}.jpg`, { type: 'image/jpeg' });
             await navigator.share({ files: [file] }); // Sem o campo 'text'
        } catch (e) { 
            alert("Erro ao compartilhar imagem. Tente salvar a foto primeiro.");
        }
    } else { 
        alert("Seu navegador não suporta compartilhamento direto de imagem.");
    }
  };

  if (!deployments.length) return <div className="text-center p-10 text-slate-500">Sem registros.</div>;

  return (
    <div className="space-y-4 pb-24">
      {deployments.map((item: any) => (
        <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
          <div className="p-3 bg-slate-900/50 flex justify-between"><span className="font-bold">OS: {item.serviceId}</span><span className="text-xs text-slate-400">{item.date}</span></div>
          <div className="p-4 space-y-2">
             <div className="text-sm flex gap-2"><MapPin size={16} className="text-sky-400 shrink-0"/> <span className="truncate">{item.address}</span></div>
             {item.photo && <img src={item.photo} className="w-full h-48 object-contain rounded mt-2 border border-slate-600 bg-black" />}
             
             <div className="flex gap-2 mt-2 pt-2 border-t border-slate-700">
                <button onClick={() => handleShare(item)} className="flex-1 bg-green-600 py-3 rounded text-white font-bold flex justify-center gap-2 items-center"><Share2 size={18}/> Enviar Foto</button>
                <button onClick={() => onDelete(item.id)} className="w-12 bg-slate-700 py-3 rounded text-red-400 flex justify-center items-center"><Trash2 size={18}/></button>
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
          <h1 className="font-bold text-lg text-white">NetBonus <span className="text-xs text-sky-400">Relatório v3</span></h1>
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
