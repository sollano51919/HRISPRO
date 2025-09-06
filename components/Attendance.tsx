// FIX: Create new file `components/Attendance.tsx`

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Spinner from './ui/Spinner';
import { LeaveRequest, EmployeeSchedule, OvertimeRequest } from '../types';
import { checkLeaveAvailability, generateEmployeeSchedule } from '../services/geminiService';
import AttendanceDashboard from './AttendanceDashboard';

type ActiveTab = 'dashboard' | 'leave' | 'schedules' | 'overtime' | 'records';

// Sub-components for each tab

const LeaveRequestsTab: React.FC = () => {
    const { currentUser, leaveRequests, addLeaveRequest, settings, userRole, employees, updateLeaveRequest } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [availabilityResult, setAvailabilityResult] = useState('');

    const myRequests = leaveRequests.filter(lr => userRole === 'Admin' || lr.employeeId === currentUser?.id);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleCheckAvailability = async () => {
        if (!currentUser || !formData.startDate || !formData.endDate) {
            alert("Please select start and end dates.");
            return;
        }
        setIsLoading(true);
        setAvailabilityResult('');
        const result = await checkLeaveAvailability(
            currentUser.name,
            currentUser.leaveCredits,
            formData.type as LeaveRequest['type'],
            formData.startDate,
            formData.endDate,
            settings.holidays
        );
        setAvailabilityResult(result);
        setIsLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        addLeaveRequest({ ...formData, employeeId: currentUser.id, employeeName: currentUser.name, status: 'Pending' });
        setIsModalOpen(false);
    };
    
    const handleAdminUpdateRequest = (request: LeaveRequest, status: LeaveRequest['status']) => {
        updateLeaveRequest({ ...request, status });
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Leave Requests</h2>
                {userRole === 'Employee' && <Button onClick={() => setIsModalOpen(true)}>Request Leave</Button>}
            </div>
            <Card>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            {userRole === 'Admin' && <th className="p-4">Employee</th>}
                            <th className="p-4">Type</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4">Status</th>
                            {userRole === 'Admin' && <th className="p-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {myRequests.map(req => (
                            <tr key={req.id}>
                                {userRole === 'Admin' && <td className="p-4 font-medium">{req.employeeName}</td>}
                                <td className="p-4">{req.type}</td>
                                <td className="p-4">{req.startDate} to {req.endDate}</td>
                                <td className="p-4">{req.status}</td>
                                {userRole === 'Admin' && (
                                    <td className="p-4 space-x-2">
                                        <Button size="sm" onClick={() => handleAdminUpdateRequest(req, 'Approved')} disabled={req.status !== 'Pending'}>Approve</Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleAdminUpdateRequest(req, 'Rejected')} disabled={req.status !== 'Pending'}>Reject</Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Leave Request">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form fields */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Submit Request</Button>
                    </div>
                    <div className="mt-4 p-4 border-t dark:border-gray-700 space-y-3">
                        <h3 className="font-semibold text-lg">AI Leave Checker</h3>
                        <p className="text-sm text-gray-500">Use our AI assistant to check if you have enough leave credits before submitting.</p>
                        <Button type="button" onClick={handleCheckAvailability} disabled={isLoading || !formData.startDate || !formData.endDate}>
                            {isLoading ? 'Checking...' : 'Check Availability'}
                        </Button>
                        {isLoading && <Spinner />}
                        {availabilityResult && (
                             <div className={`p-3 rounded-md text-sm ${
                                availabilityResult.startsWith('CONFIRMED') ? 'bg-green-100 text-green-800' :
                                availabilityResult.startsWith('WARNING') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>{availabilityResult}</div>
                        )}
                    </div>
                </form>
            </Modal>
        </>
    );
};

const SchedulesTab: React.FC = () => {
    const { employees, schedules, addSchedule } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; position: string; department: string; name: string } | null>(null);
    const [generatedSchedule, setGeneratedSchedule] = useState<any>(null);

    const handleGenerate = async () => {
        if (!selectedEmployee) return;
        setIsLoading(true);
        setGeneratedSchedule(null);
        const result = await generateEmployeeSchedule(selectedEmployee.position, selectedEmployee.department);
        try {
            const parsed = JSON.parse(result);
            if (!parsed.error) {
                setGeneratedSchedule(parsed);
            }
        } catch (e) { console.error(e); }
        setIsLoading(false);
    };

    const handleSave = () => {
        if (!generatedSchedule || !selectedEmployee) return;
        const newSchedule: Omit<EmployeeSchedule, 'id'> = {
            ...generatedSchedule,
            employeeId: Number(selectedEmployee.id),
            employeeName: selectedEmployee.name,
            effectiveDate: new Date().toISOString().slice(0, 10),
            endDate: null,
        };
        addSchedule(newSchedule);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Employee Schedules</h2>
                <Button onClick={() => setIsModalOpen(true)}>Generate Schedule</Button>
            </div>
            <Card>
                {/* Table of schedules */}
                <p className="text-center p-4 text-gray-500">Schedule table would be here.</p>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="AI Schedule Generator">
                 {!generatedSchedule && (
                     <div className="space-y-4">
                        <select onChange={e => {
                            const [id, position, department, name] = e.target.value.split('|');
                            setSelectedEmployee({ id, position, department, name });
                        }} className="w-full p-2 border rounded">
                            <option>Select Employee</option>
                            {employees.filter(e => e.status === 'Active').map(e => (
                                <option key={e.id} value={`${e.id}|${e.position}|${e.department}|${e.name}`}>{e.name} - {e.position}</option>
                            ))}
                        </select>
                        <div className="flex justify-end">
                            <Button onClick={handleGenerate} disabled={!selectedEmployee || isLoading}>
                                {isLoading ? <Spinner /> : 'Generate'}
                            </Button>
                        </div>
                    </div>
                 )}
                 {generatedSchedule && (
                     <div className="space-y-4">
                        <h3 className="font-semibold">Generated Schedule for {selectedEmployee?.name}</h3>
                        <pre className="p-2 bg-gray-100 dark:bg-gray-700 rounded whitespace-pre-wrap">{JSON.stringify(generatedSchedule, null, 2)}</pre>
                        <div className="flex justify-end space-x-2">
                             <Button variant="secondary" onClick={() => setGeneratedSchedule(null)}>Back</Button>
                            <Button onClick={handleSave}>Save Schedule</Button>
                        </div>
                     </div>
                 )}
            </Modal>
        </>
    );
};

const OvertimeTab: React.FC = () => <Card><p className="text-center p-4">Overtime Requests feature not yet implemented.</p></Card>;
const RecordsTab: React.FC = () => <Card><p className="text-center p-4">Time Records feature not yet implemented.</p></Card>;

const Attendance: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const { userRole } = useAppContext();

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AttendanceDashboard />;
            case 'leave': return <LeaveRequestsTab />;
            case 'schedules': return <SchedulesTab />;
            case 'overtime': return <OvertimeTab />;
            case 'records': return <RecordsTab />;
            default: return null;
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'leave', label: 'Leave Requests' },
        ...(userRole === 'Admin' ? [{ id: 'schedules', label: 'Schedules' }] : []),
        { id: 'overtime', label: 'Overtime' },
        ...(userRole === 'Admin' ? [{ id: 'records', label: 'Time Records' }] : []),
    ];

    return (
        <div>
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            {renderTabContent()}
        </div>
    );
};

export default Attendance;
