import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  unreadCount?: number;
  onClearUnread?: () => void;
}

export const Navbar = ({ unreadCount = 0, onClearUnread }: NavbarProps) => {
  return (
    <header className="h-16 bg-card text-card-foreground border-b border-border px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center space-x-3 flex-shrink-0">
        <img
          src="/assets/logo.png"
          alt="Machine Hawk Logo"
          className="h-8 w-8 flex-shrink-0"
        />
        <h1 className="text-xl font-semibold flex-shrink-0">Machine Hawk</h1>
      </div>

      <div className="flex items-center space-x-4 flex-shrink-0">
        <div className="relative flex-shrink-0">
          <Link
            to="/alerts"
            onClick={onClearUnread}
            className="p-2 rounded-md hover:bg-accent/5 flex-shrink-0 block relative"
          >
            <Bell className="h-4 w-4 flex-shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        <div className="relative flex-shrink-0">
          <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/5 flex-shrink-0">
            <img
              src="/assets/logo.png"
              alt="User avatar"
              className="h-8 w-8 rounded-full flex-shrink-0 object-cover"
            />
            <span className="hidden md:inline flex-shrink-0">User</span>
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
