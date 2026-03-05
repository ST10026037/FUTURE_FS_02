import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
    { icon: '📊', label: 'Dashboard', path: '/' },
    { icon: '📈', label: 'Analytics', path: '/analytics' },
    { icon: '📝', label: 'Submit Lead', path: '/contact' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    function logout() {
        localStorage.removeItem('crm_token');
        navigate('/login');
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">🎯</div>
                <span className="sidebar-brand-name">LeadFlow CRM</span>
            </div>

            {NAV.map((item) => (
                <button
                    key={item.path}
                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}

            <div className="sidebar-spacer" />

            <button className="btn-logout" onClick={logout}>
                <span>🚪</span>
                <span>Logout</span>
            </button>
        </aside>
    );
}
