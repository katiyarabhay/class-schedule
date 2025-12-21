'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { Classroom, SlotType } from '@/lib/types';
import SplitButton from '@/components/SplitButton';
import { parseCSV } from '@/lib/csvParser';
import { useRef } from 'react';
import styles from '@/app/page.module.css';

export default function ClassroomsPage() {
    const { classrooms, addClassroom, removeClassroom } = useScheduler();
    const [newRoom, setNewRoom] = useState<Partial<Classroom>>({
        name: '',
        capacity: 60,
        type: 'Theory',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!newRoom.name) return;
        addClassroom({
            id: crypto.randomUUID(),
            name: newRoom.name,
            capacity: newRoom.capacity || 60,
            type: newRoom.type as SlotType,
        } as Classroom);
        setNewRoom({ name: '', capacity: 60, type: 'Theory' });
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
            const room: Classroom = {
                id: item.id || crypto.randomUUID(),
                name: item.name || 'Unknown',
                capacity: item.capacity || 60,
                type: (item.type === 'Lab' || item.type === 'Theory') ? item.type : 'Theory'
            };
            addClassroom(room);
        });
        alert(`Imported ${data.length} classrooms`);
    };

    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <header className={styles.header}>
                    <h1>Classroom Resources</h1>
                </header>

                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3>Add New Classroom</h3>
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
                            <label>Room Name/Number</label>
                            <input
                                value={newRoom.name}
                                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                placeholder="LH-101"
                            />
                        </div>
                        <div>
                            <label>Capacity</label>
                            <input
                                type="number"
                                value={newRoom.capacity}
                                onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label>Type</label>
                            <select
                                value={newRoom.type}
                                onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value as SlotType })}
                            >
                                <option value="Theory">Theory (Lecture Hall)</option>
                                <option value="Lab">Laboratory</option>
                            </select>
                        </div>
                        <SplitButton
                            label="Add Room"
                            onClick={handleAdd}
                            menuOptions={[
                                { label: 'Import CSV', onClick: () => fileInputRef.current?.click() }
                            ]}
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    {classrooms.map((c) => (
                        <div key={c.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4>{c.name}</h4>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: c.type === 'Lab' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                    color: c.type === 'Lab' ? '#34d399' : '#60a5fa'
                                }}>
                                    {c.type}
                                </span>
                            </div>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Capacity: {c.capacity}</p>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => removeClassroom(c.id)}
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
