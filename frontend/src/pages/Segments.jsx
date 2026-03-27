import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

export default function Segments() {
    const [segments, setSegments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', filters: { city: '', minAge: '', maxAge: '', minSpent: '', inactiveDays: '', tags: '' } });

    useEffect(() => { fetchSegments(); }, []);

    const fetchSegments = async () => {
        const { data } = await API.get('/segments');
        setSegments(data);
    };

    const handlePreview = async () => {
        const filters = buildFilters();
        const { data } = await API.post('/segments/preview', { filters });
        setPreview(data.count);
    };

    const buildFilters = () => {
        const f = {};
        if (form.filters.city) f.city = form.filters.city;
        if (form.filters.minAge) f.minAge = Number(form.filters.minAge);
        if (form.filters.maxAge) f.maxAge = Number(form.filters.maxAge);
        if (form.filters.minSpent) f.minSpent = Number(form.filters.minSpent);
        if (form.filters.inactiveDays) f.inactiveDays = Number(form.filters.inactiveDays);
        if (form.filters.tags) f.tags = form.filters.tags.split(',').map(t => t.trim()).filter(Boolean);
        return f;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/segments', { name: form.name, description: form.description, filters: buildFilters() });
            setShowForm(false);
            setPreview(null);
            setForm({ name: '', description: '', filters: { city: '', minAge: '', maxAge: '', minSpent: '', inactiveDays: '', tags: '' } });
            fetchSegments();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating segment');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this segment?')) return;
        await API.delete(`/segments/${id}`);
        fetchSegments();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Audience Segments</h1>
                    <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                        + New Segment
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">Segment Builder</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="Segment name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                <input className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>

                            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                                <p className="text-sm font-medium text-gray-700 mb-3">Filters</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-purple-400" placeholder="City" value={form.filters.city} onChange={(e) => setForm({ ...form, filters: { ...form.filters, city: e.target.value } })} />
                                    <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-purple-400" placeholder="Min age" value={form.filters.minAge} onChange={(e) => setForm({ ...form, filters: { ...form.filters, minAge: e.target.value } })} />
                                    <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-purple-400" placeholder="Max age" value={form.filters.maxAge} onChange={(e) => setForm({ ...form, filters: { ...form.filters, maxAge: e.target.value } })} />
                                    <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-purple-400" placeholder="Min total spent (₹)" value={form.filters.minSpent} onChange={(e) => setForm({ ...form, filters: { ...form.filters, minSpent: e.target.value } })} />
                                    <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-purple-400" placeholder="Inactive days" value={form.filters.inactiveDays} onChange={(e) => setForm({ ...form, filters: { ...form.filters, inactiveDays: e.target.value } })} />
                                    <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-purple-400" placeholder="Tags (comma separated)" value={form.filters.tags} onChange={(e) => setForm({ ...form, filters: { ...form.filters, tags: e.target.value } })} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button type="button" onClick={handlePreview} className="border border-purple-300 text-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-50">
                                    Preview Size
                                </button>
                                {preview !== null && (
                                    <span className="text-sm font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                                        {preview} contacts match
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700">Create Segment</button>
                                <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                    {segments.length === 0 && (
                        <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No segments yet. Create your first one!</div>
                    )}
                    {segments.map((s) => (
                        <div key={s._id} className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-800">{s.name}</h3>

                                <div className="flex gap-2">
                                    <a
                                        href={`http://localhost:5000/api/segments/${s._id}/export`}
                                        className="text-xs text-teal-600 hover:underline"
                                        download
                                    >
                                        Export CSV
                                    </a>

                                    <button
                                        onClick={() => handleDelete(s._id)}
                                        className="text-xs text-red-400 hover:text-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {s.description && <p className="text-xs text-gray-400 mb-3">{s.description}</p>}
                            <div className="text-3xl font-semibold text-purple-700 mb-1">{s.contactCount}</div>
                            <div className="text-xs text-gray-400 mb-3">contacts</div>
                            {s.filters && (
                                <div className="space-y-1">
                                    {s.filters.city && <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mr-1">City: {s.filters.city}</span>}
                                    {s.filters.minAge && <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mr-1">Age ≥ {s.filters.minAge}</span>}
                                    {s.filters.minSpent && <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mr-1">Spent ≥ ₹{s.filters.minSpent}</span>}
                                    {s.filters.inactiveDays && <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mr-1">Inactive {s.filters.inactiveDays}d</span>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}