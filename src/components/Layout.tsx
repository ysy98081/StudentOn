import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: '대시보드', icon: LayoutDashboard },
        { path: '/students', label: '학생 관리', icon: Users },
        { path: '/teachers', label: '선생님 관리', icon: GraduationCap },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-indigo-600">StudentOn</h1>
                </div>
                <nav className="px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
