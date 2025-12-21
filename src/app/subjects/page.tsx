'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { Subject, SlotType } from '@/lib/types';
import SplitButton from '@/components/SplitButton';
import { parseCSV } from '@/lib/csvParser';
import { useRef } from 'react';
import styles from '@/app/page.module.css';

export default function SubjectsPage() {
    const { subjects, addSubject, removeSubject } = useScheduler();
    const [newSubject, setNewSubject] = useState<Partial<Subject>>({
        name: '',
        code: '',
        type: 'Theory',
        credits: 3,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!newSubject.name || !newSubject.code) return;
        addSubject({
            id: crypto.randomUUID(),
            name: newSubject.name,
            code: newSubject.code,
            type: newSubject.type as SlotType,
            credits: newSubject.credits || 3,
            requiredBatches: [], // To be managed via mapping or simple input later
        } as Subject);
        setNewSubject({ name: '', code: '', type: 'Theory', credits: 3 });
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
            const subject: Subject = {
                id: item.id || crypto.randomUUID(),
                name: item.name || 'Unknown',
                code: item.code || 'UNK',
                type: (item.type === 'Lab' || item.type === 'Theory') ? item.type : 'Theory',
                credits: item.credits || 3,
                requiredBatches: item.requiredBatches ? item.requiredBatches.split(';') : []
            };
            addSubject(subject);
        });
        alert(`Imported ${data.length} subjects`);
    };

    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <header className={styles.header}>
                    <h1>Subject Management</h1>
                </header>

                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3>Add New Subject</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
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
                                value={newSubject.name}
                                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                placeholder="Data Structures"
                            />
                        </div>
                        <div>
                            <label>Code</label>
                            <input
                                value={newSubject.code}
                                onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                                placeholder="CS101"
                            />
                        </div>
                        <div>
                            <label>Type</label>
                            <select
                                value={newSubject.type}
                                onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value as SlotType })}
                            >
                                <option value="Theory">Theory</option>
                                <option value="Lab">Lab</option>
                            </select>
                        </div>
                        <div>
                            <label>Credits/Hours</label>
                            <input
                                type="number"
                                value={newSubject.credits}
                                onChange={(e) => setNewSubject({ ...newSubject, credits: parseInt(e.target.value) })}
                            />
                        </div>

                        <SplitButton
                            label="Add"
                            onClick={handleAdd}
                            menuOptions={[
                                { label: 'Import CSV', onClick: () => fileInputRef.current?.click() }
                            ]}
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    {subjects.map((s) => (
                        <div key={s.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4>{s.code}</h4>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: s.type === 'Lab' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                    color: s.type === 'Lab' ? '#34d399' : '#60a5fa'
                                }}>
                                    {s.type}
                                </span>
                            </div>
                            <p style={{ fontWeight: 600 }}>{s.name}</p>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>Hours/Week: {s.credits}</p>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => removeSubject(s.id)}
                                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main >
        </div >
    );
}
