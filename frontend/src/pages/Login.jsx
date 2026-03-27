import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const body = isRegister ? { ...form, name: form.name } : form;
            const { data } = await API.post(endpoint, body);
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Marketing CRM</h1>
                <p className="text-gray-500 text-sm mb-6">{isRegister ? 'Create your account' : 'Sign in to your account'}</p>

                {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <input
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                            placeholder="Full name"
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    )}
                    <input
                        type="email"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                        placeholder="Email address"
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <input
                        type="password"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                        placeholder="Password"
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                    >
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button onClick={() => setIsRegister(!isRegister)} className="text-purple-600 font-medium">
                        {isRegister ? 'Sign in' : 'Register'}
                    </button>
                </p>
            </div>
        </div>
    );
}