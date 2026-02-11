'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { DAYS_OF_WEEK } from '@/lib/types';
import styles from '@/app/page.module.css';

export default function ResourcesPage() {
    const { teachers, classrooms, subjects, batches, config, schedule } = useScheduler();
    const [viewMode, setViewMode] = useState<'teachers' | 'classrooms'>('teachers');
    const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);

    // Helper to get cell content
    const getCellContent = (rowId: string, period: number) => {
        // Find existing schedule entry for this resource (teacher or room) at this time
        const entry = schedule.find(s =>
            s.day === selectedDay &&
            s.period === period &&
            (viewMode === 'teachers' ? s.teacherId === rowId : s.classroomId === rowId)
        );

        if (!entry) return null;

        const sub = subjects.find(s => s.id === entry.subjectId);
        const batch = batches.find(b => b.id === entry.batchIds[0]);
        const otherResource = viewMode === 'teachers'
            ? classrooms.find(r => r.id === entry.classroomId)?.name
            : teachers.find(t => t.id === entry.teacherId)?.name;

        return {
            subject: sub?.code,
            batch: batch?.name,
            other: otherResource
        };
    };

    const rows = viewMode === 'teachers' ? teachers : classrooms;

    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Master Schedule View</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '6px' }}
                        >
                            {config.daysPerWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                        <div className="toggle-group" style={{ display: 'flex', border: '1px solid var(--pk-border)', borderRadius: '6px', overflow: 'hidden' }}>
                            <button
                                onClick={() => setViewMode('teachers')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: viewMode === 'teachers' ? 'var(--pk-primary)' : 'transparent',
                                    color: viewMode === 'teachers' ? 'white' : 'var(--pk-text)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Teachers
                            </button>
                            <button
                                onClick={() => setViewMode('classrooms')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: viewMode === 'classrooms' ? 'var(--pk-primary)' : 'transparent',
                                    color: viewMode === 'classrooms' ? 'white' : 'var(--pk-text)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Classrooms
                            </button>
                        </div>
                    </div>
                </header>

                <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--pk-border)', position: 'sticky', left: 0, background: 'var(--pk-surface)', zIndex: 10 }}>
                                    {viewMode === 'teachers' ? 'Teacher' : 'Classroom'}
                                </th>
                                {Array.from({ length: config.slotsPerDay }).map((_, i) => {
                                    const breakAfter = (config as any).breakAfter || 4;
                                    const periodNum = i + 1;
                                    return (
                                        <>
                                            <th key={i} style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid var(--pk-border)' }}>
                                                P{periodNum}
                                            </th>
                                            {periodNum === breakAfter && (
                                                <th key="break" style={{ width: '2rem', background: 'var(--pk-surface-2)', borderBottom: '1px solid var(--pk-border)' }}></th>
                                            )}
                                        </>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row.id}>
                                    <td style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--pk-border)', position: 'sticky', left: 0, background: 'var(--pk-surface)', zIndex: 10 }}>
                                        {row.name}
                                    </td>
                                    {Array.from({ length: config.slotsPerDay }).map((_, i) => {
                                        const breakAfter = (config as any).breakAfter || 4;
                                        const periodNum = i + 1;
                                        const content = getCellContent(row.id, periodNum);

                                        return (
                                            <>
                                                <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid var(--pk-border)', textAlign: 'center' }}>
                                                    {content ? (
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            padding: '0.25rem',
                                                            borderRadius: '4px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '2px'
                                                        }}>
                                                            <strong style={{ color: 'var(--pk-primary)' }}>{content.subject}</strong>
                                                            <span>{content.batch}</span>
                                                            <span style={{ color: 'var(--pk-text-muted)' }}>{content.other}</span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--pk-text-muted)', fontSize: '0.8rem' }}>-</span>
                                                    )}
                                                </td>
                                                {periodNum === breakAfter && (
                                                    <td key={`break-${row.id}`} style={{ background: 'var(--pk-surface-2)', borderBottom: '1px solid var(--pk-border)' }}></td>
                                                )}
                                            </>
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
