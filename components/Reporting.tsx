
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { analyzeChartData } from '../services/geminiService';
// FIX: Corrected import path.
import { useAppContext } from '../context/AppContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Reporting: React.FC = () => {
    const { employees } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState('');

    const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Active'), [employees]);

    const departmentData = useMemo(() => {
        const counts = activeEmployees.reduce((acc, employee) => {
            const dept = employee.department || 'Unassigned';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [activeEmployees]);

    const genderData = useMemo(() => {
        const counts = activeEmployees.reduce((acc, employee) => {
            const gender = employee.gender || 'Not Specified';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [activeEmployees]);


    const handleGetInsights = async () => {
        setIsLoading(true);
        setInsights('');
        
        const dataSummary = `
        Department Headcount: ${JSON.stringify(departmentData)}.
        Gender Distribution: ${JSON.stringify(genderData)}.
        `;
        
        const result = await analyzeChartData("HR Demographics", dataSummary);
        setInsights(result);
        setIsLoading(false);
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold">HR Analytics Dashboard</h3>
                        <p className="text-gray-500 dark:text-gray-400">Key metrics for active employees</p>
                    </div>
                     <Button onClick={handleGetInsights} disabled={isLoading}>
                         <span className="flex items-center">
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            {isLoading ? 'Analyzing...' : 'Get AI Insights'}
                         </span>
                    </Button>
                </div>

                {isLoading && <div className="flex items-center p-4 bg-indigo-50 dark:bg-gray-800 rounded-md"><Spinner /> <p className="ml-4">AI is analyzing the data to find key insights...</p></div>}
                
                {insights && (
                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-gray-800 rounded-md">
                         <h4 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-2">AI-Powered Insights</h4>
                         <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{insights}</div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div>
                        <h4 className="font-semibold mb-4 text-center">Headcount by Department</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={departmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                        borderColor: 'rgba(75, 85, 99, 1)',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="count" fill="#4f46e5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                         <h4 className="font-semibold mb-4 text-center">Gender Distribution</h4>
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                 <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                        borderColor: 'rgba(75, 85, 99, 1)',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4 4-4 5.293-5.293a1 1 0 011.414 0L21 11.707" />
    </svg>
);


export default Reporting;