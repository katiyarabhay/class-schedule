import React, { useState, useEffect } from 'react';
import { Teacher, Classroom, Subject, Batch, ScheduleEntry } from '@/lib/types';

interface EditClassModalProps {
    classEntry: ScheduleEntry | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedClass: ScheduleEntry) => void;
    onDelete: (classId: string) => void;
    teachers: Teacher[];
    classrooms: Classroom[];
    subjects: Subject[];
    batches: Batch[];
}

export default function EditClassModal({
    classEntry,
    isOpen,
    onClose,
    onSave,
    onDelete,
    teachers,
    classrooms,
    subjects,
    batches
}: EditClassModalProps) {
    const [formData, setFormData] = useState<Partial<ScheduleEntry>>({});

    useEffect(() => {
        if (classEntry) {
            setFormData({ ...classEntry });
        } else {
            setFormData({});
        }
    }, [classEntry]);

    if (!isOpen || !classEntry) return null;

    const handleChange = (field: keyof ScheduleEntry, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (formData.subjectId && formData.teacherId && formData.classroomId) {
            onSave(formData as ScheduleEntry);
            onClose();
        } else {
            alert('Please fill all fields');
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this class?')) {
            onDelete(classEntry.id);
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--pk-surface)', padding: '2rem', borderRadius: '12px',
                width: '400px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--pk-primary)' }}>Edit Class</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject</label>
                    <select
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.subjectId || ''}
                        onChange={e => handleChange('subjectId', e.target.value)}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Teacher</label>
                    <select
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.teacherId || ''}
                        onChange={e => handleChange('teacherId', e.target.value)}
                    >
                        <option value="">Select Teacher</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Classroom</label>
                    <select
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.classroomId || ''}
                        onChange={e => handleChange('classroomId', e.target.value)}
                    >
                        <option value="">Select Classroom</option>
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Batch</label>
                    <select
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.batchIds?.[0] || ''}
                        onChange={e => handleChange('batchIds', [e.target.value])}
                    >
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={handleDelete}
                        style={{
                            background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginRight: 'auto'
                        }}
                    >
                        Delete
                    </button>
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
