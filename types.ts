// FIX: Create new file `types.ts` to define all data structures.

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  password?: string;
  avatar: string;
  status: 'Active' | 'Inactive';
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  supervisorId: number | null;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  employmentHistory: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
  }[];
  contracts: {
    type: 'Full-Time' | 'Part-Time' | 'Contract';
    startDate: string;
    endDate: string | null;
  }[];
  performance: {
    lastReview: string;
    achievements: string[];
    areasForImprovement: string[];
  };
  leaveCredits: {
    vacation: number;
    sick: number;
    personal: number;
  };
  healthCareBenefit: {
    allowance: number;
    balance: number;
  };
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
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface TimeRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  timeIn: string;
  clockInDevice: string;
  timeOut: string | null;
  clockOutDevice: string | null;
  totalHours: number;
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
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Memo {
    id: number;
    title: string;
    content: string;
    date: string;
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

export interface HealthCareClaim {
    id: number;
    employeeId: number;
    employeeName: string;
    date: string;
    type: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Holiday {
    id: number;
    name: string;
    date: string;
}

export interface HRSettings {
    defaultLeaveCredits: {
        vacation: number;
        sick: number;
        personal: number;
    };
    healthCareAllowance: number;
    twoStepApproval: boolean;
    holidays: Holiday[];
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
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
