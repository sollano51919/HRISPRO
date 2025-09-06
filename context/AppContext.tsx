
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as types from '../types';
import * as storage from '../services/storageService';
import { initialData } from '../data/initialData';

interface AppContextType {
    isAuthenticated: boolean;
    currentUser: types.Employee | null;
    userRole: types.UserRole | null;
    login: (userId: number) => void;
    logout: () => void;
    activeModule: string;
    setActiveModule: (module: string) => void;
    activeSubModule: string | null;
    setActiveSubModule: (subModule: string) => void;
    clearSubModule: () => void;
    
    employees: types.Employee[];
    addEmployee: (employee: Omit<types.Employee, 'id'>) => void;
    updateEmployee: (employee: types.Employee) => void;

    viewingEmployeeId: number | null;
    setViewingEmployeeId: (id: number | null) => void;

    jobPostings: types.JobPosting[];
    onboardingPlans: types.OnboardingPlan[];
    performanceReviews: types.PerformanceReview[];

    leaveRequests: types.LeaveRequest[];
    addLeaveRequest: (request: Omit<types.LeaveRequest, 'id' | 'status'>) => Promise<string|null>;
    updateLeaveRequestStatus: (id: number, status: types.LeaveRequest['status']) => void;

    timeRecords: types.TimeRecord[];
    schedules: types.EmployeeSchedule[];
    addSchedule: (schedule: Omit<types.EmployeeSchedule, 'id'>) => void;
    updateSchedule: (schedule: types.EmployeeSchedule) => void;

    overtimeRequests: types.OvertimeRequest[];
    addOvertimeRequest: (request: Omit<types.OvertimeRequest, 'id' | 'status' | 'hours'>) => Promise<string|null>;
    updateOvertimeRequestStatus: (id: number, status: types.OvertimeRequest['status']) => void;

    memos: types.Memo[];
    addMemo: (memo: Omit<types.Memo, 'id'>) => void;
    updateMemo: (memo: types.Memo) => void;
    deleteMemo: (id: number) => void;
    
    biometricDevices: types.BiometricDevice[];
    addBiometricDevice: (device: Omit<types.BiometricDevice, 'id'>) => void;
    updateBiometricDevice: (device: types.BiometricDevice) => void;
    deleteBiometricDevice: (id: number) => void;

    biometricLogs: types.BiometricLog[];
    syncBiometricData: () => Promise<{newLogsCount: number}>;

    healthCareClaims: types.HealthCareClaim[];
    addHealthCareClaim: (claim: Omit<types.HealthCareClaim, 'id'|'status'|'employeeName'>) => Promise<string|null>;
    updateHealthCareClaimStatus: (id: number, status: types.HealthCareClaim['status']) => void;

