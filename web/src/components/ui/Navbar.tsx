import {
  Search,
  Bell
} from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="h-16 bg-card text-card-foreground border-bell text-card-foreground border-b border-border px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center space-x-4 flex-shrink-0">
        <h1 className="text-xl font-semibold flex-shrink-0">Machine Hawk Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4 flex-shrink-0">
        <div className="relative flex-shrink-0">
          <button className="p-2 rounded-md hover:bg-accent/5 flex-shrink-0">
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-danger rounded-full" />
          </button>
        </div>

        <div className="relative flex-shrink-0">
          <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/5 flex-shrink-0">
            <img
              src="https://via.placeholder.com/32"
              alt="User avatar"
              className="h-8 w-8 rounded-full flex-shrink-0"
            />
            <span className="hidden md:inline flex-shrink-0">Operator</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 flex-shrink-0"
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
