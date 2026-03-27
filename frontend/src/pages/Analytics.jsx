import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#7c3aed', '#0f766e', '#b45309', '#be185d', '#1d4ed8'];

export default function Analytics() {
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        API.get('/campaigns').then(({ data }) => setCampaigns(data));
    }, []);

    const totalStats = campaigns.reduce((acc, c) => ({
        sent: acc.sent + (c.analytics.sent || 0),
        opened: acc.opened + (c.analytics.opened || 0),
        clicked: acc.clicked + (c.analytics.clicked || 0),
        bounced: acc.bounced + (c.analytics.bounced || 0),
        unsubscribed: acc.unsubscribed + (c.analytics.unsubscribed || 0),
    }), { sent: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 });

    const openRate = totalStats.sent > 0 ? ((totalStats.opened / totalStats.sent) * 100).toFixed(1) : 0;
    const clickRate = totalStats.sent > 0 ? ((totalStats.clicked / totalStats.sent) * 100).toFixed(1) : 0;

    const barData = campaigns.map((c) => ({
        name: c.name.length > 12 ? c.name.slice(0, 12) + '...' : c.name,
        Sent: c.analytics.sent || 0,
        Opened: c.analytics.opened || 0,
        Clicked: c.analytics.clicked || 0,
    }));

    const pieData = [
        { name: 'Opened', value: totalStats.opened },
        { name: 'Clicked', value: totalStats.clicked },
        { name: 'Bounced', value: totalStats.bounced },
        { name: 'Unsubscribed', value: totalStats.unsubscribed },
        { name: 'Not opened', value: Math.max(0, totalStats.sent - totalStats.opened) },
    ].filter(d => d.value > 0);

    const lineData = campaigns.map((c, i) => ({
        name: `C${i + 1}`,
        'Open Rate': c.analytics.sent > 0 ? +((c.analytics.opened / c.analytics.sent) * 100).toFixed(1) : 0,
        'Click Rate': c.analytics.sent > 0 ? +((c.analytics.clicked / c.analytics.sent) * 100).toFixed(1) : 0,
    }));

    const statCards = [
        { label: 'Total Sent', value: totalStats.sent, color: 'bg-purple-50 text-purple-700' },
        { label: 'Total Opened', value: totalStats.opened, color: 'bg-teal-50 text-teal-700' },
        { label: 'Total Clicked', value: totalStats.clicked, color: 'bg-amber-50 text-amber-700' },
        { label: 'Open Rate', value: `${openRate}%`, color: 'bg-blue-50 text-blue-700' },
        { label: 'Click Rate', value: `${clickRate}%`, color: 'bg-pink-50 text-pink-700' },
        { label: 'Unsubscribed', value: totalStats.unsubscribed, color: 'bg-red-50 text-red-700' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Analytics</h1>

                {/* Stat cards */}
                <div className="grid grid-cols-6 gap-3 mb-8">
                    {statCards.map((s) => (
                        <div key={s.label} className={`${s.color} rounded-xl p-4`}>
                            <p className="text-xs font-medium opacity-70 mb-1">{s.label}</p>
                            <p className="text-2xl font-semibold">{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Bar chart */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-medium text-gray-700 mb-4">Campaign performance</h2>
                        {barData.length === 0
                            ? <p className="text-sm text-gray-400 text-center py-8">No campaign data yet</p>
                            : <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="Sent" fill="#e9d5ff" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Opened" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Clicked" fill="#0f766e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        }
                    </div>

                    {/* Pie chart */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-medium text-gray-700 mb-4">Engagement breakdown</h2>
                        {pieData.length === 0
                            ? <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
                            : <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        }
                    </div>
                </div>

                {/* Line chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">Open rate vs click rate across campaigns</h2>
                    {lineData.length === 0
                        ? <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
                        : <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} unit="%" />
                                <Tooltip formatter={(v) => `${v}%`} />
                                <Legend />
                                <Line type="monotone" dataKey="Open Rate" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="Click Rate" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    }
                </div>

                {/* Device breakdown */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-medium text-gray-700 mb-4">Device breakdown</h2>
                        {campaigns.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
                        ) : (
                            <div className="space-y-3">
                                {['mobile', 'desktop', 'tablet'].map((device) => {
                                    const total = campaigns.reduce((acc, c) => acc + (c.analytics?.devices?.[device] || 0), 0);
                                    const max = campaigns.reduce((acc, c) => acc + (c.analytics?.opened || 0), 0) || 1;
                                    const pct = Math.round((total / max) * 100);
                                    return (
                                        <div key={device}>
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span className="capitalize">{device}</span>
                                                <span>{total} opens ({pct}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Geographic distribution */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-medium text-gray-700 mb-4">Geographic distribution</h2>
                        {campaigns.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
                        ) : (() => {
                            const cityMap = {};
                            campaigns.forEach(c => {
                                if (c.analytics?.cities) {
                                    Object.entries(c.analytics.cities).forEach(([city, count]) => {
                                        cityMap[city] = (cityMap[city] || 0) + count;
                                    });
                                }
                            });
                            const entries = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
                            const max = entries[0]?.[1] || 1;
                            return entries.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">Send campaigns to see city data</p>
                            ) : (
                                <div className="space-y-3">
                                    {entries.slice(0, 6).map(([city, count]) => (
                                        <div key={city}>
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>{city}</span><span>{count} opens</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Campaign table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-sm font-medium text-gray-700">All campaigns breakdown</h2>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Campaign', 'Type', 'Status', 'Sent', 'Opened', 'Clicked', 'Open Rate', 'Click Rate'].map(h => (
                                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {campaigns.length === 0 && (
                                <tr><td colSpan={8} className="text-center text-gray-400 text-sm py-8">No campaigns yet</td></tr>
                            )}
                            {campaigns.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : c.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.analytics.sent}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.analytics.opened}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.analytics.clicked}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.analytics.sent > 0 ? ((c.analytics.opened / c.analytics.sent) * 100).toFixed(1) : 0}%</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.analytics.sent > 0 ? ((c.analytics.clicked / c.analytics.sent) * 100).toFixed(1) : 0}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}