import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Import Pages
import PatientManagement from '../pages/PatientManagement';
import AppointmentDashboard from '../pages/AppointmentDashboard';
import TreatmentPage from '../pages/TreatmentPage';
import ChemoWardDashboard from '../pages/ChemoWardDashboard';
import SettingsPage from '../pages/SettingsPage';

const Dashboard = () => <div>ภาพรวมระบบ</div>;

const Sidebar = () => {
    const { user, logout } = React.useContext(AuthContext);

    // --- Role-based access control for sidebar links ---
    const navLinks = [
        { path: "/chemo-ward", label: "ภาพรวม", roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
        { path: "/patients", label: "จัดการข้อมูลผู้ป่วย", roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
        { path: "/appointments", label: "แดชบอร์ดนัดหมาย", roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
        { path: "/treatments", label: "แผนการรักษา", roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
        { path: "/settings", label: "ตั้งค่า", roles: ['ADMIN'] },
    ];

    const accessibleLinks = navLinks.filter(link => link.roles.includes(user?.role));

    const linkStyle = {
        display: 'block',
        padding: '10px 15px',
        textDecoration: 'none',
        color: '#333',
        borderRadius: '5px',
        marginBottom: '5px'
    };

    const activeLinkStyle = {
        ...linkStyle,
        backgroundColor: '#007bff',
        color: 'white',
    };

    return (
        <div style={{
            width: '250px',
            minHeight: '100vh',
            background: '#f8f9fa',
            borderRight: '1px solid #dee2e6',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>ChemoSys</h2>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0 }}>Logged in as:</p>
                <strong>{user?.name} ({user?.role})</strong>
            </div>
            <nav style={{ flex: 1 }}>
                {accessibleLinks.map(link => (
                    <NavLink key={link.path} to={link.path} style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            <button onClick={logout} style={{
                width: '100%',
                padding: '10px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}>
                Logout
            </button>
        </div>
    );
};

export default function DashboardLayout() {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <Routes>
                    <Route path="/chemo-ward" element={<ChemoWardDashboard />} />
                    <Route path="/patients" element={<PatientManagement />} />
                    <Route path="/appointments" element={<AppointmentDashboard />} />
                    <Route path="/treatments" element={<TreatmentPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/*" element={<Navigate to="/chemo-ward" replace />} />
                </Routes>
            </main>
        </div>
    );
} 