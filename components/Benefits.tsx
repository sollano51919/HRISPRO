
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { HealthCareClaim } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';

const ClaimFormModal: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => {
    const { currentUser, addHealthCareClaim } = useAppContext();
    const [date, setDate] = useState('');
    const [type, setType] = useState('');
    const [amount, setAmount] = useState('');
    const [submissionError, setSubmissionError] = useState<string|null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);
        if (!currentUser) return;

        const error = await addHealthCareClaim({
            employeeId: currentUser.id,
            date,
            type,
            amount: Number(amount)
        });

        if (error) {
            setSubmissionError(error);
        } else {
            onClose();
        }
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title="File a Health Care Claim">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Date of Service" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <Input label="Claim Type" placeholder="e.g., Dental Check-up, Prescription" value={type} onChange={e => setType(e.target.value)} required />
                <Input label="Amount ($)" type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required />
                
                {submissionError && <p className="text-sm text-red-500 text-center pb-2">{submissionError}</p>}

                <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Claim</Button>
                </div>
            </form>
        </Modal>
    );
};

const EmployeeView: React.FC = () => {
    const { currentUser, healthCareClaims } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    if (!currentUser) return null;

    const myClaims = useMemo(() => {
        return healthCareClaims
            .filter(c => c.employeeId === currentUser.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [healthCareClaims, currentUser.id]);

    const getStatusColor = (status: HealthCareClaim['status']) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Annual Allowance</h3>
                    <p className="text-4xl font-bold mt-2">${currentUser.healthCareBenefit.allowance.toFixed(2)}</p>
                </Card>
                 <Card className="bg-green-50 dark:bg-green-900/20">
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Remaining Balance</h3>
                    <p className="text-4xl font-bold mt-2 text-green-700 dark:text-green-300">${currentUser.healthCareBenefit.balance.toFixed(2)}</p>
                </Card>
            </div>
            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">My Health Care Claims</h2>
                    <Button onClick={() => setIsModalOpen(true)}>File New Claim</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                             <tr className="border-b dark:border-gray-700">
                                <th className="p-4">Date</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myClaims.map(claim => (
                                <tr key={claim.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-4">{claim.date}</td>
                                    <td className="p-4 font-medium">{claim.type}</td>
                                    <td className="p-4">${claim.amount.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {myClaims.length === 0 && <p className="text-center text-gray-500 py-8">You have not filed any claims.</p>}
                </div>
            </Card>
            {isModalOpen && <ClaimFormModal onClose={() => setIsModalOpen(false)} />}
        </div>
    )
};

const AdminView: React.FC = () => {
    const { healthCareClaims, updateHealthCareClaimStatus } = useAppContext();

    const getStatusColor = (status: HealthCareClaim['status']) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4">Manage Employee Health Care Claims</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {healthCareClaims.map(claim => (
                            <tr key={claim.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">{claim.employeeName}</td>
                                <td className="p-4">{claim.date}</td>
                                <td className="p-4">{claim.type}</td>
                                <td className="p-4">${claim.amount.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                                        {claim.status}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2">
                                    {claim.status === 'Pending' && (
                                        <>
                                            <Button size="sm" onClick={() => updateHealthCareClaimStatus(claim.id, 'Approved')}>Approve</Button>
                                            <Button size="sm" variant="secondary" onClick={() => updateHealthCareClaimStatus(claim.id, 'Rejected')}>Reject</Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {healthCareClaims.length === 0 && <p className="text-center text-gray-500 py-8">No claims have been submitted.</p>}
            </div>
        </Card>
    )
};

const Benefits: React.FC = () => {
    const { userRole } = useAppContext();

    if (userRole === 'Admin') {
        return <AdminView />;
    }
    
    return <EmployeeView />;
};

export default Benefits;
