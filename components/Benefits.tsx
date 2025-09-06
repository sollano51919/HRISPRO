import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { HealthCareClaim, Employee } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';

const AdminClaimFormModal: React.FC<{
    claimToEdit: HealthCareClaim | null;
    onClose: () => void;
}> = ({ claimToEdit, onClose }) => {
    const { employees, addHealthCareClaim, updateHealthCareClaim } = useAppContext();
    
    const [formData, setFormData] = useState({
        employeeId: claimToEdit?.employeeId.toString() || '',
        date: claimToEdit?.date || '',
        type: claimToEdit?.type || '',
        amount: claimToEdit?.amount.toString() || '',
        status: claimToEdit?.status || 'Pending',
    });
    
    const [submissionError, setSubmissionError] = useState<string|null>(null);

    const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Active'), [employees]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);

        const employee = employees.find(e => e.id === Number(formData.employeeId));
        if (!employee) {
            setSubmissionError("Selected employee not found.");
            return;
        }

        if (claimToEdit) {
            updateHealthCareClaim({
                ...claimToEdit,
                date: formData.date,
                type: formData.type,
                amount: Number(formData.amount),
                status: formData.status as HealthCareClaim['status'],
            });
        } else {
            await addHealthCareClaim({
                employeeId: Number(formData.employeeId),
                employeeName: employee.name,
                date: formData.date,
                type: formData.type,
                amount: Number(formData.amount),
                status: formData.status as HealthCareClaim['status'],
            });
        }
        onClose();
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={claimToEdit ? `Edit Claim for ${claimToEdit.employeeName}` : "File a Health Care Claim"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee</label>
                    <select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                        required
                        disabled={!!claimToEdit}
                    >
                        <option value="">-- Select an Employee --</option>
                        {activeEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                </div>
                <Input label="Date of Service" name="date" type="date" value={formData.date} onChange={handleChange} required />
                <Input label="Claim Type" name="type" placeholder="e.g., Dental Check-up, Prescription" value={formData.type} onChange={handleChange} required />
                <Input label="Amount ($)" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} required />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                        required
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                
                {submissionError && <p className="text-sm text-red-500 text-center pb-2">{submissionError}</p>}

                <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Claim</Button>
                </div>
            </form>
        </Modal>
    );
};

const EmployeeView: React.FC = () => {
    const { currentUser, healthCareClaims } = useAppContext();
    
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
    
    const balancePercentage = (currentUser.healthCareBenefit.balance / currentUser.healthCareBenefit.allowance) * 100;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Annual Allowance</h3>
                        <p className="text-4xl font-bold mt-1">${currentUser.healthCareBenefit.allowance.toFixed(2)}</p>
                    </div>
                    <div className="w-full md:w-1/2">
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-green-700 dark:text-green-400">Remaining Balance</span>
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">${currentUser.healthCareBenefit.balance.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                            <div className="bg-green-500 h-4 rounded-full" style={{width: `${balancePercentage > 0 ? balancePercentage : 0}%`}}></div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">My Health Care Claims</h2>
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
                     {myClaims.length === 0 && <p className="text-center text-gray-500 py-8">No claims have been filed on your behalf.</p>}
                </div>
            </Card>
        </div>
    )
};

const AdminView: React.FC = () => {
    const { healthCareClaims } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [claimToEdit, setClaimToEdit] = useState<HealthCareClaim | null>(null);

    const handleOpenModal = (claim: HealthCareClaim | null) => {
        setClaimToEdit(claim);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setClaimToEdit(null);
        setIsModalOpen(false);
    };

    const getStatusColor = (status: HealthCareClaim['status']) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        }
    };

    return (
        <>
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manage Employee Health Care Claims</h2>
                <Button onClick={() => handleOpenModal(null)}>File a Claim</Button>
            </div>
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
                                    <Button size="sm" variant="secondary" onClick={() => handleOpenModal(claim)}>Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {healthCareClaims.length === 0 && <p className="text-center text-gray-500 py-8">No claims have been submitted.</p>}
            </div>
        </Card>
        {isModalOpen && <AdminClaimFormModal claimToEdit={claimToEdit} onClose={handleCloseModal} />}
        </>
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
