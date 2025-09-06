
import React from 'react';
import { useAppContext } from '../context/AppContext';
import Card from './ui/Card';
import Button from './ui/Button';

const Profile: React.FC = () => {
    const { currentUser, employees, viewingEmployeeId, userRole, setActiveModule } = useAppContext();

    const employeeToView = userRole === 'Admin' && viewingEmployeeId 
        ? employees.find(e => e.id === viewingEmployeeId)
        : currentUser;
        
    const supervisor = employeeToView?.supervisorId ? employees.find(e => e.id === employeeToView.supervisorId) : null;

    if (!employeeToView) {
        return <Card><p>Employee not found.</p></Card>;
    }
    
    const { name, avatar, position, department, email, status, gender, address, leaveCredits, healthCareBenefit, contracts, employmentHistory } = employeeToView;

    return (
        <div className="space-y-6">
            {userRole === 'Admin' && viewingEmployeeId && (
                <Button variant="secondary" onClick={() => setActiveModule('employees')}>
                    &larr; Back to Employee List
                </Button>
            )}
            <Card>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img src={avatar} alt={name} className="w-32 h-32 rounded-full ring-4 ring-indigo-500/50" />
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold">{name}</h1>
                        <p className="text-xl text-indigo-500 dark:text-indigo-400">{position}</p>
                        <p className="text-md text-gray-500 dark:text-gray-400">{department} Department</p>
                        <span className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                            status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>{status}</span>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 space-y-4">
                     <h2 className="text-xl font-bold border-b pb-2">Contact & Info</h2>
                     <InfoItem label="Email" value={email} />
                     <InfoItem label="Gender" value={gender} />
                     <InfoItem label="Address" value={`${address.street}, ${address.city}, ${address.state} ${address.zip}`} />
                     <InfoItem label="Supervisor" value={supervisor?.name || 'N/A'} />
                </Card>
                 <Card className="lg:col-span-2 space-y-4">
                     <h2 className="text-xl font-bold border-b pb-2">Leave & Benefits</h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                         <div>
                            <p className="text-sm text-gray-500">Vacation</p>
                            <p className="text-2xl font-bold text-green-500">{leaveCredits.vacation}</p>
                         </div>
                         <div>
                             <p className="text-sm text-gray-500">Sick</p>
                            <p className="text-2xl font-bold text-yellow-500">{leaveCredits.sick}</p>
                         </div>
                         <div>
                            <p className="text-sm text-gray-500">Personal</p>
                            <p className="text-2xl font-bold text-blue-500">{leaveCredits.personal}</p>
                         </div>
                         <div>
                            <p className="text-sm text-gray-500">Health Balance</p>
                            <p className="text-2xl font-bold">${healthCareBenefit.balance.toFixed(2)}</p>
                         </div>
                     </div>
                </Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-bold border-b pb-2 mb-4">Contracts</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {contracts.map((c, i) => (
                            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                <p className="font-semibold">{c.type}</p>
                                <p className="text-sm text-gray-500">Start: {c.startDate}</p>
                                {c.endDate && <p className="text-sm text-gray-500">End: {c.endDate}</p>}
                            </div>
                        ))}
                    </div>
                </Card>
                 <Card>
                    <h2 className="text-xl font-bold border-b pb-2 mb-4">Employment History</h2>
                     <div className="space-y-3 max-h-64 overflow-y-auto">
                        {employmentHistory.map((h, i) => (
                             <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                <p className="font-semibold">{h.position} at {h.company}</p>
                                <p className="text-sm text-gray-500">{h.startDate} to {h.endDate}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</h3>
        <p className="text-gray-900 dark:text-gray-100">{value}</p>
    </div>
);

export default Profile;
