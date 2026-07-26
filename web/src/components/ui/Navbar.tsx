import { 
  Search, 
  Bell
} from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="h-16 bg-card text-card-foreground border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-md hover:bg-accent/5">
          <Search className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold">Machine Hawk Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="p-2 rounded-md hover:bg-accent/5">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-danger rounded-full"></span>
          </button>
        </div>
        
        <div className="relative">
          <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/5">
            <img 
              src="https://via.placeholder.com/32" 
              alt="User avatar" 
              className="h-8 w-8 rounded-full"
            />
            <span className="hidden md:inline">Operator</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
