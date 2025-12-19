'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { Batch } from '@/lib/types';
import styles from '@/app/page.module.css';

export default function BatchesPage() {
    const { batches, addBatch, removeBatch } = useScheduler();
    const [newBatch, setNewBatch] = useState<Partial<Batch>>({
        name: '',
        size: 40,
        department: '',
    });

    const handleAdd = () => {
        if (!newBatch.name) return;
        addBatch({
            id: crypto.randomUUID(),
            name: newBatch.name,
            size: newBatch.size || 40,
            department: newBatch.department || 'General',
        } as Batch);
        setNewBatch({ name: '', size: 40, department: '' });
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
                        <button className="btn-primary" onClick={handleAdd}>Add</button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {batches.map((b) => (
                        <div key={b.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <h4>{b.name}</h4>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>Size: {b.size} Students</p>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>Dept: {b.department}</p>
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
            </main>
        </div>
    );
}
