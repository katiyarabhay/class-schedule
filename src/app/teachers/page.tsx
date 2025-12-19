'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { Teacher } from '@/lib/types';
import styles from '@/app/page.module.css'; // Reuse or create new

export default function TeachersPage() {
    const { teachers, addTeacher, removeTeacher } = useScheduler();
    const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
        name: '',
        department: '',
        maxLoadPerWeek: 0,
    });

    const handleAdd = () => {
        if (!newTeacher.name || !newTeacher.department) return;
        addTeacher({
            id: crypto.randomUUID(),
            name: newTeacher.name,
            department: newTeacher.department,
            qualifiedSubjects: [],
            maxLoadPerDay: 4,
            maxLoadPerWeek: newTeacher.maxLoadPerWeek || 12,
            ...newTeacher,
        } as Teacher);
        setNewTeacher({ name: '', department: '', maxLoadPerWeek: 12 });
    };

    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <header className={styles.header}>
                    <h1>Faculty Management</h1>
                </header>

                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3>Add New Faculty</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                        <div>
                            <label>Name</label>
                            <input
                                value={newTeacher.name}
                                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div>
                            <label>Department</label>
                            <input
                                value={newTeacher.department}
                                onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                                placeholder="Computer Science"
                            />
                        </div>
                        <div>
                            <label>Max Load / Week</label>
                            <input
                                type="number"
                                value={newTeacher.maxLoadPerWeek}
                                onChange={(e) => setNewTeacher({ ...newTeacher, maxLoadPerWeek: parseInt(e.target.value) })}
                            />
                        </div>
                        <button className="btn-primary" onClick={handleAdd}>Add Faculty</button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {teachers.map((t) => (
                        <div key={t.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <h4>{t.name}</h4>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>{t.department}</p>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem' }}>Load: {t.maxLoadPerWeek}/wk</span>
                                <button
                                    onClick={() => removeTeacher(t.id)}
                                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
