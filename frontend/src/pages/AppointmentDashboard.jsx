import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaEdit, FaTrash, FaPlus, FaFilePdf, FaFileExcel, FaTimes, FaCheckCircle } from 'react-icons/fa';
import '../THSarabunNew-normal.js';
import '../styles/dashboard.css';
import '../styles/common.css';

const API_URL = 'http://localhost:3001/api';

// --- Reusable Modal ---
const Modal = ({ children, onClose, title }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
                <h4>{title}</h4>
                <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

// --- Status Badge ---
const StatusBadge = ({ status }) => {
    const statusMap = {
        waiting: { text: 'Waiting', color: '#ffc107' },
        admit: { text: 'Admit', color: '#28a745' },
        discharged: { text: 'Discharged', color: '#007bff' },
        missed: { text: 'Missed', color: '#dc3545' },
        rescheduled: { text: 'Rescheduled', color: '#6c757d' }
    };
    const currentStatus = statusMap[status.toLowerCase()] || { text: status, color: '#6c757d' };

    return (
        <span style={{
            backgroundColor: currentStatus.color,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            textTransform: 'capitalize'
        }}>
            {currentStatus.text}
        </span>
    );
};

// --- Appointment Form for Add/Edit ---
const AppointmentForm = ({ onSubmit, onCancel, patients, initialData }) => {
    const [formData, setFormData] = useState({
        patientId: '',
        date: '',
        chemoRegimen: '',
        note: '',
        admitStatus: 'waiting'
    });

    useEffect(() => {
        const initialDate = initialData?.date
            ? new Date(initialData.date).toISOString().substring(0, 16)
            : new Date(new Date().setMinutes(new Date().getMinutes() - new Date().getTimezoneOffset())).toISOString().slice(0, 16);

        setFormData({
            patientId: initialData?.patient?.id || initialData?.patientId || '',
            date: initialDate,
            chemoRegimen: initialData?.chemoRegimen || '',
            note: initialData?.note || '',
            admitStatus: initialData?.admitStatus || 'waiting'
        });
    }, [initialData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        // ถ้าเป็น followup ไม่ต้องส่ง chemoRegimen
        const data = { ...formData };
        if (data.admitStatus === 'followup') {
            data.chemoRegimen = '';
        }
        if (data.admitStatus === 'waiting') {
            data.note = '';
        }
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-group">
                <label htmlFor="patientId">ผู้ป่วย</label>
                <select id="patientId" name="patientId" value={formData.patientId} onChange={handleChange} required>
                    <option value="">-- เลือกผู้ป่วย --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.hn} - {p.firstName} {p.lastName}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label>วันที่นัด:</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>สถานะเริ่มต้น:</label>
                <select name="admitStatus" value={formData.admitStatus} onChange={handleChange} required>
                    <option value="waiting">Waiting (รอนัดให้ยาเคมีบำบัด)</option>
                    <option value="followup">Follow up OPD</option>
                </select>
            </div>
            {formData.admitStatus === 'waiting' && (
                <div className="form-group">
                    <label>Chemo Regimen:</label>
                    <input type="text" name="chemoRegimen" value={formData.chemoRegimen} onChange={handleChange} required placeholder="เช่น R-CHOP" />
                </div>
            )}
            {formData.admitStatus === 'followup' && (
                <div className="form-group">
                    <label>Note การวางแผน follow up:</label>
                    <textarea name="note" value={formData.note} onChange={handleChange} required placeholder="รายละเอียดการ follow up" />
                </div>
            )}
            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn-secondary">ยกเลิก</button>
                <button type="submit" className="btn-primary">บันทึก</button>
            </div>
        </form>
    );
};

// --- Main Dashboard Component ---
export default function AppointmentDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const { token, user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch appointments');
            const data = await response.json();
            setAppointments(Array.isArray(data) ? data.filter(a => a.admitStatus === 'waiting' || a.admitStatus === 'rescheduled' || a.admitStatus === 'missed' || a.admitStatus === 'followup') : []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchPatients = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/patients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch patients');
            const data = await response.json();
            setPatients(Array.isArray(data) ? data.filter(p => p.status === 'ACTIVE') : []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    }, [token]);

    useEffect(() => {
        if(token){
            fetchAppointments();
            fetchPatients();
        }
    }, [token, fetchAppointments, fetchPatients]);

    const handleOpenModal = (app = null) => {
        setEditingAppointment(app);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingAppointment(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบนัดหมายนี้?")) return;
        try {
            const response = await fetch(`${API_URL}/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
             if (!response.ok) throw new Error('Failed to delete appointment');
            fetchAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };
    
    const handleSave = async (formData) => {
        const url = editingAppointment
            ? `${API_URL}/appointments/${editingAppointment.id}`
            : `${API_URL}/appointments`;
        const method = editingAppointment ? 'PUT' : 'POST';

        // Ensure patientId is a number
        const payload = {
            ...formData,
            patientId: Number(formData.patientId)
        };
        
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Failed to save appointment');
            }
            fetchAppointments();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving appointment:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const handleAdmit = async (id) => {
        if (!window.confirm("คุณต้องการ Admit ผู้ป่วยรายนี้ และนำรายการนี้ออกจากหน้าแดชบอร์ดใช่หรือไม่?")) return;
        try {
            const response = await fetch(`${API_URL}/appointments/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ admitStatus: 'admit', admitDate: new Date().toISOString() })
            });
            if (!response.ok) throw new Error('Failed to admit patient');
            fetchAppointments(); // Re-fetch to update the list
        } catch (error) {
            console.error('Error admitting patient:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFont('THSarabunNew');
        doc.setFontSize(18);
        doc.text(`ตารางนัดหมาย`, 14, 22);

        autoTable(doc, {
            startY: 30,
            head: [['HN', 'ผู้ป่วย', 'Regimen', 'วันที่นัด', 'สถานะ']],
            body: appointments.map(app => [
                app.patient?.hn,
                `${app.patient?.firstName} ${app.patient?.lastName}`,
                app.chemoRegimen,
                new Date(app.date).toLocaleString('th-TH'),
                app.admitStatus
            ]),
            styles: { font: 'THSarabunNew', fontStyle: 'normal' },
            headStyles: { fillColor: [22, 160, 133], font: 'THSarabunNew' }
        });
        doc.save(`appointments.pdf`);
    };

    const exportExcel = () => {
         const worksheet = XLSX.utils.json_to_sheet(appointments.map(app => ({
            'HN': app.patient?.hn,
            'ผู้ป่วย': `${app.patient?.firstName} ${app.patient?.lastName}`,
            'Regimen': app.chemoRegimen,
            'วันที่นัด': new Date(app.date).toLocaleString('th-TH'),
            'สถานะ': app.admitStatus,
            'หมายเหตุ': app.note
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'นัดหมาย');
        XLSX.writeFile(workbook, 'appointments.xlsx');
    };

    // Filtered appointments
    const filteredAppointments = appointments.filter(app => {
        const hn = app.patient?.hn?.toLowerCase() || '';
        const name = `${app.patient?.firstName || ''} ${app.patient?.lastName || ''}`.toLowerCase();
        return hn.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="appointment-dashboard-container">
            <div className="page-header">
                <h1>แดชบอร์ดนัดหมาย</h1>
                <div className="header-actions">
                    <button onClick={() => handleOpenModal()} className="btn-add-new"><FaPlus /> เพิ่มนัดหมาย</button>
                    <button onClick={exportPDF} className="btn-export"><FaFilePdf /> Export PDF</button>
                    <button onClick={exportExcel} className="btn-export"><FaFileExcel /> Export Excel</button>
                </div>
            </div>

            <div className="content-card">
                <div className="card-body">
                    <div className="form-group" style={{ maxWidth: 320, marginBottom: 16 }}>
                        <input
                            type="text"
                            placeholder="ค้นหา HN หรือชื่อผู้ป่วย..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <table className="patient-table">
                        <thead>
                            <tr>
                                <th>HN</th>
                                <th>ผู้ป่วย</th>
                                <th>Regimen</th>
                                <th>วันที่นัด</th>
                                <th>สถานะ</th>
                                <th>การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{textAlign: 'center'}}>Loading...</td></tr>
                            ) : filteredAppointments.length > 0 ? (
                                filteredAppointments.map(app => (
                                    <tr key={app.id}>
                                        <td>{app.patient?.hn || 'N/A'}</td>
                                        <td>{app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'N/A'}</td>
                                        <td>{app.chemoRegimen}</td>
                                        <td>{new Date(app.date).toLocaleString('th-TH')}</td>
                                        <td><StatusBadge status={app.admitStatus} /></td>
                                        <td>
                                            <div className="action-buttons">
                                                {app.admitStatus === 'waiting' && (
                                                    <button onClick={() => handleAdmit(app.id)} className="btn-action btn-admit" title="Admit Patient">
                                                        <FaCheckCircle /> Admit
                                                    </button>
                                                )}
                                                <button onClick={() => handleOpenModal(app)} className="btn-icon" title="แก้ไข"><FaEdit /></button>
                                                {user?.role === 'ADMIN' && (
                                                    <button onClick={() => handleDelete(app.id)} className="btn-icon btn-delete" title="ลบ"><FaTrash /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{textAlign: 'center'}}>ไม่พบการนัดหมาย</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <Modal 
                    onClose={handleCloseModal}
                    title={editingAppointment ? "แก้ไขนัดหมาย" : "เพิ่มนัดหมายใหม่"}
                >
                    <AppointmentForm
                        onSubmit={handleSave}
                        onCancel={handleCloseModal}
                        patients={patients}
                        initialData={editingAppointment}
                    />
                </Modal>
            )}
        </div>
    );
}
