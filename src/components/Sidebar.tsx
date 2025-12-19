import Link from 'next/link';
import styles from './Sidebar.module.css';

const menuItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Teachers', href: '/teachers' },
    { label: 'Classrooms', href: '/classrooms' },
    { label: 'Subjects', href: '/subjects' },
    { label: 'Batches', href: '/batches' },
    { label: 'Timetable', href: '/timetable' },
];

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <h2>Scheduler<span style={{ color: 'var(--pk-primary)' }}>AI</span></h2>
            </div>
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link key={item.href} href={item.href} className={styles.link}>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
