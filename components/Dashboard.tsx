
import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
// FIX: Corrected import paths.
import { useAppContext } from '../context/AppContext';
import { LeaveRequest, Memo } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';

const MemoFormModal: React.FC<{
    memo: Memo | null;
    onClose: () => void;
    onSave: (memo: Omit<Memo, 'id'> | Memo) => void;
}> = ({ memo, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: memo?.title || '',
        content: memo?.content || '',
        date: memo?.date || new Date().toISOString().slice(0, 10),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (memo) {
            onSave({ ...memo, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={memo ? 'Edit Memo' : 'Create New Memo'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
                <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                <Textarea label="Content" name="content" value={formData.content} onChange={handleChange} required />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Memo</Button>
                </div>
            </form>
        </Modal>
    );
};

const AdminDashboard: React.FC = () => {
    const { employees, jobPostings, performanceReviews, memos, addMemo, updateMemo, deleteMemo } = useAppContext();
    const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
    const [memoToEdit, setMemoToEdit] = useState<Memo | null>(null);
    const [memoToDelete, setMemoToDelete] = useState<Memo | null>(null);

    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const openPositions = jobPostings.filter(p => p.status === 'Open').length;
    const pendingReviews = performanceReviews.filter(r => r.status === 'Pending').length;

    const handleOpenMemoModal = (memo: Memo | null) => {
        setMemoToEdit(memo);
        setIsMemoModalOpen(true);
    };

    const handleCloseMemoModal = () => {
        setMemoToEdit(null);
        setIsMemoModalOpen(false);
    };

    const handleSaveMemo = (memoData: Omit<Memo, 'id'> | Memo) => {
        if ('id' in memoData) {
            updateMemo(memoData);
        } else {
            addMemo(memoData);
        }
        handleCloseMemoModal();
    };

    const handleDeleteMemo = () => {
        if (memoToDelete) {
            deleteMemo(memoToDelete.id);
            setMemoToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Welcome back, Admin!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Active Employees</h3>
                    <p className="text-4xl font-bold mt-2">{activeEmployees}</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Open Job Positions</h3>
                    <p className="text-4xl font-bold mt-2">{openPositions}</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Pending Reviews</h3>
                    <p className="text-4xl font-bold mt-2">{pendingReviews}</p>
                </Card>
            </div>
            
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Manage Memos & Events</h3>
                    <Button onClick={() => handleOpenMemoModal(null)}>Create New</Button>
                </div>
                <ul className="space-y-3 max-h-96 overflow-y-auto">
                    {memos.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(memo => (
                        <li key={memo.id} className="py-3 border-b dark:border-gray-700 last:border-b-0 flex justify-between items-start gap-4">
                            <div>
                                <p className="font-semibold">{memo.title}</p>
                                <p className="text-sm text-gray-500">{memo.date}</p>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{memo.content}</p>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                                <Button size="sm" variant="secondary" onClick={() => handleOpenMemoModal(memo)}>Edit</Button>
                                <Button size="sm" variant="secondary" onClick={() => setMemoToDelete(memo)} className="!bg-red-100 !text-red-700 hover:!bg-red-200 dark:!bg-red-900/50 dark:!text-red-300 dark:hover:!bg-red-900/80">Delete</Button>
                            </div>
                        </li>
                    ))}
                     {memos.length === 0 && <p className="text-gray-500 text-center py-8">No memos have been posted.</p>}
                </ul>
            </Card>

            {isMemoModalOpen && (
                <MemoFormModal
                    memo={memoToEdit}
                    onClose={handleCloseMemoModal}
                    onSave={handleSaveMemo}
                />
            )}
            {memoToDelete && (
                <Modal isOpen={true} onClose={() => setMemoToDelete(null)} title="Confirm Deletion">
                    <p>Are you sure you want to delete the memo titled "<strong>{memoToDelete.title}</strong>"? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="secondary" onClick={() => setMemoToDelete(null)}>Cancel</Button>
                        <Button onClick={handleDeleteMemo} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">Delete</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};


const EmployeeDashboard: React.FC = () => {
    const { currentUser, leaveRequests, memos, setActiveModule } = useAppContext();

    if (!currentUser) {
        return <p>Loading...</p>;
    }

    const myLeaveRequests = leaveRequests
        .filter(lr => lr.employeeId === currentUser.id)
        .slice(0, 5); // Get latest 5 requests
    
    const upcomingMemos = memos
        .filter(memo => new Date(memo.date + 'T00:00:00') >= new Date(new Date().toDateString()))
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

    const getStatusColor = (status: LeaveRequest['status']) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Welcome back, {currentUser.name}!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Vacation Days Left</h3>
                    <p className="text-4xl font-bold mt-2 text-green-500">{currentUser.leaveCredits.vacation}</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Sick Days Left</h3>
                    <p className="text-4xl font-bold mt-2 text-yellow-500">{currentUser.leaveCredits.sick}</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Personal Days Left</h3>
                    <p className="text-4xl font-bold mt-2 text-blue-500">{currentUser.leaveCredits.personal}</p>
                </Card>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Recent Leave Requests</h3>
                        <Button size="sm" onClick={() => setActiveModule('attendance')}>View All</Button>
                    </div>
                     {myLeaveRequests.length > 0 ? (
                        <ul className="space-y-3">
                            {myLeaveRequests.map(req => (
                                <li key={req.id} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-b-0">
                                    <div>
                                        <p className="font-medium">{req.type}</p>
                                        <p className="text-sm text-gray-500">{req.startDate} to {req.endDate}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-gray-500 dark:text-gray-400 pt-4 text-center">You haven't made any leave requests yet.</p>
                     )}
                </Card>
                 <Card>
                    <h3 className="text-xl font-bold mb-4">Memos & Upcoming Events</h3>
                     {upcomingMemos.length > 0 ? (
                        <ul className="space-y-3 max-h-72 overflow-y-auto">
                            {upcomingMemos.map(memo => (
                                <li key={memo.id} className="py-2 border-b dark:border-gray-700 last:border-b-0">
                                    <p className="font-semibold">{memo.title}</p>
                                    <p className="text-sm text-gray-500">{memo.date}</p>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{memo.content}</p>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-gray-500 dark:text-gray-400 pt-4 text-center">No upcoming announcements.</p>
                     )}
                </Card>
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
    const { userRole } = useAppContext();

    if (userRole === 'Admin') {
        return <AdminDashboard />;
    }
    
    return <EmployeeDashboard />;
};


export default Dashboard;