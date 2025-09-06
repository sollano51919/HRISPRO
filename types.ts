
export type UserRole = 'Admin' | 'Employee';
export type Status = 'Active' | 'Inactive';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface EmploymentHistory {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
}

export interface Contract {
  type: 'Full-Time' | 'Part-Time' | 'Contract';
  startDate: string;
  endDate?: string | null;
}

export interface Performance {
  lastReview: string;
  achievements: string[];
  areasForImprovement: string[];
}

export interface LeaveCredits {
  vacation: number;
  sick: number;
  personal: number;
}

export interface HealthCareBenefit {
  allowance: number;
  balance: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  password?: string;
  avatar: string;
  status: Status;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  supervisorId: number | null;
  address: Address;
  employmentHistory: EmploymentHistory[];
  contracts: Contract[];
  performance: Performance;
  leaveCredits: LeaveCredits;
  healthCareBenefit: HealthCareBenefit;
  accessibleModules: string[];
  assignedBiometricNumber: number | null;
}

export interface JobPosting {
  id: number;
  title: string;
  department: string;
  status: 'Open' | 'Closed';
  candidates: number;
}

export interface OnboardingPlan {
  id: number;
  employeeName: string;
  role: string;
  startDate: string;
  manager: string;
  progress: number;
}

export interface GeneratedOnboardingPlan {
    plan: {
        week: number;
        title: string;
        tasks: {
            task: string;
            completed: boolean;
        }[];
    }[];
}


export interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  status: 'Pending' | 'Completed';
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  type: 'Vacation' | 'Sick Leave' | 'Personal';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved by Supervisor' | 'Approved' | 'Rejected';
}

export interface TimeRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  timeIn: string;
  clockInDevice: string | null;
  timeOut: string | null;
  clockOutDevice: string | null;
  totalHours: number | null;
  status: 'On Time' | 'Late' | 'Absent';
}

export interface EmployeeSchedule {
  id: number;
  employeeId: number;
  employeeName: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  effectiveDate: string;
  endDate: string | null;
}

export interface OvertimeRequest {
    id: number;
    employeeId: number;
    employeeName: string;
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    reason: string;
    status: 'Pending' | 'Approved by Supervisor' | 'Approved' | 'Rejected';
}

export interface BiometricDevice {
    id: number;
    name: string;
    ipAddress: string;
    port: number;
    status: 'Online' | 'Offline';
}

export interface BiometricLog {
    id: number;
    employeeName: string;
    biometricNumber: number;
    timestamp: string;
    type: 'clock-in' | 'clock-out';
    deviceInfo: string;
}

export interface Memo {
  id: number;
  title: string;
  content: string;
  date: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Holiday {
    id: number;
    name: string;
    date: string;
}

export interface HRSettings {
    defaultLeaveCredits: LeaveCredits;
    healthCareAllowance: number;
    twoStepApproval: boolean;
    holidays: Holiday[];
}

export interface HealthCareClaim {
    id: number;
    employeeId: number;
    employeeName: string;
    date: string;
    type: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    receiptUrl?: string;
}
