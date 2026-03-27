import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [segments, setSegments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '', type: 'Email', subject: '', content: '',
        budget: '', scheduledAt: '', segment: '', frequency: 'Once',
        abTest: { enabled: false, variantA: '', variantB: '' }
    });
    useEffect(() => {
        fetchCampaigns();
        fetchSegments();
    }, []);

    const fetchCampaigns = async () => {
        const { data } = await API.get('/campaigns');
        setCampaigns(data);
    };

    const fetchSegments = async () => {
        const { data } = await API.get('/segments');
        setSegments(data);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                segment: form.segment === '' ? null : form.segment,
                budget: form.budget === '' ? 0 : Number(form.budget),
            };
            await API.post('/campaigns', payload);
            setShowForm(false);
            setForm({
                name: '', type: 'Email', subject: '', content: '',
                budget: '', scheduledAt: '', segment: '', frequency: 'Once',
                abTest: { enabled: false, variantA: '', variantB: '' }
            });
            fetchCampaigns();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating campaign');
        }
    };

    const handleSend = async (id) => {
        if (!window.confirm('Send this campaign now?')) return;
        try {
            const { data } = await API.post(`/campaigns/${id}/send`);
            alert(data.message);
            fetchCampaigns();
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending campaign');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this campaign?')) return;
        await API.delete(`/campaigns/${id}`);
        fetchCampaigns();
    };

    const statusColor = (status) => {
        if (status === 'Active') return 'bg-green-100 text-green-700';
        if (status === 'Completed') return 'bg-blue-100 text-blue-700';
        if (status === 'Scheduled') return 'bg-amber-100 text-amber-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Campaigns</h1>
                    <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                        + New Campaign
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">Create Campaign</h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                            <input className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                <option>Email</option>
                                <option>SMS</option>
                                <option>Push</option>
                                <option>Social</option>
                            </select>
                            <input className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="Email subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                            <input type="number" className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="Budget (₹)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                            <input type="datetime-local" className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
                            <select
                                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                                value={form.frequency}
                                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                            >
                                <option value="Once">Send Once</option>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                            <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                                <option value="">Select segment (optional)</option>
                                {segments.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.contactCount} contacts)</option>)}
                            </select>
                            <textarea className="col-span-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" rows={4} placeholder="Email content (HTML supported)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />

                            <div className="col-span-2">
                                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <input type="checkbox" checked={form.abTest.enabled} onChange={(e) => setForm({ ...form, abTest: { ...form.abTest, enabled: e.target.checked } })} />
                                    Enable A/B Testing
                                </label>
                                {form.abTest.enabled && (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <textarea className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none" rows={3} placeholder="Variant A content" value={form.abTest.variantA} onChange={(e) => setForm({ ...form, abTest: { ...form.abTest, variantA: e.target.value } })} />
                                        <textarea className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none" rows={3} placeholder="Variant B content" value={form.abTest.variantB} onChange={(e) => setForm({ ...form, abTest: { ...form.abTest, variantB: e.target.value } })} />
                                    </div>
                                )}
                            </div>

                            <div className="col-span-2 flex gap-3">
                                <button type="submit" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700">Create Campaign</button>
                                <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid gap-4">
                    {campaigns.length === 0 && <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No campaigns yet. Create your first one!</div>}
                    {campaigns.map((c) => (
                        <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-medium text-gray-800">{c.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(c.status)}`}>{c.status}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">{c.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{c.subject}</p>
                                    {c.segment && <p className="text-xs text-gray-400 mt-1">Segment: {c.segment.name}</p>}
                                </div>
                                <div className="flex gap-2">
                                    {c.status === 'Draft' && (
                                        <button onClick={() => handleSend(c._id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700">Send Now</button>
                                    )}
                                    <button onClick={() => handleDelete(c._id)} className="border border-red-200 text-red-500 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">Delete</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-100">
                                {[['Sent', c.analytics.sent], ['Opened', c.analytics.opened], ['Clicked', c.analytics.clicked], ['Bounced', c.analytics.bounced], ['Unsubscribed', c.analytics.unsubscribed]].map(([label, val]) => (
                                    <div key={label} className="text-center">
                                        <p className="text-lg font-semibold text-gray-800">{val}</p>
                                        <p className="text-xs text-gray-400">{label}</p>
                                    </div>
                                ))}
                            </div>
                            {c.budget > 0 && <p className="text-xs text-gray-400 mt-2">Budget: ₹{c.budget}</p>}
                        </div>
                    ))}
                </div>


                {/* Campaign Calendar */}
                <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">Campaign Calendar</h2>
                    {campaigns.filter(c => c.scheduledAt).length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No scheduled campaigns yet. Set a schedule date when creating a campaign.</p>
                    ) : (
                        <div className="space-y-2">
                            {campaigns
                                .filter(c => c.scheduledAt)
                                .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                                .map(c => (
                                    <div key={c._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-center bg-purple-100 text-purple-700 rounded-lg px-3 py-2 min-w-16">
                                            <div className="text-xs font-medium">{new Date(c.scheduledAt).toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-xl font-semibold">{new Date(c.scheduledAt).getDate()}</div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{c.name}</p>
                                            <p className="text-xs text-gray-400">{c.type} · {new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}