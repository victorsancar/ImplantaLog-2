import React, { useState, useEffect } from 'react';
import { Deployment, UserRole } from './types';
import Dashboard from './components/Dashboard';
import DeploymentForm from './components/DeploymentForm';
import DeploymentList from './components/DeploymentList';
import { HomeIcon, ListIcon, PlusIcon } from './components/ui/Icons';
import { APP_NAME, USER_ROLES } from './constants';

type ViewState = 'DASHBOARD' | 'LIST' | 'FORM';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('AUXILIAR');

  // Load data and role from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('netbonus_deployments');
    const savedRole = localStorage.getItem('netbonus_role');
    
    if (savedData) {
      try {
        setDeployments(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }

    if (savedRole && (savedRole === 'AUXILIAR' || savedRole === 'OFICIAL')) {
      setUserRole(savedRole as UserRole);
    }
  }, []);

  // Save data to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('netbonus_deployments', JSON.stringify(deployments));
  }, [deployments]);

  // Save role to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('netbonus_role', userRole);
  }, [userRole]);

  const handleSaveDeployment = (data: Omit<Deployment, 'id' | 'createdAt'>) => {
    const newDeployment: Deployment = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setDeployments(prev => [newDeployment, ...prev]);
    setView('DASHBOARD');
  };

  const handleDeleteDeployment = (id: string) => {
    setDeployments(prev => prev.filter(d => d.id !== id));
  };

  const toggleRole = () => {
    setUserRole(prev => prev === USER_ROLES.AUXILIAR ? USER_ROLES.OFICIAL : USER_ROLES.AUXILIAR);
  };

  const renderContent = () => {
    switch (view) {
      case 'DASHBOARD':
        return <Dashboard deployments={deployments} onAddNew={() => setView('FORM')} userRole={userRole} />;
      case 'LIST':
        return <DeploymentList deployments={deployments} onDelete={handleDeleteDeployment} />;
      case 'FORM':
        return <DeploymentForm onSave={handleSaveDeployment} onCancel={() => setView('DASHBOARD')} />;
      default:
        return <Dashboard deployments={deployments} onAddNew={() => setView('FORM')} userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      
      {/* Header (Only show on Dashboard/List) */}
      {view !== 'FORM' && (
        <header className="bg-dark-800 p-4 sticky top-0 z-10 flex justify-between items-center border-b border-dark-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-900/50">
                N
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">{APP_NAME}</h1>
          </div>
          
          <button 
            onClick={toggleRole}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              userRole === USER_ROLES.AUXILIAR 
              ? 'bg-dark-700 text-slate-400 border-dark-600' 
              : 'bg-brand-900 text-brand-300 border-brand-700 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
            }`}
          >
             {userRole === USER_ROLES.AUXILIAR ? 'Auxiliar' : 'Oficial'} ⚡
          </button>
        </header>
      )}

      {/* Main Content */}
      <main className={`p-4 ${view === 'FORM' ? 'p-0' : ''}`}>
        {renderContent()}
      </main>

      {/* Bottom Navigation (Hidden on Form) */}
      {view !== 'FORM' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-dark-800 border-t border-dark-700 px-6 py-3 flex justify-between items-center z-20">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' ? 'text-brand-400' : 'text-slate-500'}`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Início</span>
          </button>

          {/* Floating Action Button for Add */}
          <button 
            onClick={() => setView('FORM')}
            className="bg-brand-600 text-white p-4 rounded-full -mt-8 shadow-lg shadow-black/50 hover:bg-brand-500 transition-transform active:scale-95 border-4 border-dark-900"
            aria-label="Nova Implantação"
          >
            <PlusIcon className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setView('LIST')}
            className={`flex flex-col items-center gap-1 ${view === 'LIST' ? 'text-brand-400' : 'text-slate-500'}`}
          >
            <ListIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Histórico</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;