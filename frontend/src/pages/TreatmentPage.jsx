import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../THSarabunNew-normal.js';
import './PatientManagement.css'; // Reuse styles
import { FaUserMd, FaStethoscope, FaCalendarAlt, FaFileMedicalAlt, FaSearch } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:3001';

const Modal = ({ children, onClose, title, size }) => (
    <div className="modal-overlay">
        <div className={`modal-content ${size === 'lg' ? 'modal-lg' : ''}`}>
            <div className="modal-header">
                <h4>{title}</h4>
                <button onClick={onClose} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

// Sub-component to manage the list of attachments in the form
const AttachmentManager = ({ existingAttachments = [], onRemove, newAttachments, onNewFileChange, onNewFileNameChange }) => {
    return (
        <div className="attachment-manager">
            <label>เอกสารแนบปัจจุบัน:</label>
            {existingAttachments.length > 0 ? (
                <ul className="attachment-list">
                    {existingAttachments.map((att, index) => (
                        <li key={index} className="attachment-item">
                            <a href={`${API_BASE_URL}/${att.path}`} target="_blank" rel="noopener noreferrer">{att.name}</a>
                            <button type="button" onClick={() => onRemove(att.path)} className="btn-delete-attachment">ลบ</button>
                        </li>
                    ))}
                </ul>
            ) : <p>ไม่มีไฟล์แนบ</p>}
            
            <hr />
            <label>เพิ่มไฟล์แนบใหม่:</label>
            {newAttachments.map((file, index) => (
                 <div key={index} className="new-attachment-row">
                    <input 
                        type="text" 
                        placeholder={`ชื่อไฟล์ที่ ${index + 1}`}
                        value={file.displayName}
                        onChange={(e) => onNewFileNameChange(index, e.target.value)}
                        className="attachment-name-input"
                    />
                    <span>{file.file.name}</span>
                </div>
            ))}
            <input 
                type="file" 
                multiple 
                onChange={onNewFileChange} 
                className="attachment-file-input"
            />
        </div>
    );
};

const TreatmentForm = ({ patient, onSave, onCancel, onAttachmentDelete }) => {
    const [formData, setFormData] = useState({
        diagnosis: '',
        diagnosisDate: '',
        stage: '',
        prognosis: '',
        treatmentPlan: { details: '' }
    });
    const [newAttachments, setNewAttachments] = useState([]); // { file: File, displayName: string }[]

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
            setNewAttachments([]); // Clear new attachments when patient changes
        }
    }, [patient]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'treatmentPlanDetails') {
            setFormData(prev => ({ ...prev, treatmentPlan: { details: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleNewFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map(file => ({ file, displayName: file.name }));
        setNewAttachments(prev => [...prev, ...newFiles]);
    };
    
    const handleNewFileNameChange = (index, newName) => {
        setNewAttachments(prev => {
            const updated = [...prev];
            updated[index].displayName = newName;
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalFormData = new FormData();

        // Append all text fields
        Object.keys(formData).forEach(key => {
            if (key === 'treatmentPlan') {
                 // Ensure treatmentPlan is stringified
                finalFormData.append(key, JSON.stringify(formData[key] || {}));
            } else {
                finalFormData.append(key, formData[key]);
            }
        });
        
        // Append new files and their names
        newAttachments.forEach(att => {
            finalFormData.append('newAttachments', att.file);
        });
        const attachmentNames = newAttachments.map(att => att.displayName);
        finalFormData.append('attachmentNames', JSON.stringify(attachmentNames));

        onSave(finalFormData);
    };

    return (
        <form onSubmit={handleSubmit} className="treatment-form">
            <div className="form-grid">
                <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="การวินิจฉัย *" required />
                <input name="diagnosisDate" type="date" value={formData.diagnosisDate} onChange={handleChange} required />
                <input name="stage" value={formData.stage} onChange={handleChange} placeholder="Stage *" required />
                <input name="prognosis" value={formData.prognosis} onChange={handleChange} placeholder="Prognosis" />
            </div>
            
            <div className="form-group full-width">
                 <label>รายละเอียดแผนการรักษา:</label>
                 <textarea 
                     name="treatmentPlanDetails" 
                     value={formData.treatmentPlan.details} 
                     onChange={handleChange} 
                     placeholder="รายละเอียดแผนการรักษา" 
                 />
            </div>

            <AttachmentManager 
                existingAttachments={patient.attachments || []}
                onRemove={onAttachmentDelete}
                newAttachments={newAttachments}
                onNewFileChange={handleNewFileChange}
                onNewFileNameChange={handleNewFileNameChange}
            />

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn-secondary">ยกเลิก</button>
                <button type="submit" className="btn-primary">บันทึกแผนการรักษา</button>
            </div>
        </form>
    );
};

export default function TreatmentPage() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReadMoreModalOpen, setIsReadMoreModalOpen] = useState(false);
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

    const handleAttachmentDelete = async (attachmentPath) => {
        if (!selectedPatient || !window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/patients/id/${selectedPatient.id}/delete-attachment`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ attachmentPath })
            });
            if (!response.ok) throw new Error('Failed to delete attachment');
            const updatedPatient = await response.json();
            // Update local state
            setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
            setSelectedPatient(updatedPatient);
        } catch (error) {
            console.error("Delete attachment error:", error);
        }
    };

    const handleSaveTreatment = async (formData) => {
        if (!selectedPatient) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/patients/id/${selectedPatient.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type' is intentionally omitted; browser sets it for FormData
                },
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to save treatment plan');
            const updatedPatient = await response.json();
            
            // Update local state
            setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
            setSelectedPatient(updatedPatient);
            
            closeEditModal();
        } catch (error) {
            console.error("Save error:", error);
            // You might want to show an error message to the user
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

    const openEditModal = (patient) => {
        setSelectedPatient(patient);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedPatient(null);
    };

    const openReadMoreModal = (patient) => {
        setSelectedPatient(patient);
        setIsReadMoreModalOpen(true);
    };

    if (!canView) {
        return <h2>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>;
    }

    return (
        <div className="patient-management-container">
            <div className="page-header">
                <h1>แผนการรักษา</h1>
            </div>

            <div className="treatment-layout">
                <div className="search-panel">
                    <div className="content-card">
                        <div className="card-header">
                           <h3>ค้นหาผู้ป่วย</h3>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>ค้นหาด้วย HN หรือ ชื่อ-นามสกุล:</label>
                                <input 
                                    type="text"
                                    placeholder="ค้นหา..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                             <div className="form-group">
                                <label>เลือกผู้ป่วยจากรายการ:</label>
                                <select 
                                    id="patient-select"
                                    onChange={(e) => handleSelectPatient(e.target.value)}
                                    value={selectedPatient ? selectedPatient.id : ''}
                                >
                                    <option value="">-- กรุณาเลือกผู้ป่วย --</option>
                                    {filteredPatients.map(p => (
                                        <option key={p.id} value={p.id}>{p.hn} - {p.firstName} {p.lastName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="details-panel">
                    {selectedPatient ? (
                        <div className="content-card">
                            <div className="card-header">
                                <h3>ข้อมูลแผนการรักษาของ: {selectedPatient.firstName} {selectedPatient.lastName} (HN: {selectedPatient.hn})</h3>
                                <div className="header-actions">
                                     {canManage && (
                                        <button onClick={() => openEditModal(selectedPatient)} className="btn-edit">แก้ไขแผน</button>
                                     )}
                                     <button onClick={exportPatientPDF} className="btn-export">PDF</button>
                                     <button onClick={exportExcel} className="btn-export">Excel</button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="treatment-details">
                                    <div className="detail-item"><strong>การวินิจฉัย:</strong> <span>{selectedPatient.diagnosis || '-'}</span></div>
                                    <div className="detail-item"><strong>วันที่วินิจฉัย:</strong> <span>{selectedPatient.diagnosisDate ? new Date(selectedPatient.diagnosisDate).toLocaleDateString('th-TH') : '-'}</span></div>
                                    <div className="detail-item"><strong>Stage:</strong> <span>{selectedPatient.stage || '-'}</span></div>
                                    <div className="detail-item"><strong>Prognosis:</strong> <span>{selectedPatient.prognosis || '-'}</span></div>
                                    <div className="detail-item wide">
                                        <strong>เอกสารแนบเพิ่มเติม:</strong>
                                        {(selectedPatient.attachments && selectedPatient.attachments.length > 0) ? (
                                            <ul className="attachment-list-display">
                                                {selectedPatient.attachments.map((att, index) => (
                                                    <li key={index}>
                                                        <a href={`${API_BASE_URL}/${att.path}`} target="_blank" rel="noopener noreferrer">{att.name}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span>ไม่มีไฟล์แนบ</span>
                                        )}
                                    </div>
                                    <div className="detail-item wide">
                                        <strong>แผนการรักษา:</strong>
                                        <div className="truncated-text">
                                            <p>
                                                {(selectedPatient.treatmentPlan?.details && selectedPatient.treatmentPlan.details.substring(0, 200)) || '-'}
                                                {selectedPatient.treatmentPlan?.details && selectedPatient.treatmentPlan.details.length > 200 && '...'}
                                            </p>
                                        </div>
                                        {selectedPatient.treatmentPlan?.details && (
                                            <button onClick={() => openReadMoreModal(selectedPatient)} className="btn-link">
                                                อ่านเพิ่มเติม
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="content-card empty-state">
                            <p>กรุณาเลือกผู้ป่วยเพื่อดูแผนการรักษา</p>
                        </div>
                    )}
                </div>
            </div>

            {isEditModalOpen && selectedPatient && (
                <Modal onClose={closeEditModal} title={`แก้ไขแผนการรักษาของ ${selectedPatient.firstName}`}>
                    <TreatmentForm 
                        patient={selectedPatient} 
                        onSave={handleSaveTreatment}
                        onCancel={closeEditModal} 
                        onAttachmentDelete={handleAttachmentDelete}
                    />
                </Modal>
            )}

            {isReadMoreModalOpen && selectedPatient && (
                 <Modal 
                    onClose={() => setIsReadMoreModalOpen(false)} 
                    title={`แผนการรักษาของ ${selectedPatient.firstName}`}
                    size="lg"
                 >
                    <div className="full-details-content">
                        <pre>{selectedPatient.treatmentPlan?.details}</pre>
                    </div>
                </Modal>
            )}
        </div>
    );
}