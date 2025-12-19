'use client';

import Sidebar from '@/components/Sidebar';
import { useScheduler } from '@/lib/store';
import styles from './page.module.css';

export default function Home() {
  const { teachers, classrooms, subjects, batches } = useScheduler();

  const stats = [
    { label: 'Teachers', value: teachers.length, color: 'var(--pk-primary)' },
    { label: 'Classrooms', value: classrooms.length, color: 'var(--pk-accent)' },
    { label: 'Subjects', value: subjects.length, color: '#f59e0b' }, // Amber
    { label: 'Batches', value: batches.length, color: '#ec4899' }, // Pink
  ];

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
