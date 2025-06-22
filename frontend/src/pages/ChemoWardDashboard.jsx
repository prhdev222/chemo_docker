import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Reusable Modal Component
const Modal = ({ children, onClose }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '600px', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            {children}
        </div>
    </div>
);

// Appointment Edit Form for Rescheduling
const RescheduleForm = ({ appointment, onSave, onCancel }) => {
    const [form, setForm] = useState({ date: '', note: '' });
    useEffect(() => {
        if (appointment) {
            setForm({
                date: appointment.date ? new Date(appointment.date).toISOString().slice(0, 16) : '',
                note: appointment.note || ''
            });
        }
    }, [appointment]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...form, admitStatus: 'rescheduled' });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>เลื่อนนัดสำหรับ: {appointment.patient.firstName}</h3>
            <label>วันที่นัดใหม่:</label>
            <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required style={{width: '100%', padding: '8px', marginBottom: '10px'}}/>
            <label>เหตุผล/หมายเหตุ:</label>
            <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} required style={{width: '100%', minHeight: '80px', padding: '8px'}}/>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onCancel}>ยกเลิก</button>
                <button type="submit">บันทึกการเลื่อนนัด</button>
            </div>
        </form>
    );
};

export default function ChemoWardDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const { token } = useContext(AuthContext);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appRes, linkRes] = await Promise.all([
                fetch('http://localhost:3001/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:3001/api/links', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const appData = await appRes.json();
            const linkData = await linkRes.json();
            setAppointments(Array.isArray(appData) ? appData : []);
            setLinks(Array.isArray(linkData) ? linkData : []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleUpdateStatus = async (id, newStatus, note = '') => {
        const payload = { admitStatus: newStatus, note };
        if (newStatus === 'admit') payload.admitDate = new Date().toISOString();
        if (newStatus === 'discharged') payload.dischargeDate = new Date().toISOString();
        
        await fetch(`http://localhost:3001/api/appointments/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        fetchData();
    };

    const handleReschedule = (appointment) => {
        setEditingAppointment(appointment);
    };

    const saveReschedule = async (formData) => {
        await fetch(`http://localhost:3001/api/appointments/${editingAppointment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        setEditingAppointment(null);
        fetchData();
    };

    const today = new Date();
    const waitingAppointments = appointments.filter(a => a.admitStatus === 'waiting' || (a.admitStatus === 'missed' && new Date(a.date).toDateString() === today.toDateString()));
    const admittedPatients = appointments.filter(a => a.admitStatus === 'admit');

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            {/* Main Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Box 1: Waiting for Admission */}
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
                    <h3>รอเข้ารับการรักษา ({waitingAppointments.length})</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {waitingAppointments.map(app => (
                            <div key={app.id} style={{ borderBottom: '1px solid #eee', padding: '10px' }}>
                                <p><strong>{app.patient.firstName} {app.patient.lastName}</strong> (HN: {app.patient.hn})</p>
                                <p>นัด: {new Date(app.date).toLocaleString('th-TH')} | Regimen: {app.chemoRegimen}</p>
                                {app.referHospital && <p>ส่งตัวไป: {app.referHospital} (วันที่: {new Date(app.referDate).toLocaleDateString('th-TH')})</p>}
                                <button onClick={() => handleUpdateStatus(app.id, 'admit')}>Check-in</button>
                                {app.admitStatus !== 'missed' && <button onClick={() => handleUpdateStatus(app.id, 'missed')}>ไม่มาตามนัด</button>}
                                <button onClick={() => handleReschedule(app)}>เลื่อนนัด</button>
                                {app.admitStatus === 'missed' && <span style={{color: 'red', fontWeight: 'bold'}}> MISSED</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Box 2: Currently Admitted */}
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
                    <h3>กำลังรักษาตัวในหอผู้ป่วย ({admittedPatients.length})</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {admittedPatients.map(app => (
                           <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
                               <span><strong>{app.patient.firstName} {app.patient.lastName}</strong> (HN: {app.patient.hn}) - Admit: {new Date(app.admitDate).toLocaleDateString('th-TH')}</span>
                               <button onClick={() => handleUpdateStatus(app.id, 'discharged')}>Discharge</button>
                           </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar / Tools Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Box 4: External Links */}
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
                    <h3>Links เอกสาร</h3>
                    {links.map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '8px' }}>{link.title}</a>
                    ))}
                </div>
            </div>
            
            {editingAppointment && (
                <Modal onClose={() => setEditingAppointment(null)}>
                    <RescheduleForm appointment={editingAppointment} onSave={saveReschedule} onCancel={() => setEditingAppointment(null)} />
                </Modal>
            )}
        </div>
    );
}