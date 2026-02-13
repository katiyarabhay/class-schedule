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
    updateTeacher: (teacher: Teacher) => void;
    removeTeacher: (id: string) => void;
    addClassroom: (classroom: Classroom) => void;
    updateClassroom: (classroom: Classroom) => void;
    removeClassroom: (id: string) => void;
    addSubject: (subject: Subject) => void;
    updateSubject: (subject: Subject) => void;
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

    // Load initial data
    React.useEffect(() => {
        import('@/app/actions').then(({ getInitialData }) => {
            getInitialData().then((data) => {
                setTeachers(data.teachers);
                setClassrooms(data.classrooms);
                setSubjects(data.subjects);
                setBatches(data.batches);
                setConfig(data.config);
                setSchedule(data.schedule);
            });
        });
    }, []);

    const addTeacher = (t: Teacher) => {
        setTeachers((prev) => [...prev, t]);
        import('@/app/actions').then(({ addTeacherAction }) => addTeacherAction(t));
    };

    const updateTeacher = (t: Teacher) => {
        setTeachers((prev) => prev.map(old => old.id === t.id ? t : old));
        import('@/app/actions').then(({ updateTeacherAction }) => updateTeacherAction(t));
    };

    const removeTeacher = (id: string) => {
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        import('@/app/actions').then(({ removeTeacherAction }) => removeTeacherAction(id));
    };

    const addClassroom = (c: Classroom) => {
        setClassrooms((prev) => [...prev, c]);
        import('@/app/actions').then(({ addClassroomAction }) => addClassroomAction(c));
    };
    const updateClassroom = (c: Classroom) => {
        setClassrooms((prev) => prev.map(old => old.id === c.id ? c : old));
        import('@/app/actions').then(({ updateClassroomAction }) => updateClassroomAction(c));
    };

    const removeClassroom = (id: string) => {
        setClassrooms((prev) => prev.filter((c) => c.id !== id));
        import('@/app/actions').then(({ removeClassroomAction }) => removeClassroomAction(id));
    };

    const addSubject = (s: Subject) => {
        setSubjects((prev) => [...prev, s]);
        import('@/app/actions').then(({ addSubjectAction }) => addSubjectAction(s));
    };

    const updateSubject = (s: Subject) => {
        setSubjects((prev) => prev.map(old => old.id === s.id ? s : old));
        import('@/app/actions').then(({ updateSubjectAction }) => updateSubjectAction(s));
    };

    const removeSubject = (id: string) => {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        import('@/app/actions').then(({ removeSubjectAction }) => removeSubjectAction(id));
    };

    const addBatch = (b: Batch) => {
        setBatches((prev) => [...prev, b]);
        import('@/app/actions').then(({ addBatchAction }) => addBatchAction(b));
    };
    const removeBatch = (id: string) => {
        setBatches((prev) => prev.filter((b) => b.id !== id));
        import('@/app/actions').then(({ removeBatchAction }) => removeBatchAction(id));
    };

    const updateConfig = (c: SchedulerConfig) => {
        setConfig(c);
        import('@/app/actions').then(({ updateConfigAction }) => updateConfigAction(c));
    };

    const setScheduleWrapper = (s: ScheduleEntry[]) => {
        setSchedule(s);
        import('@/app/actions').then(({ saveScheduleAction }) => saveScheduleAction(s));
    };

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
                updateTeacher,
                removeTeacher,
                addClassroom,
                updateClassroom,
                removeClassroom,
                addSubject,
                updateSubject,
                removeSubject,
                addBatch,
                removeBatch,
                updateConfig,
                setSchedule: setScheduleWrapper,
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
