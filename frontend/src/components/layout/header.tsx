import React from 'react';
import { Shield, Settings, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-blue-400" />
            <Zap className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CodeGeist
            </h1>
            <p className="text-xs text-slate-400 font-medium">Analyse de Sécurité Intelligente</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-1">
          <Button
            variant={currentView === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => onViewChange('dashboard')}
            className={currentView === 'dashboard' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }
          >
            Tableau de Bord
          </Button>
          <Button
            variant={currentView === 'projects' ? 'default' : 'ghost'}
            onClick={() => onViewChange('projects')}
            className={currentView === 'projects' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }
          >
            Projets
          </Button>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;