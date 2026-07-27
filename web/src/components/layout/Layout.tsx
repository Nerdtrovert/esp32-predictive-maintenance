import { Sidebar } from '../ui/Sidebar';
import { Navbar } from '../ui/Navbar';
import { Outlet } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border">
          Made by <a href="https://github.com/Nerdtrovert" className="underline hover:text-primary" target="_blank" rel="noopener noreferrer">Prajwal Navada G P</a>
        </footer>
      </div>
    </div>
  );
};
