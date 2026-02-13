import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
    const { user, signOut } = useAuth();
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
                {user && (
                    <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#888' }}>
                        Logged in as: <br />{user.email}
                    </div>
                )}
                <button onClick={signOut} className={styles.logoutBtn}>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
