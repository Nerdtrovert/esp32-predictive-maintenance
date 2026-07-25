import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Analytics,
  Bell,
  Wrench,
  FileText
} from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-card text-card-foreground border-r border-border flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          {/* Enhanced logo area */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-industrial-blue to-industrial-accent rounded-lg flex items-center justify-center">
              <div className="text-white text-sm font-bold">MH</div>
            </div>
          </div>
          <h1 className="text-xl font-semibold">Machine Hawk</h1>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            className={( { isActive } ) => `
              flex items-center px-3 py-2 rounded-md text-sm font-medium
              ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
            `}
          >
            <LayoutDashboard className="mr-3 h-4 w-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/machine/1"
            end
            className={( { isActive } ) => `
              flex items-center px-3 py-2 rounded-md text-sm font-medium
              ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
            `}
          >
            <Settings className="mr-3 h-4 w-4" />
            Machines
          </NavLink>

          <NavLink
            to="/ai-insights"
            end
            className={( { isActive } ) => `
              flex items-center px-3 py-2 rounded-md text-sm font-medium
              ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
            `}
          >
            <Analytics className="mr-3 h-4 w-4" />
            AI Insights
          </NavLink>

          <NavLink
            to="/alerts"
            end
            className={( { isActive } ) => `
              flex items-center px-3 py-2 rounded-md text-sm font-medium
              ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
            `}
          >
            <Bell className="mr-3 h-4 w-4" />
            Alerts
          </NavLink>

          <NavLink
            to="/maintenance"
            end
            className={( { isActive } ) => `
              flex items-center px-3 py-2 rounded-md text-sm font-medium
              ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
            `}
          >
            <Wrench className="mr-3 h-4 w-4" />
            Maintenance
          </NavLink>

          <NavLink
            to="/reports"
            end
            className={( {isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/5 text-foreground/80 hover:text-foreground'}
            `}
          >
            <FileText className="mr-3 h-4 w-4" />
            Reports
          </NavLink>
        </nav>

        <div className="mt-auto p-4 border-t border-border">
          <NavLink
            to="/settings"
            end
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/5 text-foreground/80 hover:text-foreground"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </NavLink>
        </div>
      </div>
    </aside>
  );
};