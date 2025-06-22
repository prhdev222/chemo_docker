import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../THSarabunNew-normal.js';
import './PatientManagement.css';

// --- Modal Component ---
const Modal = ({ children, onClose }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '600px', position: 'relative' }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer'
                }}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

// --- Helper function to calculate age ---
const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const patientStatusColors = {
    ACTIVE: '#28a745', // Green
    INACTIVE: '#6c757d', // Gray
    DECEASED: '#343a40' // Dark Gray
};

const PatientStatusBadge = ({ status }) => (
    <span className={`status-badge status-${status.toLowerCase()}`}>
        {status}
    </span>
);

// --- Patient Form Component ---
const PatientForm = ({ patient, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        hn: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        phone: '',
        lineId: '',
        address: '',
        status: 'ACTIVE'
    });
    const [dobInput, setDobInput] = useState('');

    useEffect(() => {
        if (patient) {
            setFormData({
                hn: patient.hn,
                firstName: patient.firstName,
                lastName: patient.lastName,
                birthDate: patient.birthDate || '',
                phone: patient.phone || '',
                lineId: patient.lineId || '',
                address: patient.address || '',
                status: patient.status || 'ACTIVE'
            });
            if (patient.birthDate) {
                const birth = new Date(patient.birthDate);
                // Convert to Buddhist Era for display
                const beYear = birth.getFullYear() + 543;
                const month = String(birth.getMonth() + 1).padStart(2, '0');
                const day = String(birth.getDate()).padStart(2, '0');
                setDobInput(`${day}/${month}/${beYear}`);
            } else {
                setDobInput('');
            }
        } else {
            // Reset form for new patient
            setFormData({
                hn: '', firstName: '', lastName: '', birthDate: '',
                phone: '', lineId: '', address: '', status: 'ACTIVE'
            });
            setDobInput('');
        }
    }, [patient]);

    const handleDobChange = (e) => {
        setDobInput(e.target.value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let birthDateToSave = null;
        const input = dobInput.trim();

        if (/^\d{1,3}$/.test(input)) { // Check if it's an age (1-3 digits)
            const age = parseInt(input, 10);
            const currentYear = new Date().getFullYear();
            birthDateToSave = new Date(currentYear - age, 0, 1).toISOString();
        } else if (/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(input)) { // Check for dd/mm/yyyy format
            const parts = input.split('/');
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);

            if (year > 2500) { // Assuming it's Buddhist Era
                year -= 543;
            }
            birthDateToSave = new Date(year, month, day).toISOString();
        }

        onSave({ ...formData, birthDate: birthDateToSave });
    };

    return (
        <form onSubmit={handleSubmit} className="patient-form">
            <h2>{patient ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มผู้ป่วยใหม่'}</h2>
            <div className="form-grid">
                <input name="hn" value={formData.hn} onChange={handleChange} placeholder="HN *" required />
                <input 
                    name="birthDate" 
                    type="text" 
                    value={dobInput} 
                    onChange={handleDobChange} 
                    placeholder="วว/ดด/ปปปป (พ.ศ.) หรือ อายุ" 
                    required 
                />
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="ชื่อ *" required />
                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="นามสกุล *" required />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="เบอร์โทรศัพท์" />
                <input name="lineId" value={formData.lineId} onChange={handleChange} placeholder="Line ID" />
                <div className="form-full-width">
                    <label>สถานะผู้ป่วย:</label>
                    <select name="status" value={formData.status} onChange={handleChange} >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="DECEASED">Deceased</option>
                    </select>
                </div>
                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="ที่อยู่" className="form-full-width" />
            </div>
            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn-cancel">ยกเลิก</button>
                <button type="submit" className="btn-save">{patient ? 'บันทึก' : 'เพิ่มผู้ป่วย'}</button>
            </div>
        </form>
    );
};

