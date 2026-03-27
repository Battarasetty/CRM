import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', age: '', totalSpent: '', totalOrders: '', tags: '' });
    const navigate = useNavigate();

    useEffect(() => { fetchContacts(); }, []);

    const fetchContacts = async () => {
        const { data } = await API.get('/contacts');
        setContacts(data);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/contacts', {
                ...form,
                age: Number(form.age),
                totalSpent: Number(form.totalSpent),
                totalOrders: Number(form.totalOrders),
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            setShowForm(false);
            setForm({ name: '', email: '', phone: '', city: '', age: '', totalSpent: '', totalOrders: '', tags: '' });
            fetchContacts();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating contact');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this contact?')) return;
        await API.delete(`/contacts/${id}`);
        fetchContacts();
    };

    const handleUnsubscribe = async (id) => {
        await API.put(`/contacts/${id}/unsubscribe`);
        fetchContacts();
    };

    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleEnrich = async (id) => {
        try {
            const { data } = await API.post(`/contacts/${id}/enrich`);
            alert(`Enriched! Company: ${data.contact.company}, Role: ${data.contact.jobTitle}`);
            fetchContacts();
        } catch (err) {
            alert('Enrichment failed: ' + err.response?.data?.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Contacts</h1>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/capture')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                        >
                            + Capture Lead
                        </button>

                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                        >
                            + Add Contact
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">New Contact</h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                            {[['name', 'Full name'], ['email', 'Email address'], ['phone', 'Phone number'], ['city', 'City'], ['age', 'Age'], ['totalSpent', 'Total spent (₹)'], ['totalOrders', 'Total orders'], ['tags', 'Tags (comma separated)']].map(([field, placeholder]) => (
                                <input key={field} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" placeholder={placeholder} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={field === 'name' || field === 'email'} />
                            ))}
                            <div className="col-span-2 flex gap-3">
                                <button type="submit" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700">Save Contact</button>
                                <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <input className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-purple-400" placeholder="Search by name, email or city..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Name', 'Email', 'City', 'Age', 'Total Spent', 'Orders', 'Company', 'Job Title', 'Tags', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 && (
                                <tr><td colSpan={9} className="text-center text-gray-400 text-sm py-8">No contacts found</td></tr>
                            )}
                            {filtered.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.city || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.age || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">₹{c.totalSpent || 0}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.totalOrders || 0}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.company || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.jobTitle || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{(c.tags || []).join(', ') || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isUnsubscribed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                            {c.isUnsubscribed ? 'Unsubscribed' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => handleEnrich(c._id)}
                                                className="text-xs text-purple-600 hover:underline"
                                            >
                                                Enrich
                                            </button>
                                            {!c.isUnsubscribed && (
                                                <button onClick={() => handleUnsubscribe(c._id)} className="text-xs text-amber-600 hover:underline">
                                                    Unsub
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(c._id)} className="text-xs text-red-500 hover:underline">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {filtered.length} of {contacts.length} contacts
                    </div>
                </div>
            </div>
        </div>
    );
}