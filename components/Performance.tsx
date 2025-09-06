
import React, { useState } from 'react';
// FIX: Corrected import paths.
import { Employee, PerformanceReview } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Spinner from './ui/Spinner';
import Textarea from './ui/Textarea';
import { generatePerformanceReview } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

const PerformanceReviewGenerator: React.FC<{ employee: Employee | null; onClose: () => void }> = ({ employee, onClose }) => {
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


const Performance: React.FC = () => {
    const { employees, performanceReviews } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const openReviewModal = (employeeId: number) => {
        const employee = employees.find(e => e.id === employeeId);
        if (employee) {
            setSelectedEmployee(employee);
            setIsModalOpen(true);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const getEmployeeStatus = (employeeId: number) => {
        return employees.find(e => e.id === employeeId)?.status || 'Inactive';
    }
    
    return (
        <>
            <Card>
                <h2 className="text-xl font-bold mb-4">Performance Reviews</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Employee</th>
                            <th className="p-4">Due Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performanceReviews.map((review) => {
                            const employeeStatus = getEmployeeStatus(review.employeeId);
                            return (
                                <tr key={review.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-4 font-medium flex items-center">
                                        {review.employeeName}
                                        {employeeStatus === 'Inactive' && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">{review.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            review.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => openReviewModal(review.employeeId)}
                                            disabled={employeeStatus === 'Inactive'}
                                            title={employeeStatus === 'Inactive' ? 'Cannot review an inactive employee' : ''}
                                        >
                                            {review.status === 'Pending' ? 'Start Review' : 'View Review'}
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={`AI Performance Review Helper for ${selectedEmployee?.name}`}>
                <PerformanceReviewGenerator employee={selectedEmployee} onClose={closeModal} />
            </Modal>
        </>
    );
};

export default Performance;