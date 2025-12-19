'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Teacher, Classroom, Subject, Batch, SchedulerConfig, ScheduleEntry, DAYS_OF_WEEK } from './types';

interface AppState {
    teachers: Teacher[];
    classrooms: Classroom[];
    subjects: Subject[];
    batches: Batch[];
    config: SchedulerConfig;
    schedule: ScheduleEntry[];
}

interface AppContextType extends AppState {
    addTeacher: (teacher: Teacher) => void;
    removeTeacher: (id: string) => void;
    addClassroom: (classroom: Classroom) => void;
    removeClassroom: (id: string) => void;
    addSubject: (subject: Subject) => void;
    removeSubject: (id: string) => void;
    addBatch: (batch: Batch) => void;
    removeBatch: (id: string) => void;
    updateConfig: (config: SchedulerConfig) => void;
    setSchedule: (schedule: ScheduleEntry[]) => void;
}

const defaultState: AppState = {
    teachers: [],
    classrooms: [],
    subjects: [],
    batches: [],
    config: {
        daysPerWeek: DAYS_OF_WEEK.slice(0, 5), // Mon-Fri default
        slotsPerDay: 6,
    },
    schedule: [],
};

const SchedulerContext = createContext<AppContextType | undefined>(undefined);

export function SchedulerProvider({ children }: { children: ReactNode }) {
    const [teachers, setTeachers] = useState<Teacher[]>(defaultState.teachers);
    const [classrooms, setClassrooms] = useState<Classroom[]>(defaultState.classrooms);
    const [subjects, setSubjects] = useState<Subject[]>(defaultState.subjects);
    const [batches, setBatches] = useState<Batch[]>(defaultState.batches);
    const [config, setConfig] = useState<SchedulerConfig>(defaultState.config);
    const [schedule, setSchedule] = useState<ScheduleEntry[]>(defaultState.schedule);

    const addTeacher = (t: Teacher) => setTeachers((prev) => [...prev, t]);
    const removeTeacher = (id: string) => setTeachers((prev) => prev.filter((t) => t.id !== id));

    const addClassroom = (c: Classroom) => setClassrooms((prev) => [...prev, c]);
    const removeClassroom = (id: string) => setClassrooms((prev) => prev.filter((c) => c.id !== id));

    const addSubject = (s: Subject) => setSubjects((prev) => [...prev, s]);
    const removeSubject = (id: string) => setSubjects((prev) => prev.filter((s) => s.id !== id));

    const addBatch = (b: Batch) => setBatches((prev) => [...prev, b]);
    const removeBatch = (id: string) => setBatches((prev) => prev.filter((b) => b.id !== id));

    const updateConfig = (c: SchedulerConfig) => setConfig(c);

    return (
        <SchedulerContext.Provider
            value={{
                teachers,
                classrooms,
                subjects,
                batches,
                config,
                schedule,
                addTeacher,
                removeTeacher,
                addClassroom,
                removeClassroom,
                addSubject,
                removeSubject,
                addBatch,
                removeBatch,
                updateConfig,
                setSchedule,
            }}
        >
            {children}
        </SchedulerContext.Provider>
    );
}

export function useScheduler() {
    const context = useContext(SchedulerContext);
    if (!context) {
        throw new Error('useScheduler must be used within a SchedulerProvider');
    }
    return context;
}
