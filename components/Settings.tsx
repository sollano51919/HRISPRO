
import React, { useState, useEffect } from 'react';
// FIX: Corrected import paths.
import { useAppContext } from '../context/AppContext';
import { HRSettings } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Modal from './ui/Modal';

type ConfirmationType = 'leave' | 'health' | null;

const Settings: React.FC = () => {
    const { settings, updateSettings } = useAppContext();
    const [localSettings, setLocalSettings] = useState<HRSettings>(settings);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });
    const [isSaved, setIsSaved] = useState(false);
    const [confirmationType, setConfirmationType] = useState<ConfirmationType>(null);
    const [pendingSettings, setPendingSettings] = useState<HRSettings | null>(null);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleLeaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            defaultLeaveCredits: {
                ...prev.defaultLeaveCredits,
                [name]: Number(value) >= 0 ? Number(value) : 0,
            }
        }));
    };
    
    const handleHealthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: Number(value) >= 0 ? Number(value) : 0,
        }));
    };

    const handleApprovalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setLocalSettings(prev => ({ ...prev, twoStepApproval: checked }));
    };

    const handleHolidayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewHoliday(prev => ({ ...prev, [name]: value }));
    };

    const addHoliday = () => {
        if (!newHoliday.name || !newHoliday.date) {
            alert('Please provide a name and date for the holiday.');
            return;
        }
        setLocalSettings(prev => ({
            ...prev,
            holidays: [...prev.holidays, { ...newHoliday, id: Date.now() }]
        }));
        setNewHoliday({ name: '', date: '' });
    };

    const deleteHoliday = (id: number) => {
        setLocalSettings(prev => ({
            ...prev,
            holidays: prev.holidays.filter(h => h.id !== id)
        }));
    };

    const handleSave = () => {
        const leaveCreditsChanged = JSON.stringify(localSettings.defaultLeaveCredits) !== JSON.stringify(settings.defaultLeaveCredits);
        const healthAllowanceChanged = localSettings.healthCareAllowance !== settings.healthCareAllowance;

        setPendingSettings(localSettings);

        if (leaveCreditsChanged) {
            setConfirmationType('leave');
        } else if (healthAllowanceChanged) {
            setConfirmationType('health');
        } else {
            updateSettings(localSettings);
            showSaveConfirmation();
        }
    };

    const showSaveConfirmation = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleConfirmPropagation = (propagate: { leave?: boolean; health?: boolean; }) => {
        if (!pendingSettings) return;

        const healthAllowanceChanged = pendingSettings.healthCareAllowance !== settings.healthCareAllowance;
        
        // If we just confirmed leave, check if health also needs confirmation
        if (propagate.leave && healthAllowanceChanged) {
            updateSettings(pendingSettings, { leave: true }); // Save leave changes
            setConfirmationType('health'); // Move to next confirmation
        } else {
            // Otherwise, finalize the save
            updateSettings(pendingSettings, propagate);
            setConfirmationType(null);
            setPendingSettings(null);
            showSaveConfirmation();
        }
    };
    
    const handleDeclinePropagation = (propagate: { leave?: boolean; health?: boolean; }) => {
         handleConfirmPropagation(propagate); // Functionally the same logic flow, just with 'false' for propagation
    };
    
    const closeModals = () => {
        setConfirmationType(null);
        setPendingSettings(null);
    }
    
    const renderConfirmationModal = () => {
        if (!confirmationType) return null;
        
        const isLeave = confirmationType === 'leave';
        const title = isLeave ? "Confirm Leave Policy Update" : "Confirm Health Care Policy Update";
        const message = isLeave 
            ? "You've changed the default leave credits. Would you like to apply these new defaults to all active employees?"
            : "You've changed the default health care allowance. Would you like to reset the allowance and balance for all active employees based on this new amount?";
        
        return (
             <Modal isOpen={true} onClose={closeModals} title={title}>
                <p className="text-gray-700 dark:text-gray-300">{message}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2"><strong>Warning:</strong> This will overwrite their current balances. This action cannot be undone.</p>
                <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="secondary" onClick={() => handleDeclinePropagation(isLeave ? { leave: false } : { health: false })}>Save Settings Only</Button>
                    <Button onClick={() => handleConfirmPropagation(isLeave ? { leave: true } : { health: true })} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">Apply to All & Save</Button>
                </div>
            </Modal>
        )
    }
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {renderConfirmationModal()}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">System Settings</h1>
                <Button onClick={handleSave} className="relative">
                    {isSaved && <CheckIcon className="w-5 h-5 mr-2" />}
                    {isSaved ? 'Settings Saved!' : 'Save All Settings'}
                </Button>
            </div>
            
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Leave Policy</h2>
                <p className="text-sm text-gray-500 mb-4">Set the default annual leave credits for new employees. Saving changes here will prompt to update existing active employees.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Vacation Days" name="vacation" type="number" min="0" value={localSettings.defaultLeaveCredits.vacation} onChange={handleLeaveChange} />
                    <Input label="Sick Days" name="sick" type="number" min="0" value={localSettings.defaultLeaveCredits.sick} onChange={handleLeaveChange} />
                    <Input label="Personal Days" name="personal" type="number" min="0" value={localSettings.defaultLeaveCredits.personal} onChange={handleLeaveChange} />
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Health Care Policy</h2>
                <p className="text-sm text-gray-500 mb-4">Set the default annual health care allowance for new employees. This can be overridden per employee.</p>
                <div className="max-w-xs">
                   <Input label="Annual Health Care Allowance ($)" name="healthCareAllowance" type="number" min="0" step="100" value={localSettings.healthCareAllowance} onChange={handleHealthChange} />
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Holiday Management</h2>
                 <p className="text-sm text-gray-500 mb-4">Define company-wide holidays for the current year. These dates will be excluded from leave duration calculations.</p>
                <div className="flex items-end gap-4 mb-4">
                    <Input label="Holiday Name" name="name" value={newHoliday.name} onChange={handleHolidayChange} />
                    <Input label="Date" name="date" type="date" value={newHoliday.date} onChange={handleHolidayChange} />
                    <Button onClick={addHoliday}>Add Holiday</Button>
                </div>
                <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-2">Holiday Name</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localSettings.holidays.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(holiday => (
                                <tr key={holiday.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-2 font-medium">{holiday.name}</td>
                                    <td className="p-2">{holiday.date}</td>
                                    <td className="p-2">
                                        <Button size="sm" variant="secondary" onClick={() => deleteHoliday(holiday.id)} className="!bg-red-100 !text-red-700 hover:!bg-red-200 dark:!bg-red-900/50 dark:!text-red-300 dark:hover:!bg-red-900/80">Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Approval Workflows</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Two-Step Approval</h3>
                        <p className="text-sm text-gray-500">If enabled, leave and overtime requests require supervisor approval first, then a final approval by an Admin.</p>
                         <p className="text-sm text-gray-500">If disabled, a supervisor's approval is final.</p>
                    </div>
                    <label htmlFor="approval-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="approval-toggle" className="sr-only peer" checked={localSettings.twoStepApproval} onChange={handleApprovalChange} />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium">{localSettings.twoStepApproval ? 'Enabled' : 'Disabled'}</span>
                    </label>
                </div>
            </Card>
        </div>
    );
};

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);


export default Settings;