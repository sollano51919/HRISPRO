
import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Spinner from './ui/Spinner';
// FIX: Corrected import paths.
import { OnboardingPlan, GeneratedOnboardingPlan } from '../types';
import { generateOnboardingPlan } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

const OnboardingPlanGenerator: React.FC<{onClose: () => void}> = ({onClose}) => {
    const [role, setRole] = useState('');
    const [department, setDepartment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedOnboardingPlan | null>(null);
    const [error, setError] = useState('');
    const [openWeeks, setOpenWeeks] = useState<{ [key: number]: boolean }>({1: true});

    const handleGenerate = async () => {
        if (!role || !department) {
            alert('Please provide both a role and department.');
            return;
        }
        setIsLoading(true);
        setGeneratedPlan(null);
        setError('');
        const result = await generateOnboardingPlan(role, department);
        try {
            const parsedResult = JSON.parse(result);
            if (parsedResult.error) {
                setError(parsedResult.error);
            } else {
                setGeneratedPlan(parsedResult);
            }
        } catch(e) {
            setError("Failed to parse the generated plan. Please try again.");
        }
        setIsLoading(false);
    };

    const toggleWeek = (weekNumber: number) => {
        setOpenWeeks(prev => ({...prev, [weekNumber]: !prev[weekNumber]}));
    }
    
    return (
        <div className="space-y-4">
           {!generatedPlan && !isLoading && !error && (
            <>
                <Input label="New Hire's Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Software Engineer" />
                <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Technology" />
                <div className="flex justify-end space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isLoading}>Generate Plan</Button>
                </div>
            </>
           )}
           {isLoading && <div className="flex flex-col items-center justify-center h-64"><Spinner/><p className="mt-2 text-gray-500">AI is building a personalized onboarding plan...</p></div>}
           {error && (
                <div>
                   <h3 className="text-lg font-semibold mb-2 text-red-600">An Error Occurred</h3>
                   <div className="p-4 bg-red-50 dark:bg-gray-900 rounded-md">
                       <p className="text-red-700 dark:text-red-300">{error}</p>
                   </div>
                   <div className="flex justify-end space-x-2 mt-4">
                       <Button variant="secondary" onClick={() => { setError(''); setRole(''); setDepartment(''); }}>Start Over</Button>
                   </div>
               </div>
           )}
           {generatedPlan && (
               <div>
                   <h3 className="text-lg font-semibold mb-2">Generated Onboarding Plan for a {role}</h3>
                   <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md max-h-96 overflow-y-auto space-y-2">
                       {generatedPlan.plan.map(week => (
                           <div key={week.week} className="border border-gray-200 dark:border-gray-700 rounded-md">
                               <button onClick={() => toggleWeek(week.week)} className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800">
                                   <span className="font-semibold">Week {week.week}: {week.title}</span>
                                   <ChevronDownIcon className={`w-5 h-5 transition-transform ${openWeeks[week.week] ? 'rotate-180' : ''}`} />
                               </button>
                               {openWeeks[week.week] && (
                                <ul className="p-4 space-y-2">
                                    {week.tasks.map((task, index) => (
                                        <li key={index} className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <label className="ml-3 text-sm">{task.task}</label>
                                        </li>
                                    ))}
                                </ul>
                               )}
                           </div>
                       ))}
                   </div>
                   <div className="flex justify-end space-x-2 mt-4">
                       <Button variant="secondary" onClick={() => { setGeneratedPlan(null); setRole(''); setDepartment(''); }}>Start Over</Button>
                       <Button onClick={onClose}>Finish</Button>
                   </div>
               </div>
           )}
        </div>
    );
};

const Onboarding: React.FC = () => {
    const { onboardingPlans } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Onboarding Plans</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <span className="flex items-center">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Generate Onboarding Plan
                    </span>
                </Button>
            </div>
            <Card>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Start Date</th>
                            <th className="p-4">Manager</th>
                            <th className="p-4">Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {onboardingPlans.map((plan) => (
                            <tr key={plan.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">{plan.employeeName}</td>
                                <td className="p-4">{plan.role}</td>
                                <td className="p-4">{plan.startDate}</td>
                                <td className="p-4">{plan.manager}</td>
                                <td className="p-4">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${plan.progress}%`}}></div>
                                    </div>
                                    <span className="text-xs text-gray-500">{plan.progress}% Complete</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="AI Onboarding Plan Generator">
                <OnboardingPlanGenerator onClose={() => setIsModalOpen(false)} />
            </Modal>
        </>
    );
};

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4 4-4 5.293-5.293a1 1 0 011.414 0L21 11.707" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);


export default Onboarding;