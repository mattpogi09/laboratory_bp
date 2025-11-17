import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    UserCog,
    Settings,
    Box,
    Tag,
    ClipboardList,
    LogOut
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard') },
        {
            name: 'Management',
            children: [
                { name: 'Patients', href: route('patients'), icon: Users },
                { name: 'User Management', href: route('users'), icon: UserCog },
                { name: 'Service Management', href: route('services'), icon: Settings },
            ],
        },
        {
            name: 'Configuration',
            children: [
                { name: 'Inventory', href: route('inventory'), icon: Box },
                { name: 'Discounts & PhilHealth', href: route('discounts-philhealth'), icon: Tag },
                { name: 'Reports & Logs', href: route('reports-logs'), icon: ClipboardList },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1f37] text-white transform transition-transform duration-200 ease-in-out",
                !isSidebarOpen && "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 bg-black/20">
                    <img src="/images/logo.png" alt="Logo" className="h-8" />
                    <span className="ml-3 text-lg font-semibold">BP Diagnostic</span>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3 space-y-1">
                    {navigation.map((item) =>
                        !item.children ? (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                                    item.current
                                        ? "bg-black/20 text-white"
                                        : "text-gray-300 hover:bg-black/10 hover:text-white"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        ) : (
                            <div key={item.name} className="space-y-1">
                                <div className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {item.name}
                                </div>
                                {item.children.map((subItem) => {
                                    const isActive = route().current() === subItem.href.replace(route().t.url + '/', '');
                                    return (
                                        <Link
                                            key={subItem.name}
                                            href={subItem.href}
                                            className={cn(
                                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                                isActive
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-300 hover:bg-black/10 hover:text-white"
                                            )}
                                        >
                                            <subItem.icon className="mr-3 h-5 w-5" />
                                            {subItem.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        )
                    )}
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-300">
                        <img
                            src="https://ui-avatars.com/api/?name=Admin+User"
                            alt=""
                            className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">Admin User</p>
                            <p className="text-xs text-gray-400">admin@bpdiagnostic.com</p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="mt-2 flex w-full items-center px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-red-500/10"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <div className={cn(
                "transition-margin duration-200 ease-in-out",
                isSidebarOpen ? "ml-64" : "ml-0"
            )}>
                <main className="py-6">
                    <div className="mx-auto px-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}