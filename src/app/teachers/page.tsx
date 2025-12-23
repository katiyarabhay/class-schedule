'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { Teacher } from '@/lib/types';
import SplitButton from '@/components/SplitButton';
import { parseCSV } from '@/lib/csvParser';
import { useRef } from 'react';
import styles from '@/app/page.module.css'; // Reuse or create new

export default function TeachersPage() {
    const { teachers, addTeacher, updateTeacher, removeTeacher } = useScheduler();
    const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
        name: '',
        department: '',
        maxLoadPerWeek: 0,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await parseCSV<any>(file);
            handleImport(data);
        } catch (err) {
            console.error(err);
            alert('Failed to parse CSV');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImport = (data: any[]) => {
        data.forEach(item => {
            const teacher: Teacher = {
                id: item.id || crypto.randomUUID(),
                name: item.name || 'Unknown',
                department: item.department || 'General',
                qualifiedSubjects: item.qualifiedSubjects ? item.qualifiedSubjects.split(';') : [],
                maxLoadPerDay: item.maxLoadPerDay || 4,
                maxLoadPerWeek: item.maxLoadPerWeek || 12,
                preferredSlots: [],
                unavailableSlots: []
            };
            addTeacher(teacher);
        });
        alert(`Imported ${data.length} teachers`);
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
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
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
                        <SplitButton
                            label="Add Faculty"
                            onClick={handleAdd}
                            menuOptions={[
                                { label: 'Import CSV', onClick: () => fileInputRef.current?.click() }
                            ]}
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    {teachers.map((t) => (
                        <div key={t.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <h4>{t.name}</h4>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>{t.department}</p>

                            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>Status:</label>
                                <button
                                    onClick={() => updateTeacher({ ...t, isAbsent: !t.isAbsent })}
                                    style={{
                                        background: t.isAbsent ? 'transparent' : 'rgba(16, 185, 129, 0.2)',
                                        border: `1px solid ${t.isAbsent ? 'var(--pk-border)' : 'var(--pk-accent)'}`,
                                        color: t.isAbsent ? 'var(--pk-text-muted)' : 'var(--pk-accent)',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {t.isAbsent ? 'Absent' : 'Present'}
                                </button>
                                {t.isAbsent && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}> (Excluded)</span>}
                            </div>

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
