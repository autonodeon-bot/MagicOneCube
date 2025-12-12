import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { useNavigate } from 'react-router-dom';
import { generateQuestDescription } from '../services/geminiService';

export const Admin: React.FC = () => {
  const { user, addCoins } = useGame();
  const navigate = useNavigate();
  const [questTheme, setQuestTheme] = useState('');
  const [generatedQuest, setGeneratedQuest] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Simple protection
  if (!user.isAdmin) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-red-500">ДОСТУП ЗАПРЕЩЕН</h1>
        <button onClick={() => navigate('/')} className="mt-4 text-white underline">На главную</button>
      </div>
    );
  }

  const handleGenerateQuest = async () => {
    if (!questTheme) return;
    setIsGenerating(true);
    const result = await generateQuestDescription(questTheme);
    setGeneratedQuest(result);
    setIsGenerating(false);
  };

  return (
    <div className="w-full h-full bg-mag-dark p-6 overflow-y-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-white">АДМИН ПАНЕЛЬ</h1>
        <button onClick={() => navigate('/')} className="text-sm text-gray-400">Выход</button>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-mag-panel p-4 rounded-lg border border-white/10">
          <p className="text-xs text-gray-400">Игроков</p>
          <p className="text-xl font-bold text-neon-blue">12,405</p>
        </div>
        <div className="bg-mag-panel p-4 rounded-lg border border-white/10">
          <p className="text-xs text-gray-400">Доход (Ads)</p>
          <p className="text-xl font-bold text-green-400">$1,290</p>
        </div>
      </div>

      {/* QR Generation Tool */}
      <div className="bg-mag-panel p-4 rounded-lg border border-white/10 mb-8">
        <h2 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Генератор QR Кодов</h2>
        <div className="flex flex-col gap-3">
          <input type="number" placeholder="Награда (MC)" className="bg-black/40 border border-white/20 p-2 rounded text-white text-sm" />
          <select className="bg-black/40 border border-white/20 p-2 rounded text-white text-sm">
            <option>Одноразовый</option>
            <option>Многоразовый</option>
          </select>
          <button className="bg-neon-blue text-black font-bold py-2 rounded hover:bg-cyan-300">Создать Код</button>
        </div>
      </div>

      {/* Gemini AI Integration */}
      <div className="bg-mag-panel p-4 rounded-lg border border-neon-purple/30 mb-8">
        <h2 className="font-bold text-white mb-2 flex items-center gap-2">
          <span>✨</span> Генератор Квестов (AI)
        </h2>
        <p className="text-xs text-gray-400 mb-4">Используйте AI для создания описаний событий.</p>
        
        <input 
          type="text" 
          value={questTheme}
          onChange={(e) => setQuestTheme(e.target.value)}
          placeholder="напр. 'Ледяное Королевство', 'Потерянный Магнит'"
          className="w-full bg-black/40 border border-white/20 p-2 rounded text-white text-sm mb-3"
        />
        
        <button 
          onClick={handleGenerateQuest}
          disabled={isGenerating}
          className="w-full bg-neon-purple text-white font-bold py-2 rounded mb-3 disabled:opacity-50"
        >
          {isGenerating ? 'Спрашиваю AI...' : 'Сгенерировать'}
        </button>

        {generatedQuest && (
          <div className="p-3 bg-black/60 rounded border-l-2 border-neon-purple text-sm text-gray-200 italic">
            "{generatedQuest}"
          </div>
        )}
      </div>

      {/* Manual Override */}
      <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/20">
         <h2 className="font-bold text-red-400 mb-2">Отладка</h2>
         <button onClick={() => addCoins(10000)} className="text-xs bg-red-800 text-white px-3 py-1 rounded">
           +10k Монет (Себе)
         </button>
      </div>
    </div>
  );
};