import { useState } from 'react';
import Navbar from '../components/Navbar';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import API from '../api/axios';

const templates = [
    {
        name: 'Diwali Sale',
        subject: 'Exclusive Diwali Offer Just For You!',
        content: `<h1 style="color:#7c3aed">Happy Diwali! 🪔</h1><p>Dear Customer,</p><p>Celebrate Diwali with our exclusive <strong>20% discount</strong> on all products!</p><p>Use code: <strong style="color:#7c3aed">DIWALI20</strong></p><p>Offer valid till 31st October.</p><br/><p>Shop Now →</p>`,
    },
    {
        name: 'Welcome Email',
        subject: 'Welcome to our family!',
        content: `<h1 style="color:#0f766e">Welcome aboard! 👋</h1><p>Hi there,</p><p>We're so excited to have you with us. Here's <strong>10% off</strong> your first order.</p><p>Use code: <strong style="color:#0f766e">WELCOME10</strong></p><br/><p>Start Shopping →</p>`,
    },
    {
        name: 'Win Back',
        subject: "We miss you! Here's a special offer",
        content: `<h1 style="color:#b45309">We miss you! 💛</h1><p>Hi there,</p><p>It's been a while since your last visit. We'd love to have you back!</p><p>Here's <strong>15% off</strong> just for you.</p><p>Use code: <strong style="color:#b45309">COMEBACK15</strong></p><br/><p>Come Back →</p>`,
    },
    {
        name: 'New Arrival',
        subject: 'New arrivals just dropped!',
        content: `<h1 style="color:#be185d">New Arrivals! 🔥</h1><p>Hi there,</p><p>Fresh styles just landed. Be the first to grab them before they sell out!</p><p>Check out our <strong>latest collection</strong> now.</p><br/><p>Shop New Arrivals →</p>`,
    },
];

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
    ],
};

export default function EmailBuilder() {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [previewMode, setPreviewMode] = useState('desktop');
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [testEmail, setTestEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [saved, setSaved] = useState(false);

    const applyTemplate = (template) => {
        setSubject(template.subject);
        setContent(template.content);
        setActiveTemplate(template.name);
    };

    const handleSendTest = async () => {
        if (!testEmail) return alert('Enter a test email address');
        if (!content) return alert('Write some content first');
        setSending(true);
        try {
            await API.post('/campaigns', {
                name: `Test — ${subject || 'No subject'}`,
                type: 'Email',
                subject: subject || 'Test Email',
                content,
                status: 'Draft',
            });
            alert(`Test email template saved! (Connect Nodemailer to actually send)`);
        } catch (err) {
            alert('Error: ' + err.message);
        }
        setSending(false);
    };

    const handleSave = () => {
        localStorage.setItem('emailDraft', JSON.stringify({ subject, content }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Email Builder</h1>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${saved ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            {saved ? 'Saved!' : 'Save Draft'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left — Templates */}
                    <div className="col-span-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Templates</p>
                        <div className="space-y-2">
                            {templates.map((t) => (
                                <button key={t.name} onClick={() => applyTemplate(t)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition ${activeTemplate === t.name ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200'}`}>
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Middle — Editor */}
                    <div className="col-span-6">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100">
                                <input
                                    className="w-full text-sm outline-none font-medium text-gray-800 placeholder-gray-400"
                                    placeholder="Email subject line..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                style={{ height: '400px' }}
                            />
                            <div style={{ height: '42px' }} />
                        </div>

                        {/* Test send */}
                        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
                            <input
                                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-purple-400"
                                placeholder="Send test to: email@example.com"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                            />
                            <button onClick={handleSendTest} disabled={sending} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                                {sending ? 'Sending...' : 'Send Test'}
                            </button>
                        </div>
                    </div>

                    {/* Right — Preview */}
                    <div className="col-span-4">
                        <div className="flex gap-2 mb-3">
                            {['desktop', 'mobile'].map((mode) => (
                                <button key={mode} onClick={() => setPreviewMode(mode)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${previewMode === mode ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                    {mode === 'desktop' ? 'Desktop' : 'Mobile'}
                                </button>
                            ))}
                        </div>

                        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${previewMode === 'mobile' ? 'max-w-xs mx-auto' : 'w-full'}`}>
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                <p className="text-xs text-gray-500">Subject: <span className="text-gray-800 font-medium">{subject || 'No subject'}</span></p>
                            </div>
                            <div
                                className="p-4 text-sm"
                                style={{ minHeight: '400px' }}
                                dangerouslySetInnerHTML={{ __html: content || '<p style="color:#9ca3af">Your email preview will appear here...</p>' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}