    settings: types.HRSettings;
    updateSettings: (settings: types.HRSettings, propagate?: { leave?: boolean; health?: boolean }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [employees, setEmployees] = useState<types.Employee[]>(() => storage.getEmployees(initialData.employees));
    const [jobPostings, setJobPostings] = useState<types.JobPosting[]>(() => storage.getJobPostings(initialData.jobPostings));
    const [onboardingPlans, setOnboardingPlans] = useState<types.OnboardingPlan[]>(() => storage.getOnboardingPlans(initialData.onboardingPlans));
    const [performanceReviews, setPerformanceReviews] = useState<types.PerformanceReview[]>(() => storage.getPerformanceReviews(initialData.performanceReviews));
    const [leaveRequests, setLeaveRequests] = useState<types.LeaveRequest[]>(() => storage.getLeaveRequests(initialData.leaveRequests));
    const [timeRecords, setTimeRecords] = useState<types.TimeRecord[]>(() => storage.getTimeRecords(initialData.timeRecords));
    const [schedules, setSchedules] = useState<types.EmployeeSchedule[]>(() => storage.getSchedules(initialData.schedules));
    const [overtimeRequests, setOvertimeRequests] = useState<types.OvertimeRequest[]>(() => storage.getOvertimeRequests(initialData.overtimeRequests));
    const [memos, setMemos] = useState<types.Memo[]>(() => storage.getMemos(initialData.memos));
    const [biometricDevices, setBiometricDevices] = useState<types.BiometricDevice[]>(() => storage.getBiometricDevices(initialData.biometricDevices));
    const [biometricLogs, setBiometricLogs] = useState<types.BiometricLog[]>(() => storage.getBiometricLogs(initialData.biometricLogs));
    const [healthCareClaims, setHealthCareClaims] = useState<types.HealthCareClaim[]>(() => storage.getHealthCareClaims(initialData.healthCareClaims));
    const [settings, setSettings] = useState<types.HRSettings>(() => storage.getSettings(initialData.settings));
    
    const [session, setSession] = useState(storage.getSession());
    const [activeModule, setActiveModuleState] = useState('dashboard');
    const [activeSubModule, setActiveSubModuleState] = useState<string | null>(null);
    const [viewingEmployeeId, setViewingEmployeeIdState] = useState<number | null>(null);

    const currentUser = employees.find(e => e.id === session?.userId) || null;
    const userRole = currentUser?.email === 'admin@hr-core.com' ? 'Admin' : 'Employee';
    
    useEffect(() => { storage.setEmployees(employees); }, [employees]);
    useEffect(() => { storage.setJobPostings(jobPostings); }, [jobPostings]);
    useEffect(() => { storage.setOnboardingPlans(onboardingPlans); }, [onboardingPlans]);
    useEffect(() => { storage.setPerformanceReviews(performanceReviews); }, [performanceReviews]);
    useEffect(() => { storage.setLeaveRequests(leaveRequests); }, [leaveRequests]);
    useEffect(() => { storage.setTimeRecords(timeRecords); }, [timeRecords]);
    useEffect(() => { storage.setSchedules(schedules); }, [schedules]);
    useEffect(() => { storage.setOvertimeRequests(overtimeRequests); }, [overtimeRequests]);
    useEffect(() => { storage.setMemos(memos); }, [memos]);
    useEffect(() => { storage.setBiometricDevices(biometricDevices); }, [biometricDevices]);
    useEffect(() => { storage.setBiometricLogs(biometricLogs); }, [biometricLogs]);
    useEffect(() => { storage.setHealthCareClaims(healthCareClaims); }, [healthCareClaims]);
    useEffect(() => { storage.setSettings(settings); }, [settings]);


    const login = (userId: number) => {
        const sessionData = { userId };
        storage.saveSession(sessionData);
        setSession(sessionData);
    };

    const logout = () => {
        storage.clearSession();
        setSession(null);
        setActiveModuleState('dashboard');
    };

    const setActiveModule = (module: string) => {
        setViewingEmployeeIdState(null);
        setActiveModuleState(module);
    };

    const setViewingEmployeeId = (id: number | null) => {
        setViewingEmployeeIdState(id);
    };

    const setActiveSubModule = (subModule: string) => {
        setActiveSubModuleState(subModule);
    }
    const clearSubModule = () => setActiveSubModuleState(null);
    
    const addEmployee = (employee: Omit<types.Employee, 'id'>) => {
        setEmployees(prev => [...prev, { ...employee, id: Date.now() }]);
    };
    
    const updateEmployee = (updatedEmployee: types.Employee) => {
        setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    };
    
    const addLeaveRequest = async (request: Omit<types.LeaveRequest, 'id' | 'status'>): Promise<string|null> => {
        setLeaveRequests(prev => [...prev, { ...request, id: Date.now(), status: 'Pending' }]);
        return null;
    };
    
    const updateLeaveRequestStatus = (id: number, status: types.LeaveRequest['status']) => {
        setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };
    
    const addSchedule = (schedule: Omit<types.EmployeeSchedule, 'id'>) => {
        setSchedules(prev => {
            const now = new Date();
            now.setDate(now.getDate() - 1);
            const yesterday = now.toISOString().slice(0, 10);
            
            const updated = prev.map(s => {
                if (s.employeeId === schedule.employeeId && !s.endDate) {
                    return { ...s, endDate: yesterday };
                }
                return s;
            });
            return [...updated, { ...schedule, id: Date.now() }];
        });
    };
    
    const updateSchedule = (updatedSchedule: types.EmployeeSchedule) => {
        setSchedules(prev => prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s));
    };

