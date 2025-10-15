import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, History, LogOut, LayoutDashboard } from 'lucide-react'; 

export default function Header({ handleLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Waves className="h-7 w-7 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-800">OceanSight</h1>
          </div>

          
          <nav className="flex items-center gap-8">
            
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            
            
            <button 
              onClick={() => navigate('/history')} 
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
            >
              <History size={18} />
              History
            </button>
            
            
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}