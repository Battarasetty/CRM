import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <span className="font-semibold text-purple-700 text-lg">MarketingCRM</span>
                <div className="flex gap-6 text-sm text-gray-600">
                    <Link to="/dashboard" className="hover:text-purple-600">Dashboard</Link>
                    <Link to="/campaigns" className="hover:text-purple-600">Campaigns</Link>
                    <Link to="/contacts" className="hover:text-purple-600">Contacts</Link>
                    <Link to="/segments" className="hover:text-purple-600">Segments</Link>
                    <Link to="/email-builder" className="hover:text-purple-600">Email Builder</Link>
                    <Link to="/analytics" className="hover:text-purple-600">Analytics</Link>
                    <Link to="/capture" className="hover:text-purple-600">Lead Form</Link>
                    {/* <Link to="/capture">Capture Lead</Link> */}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{user?.name}</span>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
            </div>
        </nav>
    );
}