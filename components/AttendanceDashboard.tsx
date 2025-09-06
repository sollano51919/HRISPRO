
import React from 'react';
// FIX: Corrected import paths.
import { useAppContext } from '../context/AppContext';
import Card from './ui/Card';
import { EmployeeSchedule } from '../types';

const AttendanceDashboard: React.FC = () => {
    const { employees, timeRecords, leaveRequests, schedules } = useAppContext();

    const activeEmployees = employees.filter(e => e.status === 'Active');
    const today = new Date();
    const todayString = today.toISOString().slice(0, 10);
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof Omit<EmployeeSchedule, 'id' | 'employeeId' | 'employeeName' | 'effectiveDate' | 'endDate'>;


    // --- Time Record Summary ---
    const todaysTimeRecords = timeRecords.filter(tr => tr.date === todayString);
    const lateCount = todaysTimeRecords.filter(tr => tr.status === 'Late').length;
    const presentCount = todaysTimeRecords.length;

    // --- Leave Summary ---
    const onLeaveToday = leaveRequests.filter(lr => {
        if (lr.status !== 'Approved') return false;
        const startDate = new Date(lr.startDate + 'T00:00:00');
        const endDate = new Date(lr.endDate + 'T23:59:59');
        return today >= startDate && today <= endDate;
    });

    const onLeaveIds = new Set(onLeaveToday.map(lr => lr.employeeId));
    const presentIds = new Set(todaysTimeRecords.map(tr => tr.employeeId));

    // --- Schedule Summary ---
    const dayOffToday = schedules.filter(s => {
        const employeeIsActive = activeEmployees.some(e => e.id === s.employeeId);
        const employeeOnLeave = onLeaveIds.has(s.employeeId);
        return employeeIsActive && !employeeOnLeave && s[dayOfWeek]?.toLowerCase().includes('day off');
    });

    const dayOffIds = new Set(dayOffToday.map(s => s.employeeId));
    
    const notLoggedInYet = activeEmployees.filter(e => 
        !presentIds.has(e.id) && 
        !onLeaveIds.has(e.id) &&
        !dayOffIds.has(e.id)
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Active</h3>
                    <p className="text-4xl font-bold mt-2">{activeEmployees.length}</p>
                </Card>
                <Card className="flex flex-col items-center justify-center bg-green-50 dark:bg-green-900/20">
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Present</h3>
                    <p className="text-4xl font-bold mt-2 text-green-700 dark:text-green-300">{presentCount}</p>
                </Card>
                 <Card className="flex flex-col items-center justify-center bg-yellow-50 dark:bg-yellow-900/20">
                    <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Late</h3>
                    <p className="text-4xl font-bold mt-2 text-yellow-700 dark:text-yellow-300">{lateCount}</p>
                </Card>
                <Card className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">On Leave</h3>
                    <p className="text-4xl font-bold mt-2 text-blue-700 dark:text-blue-300">{onLeaveToday.length}</p>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <CalendarIcon className="w-6 h-6 mr-2 text-blue-500"/> On Leave Today
                    </h3>
                    {onLeaveToday.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                            {onLeaveToday.map(req => {
                                const employee = employees.find(e => e.id === req.employeeId);
                                return (
                                    <li key={req.id} className="py-3 flex items-center space-x-4">
                                        <img className="h-10 w-10 rounded-full" src={employee?.avatar} alt={employee?.name} />
                                        <div>
                                            <p className="font-medium">{employee?.name}</p>
                                            <p className="text-sm text-gray-500">{req.type}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 pt-4 text-center">No employees are on leave today.</p>
                    )}
                </Card>
                
                 <Card>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                       <ClockIcon className="w-6 h-6 mr-2 text-red-500"/> Yet to Clock In
                    </h3>
                    {notLoggedInYet.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                           {notLoggedInYet.map(employee => (
                                <li key={employee.id} className="py-3 flex items-center space-x-4">
                                     <img className="h-10 w-10 rounded-full" src={employee.avatar} alt={employee.name} />
                                    <div>
                                        <p className="font-medium">{employee.name}</p>
                                        <p className="text-sm text-gray-500">{employee.position}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-gray-500 dark:text-gray-400 pt-4 text-center">All scheduled employees have clocked in or are on leave.</p>
                    )}
                </Card>

                <Card>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <SunIcon className="w-6 h-6 mr-2 text-orange-500"/> Scheduled Day Off
                    </h3>
                    {dayOffToday.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                           {dayOffToday.map(schedule => {
                                const employee = employees.find(e => e.id === schedule.employeeId);
                                return (
                                    <li key={schedule.id} className="py-3 flex items-center space-x-4">
                                        <img className="h-10 w-10 rounded-full" src={employee?.avatar} alt={employee?.name} />
                                        <div>
                                            <p className="font-medium">{employee?.name}</p>
                                            <p className="text-sm text-gray-500">{employee?.position}</p>
                                        </div>
                                    </li>
                                );
                           })}
                        </ul>
                    ) : (
                         <p className="text-gray-500 dark:text-gray-400 pt-4 text-center">No employees have a scheduled day off today.</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h22.5" /></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>;

export default AttendanceDashboard;