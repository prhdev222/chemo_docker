import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUserPlus, FaLink, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import './SettingsPage.css'; // Import new CSS file
import { API_BASE_URL, api } from '../utils/api';

// --- Reusable Modal Component ---
const Modal = ({ children, onClose, title }) => (
    <div className="settings-modal-overlay">
        <div className="settings-modal">
            <div className="settings-modal-header">
                <h3>{title}</h3>
                <button onClick={onClose} className="btn-close-modal"><FaTimes /></button>
            </div>
            <div className="settings-modal-content">
                {children}
            </div>
        </div>
    </div>
);

// --- User Registration Component ---
const UserRegistration = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'NURSE' });
    const { token } = useContext(AuthContext);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.register(formData, token);
            alert(`สร้างผู้ใช้ '${formData.name}' สำเร็จ!`);
            setFormData({ name: '', email: '', password: '', role: 'NURSE' });
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };
    
    return (
        <div className="settings-card">
            <div className="card-header">
                <FaUserPlus />
                <h3>ลงทะเบียนผู้ใช้ใหม่</h3>
            </div>
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label htmlFor="name">ชื่อ-นามสกุล</label>
                    <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="เช่น สมชาย ใจดี" required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@hospital.com" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">รหัสผ่าน</label>
                    <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="อย่างน้อย 6 ตัวอักษร" required />
                </div>
                <div className="form-group">
                    <label htmlFor="role">บทบาท</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange}>
                        <option value="NURSE">พยาบาล (Nurse)</option>
                        <option value="DOCTOR">แพทย์ (Doctor)</option>
                        <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
                    </select>
                </div>
                <button type="submit" className="btn-primary">ลงทะเบียน</button>
            </form>
        </div>
    );
};

// --- Link Form Modal Component (separated logic) ---
const LinkModal = ({ link, onSave, onClose }) => {
    const [formData, setFormData] = useState({ title: link?.title || '', url: link?.url || '' });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal onClose={onClose} title={link ? 'แก้ไขลิงก์' : 'เพิ่มลิงก์ใหม่'}>
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label htmlFor="link-title">ชื่อลิงก์</label>
                    <input id="link-title" name="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="เช่น คู่มือการให้ยา" required />
                </div>
                <div className="form-group">
                    <label htmlFor="link-url">URL</label>
                    <input id="link-url" name="url" type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://example.com/document.pdf" required />
                </div>
                <div className="form-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">ยกเลิก</button>
                    <button type="submit" className="btn-primary">บันทึก</button>
                </div>
            </form>
        </Modal>
    );
};

// --- Link Management Component ---
const LinkManagement = () => {
    const [links, setLinks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const { token } = useContext(AuthContext);

    const fetchLinks = async () => {
        try {
            const data = await api.getLinks(token);
            setLinks(Array.isArray(data) ? data : []);
        } catch (error) { console.error('Error fetching links:', error); }
    };

    useEffect(() => { fetchLinks(); }, [token]);

    const handleSave = async (formData) => {
        try {
            if (editingLink) {
                await api.updateLink(editingLink.id, formData, token);
            } else {
                await api.createLink(formData, token);
            }
            setIsModalOpen(false);
            fetchLinks();
        } catch (error) {
            console.error('Error saving link:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบลิงก์นี้?')) {
            try {
                await api.deleteLink(id, token);
                fetchLinks();
            } catch (error) {
                console.error('Error deleting link:', error);
            }
        }
    };
    
    return (
        <div className="settings-card">
            <div className="card-header">
                <FaLink />
                <h3>จัดการลิงก์เอกสาร</h3>
                <button onClick={() => { setEditingLink(null); setIsModalOpen(true); }} className="btn-primary-outline">+ เพิ่มลิงก์ใหม่</button>
            </div>
            <ul className="link-list">
                {links.length > 0 ? links.map(link => (
                    <li key={link.id} className="link-item">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a>
                        <div className="link-actions">
                            <button onClick={() => { setEditingLink(link); setIsModalOpen(true); }} className="btn-icon"><FaEdit /></button>
                            <button onClick={() => handleDelete(link.id)} className="btn-icon btn-delete"><FaTrash /></button>
                        </div>
                    </li>
                )) : <p className="empty-list-message">ยังไม่มีลิงก์เอกสาร</p>}
            </ul>
            {isModalOpen && <LinkModal link={editingLink} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};


// --- Main Settings Page ---
export default function SettingsPage() {
    const { user } = useContext(AuthContext);

    if (user?.role !== 'ADMIN') {
        return (
            <div className="settings-container unauthorized">
                <h2>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
                <p>กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
        );
    }

    return (
        <div className="settings-container">
            <UserRegistration />
            <LinkManagement />
        </div>
    );
} 