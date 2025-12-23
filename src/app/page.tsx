'use client';

import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import styles from './page.module.css';
import { UtilizationChart } from '@/components/UtilizationChart';
import { ScheduleEntry, Teacher, Classroom } from '@/lib/types';

export default function Home() {
  const { teachers, classrooms, subjects, batches, schedule } = useScheduler();

  const stats = [
    { label: 'Teachers', value: teachers.length, color: 'var(--pk-primary)' },
    { label: 'Classrooms', value: classrooms.length, color: 'var(--pk-accent)' },
    { label: 'Subjects', value: subjects.length, color: '#f59e0b' }, // Amber
    { label: 'Batches', value: batches.length, color: '#ec4899' }, // Pink
  ];

  // Helper to count schedule occurrences
  const countOccurrences = (sched: ScheduleEntry[], key: keyof ScheduleEntry, id: string) => {
    return sched.filter(s => {
      const val = s[key];
      if (Array.isArray(val)) return val.includes(id);
      return val === id;
    }).length;
  };

  // 1. Teacher Utilization (Assigned vs Max Load)
  const teacherStats = teachers.map(t => ({
    name: t.name,
    assigned: countOccurrences(schedule, 'teacherId', t.id),
    max: t.maxLoadPerWeek
  })).slice(0, 10); // Limit to 10 for display

  // 2. Classroom Utilization (Occupancy Count)
  const classroomStats = classrooms.map(c => ({
    name: c.name,
    occupancy: countOccurrences(schedule, 'classroomId', c.id)
  }));

  // 3. Subject Distribution
  const subjectStats = subjects.map(s => ({
    name: s.code,
    count: countOccurrences(schedule, 'subjectId', s.id)
  })).filter(s => s.count > 0); // Only show scheduled subjects

  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <header className={styles.header}>
          <h1>Dashboard Overview</h1>
          <p style={{ color: 'var(--pk-text-muted)' }}>Welcome to the Intelligent Class Scheduling Platform</p>
        </header>

        <div className={styles.grid}>
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ color: 'var(--pk-text-muted)', fontSize: '0.875rem' }}>{stat.label}</span>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.grid} style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          <UtilizationChart
            title="Teacher Utilization (Classes Assigned)"
            data={teacherStats}
            type="bar"
            dataKey="assigned"
            color="var(--pk-primary)"
          />
          <UtilizationChart
            title="Classroom Occupancy"
            data={classroomStats}
            type="bar"
            dataKey="occupancy"
            color="var(--pk-accent)"
          />
          <UtilizationChart
            title="Subject Distribution"
            data={subjectStats}
            type="pie"
            dataKey="count"
          />
        </div>

        {/* Quick Launch Panel or Recent Activity could go here */}
        <div style={{ marginTop: '2rem' }} className="glass-panel">
          <div style={{ padding: '1.5rem' }}>
            <h3>Quick Actions</h3>
            <p>Navigate to <strong>Resources</strong> to add classrooms or <strong>Faculty</strong> to add teachers.</p>
          </div>
        </div>

      </main >
    </div >
  );
}
