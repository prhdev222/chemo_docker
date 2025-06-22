import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../THSarabunNew-normal.js';

const Modal = ({ children, onClose }) => (
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

const TreatmentForm = ({ patient, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        diagnosis: '',
        diagnosisDate: '',
        stage: '',
        prognosis: '',
        treatmentPlan: { details: '' } // Assuming treatmentPlan is a JSON with a 'details' key
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                diagnosis: patient.diagnosis || '',
                diagnosisDate: patient.diagnosisDate ? patient.diagnosisDate.split('T')[0] : '',
                stage: patient.stage || '',
                prognosis: patient.prognosis || '',
                treatmentPlan: patient.treatmentPlan && patient.treatmentPlan.details 
                    ? patient.treatmentPlan 
                    : { details: '' }
            });
        }
    }, [patient]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'treatmentPlanDetails') {
            setFormData(prev => ({
                ...prev,
                treatmentPlan: { ...prev.treatmentPlan, details: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>แผนการรักษาของ {patient.firstName} {patient.lastName}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="การวินิจฉัย *" required />
                <input name="diagnosisDate" type="date" value={formData.diagnosisDate} onChange={handleChange} required />
                <input name="stage" value={formData.stage} onChange={handleChange} placeholder="Stage *" required />
                <input name="prognosis" value={formData.prognosis} onChange={handleChange} placeholder="Prognosis" />
                <textarea 
                    name="treatmentPlanDetails" 
                    value={formData.treatmentPlan.details} 
                    onChange={handleChange} 
                    placeholder="รายละเอียดแผนการรักษา" 
                    style={{ gridColumn: '1 / -1', minHeight: '100px' }} 
                />
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onCancel}>ยกเลิก</button>
                <button type="submit" style={{ background: '#007bff', color: 'white' }}>บันทึกแผนการรักษา</button>
            </div>
        </form>
    );
};

export default function TreatmentPage() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user, token } = useContext(AuthContext);
    
    const canView = user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'NURSE';
    const canManage = user?.role === 'ADMIN' || user?.role === 'DOCTOR';

    useEffect(() => {
        if (canView) {
            fetchPatients();
        }
    }, [canView, token]);

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
    
    const handleSelectPatient = (patientId) => {
        const patient = patients.find(p => p.id === parseInt(patientId));
        setSelectedPatient(patient || null);
    };

    const filteredPatients = patients.filter(p => 
        p.hn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveTreatment = async (formData) => {
        if (!selectedPatient) return;
        
        try {
            const response = await fetch(`http://localhost:3001/api/patients/id/${selectedPatient.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save treatment plan');
            }

            const updatedPatient = await response.json();
            setShowModal(false);
            setSelectedPatient(updatedPatient);
            setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
            alert('บันทึกแผนการรักษาสำเร็จ');

        } catch (error) {
            console.error('Error saving treatment:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const exportPatientPDF = () => {
        if (!selectedPatient) return;

        const doc = new jsPDF();
        doc.setFont('THSarabunNew');

        // Header
        doc.setFontSize(20);
        doc.text('ข้อมูลแผนการรักษาผู้ป่วย', 105, 20, { align: 'center' });

        // Patient Info
        doc.setFontSize(14);
        doc.text(`HN: ${selectedPatient.hn}`, 14, 35);
        doc.text(`ชื่อ-นามสกุล: ${selectedPatient.firstName} ${selectedPatient.lastName}`, 14, 42);

        // Details using autoTable for a structured layout
        autoTable(doc, {
            startY: 50,
            theme: 'grid',
            head: [['หัวข้อ', 'รายละเอียด']],
            body: [
                ['การวินิจฉัย (Diagnosis)', selectedPatient.diagnosis || 'ยังไม่มีข้อมูล'],
                ['วันที่วินิจฉัย', selectedPatient.diagnosisDate ? new Date(selectedPatient.diagnosisDate).toLocaleDateString('th-TH') : 'ยังไม่มีข้อมูล'],
                ['Stage', selectedPatient.stage || 'ยังไม่มีข้อมูล'],
                ['Prognosis', selectedPatient.prognosis || 'ยังไม่มีข้อมูล'],
                ['แผนการรักษา (Treatment Plan)', (selectedPatient.treatmentPlan && selectedPatient.treatmentPlan.details) || 'ยังไม่มีข้อมูล'],
            ],
            styles: { font: 'THSarabunNew', fontStyle: 'normal', cellPadding: 3, overflow: 'linebreak' },
            headStyles: { fillColor: [41, 128, 185], font: 'THSarabunNew' },
            columnStyles: {
                0: { cellWidth: 50 }, // Width for "หัวข้อ" column
                1: { cellWidth: 'auto' } // Width for "รายละเอียด" column
            }
        });

        doc.save(`treatment_plan_${selectedPatient.hn}.pdf`);
    };

    const exportExcel = () => {
        if (!selectedPatient) return;

        const worksheetData = [
            { 'หัวข้อ': 'HN', 'รายละเอียด': selectedPatient.hn },
            { 'หัวข้อ': 'ชื่อ-นามสกุล', 'รายละเอียด': `${selectedPatient.firstName} ${selectedPatient.lastName}` },
            { 'หัวข้อ': 'การวินิจฉัย (Diagnosis)', 'รายละเอียด': selectedPatient.diagnosis || 'ยังไม่มีข้อมูล' },
            { 'หัวข้อ': 'วันที่วินิจฉัย', 'รายละเอียด': selectedPatient.diagnosisDate ? new Date(selectedPatient.diagnosisDate).toLocaleDateString('th-TH') : 'ยังไม่มีข้อมูล' },
            { 'หัวข้อ': 'Stage', 'รายละเอียด': selectedPatient.stage || 'ยังไม่มีข้อมูล' },
            { 'หัวข้อ': 'Prognosis', 'รายละเอียด': selectedPatient.prognosis || 'ยังไม่มีข้อมูล' },
            { 'หัวข้อ': 'แผนการรักษา (Treatment Plan)', 'รายละเอียด': (selectedPatient.treatmentPlan && selectedPatient.treatmentPlan.details) || 'ยังไม่มีข้อมูล' },
        ];

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'แผนการรักษา');
        
        // Auto-fit columns
        const colWidths = Object.keys(worksheetData[0]).map(key => ({
            wch: Math.max(...worksheetData.map(row => row[key]?.toString().length ?? 10))
        }));
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `treatment_plan_${selectedPatient.hn}.xlsx`);
    };

    if (!canView) {
        return <h2>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>;
    }

    return (
        <div>
            <h1>แผนการรักษา</h1>
            <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>ค้นหาผู้ป่วย:</label>
                <input 
                    type="text"
                    placeholder="ค้นหาด้วย HN หรือ ชื่อ-นามสกุล..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <select 
                    id="patient-select"
                    onChange={(e) => handleSelectPatient(e.target.value)}
                    value={selectedPatient ? selectedPatient.id : ''}
                    style={{ width: '100%', padding: '8px' }}
                >
                    <option value="">-- กรุณาเลือกผู้ป่วย --</option>
                    {filteredPatients.map(p => (
                        <option key={p.id} value={p.id}>{p.hn} - {p.firstName} {p.lastName}</option>
                    ))}
                </select>
            </div>

            {selectedPatient && (
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h2>ข้อมูลการรักษาของ {selectedPatient.firstName}</h2>
                         <div>
                            <button onClick={exportPatientPDF} style={{ marginRight: '10px' }}>Export PDF</button>
                            <button onClick={exportExcel} style={{ marginRight: '10px' }}>Export Excel</button>
                            {canManage && (
                                <button onClick={() => setShowModal(true)} style={{ background: '#ffc107', color: 'black' }}>
                                    {selectedPatient.diagnosis ? 'แก้ไขแผนการรักษา' : 'เพิ่มแผนการรักษา'}
                                </button>
                            )}
                         </div>
                    </div>
                    <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                        <strong>การวินิจฉัย:</strong> <p>{selectedPatient.diagnosis || 'ยังไม่มีข้อมูล'}</p>
                        <strong>วันที่วินิจฉัย:</strong> <p>{selectedPatient.diagnosisDate ? new Date(selectedPatient.diagnosisDate).toLocaleDateString('th-TH') : 'ยังไม่มีข้อมูล'}</p>
                        <strong>Stage:</strong> <p>{selectedPatient.stage || 'ยังไม่มีข้อมูล'}</p>
                        <strong>Prognosis:</strong> <p>{selectedPatient.prognosis || 'ยังไม่มีข้อมูล'}</p>
                        <strong>แผนการรักษา:</strong> 
                        <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                            {(selectedPatient.treatmentPlan && selectedPatient.treatmentPlan.details) || 'ยังไม่มีข้อมูล'}
                        </p>
                    </div>
                </div>
            )}
            
            {showModal && selectedPatient && (
                <Modal onClose={() => setShowModal(false)}>
                    <TreatmentForm 
                        patient={selectedPatient}
                        onSave={handleSaveTreatment}
                        onCancel={() => setShowModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
}