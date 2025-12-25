'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { Batch } from '@/lib/types';
import SplitButton from '@/components/SplitButton';
import { parseCSV } from '@/lib/csvParser';
import { useRef } from 'react';
import styles from '@/app/page.module.css';

export default function BatchesPage() {
    const { batches, subjects, addBatch, removeBatch } = useScheduler();
    const [newBatch, setNewBatch] = useState<Partial<Batch>>({
        name: '',
        size: 40,
        department: '',
        requiredSubjects: [],
    });
    const [subjectCodes, setSubjectCodes] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!newBatch.name) return;

        // Parse Subject Codes
        const codes = subjectCodes.split(',').map(c => c.trim()).filter(c => c !== '');
        const validSubjectIds: string[] = [];

        for (const code of codes) {
            const subject = subjects.find(s => s.code.toLowerCase() === code.toLowerCase());
            if (subject) {
                if (!validSubjectIds.includes(subject.id)) validSubjectIds.push(subject.id);
            } else {
                alert(`Subject code '${code}' not found. Please check existing subjects.`);
                return;
            }
        }

        addBatch({
            id: crypto.randomUUID(),
            name: newBatch.name,
            size: newBatch.size || 40,
            department: newBatch.department || 'General',
            requiredSubjects: validSubjectIds,
        } as Batch);
        setNewBatch({ name: '', size: 40, department: '' });
        setSubjectCodes('');
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
            const batch: Batch = {
                id: item.id || crypto.randomUUID(),
                name: item.name || 'Unknown',
                size: item.size || 40,
                department: item.department || 'General',
                requiredSubjects: []
            };
            addBatch(batch);
        });
        alert(`Imported ${data.length} batches`);
    };

    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <header className={styles.header}>
                    <h1>Batch Management</h1>
                </header>

                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3>Add New Batch</h3>
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
                            <label>Batch Name</label>
                            <input
                                value={newBatch.name}
                                onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                                placeholder="CSE-A-2025"
                            />
                        </div>
                        <div>
                            <label>Student Count</label>
                            <input
                                type="number"
                                value={newBatch.size}
                                onChange={(e) => setNewBatch({ ...newBatch, size: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label>Department</label>
                            <input
                                value={newBatch.department}
                                onChange={(e) => setNewBatch({ ...newBatch, department: e.target.value })}
                                placeholder="CSE"
                            />
                        </div>
                        <div>
                            <label>Required Subjects (Codes)</label>
                            <input
                                value={subjectCodes}
                                onChange={(e) => setSubjectCodes(e.target.value)}
                                placeholder="e.g. BCA-4001, BCA-4004"
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
                    {batches.map((b) => (
                        <div key={b.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <h4>{b.name}</h4>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>Size: {b.size} Students</p>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>Dept: {b.department}</p>

                            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                {b.requiredSubjects?.map(subId => {
                                    const sub = subjects.find(s => s.id === subId);
                                    return sub ? (
                                        <span key={subId} style={{
                                            fontSize: '0.75rem',
                                            background: 'var(--pk-secondary)',
                                            color: 'white',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '4px'
                                        }}>
                                            {sub.code}
                                        </span>
                                    ) : null;
                                })}
                                {!b.requiredSubjects?.length && <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>No subjects assigned</span>}
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => removeBatch(b.id)}
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
