import { Employee, JobPosting, OnboardingPlan, PerformanceReview, LeaveRequest, TimeRecord, EmployeeSchedule, OvertimeRequest, Memo, BiometricDevice, BiometricLog, HealthCareClaim, HRSettings } from '../types';

const defaultLeaveCredits = { vacation: 15, sick: 10, personal: 5 };
const defaultHealthCareAllowance = 2000;

const employees: Employee[] = [
  {
    id: 1,
    name: 'Admin User',
    position: 'HR Administrator',
    department: 'Administration',
    email: 'admin@hr-core.com',
    password: 'password',
    avatar: 'https://i.pravatar.cc/100?u=admin',
    status: 'Active',
    gender: 'Prefer not to say',
    supervisorId: null,
    address: { street: '123 Admin Way', city: 'Corpville', state: 'CA', zip: '90210' },
    employmentHistory: [],
    contracts: [{ type: 'Full-Time', startDate: '2020-01-01', endDate: null }],
    performance: { lastReview: '2023-12-01', achievements: [], areasForImprovement: [] },
    leaveCredits: { vacation: 99, sick: 99, personal: 99 },
    healthCareBenefit: { allowance: 5000, balance: 5000 },
    accessibleModules: [], // Admin has access to all
    assignedBiometricNumber: 1000,
  },
  {
    id: 101,
    name: 'John Doe',
    position: 'Software Engineer',
    department: 'Technology',
    email: 'john.doe@example.com',
    password: 'password',
    avatar: 'https://i.pravatar.cc/100?u=johndoe',
    status: 'Active',
    gender: 'Male',
    supervisorId: 1,
    address: { street: '456 Dev Lane', city: 'Codeburg', state: 'CA', zip: '94107' },
    employmentHistory: [{ company: 'Tech Solutions Inc.', position: 'Junior Developer', startDate: '2020-06-01', endDate: '2022-05-31' }],
    contracts: [{ type: 'Full-Time', startDate: '2022-06-01', endDate: null }],
    performance: { lastReview: '2023-11-15', achievements: ['Launched new feature ahead of schedule'], areasForImprovement: ['Improve documentation on legacy code'] },
    leaveCredits: { ...defaultLeaveCredits },
    healthCareBenefit: { allowance: defaultHealthCareAllowance, balance: defaultHealthCareAllowance - 150 },
    accessibleModules: ['dashboard', 'profile', 'attendance', 'benefits', 'assistant'],
    assignedBiometricNumber: 1001,
  },
   {
    id: 102,
    name: 'Jane Smith',
    position: 'Product Manager',
    department: 'Product',
    email: 'jane.smith@example.com',
    password: 'password',
    avatar: 'https://i.pravatar.cc/100?u=janesmith',
    status: 'Inactive',
    gender: 'Female',
    supervisorId: 1,
    address: { street: '789 Product Rd', city: 'Featuretown', state: 'NY', zip: '10001' },
    employmentHistory: [],
    contracts: [{ type: 'Full-Time', startDate: '2021-03-15', endDate: '2023-08-31' }],
    performance: { lastReview: '2023-03-01', achievements: [], areasForImprovement: [] },
    leaveCredits: { vacation: 0, sick: 0, personal: 0 },
    healthCareBenefit: { allowance: defaultHealthCareAllowance, balance: 0 },
    accessibleModules: [],
    assignedBiometricNumber: 1002,
  }
];

const jobPostings: JobPosting[] = [
  { id: 1, title: 'Senior Frontend Engineer', department: 'Technology', status: 'Open', candidates: 25 },
  { id: 2, title: 'UX/UI Designer', department: 'Design', status: 'Closed', candidates: 42 },
];

const onboardingPlans: OnboardingPlan[] = [
  { id: 1, employeeName: 'New Hire Example', role: 'Data Analyst', startDate: new Date().toISOString().slice(0, 10), manager: 'Admin User', progress: 25 },
];

const performanceReviews: PerformanceReview[] = [
  { id: 1, employeeId: 101, employeeName: 'John Doe', date: '2024-07-15', status: 'Pending' },
  { id: 2, employeeId: 102, employeeName: 'Jane Smith', date: '2023-08-20', status: 'Completed' },
];

const leaveRequests: LeaveRequest[] = [
  { id: 1, employeeId: 101, employeeName: 'John Doe', type: 'Vacation', startDate: '2024-08-05', endDate: '2024-08-09', reason: 'Family trip', status: 'Approved' },
  { id: 2, employeeId: 101, employeeName: 'John Doe', type: 'Sick Leave', startDate: '2024-06-10', endDate: '2024-06-10', reason: 'Flu', status: 'Approved' },
];

const timeRecords: TimeRecord[] = [
  { id: 1, employeeId: 101, employeeName: 'John Doe', date: '2024-06-25', timeIn: '09:05', clockInDevice: "Main Entrance", timeOut: '17:30', clockOutDevice: "Main Entrance", totalHours: 8.42, status: 'Late' },
];

const schedules: EmployeeSchedule[] = [
  { id: 1, employeeId: 101, employeeName: 'John Doe', monday: '9-5', tuesday: '9-5', wednesday: '9-5', thursday: '9-5', friday: '9-5', saturday: 'Day Off', sunday: 'Day Off', effectiveDate: '2023-01-01', endDate: null },
];

const overtimeRequests: OvertimeRequest[] = [
    { id: 1, employeeId: 101, employeeName: 'John Doe', date: '2024-06-20', startTime: '17:30', endTime: '19:00', hours: 1.5, reason: 'Urgent feature release', status: 'Approved' },
];

const memos: Memo[] = [
  { id: 1, title: 'Company Summer Picnic', content: 'Join us for our annual summer picnic on July 20th!', date: '2024-07-01' },
];

const biometricDevices: BiometricDevice[] = [
  { id: 1, name: 'Main Entrance', ipAddress: '192.168.1.100', port: 8080, status: 'Online' },
];

const biometricLogs: BiometricLog[] = [
  { id: 1, employeeName: 'John Doe', biometricNumber: 1001, timestamp: new Date('2024-06-25T09:05:12Z').toISOString(), type: 'clock-in', deviceInfo: 'Main Entrance (192.168.1.100:8080)'},
];

const healthCareClaims: HealthCareClaim[] = [
  { id: 1, employeeId: 101, employeeName: 'John Doe', date: '2024-05-15', type: 'Dental Check-up', amount: 150.00, status: 'Approved' },
];

const settings: HRSettings = {
  defaultLeaveCredits,
  healthCareAllowance: defaultHealthCareAllowance,
  twoStepApproval: true,
  holidays: [
      { id: 1, name: 'New Year\'s Day', date: '2024-01-01' },
      { id: 2, name: 'Independence Day', date: '2024-07-04' },
  ],
};

export const initialData = {
  employees,
  jobPostings,
  onboardingPlans,
  performanceReviews,
  leaveRequests,
  timeRecords,
  schedules,
  overtimeRequests,
  memos,
  biometricDevices,
  biometricLogs,
  healthCareClaims,
  settings
};
