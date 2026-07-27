import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  TrendingUp,
  Cpu,
  Bell,
  Wrench,
  FileText
} from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-card text-card-foreground border-r border-border flex-shrink-0 flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-6">
          {/* Enhanced logo area */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <img src="/assets/logo.png" alt="Machine Hawk Logo" className="h-8 w-8 flex-shrink-0" />
          </div>
          <h1 className="text-xl font-semibold flex-shrink-0">Machine Hawk</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 py-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 border-l-2 text-sm font-medium transition-all duration-200
            ${isActive ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-transparent hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
          `}
        >
          <LayoutDashboard className="mr-3 h-4 w-4 flex-shrink-0" />
          Dashboard
        </NavLink>

        <NavLink
          to="/machine/1"
          end
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 border-l-2 text-sm font-medium transition-all duration-200
            ${isActive ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-transparent hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
          `}
        >
          <Cpu className="mr-3 h-4 w-4 flex-shrink-0" />
          Machines
        </NavLink>

        <NavLink
          to="/ai-insights"
          end
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 border-l-2 text-sm font-medium transition-all duration-200
            ${isActive ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-transparent hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
          `}
        >
          <TrendingUp className="mr-3 h-4 w-4 flex-shrink-0" />
          AI Insights
        </NavLink>

        <NavLink
          to="/alerts"
          end
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 border-l-2 text-sm font-medium transition-all duration-200
            ${isActive ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-transparent hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
          `}
        >
          <Bell className="mr-3 h-4 w-4 flex-shrink-0" />
          Alerts
        </NavLink>

        <NavLink
          to="/maintenance"
          end
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 border-l-2 text-sm font-medium transition-all duration-200
            ${isActive ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-transparent hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
          `}
        >
          <Wrench className="mr-3 h-4 w-4 flex-shrink-0" />
          Maintenance
        </NavLink>

        <NavLink
          to="/reports"
          end
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 border-l-2 text-sm font-medium transition-all duration-200
            ${isActive ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-transparent hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
          `}
        >
          <FileText className="mr-3 h-4 w-4 flex-shrink-0" />
          Reports
        </NavLink>
      </nav>

      <div className="mt-auto h-[60px] flex items-center border-t border-border flex-shrink-0">
        <NavLink
          to="/settings"
          end
          className={({ isActive }) => `
            flex items-center w-full px-4 h-full border-l-2 text-sm font-medium transition-all duration-200
            ${isActive ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-transparent hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
          `}
        >
          <Settings className="mr-3 h-4 w-4 flex-shrink-0" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
};