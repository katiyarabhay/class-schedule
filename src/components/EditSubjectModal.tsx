import React, { useState, useEffect } from 'react';
import { Subject, SlotType } from '@/lib/types';

interface EditSubjectModalProps {
    subject: Subject | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedSubject: Subject) => void;
}

export default function EditSubjectModal({
    subject,
    isOpen,
    onClose,
    onSave
}: EditSubjectModalProps) {
    const [formData, setFormData] = useState<Partial<Subject>>({});

    useEffect(() => {
        if (subject) {
            setFormData({ ...subject });
        } else {
            setFormData({});
        }
    }, [subject]);

    if (!isOpen || !subject) return null;

    const handleSave = () => {
        if (!formData.name || !formData.code) {
            alert("Name and Code are required");
            return;
        }

        onSave({
            ...subject,
            ...formData
        } as Subject);
        onClose();
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
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--pk-primary)' }}>Edit Subject</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Name</label>
                    <input
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Code</label>
                    <input
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Type</label>
                    <select
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.type || 'Theory'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as SlotType })}
                    >
                        <option value="Theory">Theory</option>
                        <option value="Lab">Lab</option>
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Credits/Hours</label>
                    <input
                        type="number"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}
                        value={formData.credits || 3}
                        onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    />
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
