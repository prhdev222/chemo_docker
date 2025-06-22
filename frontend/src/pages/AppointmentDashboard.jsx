import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../THSarabunNew-normal.js';

const statusColors = {
    waiting: '#ffc107', // Yellow
    admit: '#28a745',   // Green
    discharged: '#007bff', // Blue
    missed: '#dc3545',  // Red
    rescheduled: '#6c757d' // Gray
};

const StatusBadge = ({ status }) => (
    <span style={{
        backgroundColor: statusColors[status.toLowerCase()] || '#6c757d',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        textTransform: 'capitalize'
    }}>
        {status}
    </span>
);

export default function AppointmentDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        patientId: '',
        date: '',
        chemoRegimen: '',
        admitStatus: 'waiting',
        note: ''
    });
    const { token } = useContext(AuthContext);

    useEffect(() => {
        fetchAppointments();
        fetchPatients();
    }, [token]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        const filtered = appointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate >= today && appDate <= nextWeek;
        });
        setFilteredAppointments(filtered);
    }, [appointments]);


    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAppointments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPatients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        const payload = { admitStatus: newStatus };
        if (newStatus === 'admit') {
            payload.admitDate = new Date().toISOString();
        } else if (newStatus === 'discharged') {
            payload.dischargeDate = new Date().toISOString();
        }

        try {
            const response = await fetch(`http://localhost:3001/api/appointments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to update status');

            // Refetch or update state locally for immediate feedback
            fetchAppointments(); 

        } catch (error) {
            console.error('Error updating status:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create appointment');

            // Reset form and refresh data
            setFormData({
                patientId: '',
                date: '',
                chemoRegimen: '',
                admitStatus: 'waiting',
                note: ''
            });
            setShowForm(false);
            fetchAppointments();

        } catch (error) {
            console.error('Error creating appointment:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFont('THSarabunNew');
        doc.setFontSize(18);
        doc.text('ตารางนัดหมาย (14 วันข้างหน้า)', 14, 22);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(today.getDate() + 14);
        twoWeeksLater.setHours(23, 59, 59, 999);

        const appointmentsToExport = appointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate >= today && appDate <= twoWeeksLater;
        });

        autoTable(doc, {
            startY: 30,
            head: [['HN', 'ผู้ป่วย', 'Regimen', 'วันที่นัด', 'สถานะ']],
            body: appointmentsToExport.map(app => [
                app.patient?.hn || 'N/A',
                app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'N/A',
                app.chemoRegimen,
                new Date(app.date).toLocaleString('th-TH'),
                app.admitStatus
            ]),
            styles: { font: 'THSarabunNew', fontStyle: 'normal' },
            headStyles: { fillColor: [22, 160, 133], font: 'THSarabunNew' }
        });

        doc.save('appointments_next_14_days.pdf');
    };

    const exportExcel = () => {
        const worksheetData = filteredAppointments.map(app => ({
            'HN': app.patient?.hn || 'N/A',
            'ผู้ป่วย': app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'N/A',
            'Regimen': app.chemoRegimen,
            'วันที่นัด': new Date(app.date).toLocaleString('th-TH'),
            'สถานะ': app.admitStatus,
            'หมายเหตุ': app.note || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'นัดหมาย');
        XLSX.writeFile(workbook, 'appointments_next_7_days.xlsx');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>แดชบอร์ดนัดหมาย (7 วันข้างหน้า)</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={exportPDF}>Export PDF (14 วัน)</button>
                    <button onClick={exportExcel}>Export Excel (7 วัน)</button>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        style={{ 
                            background: showForm ? '#dc3545' : '#28a745', 
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {showForm ? 'ปิดฟอร์ม' : '+ เพิ่มนัดหมาย'}
                    </button>
                </div>
            </div>

            {/* Add Appointment Form */}
            {showForm && (
                <div style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    padding: '20px', 
                    marginBottom: '20px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h3>เพิ่มนัดหมายใหม่</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>เลือกผู้ป่วย:</label>
                            <select 
                                name="patientId" 
                                value={formData.patientId} 
                                onChange={handleFormChange} 
                                required
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            >
                                <option value="">-- เลือกผู้ป่วย --</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName} (HN: {p.hn})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label>วันที่และเวลานัด:</label>
                            <input 
                                type="datetime-local" 
                                name="date" 
                                value={formData.date} 
                                onChange={handleFormChange} 
                                required
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        
                        <div>
                            <label>สูตรยาเคมีบำบัด:</label>
                            <input 
                                type="text" 
                                name="chemoRegimen" 
                                value={formData.chemoRegimen} 
                                onChange={handleFormChange} 
                                placeholder="เช่น R-CHOP, ABVD"
                                required
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        
                        <div>
                            <label>สถานะ:</label>
                            <select 
                                name="admitStatus" 
                                value={formData.admitStatus} 
                                onChange={handleFormChange}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            >
                                <option value="waiting">รอเข้ารับการรักษา</option>
                                <option value="admit">กำลังรักษา</option>
                                <option value="discharged">จำหน่ายแล้ว</option>
                                <option value="missed">ไม่มาตามนัด</option>
                                <option value="rescheduled">เลื่อนนัด</option>
                            </select>
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>หมายเหตุ:</label>
                            <textarea 
                                name="note" 
                                value={formData.note} 
                                onChange={handleFormChange} 
                                placeholder="หมายเหตุเพิ่มเติม..."
                                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
                            />
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                style={{ 
                                    background: '#6c757d', 
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                ยกเลิก
                            </button>
                            <button 
                                type="submit"
                                style={{ 
                                    background: '#007bff', 
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                เพิ่มนัดหมาย
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <p>กำลังโหลด...</p> : (
                <table>
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
                        {filteredAppointments.length > 0 ? filteredAppointments.map(app => (
                            <tr key={app.id}>
                                <td>{app.patient?.hn || 'N/A'}</td>
                                <td>{app.patient?.firstName ? `${app.patient.firstName} ${app.patient.lastName}` : 'N/A'}</td>
                                <td>{app.chemoRegimen}</td>
                                <td>{new Date(app.date).toLocaleString('th-TH')}</td>
                                <td><StatusBadge status={app.admitStatus} /></td>
                                <td>
                                    {app.admitStatus === 'waiting' && (
                                        <button onClick={() => handleUpdateStatus(app.id, 'admit')} style={{ background: statusColors.admit }}>Admit</button>
                                    )}
                                    {app.admitStatus === 'admit' && (
                                        <button onClick={() => handleUpdateStatus(app.id, 'discharged')} style={{ background: statusColors.discharged }}>Discharge</button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>ไม่พบนัดหมายใน 7 วันข้างหน้า</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}