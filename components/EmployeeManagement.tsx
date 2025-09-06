
import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Textarea from './ui/Textarea';
import Spinner from './ui/Spinner';
import Input from './ui/Input';
// FIX: Corrected import paths.
import { Employee } from '../types';
import { generatePerformanceReview } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

const PerformanceReviewGenerator: React.FC<{ employee: Employee | null; onClose: () => void }> = ({ employee, onClose }) => {
    // ... (existing component, no changes needed)
    const [achievements, setAchievements] = useState(employee?.performance.achievements.join(', ') || '');
    const [improvementAreas, setImprovementAreas] = useState(employee?.performance.areasForImprovement.join(', ') || '');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedReview, setGeneratedReview] = useState('');

    if (!employee) return null;

    const handleGenerate = async () => {
        if (!achievements || !improvementAreas) {
            alert('Please provide key achievements and areas for improvement.');
            return;
        }
        setIsLoading(true);
        setGeneratedReview('');
        const result = await generatePerformanceReview(employee.name, achievements, improvementAreas);
        setGeneratedReview(result);
        setIsLoading(false);
    };
    
    return (
        <div className="space-y-4">
           {!generatedReview && !isLoading && (
            <>
            <Textarea label="Key Achievements" value={achievements} onChange={(e) => setAchievements(e.target.value)} />
            <Textarea label="Areas for Improvement" value={improvementAreas} onChange={(e) => setImprovementAreas(e.target.value)} />
            <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={isLoading}>Generate Summary</Button>
            </div>
            </>
           )}
           {isLoading && <div className="flex flex-col items-center justify-center h-64"><Spinner/><p className="mt-2 text-gray-500">AI is writing a thoughtful review...</p></div>}
           {generatedReview && (
               <div>
                   <h3 className="text-lg font-semibold mb-2">Generated Performance Review Summary</h3>
                   <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md max-h-96 overflow-y-auto whitespace-pre-wrap font-sans text-sm">
                       {generatedReview}
                   </div>
                   <div className="flex justify-end space-x-2 mt-4">
                       <Button variant="secondary" onClick={() => setGeneratedReview('')}>Back to Form</Button>
                       <Button onClick={() => navigator.clipboard.writeText(generatedReview)}>Copy Text</Button>
                   </div>
               </div>
           )}
        </div>
    );
};

