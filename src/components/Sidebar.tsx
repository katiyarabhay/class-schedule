import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const menuItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Teachers', href: '/teachers' },
    { label: 'Classrooms', href: '/classrooms' },
    { label: 'Subjects', href: '/subjects' },
    { label: 'Batches', href: '/batches' },
    { label: 'Timetable', href: '/timetable' },
    { label: 'Master View', href: '/resources' },
];

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <h2>AUTO<span style={{ color: 'var(--pk-primary)' }}>PLANNER</span></h2>
            </div>
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link key={item.href} href={item.href} className={styles.link}>
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className={styles.footer}>
                {/* Auth removed */}
            </div>
        </aside>
    );
}
