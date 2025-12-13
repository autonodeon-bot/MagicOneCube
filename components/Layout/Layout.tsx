import React, { useEffect, useState } from 'react';
import { useGame } from '../../store/GameContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  const isGameScreen = location.pathname.startsWith('/game/');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-mag-dark text-white select-none">
      
      {/* Top Bar - Sticky */}
      {!isGameScreen && (
        <div className="absolute top-0 left-0 w-full z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2" onClick={() => navigate('/profile')}>
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center border-2 border-white font-bold text-sm">
               {user.username.substring(0, 2).toUpperCase()}
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-gray-400">Уровень {Math.floor(user.magCoins / 1000) + 1}</span>
                <span className="font-bold text-neon-blue drop-shadow-md">MC {user.magCoins.toLocaleString()}</span>
             </div>
          </div>
          
          <div className="pointer-events-auto flex gap-3">
             {user.isAdmin && (
                <button onClick={() => navigate('/admin')} className="p-2 bg-red-900/50 rounded-lg border border-red-500/30 text-xs text-white">
                  АДМИН
                </button>
             )}
             <button onClick={() => navigate('/shop')} className="p-2 bg-mag-panel rounded-full border border-neon-purple/50 shadow-[0_0_10px_rgba(188,19,254,0.3)]">
               🛒
             </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full h-full relative z-10">
        {children}
      </main>
      
      {/* MAG-BOT COMPANION */}
      <MagBot />

      {/* Bottom Navigation - Sticky */}
      {!isGameScreen && (
        <nav className="absolute bottom-0 left-0 w-full z-50 bg-mag-panel/90 backdrop-blur-md border-t border-white/10 flex justify-around py-3 pb-5">
           <NavBtn icon="🏠" label="Главная" active={location.pathname === '/'} onClick={() => navigate('/')} />
           <NavBtn icon="📷" label="Скан" active={location.pathname === '/scan'} onClick={() => navigate('/scan')} />
           <NavBtn icon="🏆" label="Профиль" active={location.pathname === '/profile'} onClick={() => navigate('/profile')} />
        </nav>
      )}
    </div>
  );
};

const MagBot: React.FC = () => {
    const [pos, setPos] = useState({x: 80, y: 80});
    
    useEffect(() => {
        const interval = setInterval(() => {
            // Random float movement
            setPos(p => ({
                x: Math.max(10, Math.min(90, p.x + (Math.random() - 0.5) * 5)),
                y: Math.max(10, Math.min(90, p.y + (Math.random() - 0.5) * 5))
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className="absolute pointer-events-none z-40 transition-all duration-1000 ease-in-out"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
            <div className="relative animate-bounce">
                <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(0,255,255,0.8)] border-2 border-neon-blue flex items-center justify-center">
                    <div className="w-4 h-1 bg-black rounded-full animate-pulse"></div>
                </div>
                <div className="absolute -top-3 -left-2 w-3 h-3 border-l-2 border-t-2 border-white rounded-tl-lg"></div>
                <div className="absolute -top-3 -right-2 w-3 h-3 border-r-2 border-t-2 border-white rounded-tr-lg"></div>
            </div>
        </div>
    );
};

const NavBtn: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-neon-blue scale-110' : 'text-gray-500'}`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);