const EmployeeFormModal: React.FC<{ employee: Partial<Employee> | null; employees: Employee[]; onClose: () => void; onSave: (employee: Employee) => void; }> = ({ employee, employees, onClose, onSave }) => {
    const { settings } = useAppContext();
    const [formData, setFormData] = useState<Employee>({
        id: employee?.id || Date.now(),
        name: employee?.name || '',
        position: employee?.position || '',
        department: employee?.department || '',
        email: employee?.email || '',
        avatar: employee?.avatar || `https://i.pravatar.cc/100?u=${Date.now()}`,
        status: employee?.status || 'Active',
        gender: employee?.gender || 'Prefer not to say',
        supervisorId: employee?.supervisorId || null,
        address: employee?.address || { street: '', city: '', state: '', zip: '' },
        employmentHistory: employee?.employmentHistory || [],
        contracts: employee?.contracts || [],
        performance: employee?.performance || { lastReview: '', achievements: [], areasForImprovement: [] },
        leaveCredits: employee?.leaveCredits || settings.defaultLeaveCredits,
        healthCareBenefit: employee?.healthCareBenefit || { allowance: settings.healthCareAllowance, balance: settings.healthCareAllowance },
        password: '', // Always start blank for security
        accessibleModules: employee?.accessibleModules || [],
        assignedBiometricNumber: employee?.assignedBiometricNumber || null,
    });

    const employeeModules = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'profile', label: 'Profile' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'benefits', label: 'Benefits' },
        { id: 'assistant', label: 'AI Assistant' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'assignedBiometricNumber') {
            setFormData(prev => ({ ...prev, [name]: value ? Number(value) : null }));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    }
    
    const handleBenefitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = Number(value) >= 0 ? Number(value) : 0;
        setFormData(p => ({ ...p, healthCareBenefit: { ...p.healthCareBenefit, [name]: numValue } }));
    };

    const handleModuleChange = (moduleId: string, isChecked: boolean) => {
        setFormData(prev => {
            const modules = prev.accessibleModules || [];
            if (isChecked) {
                return { ...prev, accessibleModules: [...new Set([...modules, moduleId])] };
            } else {
                return { ...prev, accessibleModules: modules.filter(id => id !== moduleId) };
            }
        });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, address: { ...p.address, [name]: value } }));
    };

    const handleHistoryChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newHistory = [...formData.employmentHistory];
        newHistory[index] = { ...newHistory[index], [name]: value };
        setFormData(p => ({ ...p, employmentHistory: newHistory }));
    };

    const addHistory = () => setFormData(p => ({ ...p, employmentHistory: [...p.employmentHistory, { company: '', position: '', startDate: '', endDate: '' }] }));
    const removeHistory = (index: number) => setFormData(p => ({ ...p, employmentHistory: p.employmentHistory.filter((_, i) => i !== index) }));

    const handleContractChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newContracts = [...formData.contracts];
        newContracts[index] = { ...newContracts[index], [name]: value as any };
        setFormData(p => ({ ...p, contracts: newContracts }));
    };
    
    const addContract = () => setFormData(p => ({ ...p, contracts: [...p.contracts, { type: 'Full-Time', startDate: '', endDate: '' }] }));
    const removeContract = (index: number) => setFormData(p => ({ ...p, contracts: p.contracts.filter((_, i) => i !== index) }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.assignedBiometricNumber) {
            const isDuplicate = employees.some(
                emp => emp.id !== formData.id && emp.assignedBiometricNumber === formData.assignedBiometricNumber
            );
            if (isDuplicate) {
                alert(`Error: Biometric Number "${formData.assignedBiometricNumber}" is already assigned to another employee. Please provide a unique number.`);
                return;
            }
        }

        let finalData = { ...formData };

        // If editing an existing employee and the password field is blank,
        // do not overwrite their existing password.
        if (employee?.id && !formData.password) {
            const originalEmployee = employees.find(e => e.id === employee.id);
            finalData.password = originalEmployee?.password;
        }

        onSave(finalData);
        onClose();
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={employee?.id ? 'Edit Employee' : 'Add New Employee'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                    <Input label="Position" name="position" value={formData.position} onChange={handleChange} required />
                    <Input label="Department" name="department" value={formData.department} onChange={handleChange} required />
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    <Input label="Set/Reset Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder={employee?.id ? 'Leave blank to keep existing' : ''} required={!employee?.id} />
                    <Input label="Avatar URL" name="avatar" value={formData.avatar} onChange={handleChange} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                            <option>Prefer not to say</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supervisor</label>
                        <select name="supervisorId" value={formData.supervisorId || ''} onChange={(e) => setFormData(p => ({ ...p, supervisorId: e.target.value ? Number(e.target.value) : null }))} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option value="">None</option>
                            {employees.filter(e => e.id !== formData.id && e.status === 'Active').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <Input 
                        label="Assigned Biometric Number"
                        name="assignedBiometricNumber"
                        type="number"
                        value={formData.assignedBiometricNumber || ''}
                        onChange={handleChange}
                        placeholder="e.g. 1001"
                    />
                    {employee?.id && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                <option value="Active">Active</option><option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    )}
                </fieldset>
                
                 {/* Accessible Modules */}
                 <fieldset className="border p-4 rounded-md">
                    <legend className="px-2 font-semibold">Accessible Modules</legend>
                    <div className="flex flex-wrap gap-4">
                        {employeeModules.map(module => (
                            <label key={module.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={formData.accessibleModules?.includes(module.id)}
                                    onChange={(e) => handleModuleChange(module.id, e.target.checked)}
                                />
                                <span>{module.label}</span>
                            </label>
                        ))}
                    </div>
                 </fieldset>

                 <fieldset className="border p-4 rounded-md space-y-4">
                     <legend className="px-2 font-semibold">Health Care</legend>
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Annual Health Care Allowance ($)" name="allowance" type="number" step="100" min="0" value={formData.healthCareBenefit.allowance} onChange={handleBenefitChange} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remaining Balance ($)</label>
                            <p className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md sm:text-sm">{formData.healthCareBenefit.balance.toFixed(2)}</p>
                        </div>
                     </div>
                 </fieldset>

                <fieldset className="border p-4 rounded-md space-y-4">
                    <legend className="px-2 font-semibold">Address</legend>
                    <Input label="Street" name="street" value={formData.address.street} onChange={handleAddressChange} />
                    <div className="grid grid-cols-3 gap-4">
                        <Input label="City" name="city" value={formData.address.city} onChange={handleAddressChange} />
                        <Input label="State" name="state" value={formData.address.state} onChange={handleAddressChange} />
                        <Input label="ZIP Code" name="zip" value={formData.address.zip} onChange={handleAddressChange} />
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                    <legend className="px-2 font-semibold">Employment History</legend>
                    <div className="space-y-4 max-h-48 overflow-y-auto">
                        {formData.employmentHistory.map((hist, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b dark:border-gray-700 pb-4">
                                <Input label="Company" name="company" value={hist.company} onChange={e => handleHistoryChange(index, e)} />
                                <Input label="Position" name="position" value={hist.position} onChange={e => handleHistoryChange(index, e)} />
                                <Input label="Start Date" name="startDate" type="date" value={hist.startDate} onChange={e => handleHistoryChange(index, e)} />
                                <div className="flex items-end">
                                    <Input label="End Date" name="endDate" type="date" value={hist.endDate} onChange={e => handleHistoryChange(index, e)} />
                                    <Button type="button" variant="secondary" size="sm" onClick={() => removeHistory(index)} className="ml-2 mb-1 !p-2 bg-red-100 text-red-700 hover:bg-red-200"><TrashIcon/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="secondary" onClick={addHistory} className="mt-4">Add History</Button>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                    <legend className="px-2 font-semibold">Contracts</legend>
                    <div className="space-y-4 max-h-48 overflow-y-auto">
                        {formData.contracts.map((con, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b dark:border-gray-700 pb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select name="type" value={con.type} onChange={e => handleContractChange(index, e)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                        <option>Full-Time</option><option>Part-Time</option><option>Contract</option>
                                    </select>
                                </div>
                                <Input label="Start Date" name="startDate" type="date" value={con.startDate} onChange={e => handleContractChange(index, e)} />
                                <div className="flex items-end">
                                    <Input label="End Date (Optional)" name="endDate" type="date" value={con.endDate || ''} onChange={e => handleContractChange(index, e)} />
                                    <Button type="button" variant="secondary" size="sm" onClick={() => removeContract(index)} className="ml-2 mb-1 !p-2 bg-red-100 text-red-700 hover:bg-red-200"><TrashIcon/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="secondary" onClick={addContract} className="mt-4">Add Contract</Button>
                </fieldset>
                
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Employee</Button>
                </div>
            </form>
        </Modal>
    )
}

const EmployeeManagement: React.FC = () => {
    const { employees, addEmployee, updateEmployee, setActiveModule, setViewingEmployeeId } = useAppContext();
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [viewStatus, setViewStatus] = useState<'Active' | 'Inactive'>('Active');
    const [searchTerm, setSearchTerm] = useState('');

    const openReviewModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setReviewModalOpen(true);
    };

    const handleOpenEmployeeForm = (employee: Employee | null) => {
        setSelectedEmployee(employee);
        setEmployeeFormOpen(true);
    };
    
    const handleViewProfile = (employee: Employee) => {
        setViewingEmployeeId(employee.id);
        setActiveModule('profile');
    };

    const handleCloseModals = () => {
        setReviewModalOpen(false);
        setEmployeeFormOpen(false);
        setSelectedEmployee(null);
    };
    
    const handleSaveEmployee = (employeeData: Employee) => {
        const exists = employees.some(e => e.id === employeeData.id);
        if (exists) {
            updateEmployee(employeeData);
        } else {
            addEmployee(employeeData as Omit<Employee, 'id'>);
        }
        handleCloseModals();
    };

    const filteredEmployees = useMemo(() => {
        return employees
            .filter(employee => employee.status === viewStatus)
            .filter(employee => {
                const term = searchTerm.toLowerCase();
                return (
                    employee.name.toLowerCase().includes(term) ||
                    employee.position.toLowerCase().includes(term) ||
                    employee.department.toLowerCase().includes(term)
                );
            });
    }, [employees, viewStatus, searchTerm]);
    
    return (
         <>
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                     <div className="flex-1">
                        <Input 
                            label="Search Employees"
                            placeholder="Search by name, position, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end gap-4">
                        <Button onClick={() => handleOpenEmployeeForm(null)}>Add New Employee</Button>
                    </div>
                </div>
            </Card>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setViewStatus('Active')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${viewStatus === 'Active' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        Active Employees
                    </button>
                    <button onClick={() => setViewStatus('Inactive')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${viewStatus === 'Inactive' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        Inactive Employees
                    </button>
                </nav>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map(employee => (
                    <Card key={employee.id} className="flex flex-col">
                        <div className="flex-grow text-center">
                            <img src={employee.avatar} alt={employee.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
                            <h3 className="text-lg font-bold">{employee.name}</h3>
                            <p className="text-indigo-500 dark:text-indigo-400">{employee.position}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.department}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{employee.email}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t dark:border-gray-700 flex flex-col space-y-2">
                             {employee.status === 'Active' && (
                                <Button size="sm" variant="secondary" onClick={() => openReviewModal(employee)}>
                                   <span className="flex items-center justify-center">
                                        <SparklesIcon className="w-4 h-4 mr-2" />
                                        Write Performance Review
                                   </span>
                                </Button>
                             )}
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" className="w-full" onClick={() => handleViewProfile(employee)}>View Profile</Button>
                                <Button size="sm" variant="secondary" className="w-full" onClick={() => handleOpenEmployeeForm(employee)}>Edit</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            
            {reviewModalOpen && (
                <Modal isOpen={reviewModalOpen} onClose={handleCloseModals} title={`AI Performance Review for ${selectedEmployee?.name}`}>
                    <PerformanceReviewGenerator employee={selectedEmployee} onClose={handleCloseModals} />
                </Modal>
            )}

            {employeeFormOpen && (
                 <EmployeeFormModal employee={selectedEmployee} employees={employees} onClose={handleCloseModals} onSave={handleSaveEmployee} />
            )}
         </>
    );
};

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4 4-4 5.293-5.293a1 1 0 011.414 0L21 11.707" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


export default EmployeeManagement;