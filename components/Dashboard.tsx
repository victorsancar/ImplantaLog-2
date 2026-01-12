import React, { useMemo } from 'react';
import { Deployment, UserRole } from '../types';
import { getCurrentPeriod, calculateBonus, formatCurrency } from '../utils/calculations';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SignalIcon } from './ui/Icons';
import { BONUS_RULES } from '../constants';

interface DashboardProps {
  deployments: Deployment[];
  onAddNew: () => void;
  userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ deployments, onAddNew, userRole }) => {
  const period = getCurrentPeriod();
  const bonusData = useMemo(() => calculateBonus(deployments, period, userRole), [deployments, period, userRole]);
  const currentValues = BONUS_RULES.VALUES[userRole];

  // Prepare data for chart
  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    deployments.forEach(d => {
        const dDate = new Date(d.executionDate + 'T00:00:00');
        if (dDate >= period.start && dDate <= period.end && d.hasSignal && d.statusFinal === 'IMPLANTADO') {
            const day = dDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            dataMap.set(day, (dataMap.get(day) || 0) + d.towerCount);
        }
    });

    return Array.from(dataMap.entries()).map(([name, towers]) => ({ name, towers }));
  }, [deployments, period]);

  const percentageToNext = bonusData.nextTierGap > 0 
    ? Math.min(100, (bonusData.totalTowers / (bonusData.totalTowers + bonusData.nextTierGap)) * 100)
    : 100;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Summary */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-700 text-white p-6 rounded-3xl shadow-lg border border-brand-600">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-brand-100 text-sm font-medium uppercase tracking-wider">Período Atual</h2>
            <p className="text-white font-bold">{period.label}</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <SignalIcon className="text-brand-100 w-6 h-6" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-4">
          <span className="text-5xl font-extrabold tracking-tight drop-shadow-sm">
            {bonusData.totalTowers}
          </span>
          <span className="text-brand-100 text-sm mt-1">Torres Válidas</span>
        </div>

        <div className="mt-4 pt-4 border-t border-brand-600/50">
          <div className="flex justify-between items-center">
            <span className="text-brand-100">Prêmio Estimado</span>
            <span className="text-2xl font-bold text-green-300">
              {formatCurrency(bonusData.estimatedBonus)}
            </span>
          </div>
          <div className="text-right text-[10px] text-brand-200 mt-1">
             Cálculo para: <span className="font-bold">{userRole}</span>
          </div>
        </div>
      </div>

      {/* Progress / Goal Card */}
      <div className="bg-dark-800 p-5 rounded-2xl shadow-md border border-dark-700">
        <h3 className="font-semibold text-white mb-3">Progresso da Meta</h3>
        
        {bonusData.currentTier === 2 ? (
           <div className="bg-green-900/30 text-green-400 border border-green-800 p-3 rounded-lg text-sm text-center font-medium">
             🚀 Parabéns! Você atingiu a faixa máxima (R$ {currentValues.TIER_2}/torre).
           </div>
        ) : (
          <div>
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Atual: {bonusData.totalTowers}</span>
              <span>Próxima Faixa: {bonusData.totalTowers + bonusData.nextTierGap}</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3 mb-3">
              <div 
                className="bg-brand-500 h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
                style={{ width: `${percentageToNext}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Faltam <span className="font-bold text-slate-300">{bonusData.nextTierGap} torres</span> para 
              {bonusData.currentTier === 0 ? ` começar a ganhar (R$ ${currentValues.TIER_1}/torre)` : ` pular para R$ ${currentValues.TIER_2}/torre`}.
            </p>
          </div>
        )}
      </div>

      {/* Rules Reference - DYNAMIC BASED ON ROLE */}
      <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-xs text-slate-500 space-y-1">
        <div className="flex justify-between items-center mb-2">
            <span className="text-brand-400 font-bold uppercase tracking-wider">Regras: {userRole}</span>
        </div>
        <p><span className="font-bold text-slate-300">0-{BONUS_RULES.TIER_1_THRESHOLD - 1} torres:</span> R$ 0,00</p>
        <p><span className="font-bold text-slate-300">{BONUS_RULES.TIER_1_THRESHOLD}-{BONUS_RULES.TIER_2_THRESHOLD - 1} torres:</span> R$ {formatCurrency(currentValues.TIER_1)} / torre</p>
        <p><span className="font-bold text-slate-300">{BONUS_RULES.TIER_2_THRESHOLD}+ torres:</span> R$ {formatCurrency(currentValues.TIER_2)} / torre</p>
      </div>

      {/* Simple Chart */}
      {chartData.length > 0 && (
        <div className="bg-dark-800 p-5 rounded-2xl shadow-md border border-dark-700 h-64">
           <h3 className="font-semibold text-white mb-4">Produção Recente</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
               <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
               <Tooltip 
                 cursor={{fill: '#334155'}}
                 contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
               />
               <Bar dataKey="towers" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.towers >= 4 ? '#0ea5e9' : '#38bdf8'} />
                ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
      )}

      {/* Empty State Call to Action if needed */}
      {deployments.length === 0 && (
        <div className="text-center py-8">
            <p className="text-slate-500 mb-4">Nenhuma implantação registrada.</p>
            <button 
                onClick={onAddNew}
                className="bg-brand-600 text-white px-6 py-2 rounded-full font-medium shadow hover:bg-brand-700"
            >
                Adicionar Primeira
            </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;