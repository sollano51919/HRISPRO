// FIX: Create new file `context/AppContext.tsx` to provide global state management.

import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import * as storage from '../services/storageService';
import { initialData } from '../data/initialData';
import { Employee, JobPosting, OnboardingPlan, PerformanceReview, LeaveRequest, TimeRecord, EmployeeSchedule, OvertimeRequest, Memo, BiometricDevice, BiometricLog, HealthCareClaim, HRSettings } from '../types';

interface AppContextType {
    isAuthenticated: boolean;
    currentUser: Employee | null;
    userRole: 'Admin' | 'Employee';
    employees: Employee[];
    jobPostings: JobPosting[];
    onboardingPlans: OnboardingPlan[];
    performanceReviews: PerformanceReview[];
    leaveRequests: LeaveRequest[];
    timeRecords: TimeRecord[];
    schedules: EmployeeSchedule[];
    overtimeRequests: OvertimeRequest[];
    memos: Memo[];
    biometricDevices: BiometricDevice[];
    biometricLogs: BiometricLog[];
    healthCareClaims: HealthCareClaim[];
    settings: HRSettings;
    activeModule: string;
    viewingEmployeeId: number | null;
    activeSubModule: string | null;
    
    login: (userId: number) => void;
    logout: () => void;
    setActiveModule: (module: string) => void;
    setViewingEmployeeId: (id: number | null) => void;
    clearSubModule: () => void;
    
    addEmployee: (employeeData: Omit<Employee, 'id'>) => void;
    updateEmployee: (employeeData: Employee) => void;
    
    addMemo: (memo: Omit<Memo, 'id'>) => void;
    updateMemo: (memo: Memo) => void;
    deleteMemo: (id: number) => void;

    addLeaveRequest: (request: Omit<LeaveRequest, 'id'>) => void;
    updateLeaveRequest: (request: LeaveRequest) => void;

    addSchedule: (schedule: Omit<EmployeeSchedule, 'id'>) => void;
    
    addOvertimeRequest: (request: Omit<OvertimeRequest, 'id'>) => void;
    updateOvertimeRequest: (request: OvertimeRequest) => void;

    addHealthCareClaim: (claim: Omit<HealthCareClaim, 'id'>) => Promise<void>;
    updateHealthCareClaim: (claim: HealthCareClaim) => void;

    updateSettings: (newSettings: HRSettings, propagate?: { leave?: boolean; health?: boolean; }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State
    const [employees, setEmployees] = useState<Employee[]>(() => storage.getEmployees(initialData.employees));
    const [jobPostings, setJobPostings] = useState<JobPosting[]>(() => storage.getJobPostings(initialData.jobPostings));
    const [onboardingPlans, setOnboardingPlans] = useState<OnboardingPlan[]>(() => storage.getOnboardingPlans(initialData.onboardingPlans));
    const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(() => storage.getPerformanceReviews(initialData.performanceReviews));
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => storage.getLeaveRequests(initialData.leaveRequests));
    const [timeRecords, setTimeRecords] = useState<TimeRecord[]>(() => storage.getTimeRecords(initialData.timeRecords));
    const [schedules, setSchedules] = useState<EmployeeSchedule[]>(() => storage.getSchedules(initialData.schedules));
    const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(() => storage.getOvertimeRequests(initialData.overtimeRequests));
    const [memos, setMemos] = useState<Memo[]>(() => storage.getMemos(initialData.memos));
    const [biometricDevices, setBiometricDevices] = useState<BiometricDevice[]>(() => storage.getBiometricDevices(initialData.biometricDevices));
    const [biometricLogs, setBiometricLogs] = useState<BiometricLog[]>(() => storage.getBiometricLogs(initialData.biometricLogs));
    const [healthCareClaims, setHealthCareClaims] = useState<HealthCareClaim[]>(() => storage.getHealthCareClaims(initialData.healthCareClaims));
    const [settings, setSettings] = useState<HRSettings>(() => storage.getSettings(initialData.settings));

    // Session State
    const [session, setSession] = useState(storage.getSession());
    const [activeModule, setActiveModule] = useState('dashboard');
    const [viewingEmployeeId, setViewingEmployeeId] = useState<number | null>(null);
    const [activeSubModule, setActiveSubModule] = useState<string | null>(null);

    // Derived State
    const isAuthenticated = !!session;
    const currentUser = useMemo(() => employees.find(e => e.id === session?.userId) || null, [employees, session]);
    const userRole = useMemo(() => (currentUser?.email === 'admin@hr-core.com' ? 'Admin' : 'Employee'), [currentUser]);

