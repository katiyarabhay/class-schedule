'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import { Teacher } from '@/lib/types';
import SplitButton from '@/components/SplitButton';
import { parseCSV } from '@/lib/csvParser';
import { useRef } from 'react';
import styles from '@/app/page.module.css';
import EditTeacherModal from '@/components/EditTeacherModal';

export default function TeachersPage() {
    const { teachers, subjects, addTeacher, updateTeacher, removeTeacher } = useScheduler();
    const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
        id: '', // Used for Faculty Code
        name: '',
        department: '',
        maxLoadPerWeek: 0,
    });
    const [subjectCode1, setSubjectCode1] = useState('');
    const [subjectCode2, setSubjectCode2] = useState('');

    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!newTeacher.name || !newTeacher.department || !newTeacher.id) {
            alert("Name, Department and Faculty Code are required");
            return;
        }

        // Check for duplicate code (ID)
        if (teachers.some(t => t.id === newTeacher.id)) {
            alert(`Faculty Code '${newTeacher.id}' already exists.`);
            return;
        }

        // Subject Validation
        if (!subjectCode1.trim()) {
            alert("Subject Code 1 is compulsory");
            return;
        }

        const validSubjectIds: string[] = [];
        const codesToCheck = [subjectCode1, subjectCode2].filter(c => c.trim() !== '');

        for (const code of codesToCheck) {
            const subject = subjects.find(s => s.code.toLowerCase() === code.trim().toLowerCase());
            if (subject) {
                if (!validSubjectIds.includes(subject.id)) {
                    validSubjectIds.push(subject.id);
                }
            } else {
                alert(`Subject code '${code}' not found`);
                return; // Stop if any code is invalid
            }
        }

        addTeacher({
            id: newTeacher.id, // Use the provided Code as ID
            name: newTeacher.name,
            department: newTeacher.department,
            qualifiedSubjects: validSubjectIds,
            maxLoadPerDay: 4,
            maxLoadPerWeek: newTeacher.maxLoadPerWeek || 12,
            ...newTeacher,
        } as Teacher);
        setNewTeacher({ id: '', name: '', department: '', maxLoadPerWeek: 12 });
        setSubjectCode1('');
        setSubjectCode2('');
        alert("Teacher added successfully");
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = await parseCSV<any>(file);
            handleImport(data);
        } catch (err) {
            console.error(err);
            alert('Failed to parse CSV');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleImport = (data: any[]) => {
        let importedCount = 0;
        data.forEach(item => {
            // Normalize keys to lowercase to be safe
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const normalizedItem: any = {};
            Object.keys(item).forEach(k => normalizedItem[k.toLowerCase()] = item[k]);

            // Resolve Subject Codes to IDs
            const codes = [];
            if (normalizedItem.subjectcode1) codes.push(normalizedItem.subjectcode1);
            if (normalizedItem.subjectcode2) codes.push(normalizedItem.subjectcode2);
            // Also support the old list format if present
            if (normalizedItem.qualifiedsubjects) {
                codes.push(...normalizedItem.qualifiedsubjects.split(';'));
            }

            const validSubjectIds: string[] = [];
            codes.forEach(code => {
                const sub = subjects.find(s => s.code.toLowerCase() === code.trim().toLowerCase());
                if (sub) validSubjectIds.push(sub.id);
            });

            if (!normalizedItem.name) return;

            const teacher: Teacher = {
                id: normalizedItem.facultycode || normalizedItem.code || normalizedItem.id || `FAC-${crypto.randomUUID().slice(0, 8)}`, // Prefer code from CSV
                name: normalizedItem.name || 'Unknown',
                department: normalizedItem.department || 'General',
                qualifiedSubjects: validSubjectIds,
                maxLoadPerDay: parseInt(normalizedItem.maxloadperday) || 4,
                maxLoadPerWeek: parseInt(normalizedItem.maxloadperweek) || 12,
                preferredSlots: [],
                unavailableSlots: []
            };
            addTeacher(teacher);
            importedCount++;
        });
        alert(`Imported ${importedCount} teachers`);
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
                                value={newTeacher.name}
                                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div>
                            <label>Faculty Code <span style={{ color: '#ef4444' }}>*</span></label>
                            <input
                                value={newTeacher.id}
                                onChange={(e) => setNewTeacher({ ...newTeacher, id: e.target.value })}
                                placeholder="FAC-001"
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

                        {/* Subject Codes Inputs */}
                        <div>
                            <label>Subject Code 1 <span style={{ color: '#ef4444' }}>*</span></label>
                            <input
                                value={subjectCode1}
                                onChange={(e) => setSubjectCode1(e.target.value)}
                                placeholder="e.g. CS101"
                            />
                        </div>
                        <div>
                            <label>Subject Code 2</label>
                            <input
                                value={subjectCode2}
                                onChange={(e) => setSubjectCode2(e.target.value)}
                                placeholder="Optional"
                            />
                        </div>

                        <SplitButton
                            label="Add Faculty"
                            onClick={handleAdd}
                            menuOptions={[
                                { label: 'Import CSV', onClick: () => fileInputRef.current?.click() },
                                {
                                    label: 'Download Sample CSV',
                                    onClick: () => {
                                        const headers = ['Name', 'Department', 'SubjectCode1', 'SubjectCode2', 'MaxLoadPerWeek']; // Fixed header
                                        const rows = [
                                            ['Dr. Alice Smith', 'Computer Science', 'BCA-4004', 'BCA-4001', '12'],
                                            ['Prof. Bob Jones', 'Mathematics', 'BCA-5005', '', '10']
                                        ];
                                        const csvContent = [
                                            headers.join(','),
                                            ...rows.map(r => r.join(','))
                                        ].join('\n');

                                        const blob = new Blob([csvContent], { type: 'text/csv' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'teachers_sample.csv';
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    {teachers.map((t) => (
                        <div key={t.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4>{t.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--pk-accent)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {t.id}
                                </span>
                            </div>
                            <p style={{ color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>{t.department}</p>

                            {/* Qualified Subjects Display */}
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                {t.qualifiedSubjects.map(subId => {
                                    const sub = subjects.find(s => s.id === subId);
                                    return sub ? (
                                        <span key={subId} style={{
                                            fontSize: '0.75rem',
                                            background: 'var(--pk-primary)',
                                            color: 'white',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '4px'
                                        }}>
                                            {sub.code}
                                        </span>
                                    ) : null;
                                })}
                            </div>



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
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => {
                                            setEditingTeacher(t);
                                            setIsEditModalOpen(true);
                                        }}
                                        style={{ background: 'transparent', border: '1px solid var(--pk-accent)', color: 'var(--pk-accent)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => removeTeacher(t.id)}
                                        style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <EditTeacherModal
                    teacher={editingTeacher}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={updateTeacher}
                    subjects={subjects}
                />
            </main>
        </div>
    );
}