    const addOvertimeRequest = async (request: Omit<types.OvertimeRequest, 'id'|'status'|'hours'>): Promise<string|null> => {
        const start = new Date(`${request.date}T${request.startTime}`);
        const end = new Date(`${request.date}T${request.endTime}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (hours <= 0) return "End time must be after start time.";
        setOvertimeRequests(prev => [...prev, { ...request, id: Date.now(), hours, status: 'Pending' }]);
        return null;
    };

    const updateOvertimeRequestStatus = (id: number, status: types.OvertimeRequest['status']) => {
        setOvertimeRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    const addMemo = (memo: Omit<types.Memo, 'id'>) => setMemos(prev => [...prev, { ...memo, id: Date.now() }]);
    const updateMemo = (memo: types.Memo) => setMemos(prev => prev.map(m => m.id === memo.id ? memo : m));
    const deleteMemo = (id: number) => setMemos(prev => prev.filter(m => m.id !== id));

    const addBiometricDevice = (device: Omit<types.BiometricDevice, 'id'>) => setBiometricDevices(prev => [...prev, { ...device, id: Date.now() }]);
    const updateBiometricDevice = (device: types.BiometricDevice) => setBiometricDevices(prev => prev.map(d => d.id === device.id ? device : d));
    const deleteBiometricDevice = (id: number) => setBiometricDevices(prev => prev.filter(d => d.id !== id));

    const syncBiometricData = async (): Promise<{newLogsCount: number}> => {
        // Mock sync
        await new Promise(res => setTimeout(res, 1500));
        const newLog: types.BiometricLog = {
            id: Date.now(),
            employeeName: "John Doe",
            biometricNumber: 1001,
            timestamp: new Date().toISOString(),
            type: 'clock-in',
            deviceInfo: "Main Entrance (192.168.1.100:8080)"
        };
        setBiometricLogs(prev => [...prev, newLog].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        return { newLogsCount: 1 };
    }

    const addHealthCareClaim = async (claim: Omit<types.HealthCareClaim, 'id'|'status'|'employeeName'>): Promise<string|null> => {
        const employee = employees.find(e => e.id === claim.employeeId);
        if (!employee) return "Employee not found.";
        if (claim.amount > employee.healthCareBenefit.balance) return "Claim amount exceeds available balance.";
        
        setHealthCareClaims(prev => [...prev, { ...claim, id: Date.now(), status: 'Pending', employeeName: employee.name }]);
        return null;
    };

    const updateHealthCareClaimStatus = (id: number, status: types.HealthCareClaim['status']) => {
        setHealthCareClaims(prev => prev.map(c => {
            if (c.id === id) {
                if (status === 'Approved') {
                    setEmployees(empPrev => empPrev.map(e => {
                        if (e.id === c.employeeId) {
                            return { ...e, healthCareBenefit: { ...e.healthCareBenefit, balance: e.healthCareBenefit.balance - c.amount } };
                        }
                        return e;
                    }));
                }
                return { ...c, status };
            }
            return c;
        }));
    };

    const updateSettings = (newSettings: types.HRSettings, propagate?: { leave?: boolean; health?: boolean }) => {
        setSettings(newSettings);
        if (propagate?.leave || propagate?.health) {
            setEmployees(prev => prev.map(e => {
                if (e.status === 'Active') {
                    let updatedEmployee = { ...e };
                    if (propagate.leave) {
                        updatedEmployee.leaveCredits = { ...newSettings.defaultLeaveCredits };
                    }
                    if (propagate.health) {
                        updatedEmployee.healthCareBenefit = { allowance: newSettings.healthCareAllowance, balance: newSettings.healthCareAllowance };
                    }
                    return updatedEmployee;
                }
                return e;
            }));
        }
    };

    const value: AppContextType = {
        isAuthenticated: !!session,
        currentUser,
        userRole,
        login,
        logout,
        activeModule,
        setActiveModule,
        activeSubModule,
        setActiveSubModule,
        clearSubModule,
        employees,
        addEmployee,
        updateEmployee,
        viewingEmployeeId,
        setViewingEmployeeId,
        jobPostings,
        onboardingPlans,
        performanceReviews,
        leaveRequests,
        addLeaveRequest,
        updateLeaveRequestStatus,
        timeRecords,
        schedules,
        addSchedule,
        updateSchedule,
        overtimeRequests,
        addOvertimeRequest,
        updateOvertimeRequestStatus,
        memos,
        addMemo,
        updateMemo,
        deleteMemo,
        biometricDevices,
        addBiometricDevice,
        updateBiometricDevice,
        deleteBiometricDevice,
        biometricLogs,
        syncBiometricData,
        healthCareClaims,
        addHealthCareClaim,
        updateHealthCareClaimStatus,
        settings,
        updateSettings,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};