// --- Main Patient Management Page ---
export default function PatientManagement() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const { user, token } = useContext(AuthContext);

    const canManagePatients = user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'NURSE';

    useEffect(() => {
        if (canManagePatients) {
            fetchPatients();
        } else {
            setLoading(false);
        }
    }, [canManagePatients]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPatients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFont('THSarabunNew');
        doc.setFontSize(18);
        doc.text(`รายชื่อผู้ป่วย (สถานะ: ${statusFilter})`, 14, 22);

        const filteredPatients = statusFilter === 'All' 
            ? patients 
            : patients.filter(p => p.status === statusFilter);

        autoTable(doc, {
            startY: 30,
            head: [['HN', 'ชื่อ-นามสกุล', 'อายุ', 'เบอร์โทร', 'สถานะ']],
            body: filteredPatients.map(p => {
                const age = p.birthDate ? new Date().getFullYear() - new Date(p.birthDate).getFullYear() : 'N/A';
                return [
                    p.hn,
                    `${p.firstName} ${p.lastName}`,
                    age,
                    p.phone || '-',
                    p.status
                ];
            }),
            styles: { font: 'THSarabunNew', fontStyle: 'normal' },
            headStyles: { fillColor: [22, 160, 133], font: 'THSarabunNew' }
        });

        doc.save(`patients_status_${statusFilter}.pdf`);
    };

    const exportExcel = () => {
        const filteredPatients = statusFilter === 'All' 
            ? patients 
            : patients.filter(p => p.status === statusFilter);

        const worksheetData = filteredPatients.map(p => ({
            'HN': p.hn,
            'ชื่อ': p.firstName,
            'นามสกุล': p.lastName,
            'วันเกิด': p.birthDate ? new Date(p.birthDate).toLocaleDateString('th-TH') : 'N/A',
            'อายุ': calculateAge(p.birthDate),
            'เบอร์โทร': p.phone || '-',
            'Line ID': p.lineId || '-',
            'ที่อยู่': p.address || '-',
            'สถานะ': p.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อผู้ป่วย');
        XLSX.writeFile(workbook, `patients_status_${statusFilter}.xlsx`);
    };

    const handleSavePatient = async (formData) => {
        const url = editingPatient
            ? `http://localhost:3001/api/patients/id/${editingPatient.id}`
            : 'http://localhost:3001/api/patients';
        const method = editingPatient ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save patient');
            }
            
            setShowModal(false);
            setEditingPatient(null);
            fetchPatients();
            alert(`บันทึกข้อมูลผู้ป่วย '${formData.firstName}' สำเร็จ`);

        } catch (error) {
            console.error('Error saving patient:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const handleAddNew = () => {
        setEditingPatient(null);
        setShowModal(true);
    };

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setShowModal(true);
    };

    const handleDelete = async (patientId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ป่วยรายนี้?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/patients/id/${patientId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete patient');
            fetchPatients();
            alert('ลบผู้ป่วยสำเร็จ');
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const filteredPatients = statusFilter === 'All'
        ? patients
        : patients.filter(p => p.status === statusFilter);

    if (!canManagePatients) {
        return <h2>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>;
    }

    return (
        <div className="patient-management-container">
            <div className="page-header">
                <h1>จัดการข้อมูลผู้ป่วย</h1>
                <div className="header-actions">
                    <button onClick={handleAddNew} className="btn-add-new">
                        เพิ่มผู้ป่วยใหม่
                    </button>
                    <button onClick={exportPDF} className="btn-export">Export PDF</button>
                    <button onClick={exportExcel} className="btn-export">Export Excel</button>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <div className="filter-group">
                        <label htmlFor="status-filter">กรองตามสถานะ:</label>
                        <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">ทั้งหมด</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="DECEASED">Deceased</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="patient-table">
                        <thead>
                            <tr>
                                <th>HN</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>อายุ</th>
                                <th>เบอร์โทร</th>
                                <th>สถานะ</th>
                                <th>การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6">Loading...</td></tr>
                            ) : filteredPatients.length > 0 ? (
                                filteredPatients.map(patient => (
                                    <tr key={patient.id}>
                                        <td>{patient.hn}</td>
                                        <td>{patient.firstName} {patient.lastName}</td>
                                        <td>{calculateAge(patient.birthDate)}</td>
                                        <td>{patient.phone || '-'}</td>
                                        <td><PatientStatusBadge status={patient.status} /></td>
                                        <td className="actions-cell">
                                            <button onClick={() => handleEdit(patient)} className="btn-edit">แก้ไข</button>
                                            <button onClick={() => handleDelete(patient.id)} className="btn-delete">ลบ</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6">ไม่พบข้อมูลผู้ป่วย</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <PatientForm
                        patient={editingPatient}
                        onSave={handleSavePatient}
                        onCancel={() => setShowModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
} 