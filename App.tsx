
import React from 'react';
// FIX: Corrected import paths to be relative.
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import Recruitment from './components/Recruitment';
import Performance from './components/Performance';
import Reporting from './components/Reporting';
import AiAssistant from './components/AiAssistant';
import Attendance from './components/Attendance';
import Login from './components/Login';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Benefits from './components/Benefits';

const MainApp: React.FC = () => {
    const { activeModule } = useAppContext();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const renderContent = () => {
        switch (activeModule) {
            case 'dashboard':
                return <Dashboard />;
            case 'employees':
                return <EmployeeManagement />;
            case 'recruitment':
                return <Recruitment />;
            case 'performance':
                return <Performance />;
            case 'reporting':
                return <Reporting />;
            case 'attendance':
                return <Attendance />;
            case 'assistant':
                return <AiAssistant />;
            case 'profile':
                return <Profile />;
            case 'settings':
                return <Settings />;
            case 'benefits':
                return <Benefits />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
    const { isAuthenticated } = useAppContext();

    if (!isAuthenticated) {
        return <Login />;
    }

    return <MainApp />;
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;