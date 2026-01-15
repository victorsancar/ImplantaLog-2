import React, { useState, useEffect, useRef } from 'react';
import { Home, List, Plus, Save, X, Camera, MapPin, Trash2, Share2, Loader2, RefreshCw } from 'lucide-react';

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

// --- COMPONENTE: CÂMERA AO VIVO COM TIMESTAMP ---
const LiveCamera = ({ onCapture, onClose, info }: { onCapture: (img: string) => void, onClose: () => void, info: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('environment'); // Começa com câmera traseira

  // Inicia a Câmera
  useEffect(() => {
    const startCamera = async () => {
      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraMode }
        });
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        setError('Erro ao acessar câmera. Verifique as permissões.');
        console.error(err);
      }
    };
    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [cameraMode]);

  // Função para Capturar e Desenhar o Timestamp Definitivo
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Define o tamanho do canvas igual ao vídeo real
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 1. Desenha o vídeo no canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Desenha o Timestamp (Igual ao que você vê na tela)
    // Configurações de fonte proporcionais ao tamanho da imagem
    const fontSize = Math.max(20, canvas.width / 25);
    const padding = fontSize;
    const lineHeight = fontSize * 1.3;
    
    // Fundo escuro no rodapé
    const boxHeight = (lineHeight * 3) + (padding * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, canvas.height - boxHeight, canvas.width, boxHeight);

    // Texto
    ctx.textBaseline = 'top';
    const textX = padding;
    let textY = canvas.height - boxHeight + padding;

    // Linha 1: Data
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = '#FFD700'; // Amarelo
    ctx.fillText(`📅 ${info.date} • ${info.time}`, textX, textY);

    // Linha 2: Endereço
    textY += lineHeight;
    ctx.fillStyle = '#FFFFFF'; // Branco
    ctx.font = `${fontSize}px sans-serif`;
    let addr = `📍 ${info.address || 'Local não definido'}`;
    if (addr.length > 50) addr = addr.substring(0, 50) + '...';
    ctx.fillText(addr, textX, textY);

    // Linha 3: OS
    textY += lineHeight;
    ctx.fillText(`🆔 OS: ${info.os || 'N/A'}`, textX, textY);

    // Salva e fecha
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    onCapture(imgData);
    onClose();
  };

  const toggleCamera = () => {
     setCameraMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  if (error) return <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white p-4">{error} <button onClick={onClose} className="ml-4 bg-slate-700 p-2 rounded">Fechar</button></div>;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
         <video ref={videoRef} autoPlay playsInline muted className="absolute min-w-full min-h-full object-cover" />
         
         {/* OVERLAY NA TELA (O que o usuário vê) */}
         <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white pointer-events-none">
            <div className="text-yellow-400 font-bold text-sm md:text-xl">📅 {info.date} • {info.time}</div>
            <div className="text-white text-xs md:text-lg truncate">📍 {info.address || 'Buscando local...'}</div>
            <div className="text-white text-xs md:text-lg">🆔 OS: {info.os}</div>
         </div>
      </div>

      {/* Controles */}
      <div className="h-24 bg-slate-900 flex items-center justify-between px-8">
        <button onClick={onClose} className="text-white p-2 rounded-full bg-slate-800"><X /></button>
        <button onClick={handleSnap} className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-lg active:scale-90 transition-transform"></button>
        <button onClick={toggleCamera} className="text-white p-2 rounded-full bg-slate-800"><RefreshCw /></button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// --- FORMULÁRIO ---
const DeploymentForm = ({ onSave, onCancel }: any) => {
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState<Partial<Deployment>>({
    date: new Date().toLocaleDateString('pt-BR'),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    hasSignal: true, hasHubBox: false,
    towers: 1, cdoe: 0,
    cableSource: 'Rolo 100m', cableUsed: 0, connectors: 0, anchors: 0,
    address: '', status: 'IMPLANTADO OK'
  });

  // Atualiza relógio
  useEffect(() => {
    const timer = setInterval(() => {
        setFormData(p => ({...p, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <>
      {showCamera && (
        <LiveCamera 
           info={{ date: formData.date, time: formData.time, address: formData.address, os: formData.serviceId }}
           onClose={() => setShowCamera(false)}
           onCapture={(img) => {
               setPhotoPreview(img);
               setFormData(p => ({ ...p, photo: img }));
           }}
        />
      )}

      <div className={`bg-slate-800 min-h-screen pb-24 ${showCamera ? 'hidden' : 'block'}`}>
        <div className="p-4 bg-slate-900 sticky top-0 z-10 flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold text-white">Nova OS</h2>
          <button onClick={onCancel} className="text-slate-400"><X /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-6">
          
          <div className="space-y-3">
            <label className="text-sky-400 text-xs font-bold uppercase">Dados & GPS</label>
            <input name="serviceId" placeholder="ID da OS" inputMode="numeric" required className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
            
            <div className="flex gap-2">
                <input name="address" value={formData.address} placeholder="Endereço (Obrigatório para o Timestamp)" className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
                <button type="button" onClick={handleGetLocation} className="bg-sky-600 text-white px-4 rounded">{isLocating ? <Loader2 className="animate-spin"/> : <MapPin />}</button>
            </div>
            
            <input name="responsible" placeholder="Responsável" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} />
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-700">
            <label className="text-sky-400 text-xs font-bold uppercase">Produção</label>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[10px] text-slate-400">Torres</span><input name="towers" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
              <div><span className="text-[10px] text-slate-400">CDOE</span><input name="cdoe" type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" onChange={handleChange} /></div>
            </div>
            
             <div className="bg-slate-900/50 p-3 rounded mt-2">
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
             <textarea name="team" placeholder="Equipe" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-20" onChange={handleChange}></textarea>
          </div>

          <div className="pt-4 border-t border-slate-700">
              <button type="button" onClick={() => setShowCamera(true)} className="w-full bg-slate-700 hover:bg-slate-600 p-6 rounded-lg border-2 border-dashed border-sky-500 text-center transition-all flex flex-col items-center gap-2">
                  <Camera className="text-sky-400 w-8 h-8" />
                  <span className="font-bold text-white">ABRIR CÂMERA TIMESTAMP</span>
                  <span className="text-xs text-slate-400">Ver data/local na tela ao vivo</span>
              </button>
              {photoPreview && <img src={photoPreview} className="mt-4 w-full h-auto rounded-lg border border-slate-600" />}
          </div>

          <button type="submit" className="w-full py-4 rounded-lg bg-sky-600 text-white font-bold text-lg shadow-lg">SALVAR</button>
        </form>
      </div>
    </>
  );
};

// --- LISTA (COMPARTILHAMENTO) ---
const DeploymentList = ({ deployments, onDelete }: any) => {
  const handleShare = async (d: Deployment) => {
    // Compartilha TEXTO + FOTO
    const text = `*RELATÓRIO NETBONUS*\nOS: ${d.serviceId}\nEND: ${d.address}\nDATA: ${d.date}\n---\nTORRES: ${d.towers}\nCABO: ${d.cableUsed || 0}m\nMATERIAIS: ${d.connectors} Conectores, ${d.anchors} Alças\nSINAL: ${d.signal}\nSTATUS: ${d.status}`;
    
    if (navigator.share) {
        try {
            let shareData: any = { text };
            if (d.photo) {
                const res = await fetch(d.photo);
                const blob = await res.blob();
                const file = new File([blob], `OS_${d.serviceId}.jpg`, { type: 'image/jpeg' });
                shareData.files = [file];
            }
            await navigator.share(shareData);
        } catch { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
    } else { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
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
                <button onClick={() => handleShare(item)} className="flex-1 bg-green-600 py-3 rounded text-white font-bold flex justify-center gap-2 items-center"><Share2 size={18}/> Compartilhar</button>
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
          <h1 className="font-bold text-lg text-white">NetBonus <span className="text-xs text-sky-400">LiveCam v4</span></h1>
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
