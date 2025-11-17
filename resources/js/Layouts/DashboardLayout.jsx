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
    LogOut,
    Plus,
    History
} from 'lucide-react';

export default function DashboardLayout({ children, auth }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const user = auth?.user;
    const userRole = user?.role || 'cashier';

    // Admin navigation
    const adminNavigation = [
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

    // Cashier navigation
    const cashierNavigation = [
        {
            name: 'Main Navigation',
            children: [
                { name: 'Patients', href: route('patients'), icon: Users },
            ],
        },
        {
            name: 'Management',
            children: [
                { name: 'New Transaction', href: '#', icon: Plus },
                { name: 'Transaction History', href: '#', icon: History },
            ],
        },
        
    ];

    // Lab Staff navigation (Lab Test Queue only)
    const labStaffNavigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard') },
        {
            name: 'Laboratory',
            children: [
                { name: 'Inventory', href: route('inventory'), icon: Box },
            ],
        },
    ];

    // Select navigation based on role
    const navigation = userRole === 'admin' 
        ? adminNavigation 
        : userRole === 'lab_staff' 
            ? labStaffNavigation 
            : cashierNavigation;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white text-black transform transition-transform duration-200 ease-in-out",
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
                                        ? "bg-black/20 text-black"
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
                                                    ? "bg-red-600 text-white"
                                                    : "text-gray-700 hover:bg-black/10 hover:text-black"
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
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                            alt=""
                            className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-400 capitalize">{userRole.replace('_', ' ')}</p>
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