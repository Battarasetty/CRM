import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function LeadCapture() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', city: '' });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/contacts/capture', form);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md shadow-sm">
                {success ? (
                    <div className="text-center py-6">
                        <div className="text-4xl mb-4">✅</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">You're in!</h2>
                        <p className="text-gray-500 text-sm mb-4">
                            Thanks for signing up. We'll be in touch soon.
                        </p>

                        <button
                            onClick={() => navigate('/contacts')}
                            className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-purple-700"
                        >
                            Go to App
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Get Exclusive Offers</h1>
                        <p className="text-gray-400 text-sm mb-6">Sign up to receive personalised deals and updates.</p>

                        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="Phone number (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="City (optional)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                            <button type="submit" className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                                Sign Me Up
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}