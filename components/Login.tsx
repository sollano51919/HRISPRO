
import React, { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
// FIX: Corrected import path.
import { useAppContext } from '../context/AppContext';

const Login: React.FC = () => {
    const { login, employees } = useAppContext();
    const [email, setEmail] = useState('admin@hr-core.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const user = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase() && emp.password === password);

        if (user) {
            login(user.id);
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">HR Core</h1>
                    <p className="text-gray-500 dark:text-gray-400">AI-Powered Human Resources Dashboard</p>
                </div>
                <Card>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">Login</h2>
                        <Input 
                            label="Email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                        <Input 
                            label="Password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            required
                        />
                         {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                        <div className="text-xs text-center text-gray-500 dark:text-gray-400 space-y-2 pt-2 border-t dark:border-gray-700">
                           <p className="font-semibold">Login with your employee credentials.</p>
                           <p>Default admin: <strong>admin@hr-core.com</strong></p>
                           <p>Default employee: <strong>john.doe@example.com</strong></p>
                           <p>(Default password for all is "<strong>password</strong>")</p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Login;