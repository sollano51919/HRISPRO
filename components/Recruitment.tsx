
import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Spinner from './ui/Spinner';
// FIX: Corrected import paths.
import { JobPosting } from '../types';
import { generateJobDescription } from '../services/geminiService';
import Onboarding from './Onboarding';
import { useAppContext } from '../context/AppContext';

type ActiveTab = 'postings' | 'onboarding';

const JobDescriptionGenerator: React.FC<{onClose: () => void}> = ({onClose}) => {
    const [title, setTitle] = useState('');
    const [requirements, setRequirements] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedJD, setGeneratedJD] = useState('');

    const handleGenerate = async () => {
        if (!title || !requirements) {
            alert('Please provide a title and key requirements.');
            return;
        }
        setIsLoading(true);
        setGeneratedJD('');
        const result = await generateJobDescription(title, requirements);
        setGeneratedJD(result);
        setIsLoading(false);
    };
    
    return (
        <div className="space-y-4">
           {!generatedJD && !isLoading && (
            <>
            <Input label="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Senior Product Manager" />
            <Textarea label="Key Requirements / Skills" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="e.g., 5+ years experience, React, TypeScript, Figma..." />
            <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={isLoading}>Generate</Button>
            </div>
            </>
           )}
           {isLoading && <div className="flex flex-col items-center justify-center h-64"><Spinner/><p className="mt-2 text-gray-500">AI is crafting the perfect job description...</p></div>}
           {generatedJD && (
               <div>
                   <h3 className="text-lg font-semibold mb-2">Generated Job Description</h3>
                   <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                       {generatedJD}
                   </div>
                   <div className="flex justify-end space-x-2 mt-4">
                       <Button variant="secondary" onClick={() => { setGeneratedJD(''); setTitle(''); setRequirements(''); }}>Start Over</Button>
                       <Button onClick={() => navigator.clipboard.writeText(generatedJD)}>Copy Text</Button>
                   </div>
               </div>
           )}
        </div>
    );
};

const JobPostingsTab: React.FC = () => {
    const { jobPostings } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Job Postings</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <span className="flex items-center">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Generate Job Description
                    </span>
                </Button>
            </div>
            <Card>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Title</th>
                            <th className="p-4">Department</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Candidates</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobPostings.map((job) => (
                            <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">{job.title}</td>
                                <td className="p-4">{job.department}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        job.status === 'Open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="p-4">{job.candidates}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="AI Job Description Generator">
                <JobDescriptionGenerator onClose={() => setIsModalOpen(false)} />
            </Modal>
        </>
    );
}


const Recruitment: React.FC = () => {
    const { activeSubModule, clearSubModule } = useAppContext();
    const [activeTab, setActiveTab] = useState<ActiveTab>('postings');

    useEffect(() => {
        if (activeSubModule === 'onboarding') {
            setActiveTab('onboarding');
            clearSubModule(); 
        }
    }, [activeSubModule, clearSubModule]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'postings':
                return <JobPostingsTab />;
            case 'onboarding':
                return <Onboarding />;
            default:
                return null;
        }
    }

    return (
        <div>
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('postings')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'postings'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Job Postings
                    </button>
                    <button
                        onClick={() => setActiveTab('onboarding')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'onboarding'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Onboarding Plans
                    </button>
                </nav>
            </div>
            
            {renderTabContent()}
        </div>
    );
};

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4 4-4 5.293-5.293a1 1 0 011.414 0L21 11.707" />
    </svg>
);


export default Recruitment;