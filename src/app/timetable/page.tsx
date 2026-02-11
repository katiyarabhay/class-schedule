'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { generateSchedule } from '@/lib/scheduler';
import { DAYS_OF_WEEK, ScheduleEntry } from '@/lib/types';
import styles from '@/app/page.module.css';
import EditClassModal from '@/components/EditClassModal';

export default function TimetablePage() {
    const { teachers, classrooms, subjects, batches, config, schedule, setSchedule } = useScheduler();
    const [selectedBatch, setSelectedBatch] = useState<string>('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingClass, setEditingClass] = useState<ScheduleEntry | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            let newSchedule;

            // Check if running in Electron
            console.log("Using Web API for scheduling");
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teachers, classrooms, subjects, batches, config })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate schedule');
            }
            newSchedule = await response.json();

            setSchedule(newSchedule);

            if (Array.isArray(newSchedule) && newSchedule.length === 0) {
                alert('No classes could be scheduled. Check constraints.');
            }
        } catch (error: any) {
            console.error(error);
            alert('Error generating schedule: ' + (error.message || 'Unknown error'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClassClick = (entry: ScheduleEntry) => {
        if (isEditing) {
            setEditingClass(entry);
        }
    };

    const handleSaveClass = (updatedClass: ScheduleEntry) => {
        const updatedSchedule = schedule.map(s => s.id === updatedClass.id ? updatedClass : s);
        setSchedule(updatedSchedule);
        setEditingClass(null);
    };

    const handleDeleteClass = (classId: string) => {
        const updatedSchedule = schedule.filter(s => s.id !== classId);
        setSchedule(updatedSchedule);
        setEditingClass(null);
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
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: isEditing ? 'var(--pk-surface-2)' : 'transparent', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--pk-border)' }}>
                            <input
                                type="checkbox"
                                checked={isEditing}
                                onChange={e => setIsEditing(e.target.checked)}
                            />
                            Edit Mode
                        </label>
                        <button
                            className="btn-primary"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Optimized Schedule'}
                        </button>
                    </div>
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
                                {Array.from({ length: config.slotsPerDay }).map((_, i) => {
                                    // Logic to insert Break Header
                                    // If break is after period 4, we want: P1, P2, P3, P4, BREAK, P5...
                                    // But simple mapping is harder.
                                    // Let's render header, then CHECK if we need to render break header.
                                    const breakAfter = (config as any).breakAfter || 4; // Default to 4
                                    const periodNum = i + 1;

                                    return (
                                        <>
                                            <th key={i} style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--pk-border)' }}>
                                                Period {periodNum}
                                            </th>
                                            {periodNum === breakAfter && (
                                                <th key={`break-header`} style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid var(--pk-border)', background: 'var(--pk-surface-2)', color: 'var(--pk-text-muted)' }}>
                                                    Break (40m)
                                                </th>
                                            )}
                                        </>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {config.daysPerWeek.map(day => (
                                <tr key={day}>
                                    <td style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--pk-border)' }}>{day}</td>
                                    {Array.from({ length: config.slotsPerDay }).map((_, i) => {
                                        const entries = getCellContent(day, i + 1);

                                        const breakAfter = (config as any).breakAfter || 4;
                                        const periodNum = i + 1;

                                        return (
                                            <>
                                                <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid var(--pk-border)', verticalAlign: 'top' }}>
                                                    {entries.map(entry => {
                                                        const sub = subjects.find(s => s.id === entry.subjectId);
                                                        const teacher = teachers.find(t => t.id === entry.teacherId);
                                                        const room = classrooms.find(r => r.id === entry.classroomId);
                                                        const batch = batches.find(b => b.id === entry.batchIds[0]); // assuming single batch for MVP

                                                        return (
                                                            <div
                                                                key={entry.id}
                                                                onClick={() => handleClassClick(entry)}
                                                                style={{
                                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                                    border: isEditing ? '2px dashed var(--pk-primary)' : '1px solid rgba(59, 130, 246, 0.2)',
                                                                    borderRadius: '6px',
                                                                    padding: '0.5rem',
                                                                    marginBottom: '0.5rem',
                                                                    fontSize: '0.85rem',
                                                                    cursor: isEditing ? 'pointer' : 'default',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                title={isEditing ? "Click to edit" : ""}
                                                            >
                                                                <div style={{ fontWeight: 600, color: 'var(--pk-primary)' }}>{sub?.code || 'Unknown'}</div>
                                                                <div>{room?.name}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>{teacher?.name}</div>
                                                                <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{batch?.name}</div>
                                                            </div>
                                                        )
                                                    })}
                                                </td>
                                                {periodNum === breakAfter && (
                                                    <td key={`break-cell-${day}`} style={{ background: 'var(--pk-surface-2)', borderBottom: '1px solid var(--pk-border)' }}>
                                                        {/* Empty Break Cell */}
                                                    </td>
                                                )}
                                            </>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <EditClassModal
                    classEntry={editingClass}
                    isOpen={!!editingClass}
                    onClose={() => setEditingClass(null)}
                    onSave={handleSaveClass}
                    onDelete={handleDeleteClass}
                    teachers={teachers}
                    classrooms={classrooms}
                    subjects={subjects}
                    batches={batches}
                />
            </main>
        </div>
    );
}
