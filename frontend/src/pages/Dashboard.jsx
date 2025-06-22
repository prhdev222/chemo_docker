import React, { useEffect, useState, useContext } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../THSarabunNew-normal';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [hn, setHn] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchPatients = () => {
    if (!token) return;
    fetch('http://localhost:3001/api/patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPatients(data.error ? [] : data));
  };

  useEffect(() => {
    fetchPatients();
  }, [token]);

  // ดึงข้อมูลผู้ป่วยตาม HN
  const handleSearch = () => {
    if (!token || !hn) return;
    fetch(`http://localhost:3001/api/patients/${hn}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSelectedPatient(data.error ? null : data));
  };

  // ฟังก์ชัน export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('THSarabunNew');
    doc.setFontSize(16);
    doc.text('รายชื่อผู้ป่วย', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [['HN', 'ชื่อ', 'นามสกุล', 'การวินิจฉัย']],
      body: patients.map(p => [p.hn, p.firstName, p.lastName, p.diagnosis]),
      styles: { font: 'THSarabunNew', fontStyle: 'normal', fontSize: 14 },
      headStyles: { font: 'THSarabunNew', fontStyle: 'normal', fontSize: 14 }
    });
    doc.save('patients.pdf');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>แดชบอร์ดผู้ป่วย (Demo)</h1>
      <div style={{ marginBottom: 16 }}>
        <input
          value={hn}
          onChange={e => setHn(e.target.value)}
          placeholder="ค้นหา HN ผู้ป่วย"
        />
        <button onClick={handleSearch}>ค้นหา</button>
      </div>
      {selectedPatient && (
        <div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
          <h2>ข้อมูลผู้ป่วย HN: {selectedPatient.hn}</h2>
          <div>ชื่อ: {selectedPatient.firstName} {selectedPatient.lastName}</div>
          <div>การวินิจฉัย: {selectedPatient.diagnosis}</div>
          <div>แผนการรักษา: {JSON.stringify(selectedPatient.treatmentPlan)}</div>
        </div>
      )}
      <h2>รายชื่อผู้ป่วยทั้งหมด</h2>
      <button onClick={exportPDF} style={{ marginBottom: 8 }}>Export PDF</button>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>HN</th>
            <th>ชื่อ</th>
            <th>นามสกุล</th>
            <th>การวินิจฉัย</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.hn}>
              <td>{p.hn}</td>
              <td>{p.firstName}</td>
              <td>{p.lastName}</td>
              <td>{p.diagnosis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 