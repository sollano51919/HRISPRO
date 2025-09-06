
import React from 'react';
// FIX: Corrected import path.
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { activeModule, currentUser, logout } = useAppContext();

    const getTitle = () => {
        const title = activeModule.charAt(0).toUpperCase() + activeModule.slice(1);
        return title;
    };

    return (
        <header className="flex justify-between items-center p-4 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none lg:hidden mr-4">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
                <h1 className="text-xl font-semibold">{getTitle()}</h1>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative group">
                     <img className="h-10 w-10 rounded-full" src={currentUser?.avatar || ''} alt={currentUser?.name || 'User'}/>
                     <span className="absolute right-0 bottom-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block border dark:border-gray-700">
                         <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                            <p className="font-semibold">{currentUser?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                         </div>
                         <div className="border-t border-gray-100 dark:border-gray-700"></div>
                         <a href="#" onClick={(e) => {e.preventDefault(); logout();}} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <LogoutIcon className="w-4 h-4 mr-2" />
                            Logout
                         </a>
                     </div>
                </div>
            </div>
        </header>
    );
};

const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);


export default Header;