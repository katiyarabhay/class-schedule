import React, { useState, useEffect } from 'react';
import { Teacher, Subject } from '@/lib/types';

interface EditTeacherModalProps {
    teacher: Teacher | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedTeacher: Teacher) => void;
    subjects: Subject[];
}

export default function EditTeacherModal({
    teacher,
    isOpen,
    onClose,
    onSave,
    subjects
}: EditTeacherModalProps) {
    const [formData, setFormData] = useState<Partial<Teacher>>({});
    const [subjectCode1, setSubjectCode1] = useState('');
    const [subjectCode2, setSubjectCode2] = useState('');

    useEffect(() => {
        if (teacher) {
            setFormData({ ...teacher });
            // Pre-fill subject codes if possible
            const codes = teacher.qualifiedSubjects.map(id => subjects.find(s => s.id === id)?.code || '');
            setSubjectCode1(codes[0] || '');
            setSubjectCode2(codes[1] || '');
        } else {
            setFormData({});
            setSubjectCode1('');
            setSubjectCode2('');
        }
    }, [teacher, subjects]);

    if (!isOpen || !teacher) return null;

    const handleSave = () => {
        if (!formData.name || !formData.department) {
            alert("Name and Department are required");
            return;
        }

        const validSubjectIds: string[] = [];
        const codesToCheck = [subjectCode1, subjectCode2].filter(c => c.trim() !== '');

        for (const code of codesToCheck) {
            const subject = subjects.find(s => s.code.toLowerCase() === code.trim().toLowerCase());
            if (subject) {
                if (!validSubjectIds.includes(subject.id)) {
                    validSubjectIds.push(subject.id);
                }
            } else {
                alert(`Subject code '${code}' not found`);
                return;
            }
        }

        onSave({
            ...teacher,
            ...formData,
            qualifiedSubjects: validSubjectIds
        } as Teacher);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--pk-surface)', padding: '2rem', borderRadius: '12px',
                width: '500px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--pk-primary)' }}>Edit Faculty</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Faculty Code</label>
                        <input
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)', background: 'rgba(0,0,0,0.05)', color: 'var(--pk-text-muted)' }}
                            value={formData.id || ''}
                            readOnly
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                        <input
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Department</label>
                        <input
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                            value={formData.department || ''}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Max Load / Week</label>
                    <input
                        type="number"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.maxLoadPerWeek || 0}
                        onChange={(e) => setFormData({ ...formData, maxLoadPerWeek: parseInt(e.target.value) })}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Codes</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input
                            placeholder="Code 1"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                            value={subjectCode1}
                            onChange={(e) => setSubjectCode1(e.target.value)}
                        />
                        <input
                            placeholder="Code 2"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                            value={subjectCode2}
                            onChange={(e) => setSubjectCode2(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent', border: '1px solid var(--pk-border)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
