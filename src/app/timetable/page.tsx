'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { generateSchedule } from '@/lib/scheduler';
import { DAYS_OF_WEEK } from '@/lib/types';
import styles from '@/app/page.module.css';

export default function TimetablePage() {
    const { teachers, classrooms, subjects, batches, config, schedule, setSchedule } = useScheduler();
    const [selectedBatch, setSelectedBatch] = useState<string>('all');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Timeout to allow UI to update
        setTimeout(() => {
            const newSchedule = generateSchedule(teachers, classrooms, subjects, batches, config);
            setSchedule(newSchedule);
            setIsGenerating(false);
            if (newSchedule.length === 0) {
                alert('No classes could be scheduled. Check constraints.');
            }
        }, 100);
    };

    const filteredSchedule = selectedBatch === 'all'
        ? schedule
        : schedule.filter(s => s.batchIds.includes(selectedBatch));

    const getCellContent = (day: string, period: number) => {
        // Find classes in this slot
        // If 'all', might be multiple. 
        const classes = filteredSchedule.filter(s => s.day === day && s.period === period);
        return classes;
    };

    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Timetable</h1>
                    <button
                        className="btn-primary"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Optimized Schedule'}
                    </button>
                </header>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ marginRight: '1rem' }}>Filter by Batch:</label>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        style={{ width: '200px', display: 'inline-block' }}
                    >
                        <option value="all">View All (Master)</option>
                        {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--pk-border)' }}>Time / Day</th>
                                {Array.from({ length: config.slotsPerDay }).map((_, i) => (
                                    <th key={i} style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--pk-border)' }}>
                                        Period {i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {config.daysPerWeek.map(day => (
                                <tr key={day}>
                                    <td style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--pk-border)' }}>{day}</td>
                                    {Array.from({ length: config.slotsPerDay }).map((_, i) => {
                                        const entries = getCellContent(day, i + 1);
                                        return (
                                            <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid var(--pk-border)', verticalAlign: 'top' }}>
                                                {entries.map(entry => {
                                                    const sub = subjects.find(s => s.id === entry.subjectId);
                                                    const teacher = teachers.find(t => t.id === entry.teacherId);
                                                    const room = classrooms.find(r => r.id === entry.classroomId);
                                                    const batch = batches.find(b => b.id === entry.batchIds[0]); // assuming single batch for MVP

                                                    return (
                                                        <div key={entry.id} style={{
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                                            borderRadius: '6px',
                                                            padding: '0.5rem',
                                                            marginBottom: '0.5rem',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            <div style={{ fontWeight: 600, color: 'var(--pk-primary)' }}>{sub?.code || 'Unknown'}</div>
                                                            <div>{room?.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>{teacher?.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{batch?.name}</div>
                                                        </div>
                                                    )
                                                })}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
