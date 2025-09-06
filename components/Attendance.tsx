
import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Spinner from './ui/Spinner';
import Modal from './ui/Modal';
// FIX: Corrected import paths.
import { useAppContext } from '../context/AppContext';
import { generateEmployeeSchedule, checkLeaveAvailability } from '../services/geminiService';
import { Employee, LeaveRequest, TimeRecord, EmployeeSchedule, OvertimeRequest, BiometricDevice, BiometricLog } from '../types';
import AttendanceDashboard from './AttendanceDashboard';
import Textarea from './ui/Textarea';

type AdminTab = 'dashboard' | 'timeRecord' | 'leaves' | 'schedule' | 'overtime' | 'devices' | 'logs' | 'inactive';
type EmployeeTab = 'time' | 'schedule' | 'leaves' | 'overtime';

const LeaveRequestModal: React.FC<{
    onClose: () => void;
    onSubmit: (request: Omit<LeaveRequest, 'id' | 'status' | 'employeeName'>) => Promise<string | null>;
    activeEmployees: Employee[];
    currentUser: Employee;
    userRole: 'Admin' | 'Employee';
}> = ({ onClose, onSubmit, activeEmployees, currentUser, userRole }) => {
    const { employees, settings } = useAppContext();
    const [employeeId, setEmployeeId] = useState<string>(currentUser.id.toString());
    const [leaveType, setLeaveType] = useState<'Vacation' | 'Sick Leave' | 'Personal'>('Vacation');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        if (employeeId && startDate && endDate) {
            const handler = setTimeout(() => {
                handleCheckAvailability();
            }, 1000);
            return () => clearTimeout(handler);
        }
    }, [employeeId, leaveType, startDate, endDate]);
    
    const handleCheckAvailability = async () => {
        const employee = employees.find(e => e.id === Number(employeeId));
        if (!employee || !startDate || !endDate) return;
        
        setIsLoading(true);
        setAiResponse('');
        const result = await checkLeaveAvailability(employee.name, employee.leaveCredits, leaveType, startDate, endDate, settings.holidays);
        setAiResponse(result);
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);
        if (aiResponse.startsWith('ERROR:')) {
            alert("Please resolve the errors before submitting.");
            return;
        }
        if (!reason) {
            alert("Please provide a reason for your leave request.");
            return;
        }
        const error = await onSubmit({ employeeId: Number(employeeId), type: leaveType, startDate, endDate, reason });
        if (error) {
            setSubmissionError(error);
        } else {
            onClose();
        }
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title="Request Time Off">
            <form onSubmit={handleSubmit} className="space-y-4">
                 {userRole === 'Admin' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee</label>
                        <select
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                        >
                            {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                 )}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                    <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    >
                        <option>Vacation</option>
                        <option>Sick Leave</option>
                        <option>Personal</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                    <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                
                <Textarea label="Reason / Remarks" value={reason} onChange={e => setReason(e.target.value)} required />

                <div className="h-20">
                {isLoading && <div className="flex items-center"><Spinner /> <span className="ml-2 text-gray-500">AI is checking leave balance...</span></div>}
                {aiResponse && (
                    <div className={`p-3 rounded-md text-sm ${
                        aiResponse.startsWith('CONFIRMED:') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        aiResponse.startsWith('WARNING:') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                        <p className="font-semibold">AI Assistant:</p>
                        <p>{aiResponse}</p>
                    </div>
                )}
                </div>

                {submissionError && <p className="text-sm text-red-500 text-center pb-2">{submissionError}</p>}

                <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>Submit Request</Button>
                </div>
            </form>
        </Modal>
    );
};

const TimeRecordTab: React.FC<{ records: TimeRecord[] }> = ({ records }) => {
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const recordDate = new Date(record.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return recordDate >= start && recordDate <= end;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [records, startDate, endDate]);
    
    const getStatusColor = (status: TimeRecord['status']) => {
        switch(status) {
            case 'On Time': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        }
    }

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-bold">Daily Time Record</h3>
                <div className="flex items-center gap-2">
                    <Input label="" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>to</span>
                    <Input label="" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Time In</th>
                            <th className="p-4">Clock-in Source</th>
                            <th className="p-4">Time Out</th>
                            <th className="p-4">Clock-out Source</th>
                            <th className="p-4">Total Hours</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? filteredRecords.map(rec => (
                            <tr key={rec.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">{rec.employeeName}</td>
                                <td className="p-4">{rec.date}</td>
                                <td className="p-4">{rec.timeIn}</td>
                                <td className="p-4 font-mono text-xs">{rec.clockInDevice || 'N/A'}</td>
                                <td className="p-4">{rec.timeOut || 'N/A'}</td>
                                <td className="p-4 font-mono text-xs">{rec.clockOutDevice || 'N/A'}</td>
                                <td className="p-4">{rec.totalHours || '--'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rec.status)}`}>
                                        {rec.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={8} className="text-center p-8 text-gray-500">No time records for the selected date range.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

const LeaveRequestsTab: React.FC<{ requests: LeaveRequest[], title: string, showActions: boolean }> = ({ requests, title, showActions }) => {
    const { updateLeaveRequestStatus, currentUser, employees, userRole, settings } = useAppContext();
    const getStatusColor = (status: LeaveRequest['status']) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Approved by Supervisor': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        }
    }
    return (
         <Card>
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Status</th>
                            {showActions && <th className="p-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(req => {
                            const employee = employees.find(e => e.id === req.employeeId);
                            const isSupervisor = currentUser?.id === employee?.supervisorId;
                            const isAdmin = userRole === 'Admin';
                            return (
                                <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-4 font-medium">{req.employeeName}</td>
                                    <td className="p-4">{req.type}</td>
                                    <td className="p-4">{req.startDate} to {req.endDate}</td>
                                    <td className="p-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    {showActions && (
                                        <td className="p-4 space-x-2">
                                            {req.status === 'Pending' && isSupervisor && (
                                                <Button size="sm" onClick={() => updateLeaveRequestStatus(req.id, 'Approved by Supervisor')}>{settings.twoStepApproval ? 'Approve (Sup.)' : 'Approve'}</Button>
                                            )}
                                            {req.status === 'Approved by Supervisor' && isAdmin && (
                                                <Button size="sm" onClick={() => updateLeaveRequestStatus(req.id, 'Approved')}>Final Approve</Button>
                                            )}
                                            {req.status !== 'Approved' && req.status !== 'Rejected' && (isSupervisor || isAdmin) &&(
                                                <Button size="sm" variant="secondary" onClick={() => updateLeaveRequestStatus(req.id, 'Rejected')}>Reject</Button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan={showActions ? 6: 5} className="text-center p-8 text-gray-500">No leave requests found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4 4-4 5.293-5.293a1 1 0 011.414 0L21 11.707" />
    </svg>
);

const ScheduleHistoryModal: React.FC<{
    onClose: () => void;
    employeeId: number;
    employeeName: string;
}> = ({ onClose, employeeId, employeeName }) => {
    const { schedules } = useAppContext();

    const history = useMemo(() => {
        return schedules
            .filter(s => s.employeeId === employeeId)
            .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
    }, [schedules, employeeId]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Schedule History for ${employeeName}`}>
            <div className="space-y-4">
                {history.map(schedule => (
                    <Card key={schedule.id}>
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold">{schedule.effectiveDate} to {schedule.endDate || 'Present'}</h4>
                             {!schedule.endDate && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-center text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <th key={day} className="p-2 font-semibold">{day}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {[schedule.monday, schedule.tuesday, schedule.wednesday, schedule.thursday, schedule.friday, schedule.saturday, schedule.sunday].map((time, i) => <td key={i} className="p-2">{time}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ))}
                {history.length === 0 && <p className="text-gray-500">No schedule history found.</p>}
            </div>
        </Modal>
    );
};


const ScheduleEditModal: React.FC<{
    onClose: () => void;
    scheduleToEdit: EmployeeSchedule | null;
}> = ({ onClose, scheduleToEdit }) => {
    const { employees, schedules, addSchedule, updateSchedule } = useAppContext();
    const [formData, setFormData] = useState({
        monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '',
        effectiveDate: new Date().toISOString().slice(0, 10),
        endDate: '',
    });
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [error, setError] = useState('');

    const scheduledEmployeeIds = useMemo(() => new Set(schedules.filter(s => !s.endDate).map(s => s.employeeId)), [schedules]);

    const availableEmployees = useMemo(() => {
        return employees.filter(e => e.status === 'Active' && (!scheduledEmployeeIds.has(e.id) || e.id === scheduleToEdit?.employeeId));
    }, [employees, scheduledEmployeeIds, scheduleToEdit]);

    useEffect(() => {
        if (scheduleToEdit) {
            setSelectedEmployeeId(scheduleToEdit.employeeId.toString());
            setFormData({
                monday: scheduleToEdit.monday,
                tuesday: scheduleToEdit.tuesday,
                wednesday: scheduleToEdit.wednesday,
                thursday: scheduleToEdit.thursday,
                friday: scheduleToEdit.friday,
                saturday: scheduleToEdit.saturday,
                sunday: scheduleToEdit.sunday,
                effectiveDate: scheduleToEdit.effectiveDate,
                endDate: scheduleToEdit.endDate || '',
            });
        }
    }, [scheduleToEdit]);

    const handleGenerate = async () => {
        if (!selectedEmployeeId) {
            setError('Please select an employee first.');
            return;
        }
        const employee = employees.find(e => e.id === Number(selectedEmployeeId));
        if (!employee) return;

        setIsLoadingAI(true);
        setError('');
        const result = await generateEmployeeSchedule(employee.position, employee.department);
        try {
            const parsed = JSON.parse(result);
            if (parsed.error) {
                setError(parsed.error);
            } else {
                 setFormData(prev => ({ ...prev, ...parsed }));
            }
        } catch (e) {
            setError("Failed to parse AI response.");
        }
        setIsLoadingAI(false);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const employee = employees.find(e => e.id === Number(selectedEmployeeId));
        if (!employee) {
            setError('Could not find selected employee.');
            return;
        }

        const schedulePayload = {
            employeeId: Number(selectedEmployeeId),
            employeeName: employee.name,
            monday: formData.monday,
            tuesday: formData.tuesday,
            wednesday: formData.wednesday,
            thursday: formData.thursday,
            friday: formData.friday,
            saturday: formData.saturday,
            sunday: formData.sunday,
            effectiveDate: formData.effectiveDate,
            endDate: formData.endDate || null,
        };

        if (scheduleToEdit) {
            updateSchedule({
                ...scheduleToEdit,
                ...schedulePayload,
            });
        } else {
            addSchedule(schedulePayload);
        }
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={scheduleToEdit ? `Edit Schedule for ${scheduleToEdit.employeeName}` : 'Create New Schedule'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee</label>
                    <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                        disabled={!!scheduleToEdit}
                        required
                    >
                        <option value="">-- Select Employee --</option>
                        {availableEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Effective Date" name="effectiveDate" type="date" value={formData.effectiveDate} onChange={handleChange} required disabled={!!scheduleToEdit} title={scheduleToEdit ? "Effective date cannot be changed." : ""} />
                    <Input label="End Date (Optional)" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
                </div>
                
                <div className="flex justify-end">
                    <Button type="button" onClick={handleGenerate} disabled={isLoadingAI || !selectedEmployeeId} variant="secondary">
                        {isLoadingAI ? <Spinner /> : <span className="flex items-center"><SparklesIcon className="w-4 h-4 mr-2" /> Generate with AI</span>}
                    </Button>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input label="Monday" name="monday" value={formData.monday} onChange={handleChange} required />
                    <Input label="Tuesday" name="tuesday" value={formData.tuesday} onChange={handleChange} required />
                    <Input label="Wednesday" name="wednesday" value={formData.wednesday} onChange={handleChange} required />
                    <Input label="Thursday" name="thursday" value={formData.thursday} onChange={handleChange} required />
                    <Input label="Friday" name="friday" value={formData.friday} onChange={handleChange} required />
                    <Input label="Saturday" name="saturday" value={formData.saturday} onChange={handleChange} required />
                    <Input label="Sunday" name="sunday" value={formData.sunday} onChange={handleChange} required />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Schedule</Button>
                </div>
            </form>
        </Modal>
    );
};


const ScheduleTab: React.FC<{schedules: EmployeeSchedule[]}> = ({ schedules }) => {
    const { employees } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<EmployeeSchedule | null>(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState<{id: number, name: string} | null>(null);

    const activeEmployeeIds = useMemo(() => new Set(employees.filter(e => e.status === 'Active').map(e => e.id)), [employees]);
    const activeSchedules = useMemo(() => schedules.filter(s => activeEmployeeIds.has(s.employeeId) && !s.endDate), [schedules, activeEmployeeIds]);

    const handleOpenModal = (schedule: EmployeeSchedule | null) => {
        setSelectedSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedSchedule(null);
        setIsModalOpen(false);
    };
    
    const handleOpenHistoryModal = (employeeId: number, employeeName: string) => {
        setSelectedEmployeeForHistory({id: employeeId, name: employeeName});
        setHistoryModalOpen(true);
    };

    const handleCloseHistoryModal = () => {
        setHistoryModalOpen(false);
        setSelectedEmployeeForHistory(null);
    };

    return (
        <>
        <Card>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Active Employee Schedules</h3>
                <Button onClick={() => handleOpenModal(null)}>Create Schedule</Button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Employee</th>
                            <th className="p-4 text-center">Mon</th>
                            <th className="p-4 text-center">Tue</th>
                            <th className="p-4 text-center">Wed</th>
                            <th className="p-4 text-center">Thu</th>
                            <th className="p-4 text-center">Fri</th>
                            <th className="p-4 text-center">Sat</th>
                            <th className="p-4 text-center">Sun</th>
                            <th className="p-4">Effective Date</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeSchedules.map(sch => (
                             <tr key={sch.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">{sch.employeeName}</td>
                                <td className="p-4 text-center">{sch.monday}</td>
                                <td className="p-4 text-center">{sch.tuesday}</td>
                                <td className="p-4 text-center">{sch.wednesday}</td>
                                <td className="p-4 text-center">{sch.thursday}</td>
                                <td className="p-4 text-center">{sch.friday}</td>
                                <td className="p-4 text-center">{sch.saturday}</td>
                                <td className="p-4 text-center">{sch.sunday}</td>
                                <td className="p-4">{sch.effectiveDate}</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(sch)}>Edit</Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenHistoryModal(sch.employeeId, sch.employeeName)}>History</Button>
                                    </div>
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </Card>
        {isModalOpen && <ScheduleEditModal onClose={handleCloseModal} scheduleToEdit={selectedSchedule} />}
        {historyModalOpen && selectedEmployeeForHistory && (
            <ScheduleHistoryModal 
                onClose={handleCloseHistoryModal} 
                employeeId={selectedEmployeeForHistory.id}
                employeeName={selectedEmployeeForHistory.name}
            />
        )}
        </>
    );
};

const OvertimeRequestModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { currentUser, addOvertimeRequest } = useAppContext();
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('');
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);
        if (!currentUser) return;

        const error = await addOvertimeRequest({
            employeeId: currentUser.id,
            employeeName: currentUser.name,
            date,
            startTime,
            endTime,
            reason,
        });
        
        if (error) {
            setSubmissionError(error);
        } else {
            onClose();
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="File Overtime Request">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Date of Overtime" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
                <Textarea label="Reason / Remarks" value={reason} onChange={e => setReason(e.target.value)} required />
                 
                {submissionError && <p className="text-sm text-red-500 text-center pb-2">{submissionError}</p>}

                 <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Modal>
    );
};


const OvertimeRequestsTab: React.FC<{ requests: OvertimeRequest[], forAdmin: boolean }> = ({ requests, forAdmin }) => {
    const { currentUser, employees, userRole, updateOvertimeRequestStatus, settings } = useAppContext();

    const getStatusColor = (status: OvertimeRequest['status']) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Approved by Supervisor': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-bold mb-4">{forAdmin ? 'Overtime Requests' : 'My Overtime Requests'}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                     <thead>
                        <tr className="border-b dark:border-gray-700">
                            {forAdmin && <th className="p-4">Employee</th>}
                            <th className="p-4">Date</th>
                            <th className="p-4">Start Time</th>
                            <th className="p-4">End Time</th>
                            <th className="p-4">Hours</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Status</th>
                            {forAdmin && <th className="p-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(req => {
                            const employee = employees.find(e => e.id === req.employeeId);
                            const isSupervisor = currentUser?.id === employee?.supervisorId;
                            const isAdmin = userRole === 'Admin';

                            return (
                                <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    {forAdmin && <td className="p-4 font-medium">{req.employeeName}</td>}
                                    <td className="p-4">{req.date}</td>
                                    <td className="p-4">{req.startTime}</td>
                                    <td className="p-4">{req.endTime}</td>
                                    <td className="p-4">{req.hours.toFixed(2)}</td>
                                    <td className="p-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    {forAdmin && (
                                        <td className="p-4 space-x-2">
                                            {req.status === 'Pending' && isSupervisor && (
                                                <Button size="sm" onClick={() => updateOvertimeRequestStatus(req.id, 'Approved by Supervisor')}>{settings.twoStepApproval ? 'Approve (Sup.)' : 'Approve'}</Button>
                                            )}
                                            {req.status === 'Approved by Supervisor' && isAdmin && (
                                                 <Button size="sm" onClick={() => updateOvertimeRequestStatus(req.id, 'Approved')}>Final Approve</Button>
                                            )}
                                            {req.status !== 'Approved' && req.status !== 'Rejected' && (isSupervisor || isAdmin) && (
                                                <Button size="sm" variant="secondary" onClick={() => updateOvertimeRequestStatus(req.id, 'Rejected')}>Reject</Button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan={forAdmin ? 8 : 7} className="text-center p-8 text-gray-500">No overtime requests found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const BiometricDeviceFormModal: React.FC<{
    device: BiometricDevice | null;
    onClose: () => void;
    onSave: (device: Omit<BiometricDevice, 'id'> | BiometricDevice) => void;
}> = ({ device, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: device?.name || '',
        ipAddress: device?.ipAddress || '',
        port: device?.port || 8080,
        status: device?.status || 'Online',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (device) {
            onSave({ ...device, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={device ? 'Edit Device' : 'Add New Device'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Device Name / Location" name="name" value={formData.name} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="IP Address" name="ipAddress" value={formData.ipAddress} onChange={handleChange} required pattern="\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}" title="Please enter a valid IP address." />
                    <Input label="Port" name="port" type="number" value={formData.port} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Device</Button>
                </div>
            </form>
        </Modal>
    );
};


const BiometricDevicesTab: React.FC = () => {
    const { biometricDevices, addBiometricDevice, updateBiometricDevice, deleteBiometricDevice } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deviceToEdit, setDeviceToEdit] = useState<BiometricDevice | null>(null);
    const [deviceToDelete, setDeviceToDelete] = useState<BiometricDevice | null>(null);

    const handleOpenModal = (device: BiometricDevice | null) => {
        setDeviceToEdit(device);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setDeviceToEdit(null);
        setIsModalOpen(false);
    };

    const handleSaveDevice = (deviceData: Omit<BiometricDevice, 'id'> | BiometricDevice) => {
        if ('id' in deviceData) {
            updateBiometricDevice(deviceData);
        } else {
            addBiometricDevice(deviceData);
        }
        handleCloseModal();
    };

    const handleDelete = () => {
        if (deviceToDelete) {
            deleteBiometricDevice(deviceToDelete.id);
            setDeviceToDelete(null);
        }
    };
    
    const getStatusColor = (status: BiometricDevice['status']) => {
        switch (status) {
            case 'Online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Offline': return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <>
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Biometric Device Network</h3>
                <Button onClick={() => handleOpenModal(null)}>Add New Device</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Device Name / Location</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Port</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {biometricDevices.map(device => (
                            <tr key={device.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">{device.name}</td>
                                <td className="p-4 font-mono">{device.ipAddress}</td>
                                <td className="p-4 font-mono">{device.port}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.status)}`}>
                                        {device.status}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleOpenModal(device)}>Edit</Button>
                                    <Button size="sm" variant="secondary" onClick={() => setDeviceToDelete(device)} className="!bg-red-100 !text-red-700 hover:!bg-red-200 dark:!bg-red-900/50 dark:!text-red-300 dark:hover:!bg-red-900/80">Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
        {isModalOpen && <BiometricDeviceFormModal device={deviceToEdit} onClose={handleCloseModal} onSave={handleSaveDevice} />}
        {deviceToDelete && (
            <Modal isOpen={true} onClose={() => setDeviceToDelete(null)} title="Confirm Deletion">
                <p>Are you sure you want to delete the device "<strong>{deviceToDelete.name}</strong>"? This action cannot be undone. Any employees assigned to this device will be unassigned.</p>
                <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="secondary" onClick={() => setDeviceToDelete(null)}>Cancel</Button>
                    <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">Delete</Button>
                </div>
            </Modal>
        )}
        </>
    );
};

const BiometricLogsTab: React.FC<{ logs: BiometricLog[] }> = ({ logs }) => {
    return (
        <Card>
            <h3 className="text-xl font-bold mb-4">Biometric Event Logs</h3>
            <p className="text-sm text-gray-500 mb-4">This is a raw log of all clock-in/out events received from network devices.</p>
            <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Biometric No.</th>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Device Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">{log.employeeName}</td>
                                <td className="p-4 font-mono text-sm">{log.biometricNumber}</td>
                                <td className="p-4">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-4 capitalize">{log.type.replace('-', ' ')}</td>
                                <td className="p-4 font-mono text-xs">{log.deviceInfo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


const AdminView: React.FC = () => {
    const { employees, leaveRequests, addLeaveRequest, overtimeRequests, userRole, currentUser, timeRecords, schedules, syncBiometricData, biometricLogs } = useAppContext();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const { newLogsCount } = await syncBiometricData();
            alert(`Sync complete. Downloaded and processed ${newLogsCount} new attendance log(s).`);
        } catch (error) {
            console.error("Biometric sync failed:", error);
            alert("An error occurred during the biometric sync. Please check the console for details.");
        } finally {
            setIsSyncing(false);
        }
    };

    const isAdmin = userRole === 'Admin';

    const managedEmployeeIds = useMemo(() => {
        if (isAdmin) return employees.map(e => e.id);
        if (!currentUser) return [];
        return employees.filter(e => e.supervisorId === currentUser.id).map(e => e.id);
    }, [employees, currentUser, isAdmin]);
    
    const managedEmployees = useMemo(() => employees.filter(e => managedEmployeeIds.includes(e.id)), [employees, managedEmployeeIds]);
    const activeEmployees = useMemo(() => managedEmployees.filter(e => e.status === 'Active'), [managedEmployees]);
    
    const managedLeaveRequests = useMemo(() => leaveRequests.filter(lr => managedEmployeeIds.includes(lr.employeeId)), [leaveRequests, managedEmployeeIds]);
    const managedOvertimeRequests = useMemo(() => overtimeRequests.filter(or => managedEmployeeIds.includes(or.employeeId)), [overtimeRequests, managedEmployeeIds]);
    const managedTimeRecords = useMemo(() => timeRecords.filter(tr => managedEmployeeIds.includes(tr.employeeId)), [timeRecords, managedEmployeeIds]);
    const managedSchedules = useMemo(() => schedules.filter(s => managedEmployeeIds.includes(s.employeeId)), [schedules, managedEmployeeIds]);

    const activeLeaveRequests = useMemo(() => managedLeaveRequests.filter(lr => activeEmployees.some(e => e.id === lr.employeeId)), [managedLeaveRequests, activeEmployees]);
    const inactiveLeaveRequests = useMemo(() => managedLeaveRequests.filter(lr => !activeEmployees.some(e => e.id === lr.employeeId)), [managedLeaveRequests, activeEmployees]);
    
    const handleAddLeaveRequestAdmin = async (request: Omit<LeaveRequest, 'id' | 'status' | 'employeeName'>): Promise<string | null> => {
        const employee = employees.find(e => e.id === request.employeeId);
        if (!employee) return "Employee not found.";
        return addLeaveRequest({
            ...request,
            employeeName: employee.name,
        });
    };

    const renderAdminContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AttendanceDashboard />;
            case 'timeRecord': return <TimeRecordTab records={managedTimeRecords} />;
            case 'leaves': return <LeaveRequestsTab requests={activeLeaveRequests} title="Active Employee Leave Requests" showActions={true}/>;
            case 'schedule': return <ScheduleTab schedules={managedSchedules}/>;
            case 'overtime': return <OvertimeRequestsTab requests={managedOvertimeRequests} forAdmin={true} />;
            case 'devices': return <BiometricDevicesTab />;
            case 'logs': return <BiometricLogsTab logs={biometricLogs} />;
            case 'inactive': return <LeaveRequestsTab requests={inactiveLeaveRequests} title="Inactive Employee Leave Records" showActions={false} />;
        }
    };
    
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <div className="border-b border-gray-200 dark:border-gray-700 flex-grow">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {(['dashboard', 'timeRecord', 'leaves', 'schedule', 'overtime', 'devices', 'logs', 'inactive'] as AdminTab[]).map(tab => (
                             <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                                    activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.replace('Record', ' Record').replace('Requests', ' Requests')}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    {activeTab === 'timeRecord' && (
                        <Button onClick={handleSync} disabled={isSyncing} variant="secondary">
                            {isSyncing ? (
                                <span className="flex items-center"><Spinner /> <span className="ml-2">Syncing...</span></span>
                            ) : (
                                <span className="flex items-center">
                                    <SyncIcon className="w-5 h-5 mr-2" />
                                    Sync Biometrics
                                </span>
                            )}
                        </Button>
                    )}
                    {isAdmin && <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap">Request Time Off</Button>}
                </div>
            </div>
            <div>
                {renderAdminContent()}
            </div>
            {isModalOpen && (
                 <LeaveRequestModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSubmit={handleAddLeaveRequestAdmin}
                    activeEmployees={activeEmployees}
                    currentUser={activeEmployees[0]} // Admin can select any employee
                    userRole="Admin"
                />
            )}
        </div>
    );
}

const EmployeeView: React.FC = () => {
    const { leaveRequests, currentUser, addLeaveRequest, userRole, timeRecords, overtimeRequests, schedules } = useAppContext();
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<EmployeeTab>('time');
    
    if (!currentUser || !userRole) return null;

    const myLeaveRequests = useMemo(() => leaveRequests.filter(lr => lr.employeeId === currentUser.id), [leaveRequests, currentUser]);
    const myTimeRecords = useMemo(() => timeRecords.filter(tr => tr.employeeId === currentUser.id), [timeRecords, currentUser]);
    const myOvertimeRequests = useMemo(() => overtimeRequests.filter(otr => otr.employeeId === currentUser.id), [overtimeRequests, currentUser]);
    const mySchedule = useMemo(() => schedules.find(s => s.employeeId === currentUser.id && !s.endDate), [schedules, currentUser]);
    
    const handleAddLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'status' | 'employeeName'>): Promise<string | null> => {
        return addLeaveRequest({
            ...request,
            employeeName: currentUser.name,
        });
    };

    const MyTimeRecordsTab = () => {
        const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10));
        const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

        const filteredRecords = useMemo(() => {
            return myTimeRecords.filter(record => {
                const recordDate = new Date(record.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return recordDate >= start && recordDate <= end;
            }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, [myTimeRecords, startDate, endDate]);

        return (
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold">My Time Records</h3>
                    <div className="flex items-center gap-2">
                         <Input label="" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                         <span>to</span>
                         <Input label="" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-4">Date</th>
                                <th className="p-4">Time In</th>
                                <th className="p-4">Time Out</th>
                                <th className="p-4">Total Hours</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? filteredRecords.map(rec => (
                                <tr key={rec.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-4 font-medium">{rec.date}</td>
                                    <td className="p-4">{rec.timeIn}</td>
                                    <td className="p-4">{rec.timeOut || 'N/A'}</td>
                                    <td className="p-4">{rec.totalHours || '--'}</td>
                                    <td className="p-4">{rec.status}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center p-8 text-gray-500">You have no time records for this date range.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        )
    };

    const MyScheduleTab = () => (
        <Card>
            <h3 className="text-xl font-bold mb-4">My Weekly Schedule</h3>
            {mySchedule ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-center">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="p-2 font-semibold">Mon</th>
                                <th className="p-2 font-semibold">Tue</th>
                                <th className="p-2 font-semibold">Wed</th>
                                <th className="p-2 font-semibold">Thu</th>
                                <th className="p-2 font-semibold">Fri</th>
                                <th className="p-2 font-semibold">Sat</th>
                                <th className="p-2 font-semibold">Sun</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2">{mySchedule.monday}</td>
                                <td className="p-2">{mySchedule.tuesday}</td>
                                <td className="p-2">{mySchedule.wednesday}</td>
                                <td className="p-2">{mySchedule.thursday}</td>
                                <td className="p-2">{mySchedule.friday}</td>
                                <td className="p-2">{mySchedule.saturday}</td>
                                <td className="p-2">{mySchedule.sunday}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 pt-4 text-center">Your schedule has not been set up.</p>
            )}
        </Card>
    );

    const renderEmployeeContent = () => {
        switch(activeTab) {
            case 'time': return <MyTimeRecordsTab />;
            case 'schedule': return <MyScheduleTab />;
            case 'leaves': return <LeaveRequestsTab requests={myLeaveRequests} title="My Leave Requests" showActions={false}/>;
            case 'overtime': return <OvertimeRequestsTab requests={myOvertimeRequests} forAdmin={false}/>;
        }
    }

    return (
         <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         <button onClick={() => setActiveTab('time')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'time' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Time Records</button>
                         <button onClick={() => setActiveTab('schedule')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedule' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Schedule</button>
                         <button onClick={() => setActiveTab('leaves')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaves' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Leave Requests</button>
                         <button onClick={() => setActiveTab('overtime')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overtime' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Overtime</button>
                    </nav>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => setIsOvertimeModalOpen(true)}>File Overtime</Button>
                    <Button onClick={() => setIsLeaveModalOpen(true)}>Request Time Off</Button>
                </div>
            </div>

            {renderEmployeeContent()}

            {isLeaveModalOpen && (
                 <LeaveRequestModal 
                    onClose={() => setIsLeaveModalOpen(false)} 
                    onSubmit={handleAddLeaveRequest}
                    activeEmployees={[]}
                    currentUser={currentUser}
                    userRole={userRole}
                />
            )}
            {isOvertimeModalOpen && <OvertimeRequestModal onClose={() => setIsOvertimeModalOpen(false)}/>}
        </div>
    );
}


const Attendance: React.FC = () => {
    const { userRole, currentUser, employees } = useAppContext();
    
    const isSupervisor = employees.some(e => e.supervisorId === currentUser?.id);

    if (userRole === 'Admin' || isSupervisor) {
        return <AdminView />;
    }
    
    return <EmployeeView />;
};

const SyncIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348A4.5 4.5 0 0 0 12 7.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5c.621 0 1.22-.126 1.77-.354m-4.01-8.869A4.5 4.5 0 0 1 12 3c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5c-.621 0-1.22-.126-1.77-.354m-4.01-8.869L2.25 6m9.523 9.348L16.023 9.348" />
    </svg>
);

export default Attendance;