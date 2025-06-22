import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// --- User Registration Component ---
const UserRegistration = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'NURSE' });
    const { token } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Assuming registration requires auth
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'ไม่สามารถสร้างผู้ใช้ได้');
            }

            alert(`สร้างผู้ใช้ '${formData.name}' สำเร็จ!`);
            setFormData({ name: '', email: '', password: '', role: 'NURSE' }); // Reset form
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };
    
    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
            <h3>ลงทะเบียนผู้ใช้ใหม่</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="ชื่อ-นามสกุล" required />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="รหัสผ่าน" required />
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="NURSE">พยาบาล (Nurse)</option>
                    <option value="DOCTOR">แพทย์ (Doctor)</option>
                </select>
                <button type="submit" style={{ alignSelf: 'flex-start' }}>ลงทะเบียน</button>
            </form>
        </div>
    );
};

// --- Link Management Component ---
const LinkManagement = () => {
    const [links, setLinks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const { token } = useContext(AuthContext);

    const fetchLinks = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/links', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setLinks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching links:', error);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, [token]);

    const handleSave = async (formData) => {
        const url = editingLink 
            ? `http://localhost:3001/api/links/${editingLink.id}`
            : 'http://localhost:3001/api/links';
        const method = editingLink ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(formData)
        });
        
        setShowModal(false);
        fetchLinks();
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบลิงก์นี้?')) {
            await fetch(`http://localhost:3001/api/links/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchLinks();
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>จัดการลิงก์เอกสาร</h3>
                <button onClick={() => { setEditingLink(null); setShowModal(true); }}>+ เพิ่มลิงก์ใหม่</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                {links.map(link => (
                    <li key={link.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a>
                        <div>
                            <button onClick={() => { setEditingLink(link); setShowModal(true); }}>แก้ไข</button>
                            <button onClick={() => handleDelete(link.id)} style={{ marginLeft: '10px' }}>ลบ</button>
                        </div>
                    </li>
                ))}
            </ul>
            {showModal && <LinkModal link={editingLink} onSave={handleSave} onClose={() => setShowModal(false)} />}
        </div>
    );
};

// --- Link Form Modal ---
const LinkModal = ({ link, onSave, onClose }) => {
    const [formData, setFormData] = useState({ title: '', url: '' });

    useEffect(() => {
        if (link) {
            setFormData({ title: link.title, url: link.url });
        }
    }, [link]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                <form onSubmit={handleSubmit}>
                    <h2>{link ? 'แก้ไขลิงก์' : 'เพิ่มลิงก์ใหม่'}</h2>
                    <input name="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="ชื่อลิงก์" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}/>
                    <input name="url" type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="URL (เช่น https://...)" required style={{ width: '100%', padding: '8px', marginBottom: '20px' }}/>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose}>ยกเลิก</button>
                        <button type="submit">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function SettingsPage() {
    const { user } = useContext(AuthContext);

    if (user?.role !== 'ADMIN') {
        return <h2>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>;
    }

    return (
        <div>
            <h1>หน้าการตั้งค่า</h1>
            <UserRegistration />
            <LinkManagement />
        </div>
    );
} 