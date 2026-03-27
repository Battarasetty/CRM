import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

export default function Dashboard() {
    const [stats, setStats] = useState({ campaigns: 0, contacts: 0, segments: 0, sent: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const [campaigns, contacts, segments] = await Promise.all([
                API.get('/campaigns'),
                API.get('/contacts'),
                API.get('/segments'),
            ]);
            const totalSent = campaigns.data.reduce((acc, c) => acc + (c.analytics?.sent || 0), 0);
            setStats({
                campaigns: campaigns.data.length,
                contacts: contacts.data.length,
                segments: segments.data.length,
                sent: totalSent,
            });
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Campaigns', value: stats.campaigns, color: 'bg-purple-50 text-purple-700' },
        { label: 'Total Contacts', value: stats.contacts, color: 'bg-teal-50 text-teal-700' },
        { label: 'Segments', value: stats.segments, color: 'bg-amber-50 text-amber-700' },
        { label: 'Emails Sent', value: stats.sent, color: 'bg-blue-50 text-blue-700' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {cards.map((card) => (
                        <div key={card.label} className={`${card.color} rounded-xl p-5`}>
                            <p className="text-sm font-medium opacity-70">{card.label}</p>
                            <p className="text-3xl font-semibold mt-1">{card.value}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-700 mb-2">Welcome, let's get started</h2>
                    <p className="text-sm text-gray-500">Create your first campaign, import contacts, and start engaging your audience.</p>
                </div>
            </div>
        </div>
    );
}