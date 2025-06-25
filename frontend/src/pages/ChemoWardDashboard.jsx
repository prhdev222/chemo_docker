import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiLink , FiCalendar, FiEdit } from 'react-icons/fi';
import { FaBed } from 'react-icons/fa';
import '../styles/dashboard.css';
import '../styles/common.css';
import { API_BASE_URL, api } from '../utils/api';

// I will reuse the existing Modal component from the original file if it exists,
// assuming it's still needed for rescheduling.
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h4>{title}</h4>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export default function ChemoWardDashboard() {
    const { token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newDate, setNewDate] = useState('');

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [appointmentsData, linksData] = await Promise.all([
                api.getAppointments(token),
                api.getLinks(token)
            ]);
            
            setAppointments(appointmentsData);
            setLinks(linksData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const body = { admitStatus: status };
            if (status === 'admit') {
                body.admitDate = new Date().toISOString();
            } else if (status === 'discharged') {
                body.dischargeDate = new Date().toISOString();
            }

            await api.updateAppointmentStatus(id, body, token);
            fetchDashboardData(); // Refresh data
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReschedule = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
        const today = new Date().toISOString().split('T')[0];
        setNewDate(today);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
        setNewDate('');
    };

    const handleConfirmReschedule = async () => {
        if (!selectedAppointment || !newDate) return;
        try {
            await api.updateAppointment(selectedAppointment.id, { 
                date: newDate, 
                admitStatus: 'waiting' 
            }, token);
            handleCloseModal();
            fetchDashboardData();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading dashboard...</p>;
    if (error) return <p>Error: {error}</p>;

    const today = new Date();
    const waitingAppointments = appointments.filter(a => a.admitStatus === 'waiting');
    const admittedPatients = appointments.filter(a => a.admitStatus === 'admit');

    return (
        <div className="dashboard-grid-original">
            <div className="main-column">
                <div className="content-card">
                    <div className="card-header">
                        <div className="card-title"><FiCalendar /><h3>รอเข้ารับการรักษา ({waitingAppointments.length})</h3></div>
                    </div>
                    <div className="card-body list-body">
                        {waitingAppointments.length > 0 ? waitingAppointments.map(app => (
                            <div key={app.id} className="list-item">
                                <p><strong>{app.patient.firstName} {app.patient.lastName}</strong> (HN: {app.patient.hn})</p>
                                <p>นัด: {new Date(app.date).toLocaleString('th-TH')} | Regimen: {app.chemoRegimen}</p>
                                <div className="button-group">
                                    <button className="btn-action-sm btn-success" onClick={() => handleUpdateStatus(app.id, 'admit')}>Check-in</button>
                                    <button className="btn-action-sm btn-secondary" onClick={() => handleReschedule(app)}>เลื่อนนัด</button>
                                </div>
                                {app.admitStatus === 'missed' && <span className="status-missed"> MISSED</span>}
                            </div>
                        )) : <p>ไม่มีผู้ป่วยรอเข้ารับการรักษา</p>}
                    </div>
                </div>

                <div className="content-card">
                    <div className="card-header">
                        <div className="card-title"><FaBed /><h3>กำลังรักษาตัวในหอผู้ป่วย ({admittedPatients.length})</h3></div>
                    </div>
                    <div className="card-body list-body">
                        {admittedPatients.length > 0 ? admittedPatients.map(app => (
                             <div key={app.id} className="list-item">
                                <span><strong>{app.patient.firstName} {app.patient.lastName}</strong> (HN: {app.patient.hn}) - Admit: {new Date(app.admitDate).toLocaleString('th-TH')}</span>
                                <button className="btn-action-sm btn-danger" onClick={() => handleUpdateStatus(app.id, 'discharged')}>Discharge</button>
                            </div>
                        )) : <p>ไม่มีผู้ป่วยกำลังรักษาตัว</p>}
                    </div>
                </div>
            </div>

            <div className="side-column">
                 <div className="content-card">
                    <div className="card-header">
                        <div className="card-title"><FiLink /><h3>Links เอกสาร</h3></div>
                        <button className="card-action-icon"><FiEdit /></button>
                    </div>
                    <div className="card-body">
                        {links.length > 0 ? links.map(link => (
                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="link-item">{link.title}</a>
                        )) : <p>ยังไม่มีลิงก์</p>}
                    </div>
                </div>
            </div>

             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="เลื่อนนัดผู้ป่วย">
                <div className="reschedule-form">
                    <p>เลื่อนนัดสำหรับ: <strong>{selectedAppointment?.patient.firstName}</strong></p>
                    <label htmlFor="newDate">วันที่นัดใหม่:</label>
                    <input type="date" id="newDate" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    <div className="button-group">
                        <button className="btn-primary" onClick={handleConfirmReschedule}>ยืนยันการเลื่อนนัด</button>
                        <button className="btn-secondary" onClick={handleCloseModal}>ยกเลิก</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 