    // Effects to persist state
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
    useEffect(() => { session ? storage.saveSession(session) : storage.clearSession(); }, [session]);

    // Functions
    const login = (userId: number) => setSession({ userId });
    const logout = () => {
      setSession(null);
      setActiveModule('dashboard');
      setViewingEmployeeId(null);
    };
    const clearSubModule = () => setActiveSubModule(null);
    
    const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
        setEmployees(prev => [...prev, { ...employeeData, id: Date.now() }]);
    };
    const updateEmployee = (employeeData: Employee) => {
        setEmployees(prev => prev.map(emp => emp.id === employeeData.id ? employeeData : emp));
    };

    const addMemo = (memo: Omit<Memo, 'id'>) => setMemos(p => [...p, { ...memo, id: Date.now() }]);
    const updateMemo = (memo: Memo) => setMemos(p => p.map(m => m.id === memo.id ? memo : m));
    const deleteMemo = (id: number) => setMemos(p => p.filter(m => m.id !== id));

    const addLeaveRequest = (request: Omit<LeaveRequest, 'id'>) => setLeaveRequests(p => [...p, { ...request, id: Date.now() }]);
    const updateLeaveRequest = (request: LeaveRequest) => setLeaveRequests(p => p.map(lr => lr.id === request.id ? request : lr));
    
    const addSchedule = (schedule: Omit<EmployeeSchedule, 'id'>) => setSchedules(p => [...p, { ...schedule, id: Date.now() }]);
    
    const addOvertimeRequest = (request: Omit<OvertimeRequest, 'id'>) => setOvertimeRequests(p => [...p, { ...request, id: Date.now() }]);
    const updateOvertimeRequest = (request: OvertimeRequest) => setOvertimeRequests(p => p.map(or => or.id === request.id ? request : or));

    const addHealthCareClaim = async (claim: Omit<HealthCareClaim, 'id'>) => {
      if (claim.status === 'Approved') {
          const employee = employees.find(e => e.id === claim.employeeId);
          if (employee && employee.healthCareBenefit.balance >= claim.amount) {
              updateEmployee({ ...employee, healthCareBenefit: { ...employee.healthCareBenefit, balance: employee.healthCareBenefit.balance - claim.amount } });
          } else {
              throw new Error("Insufficient balance.");
          }
      }
      setHealthCareClaims(p => [...p, { ...claim, id: Date.now() }]);
    };

    const updateHealthCareClaim = (claim: HealthCareClaim) => {
      const originalClaim = healthCareClaims.find(c => c.id === claim.id);
      const employee = employees.find(e => e.id === claim.employeeId);
      if (!originalClaim || !employee) return;

      let newBalance = employee.healthCareBenefit.balance;
      // Revert old transaction if it was approved
      if (originalClaim.status === 'Approved') {
          newBalance += originalClaim.amount;
      }
      // Apply new transaction if it is approved
      if (claim.status === 'Approved') {
          newBalance -= claim.amount;
      }
      
      updateEmployee({ ...employee, healthCareBenefit: { ...employee.healthCareBenefit, balance: newBalance } });
      setHealthCareClaims(p => p.map(c => c.id === claim.id ? claim : c));
    };

    const updateSettings = (newSettings: HRSettings, propagate: { leave?: boolean; health?: boolean; } = {}) => {
        setSettings(newSettings);
        if (propagate.leave) {
            setEmployees(prev => prev.map(emp => emp.status === 'Active' ? { ...emp, leaveCredits: newSettings.defaultLeaveCredits } : emp));
        }
        if (propagate.health) {
             setEmployees(prev => prev.map(emp => emp.status === 'Active' ? { ...emp, healthCareBenefit: { allowance: newSettings.healthCareAllowance, balance: newSettings.healthCareAllowance } } : emp));
        }
    };

    const value: AppContextType = {
        isAuthenticated, currentUser, userRole, employees, jobPostings, onboardingPlans,
        performanceReviews, leaveRequests, timeRecords, schedules, overtimeRequests, memos,
        biometricDevices, biometricLogs, healthCareClaims, settings, activeModule, viewingEmployeeId, activeSubModule,
        login, logout, setActiveModule, setViewingEmployeeId, clearSubModule, addEmployee, updateEmployee,
        addMemo, updateMemo, deleteMemo, addLeaveRequest, updateLeaveRequest, addSchedule, addOvertimeRequest,
        updateOvertimeRequest, addHealthCareClaim, updateHealthCareClaim, updateSettings,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
