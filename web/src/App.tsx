import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { FactoryOverview } from './pages/FactoryOverview';
import { MachineDetails } from './pages/MachineDetails';
import { AIInsights } from './pages/AIInsights';
import { Alerts } from './pages/Alerts';
import { Maintenance } from './pages/Maintenance';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <Layout>
          <Routes>
            <Route path="/" element={<FactoryOverview />} />
            <Route path="/machine/:id" element={<MachineDetails />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </div>
    </BrowserRouter>
  );
}

export default App;
