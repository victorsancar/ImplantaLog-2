import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Save, X, Camera, MapPin, Signal, Trash2, Share2, Loader2 } from 'lucide-react';

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

// --- FUNÇÃO DE CARIMBO (TIMESTAMP) ---
const addWatermark = (file: File, info: { date: string, time: string, address: string, os: string }): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Mantém a resolução original
        canvas.width = img.width;
        canvas.height = img.height;

        // Desenha a foto
        ctx.drawImage(img, 0, 0);

        // Configurações do Carimbo (Rodapé escuro)
        const fontSize = Math.max(24, canvas.width / 25); // Fonte maior
        const padding = fontSize;
        const lineHeight = fontSize * 1.4;
        
        // Área do texto (3 linhas)
        const textBoxHeight = (lineHeight * 3) + (padding * 2);
        const bottomY = canvas.height - textBoxHeight;

        // Fundo semitransparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, bottomY, canvas.width, textBoxHeight);

        // Configuração do Texto
        ctx.textBaseline = 'top';
        const textX = padding;
        let textY = bottomY + padding;

        // Linha 1: Data e Hora (Amarelo Ouro)
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`📅 ${info.date} • ${info.time}`, textX, textY);
        
        // Linha 2: Endereço (Branco)
        textY += lineHeight;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${fontSize}px sans-serif`;
        // Corta o endereço se for muito longo
        let addressText = `📍 ${info.address || 'Localização não definida'}`;
        if (addressText.length > 50) addressText = addressText.substring(0, 50) + '...';
        ctx.fillText(addressText, textX, textY);

        // Linha 3: OS e ID (Branco)
        textY += lineHeight;
        ctx.fillText(`🆔 OS: ${info.os || 'N/A'}`, textX, textY);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// --- COMPONENTE: FORMULÁRIO ---
const DeploymentForm = ({ onSave, onCancel }: any) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // Estado do GPS

  const [formData, setFormData] = useState<Partial<Deployment>>({
    type: 'IMPLANTAÇÃO',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    hasSignal: true, hasHubBox: false,
    towers: 1, cdoe: 0, floors: 0, apartments: 0,
    cableSource: 'Rolo 100m', cableUsed: 0, connectors: 0, anchors: 0,
    address: '' // Começa vazio para obrigar o uso do GPS ou digitação
  });

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  // --- FUNÇÃO NOVA: PEGAR LOCALIZAÇÃO GPS ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta GPS.");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Usa API gratuita do OpenStreetMap para descobrir o nome da rua
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          let fullAddress = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
          if (data && data.address) {
             const road = data.address.road || '';
             const suburb = data.address.suburb || data.address.neighbourhood || '';
             const city = data.address.city || data.address.town || '';
             fullAddress = `${road}, ${suburb} - ${city}`;
          }
          
          setFormData(prev => ({ ...prev, address: fullAddress }));
        } catch (error) {
          // Se der erro na API, usa as coordenadas puras
          setFormData(prev => ({ ...prev, address: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        alert("Erro ao obter GPS. Verifique se a localização está ativada.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!formData.address) {
        if(!confirm("⚠️ ATENÇÃO: Você não definiu o endereço/GPS. A foto ficará sem local. Deseja continuar?")) {
           e.target.value = ''; // Limpa a seleção
           return; 
        }
      }

      setIsProcessing(true);
      const watermarkedImage = await addWatermark(file, {
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        address: formData.address || '',
        os: formData.serviceId || ''
      });

      setPhotoPreview(watermarkedImage);
      setFormData(prev => ({ ...prev, photo: watermarkedImage }));
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
        
        {/* SERVIÇO & GPS */}
        <div className="space-y-3">
          <h3 className="text-sky-400 text-xs font-bold uppercase">Localização & Serviço</h3>
          <input name="serviceId" placeholder="ID da OS" inputMode="numeric" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-sky-500 transition-colors" onChange={handleChange} />
          
          <div className="flex gap-2">
              <input 
                name="address" 
                value={formData.address} 
                placeholder="Endereço (Use o botão GPS 👉)" 
                className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-sky-500" 
                onChange={handleChange} 
              />
              <button 
                type="button" 
                onClick={handleGetLocation}
                disabled={isLocating}
                className="bg-sky-600 text-white px-4 rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                {isLocating ? <Loader2 className="animate-spin" /> : <MapPin />}
              </button>
          </div>
          
          <input name="responsible" placeholder="Responsável" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
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

        {/* FINALIZAÇÃO */}
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

        {/* CÂMERA */}
        <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sky-400 text-xs font-bold uppercase mb-2">Evidência Fotográfica</h3>
            <label className={`block w-full ${isProcessing ? 'bg-slate-800' : 'bg-slate-700 hover:bg-slate-600'} p-6 rounded-lg border-2 border-dashed ${formData.address ? 'border-sky-500' : 'border-slate-500'} text-center cursor-pointer transition-all`}>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} disabled={isProcessing} />
                <div className="flex flex-col items-center gap-2">
                    <Camera className={`w-8 h-8 ${isProcessing ? 'text-sky-400 animate-pulse' : 'text-slate-300'}`} />
                    <span className="font-bold text-white">{isProcessing ? 'Processando Carimbo...' : '📸 TIRAR FOTO'}</span>
                    {!formData.address && <span className="text-xs text-red-400 mt-1">(Pegue o GPS antes de tirar a foto!)</span>}
                </div>
            </label>
            
            {photoPreview && (
                <div className="mt-4 animate-in fade-in zoom-in duration-300">
                    <p className="text-xs text-sky-400 mb-1 text-center font-bold">PRÉVIA COM TIMESTAMP:</p>
                    <img src={photoPreview} className="w-full h-auto object-contain rounded-lg border-2 border-slate-600 bg-black shadow-xl" />
                </div>
            )}
        </div>

        <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-lg bg-sky-600 text-white font-bold text-lg shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95 transition-transform">
            <Save /> {isProcessing ? 'Aguarde...' : 'SALVAR REGISTRO'}
        </button>
      </form>
    </div>
  );
};

// --- LISTA ---
const DeploymentList = ({ deployments, onDelete }: any) => {
  const handleShare = async (d: Deployment) => {
    const text = `*RELATÓRIO NETBONUS*\nOS: ${d.serviceId}\nEND: ${d.address}\nDATA: ${d.date}\n---\nTORRES: ${d.towers}\nCABO: ${d.cableUsed || 0}m (${d.cableSource})\nCONECTORES: ${d.connectors || 0}\nALÇAS: ${d.anchors || 0}\nSINAL: ${d.signal} (${d.hasSignal ? 'OK' : 'SEM'})\n---\nSTATUS: ${d.status}\nEQUIPE: ${d.team || '-'}`;
    
    if (navigator.share) {
        try {
            let filesArray: File[] = [];
            if (d.photo) {
                const res = await fetch(d.photo);
                const blob = await res.blob();
                filesArray = [new File([blob], `OS_${d.serviceId}.jpg`, { type: 'image/jpeg' })];
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
             <div className="flex gap-2 text-sm text-slate-300"><MapPin size={16} className="text-sky-400 shrink-0"/> <span className="truncate">{item.address}</span></div>
             <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-600"><div className="text-xs text-slate-500">TORRES</div><div className="text-lg font-mono text-white">{item.towers}</div></div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-600"><div className="text-xs text-slate-500">CABO</div><div className="text-sm font-mono text-white">{item.cableUsed || 0}m</div></div>
             </div>
             
             {item.photo && (
                 <div className="mt-2 relative">
                    <img src={item.photo} className="w-full h-48 object-contain bg-black rounded border border-slate-600" />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">📍 GPS Carimbado</div>
                 </div>
             )}
             
             <div className="flex gap-3 mt-4 pt-3 border-t border-slate-700">
                <button onClick={() => handleShare(item)} className="flex-1 bg-green-600 py-3 rounded text-white font-bold flex justify-center gap-2 items-center active:bg-green-700"><Share2 size={18}/> WhatsApp</button>
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
          <h1 className="font-bold text-lg text-white">NetBonus <span className="text-xs font-normal text-slate-400">v2.0 GPS</span></h1>
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
             <button onClick={() => setView('FORM')} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">NOVA IMPLANTAÇÃO</button>
          </div>
        )}
        {view === 'LIST' && <DeploymentList deployments={deployments} onDelete={(id: string) => setDeployments(p => p.filter(d => d.id !== id))} />}
        {view === 'FORM' && <DeploymentForm onSave={(data: any) => { setDeployments(p => [{...data, id: crypto.randomUUID(), createdAt: Date.now()}, ...p]); setView('DASHBOARD'); }} onCancel={() => setView('DASHBOARD')} />}
      </main>

      {view !== 'FORM' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800 border-t border-slate-700 px-6 py-3 flex justify-between items-center z-20">
          <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' ? 'text-sky-400' : 'text-slate-500'}`}><Home className="w-6 h-6" /><span className="text-[10px]">Início</span></button>
          <button onClick={() => setView('FORM')} className="bg-sky-600 text-white p-3 rounded-full -mt-12 shadow-lg border-4 border-slate-900 active:scale-90 transition-transform"><Plus
