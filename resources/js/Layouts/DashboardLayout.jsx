import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import LogoutModal from '@/Components/LogoutModal';
import SuccessModal from '@/Components/SuccessModal';
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
    History,
    Beaker,
    Send,
    FileText
} from 'lucide-react';

export default function DashboardLayout({ children, auth }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    const { flash } = usePage().props;
    const user = auth?.user;
    const userRole = user?.role;

    // Handle flash success messages
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccessModal(true);
        }
    }, [flash]);

    // Admin navigation
    const adminNavigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, routeName: 'dashboard' },
        {
            name: 'Management',
            children: [
                { name: 'Patients', href: route('patients.index'), icon: Users, routeName: 'patients.index' },
                { name: 'User Management', href: route('users.index'), icon: UserCog, routeName: 'users.index' },
                { name: 'Service Management', href: route('services.index'), icon: Settings, routeName: 'services.index' },
            ],
        },
        {
            name: 'Configuration',
            children: [
                { name: 'Inventory', href: route('inventory'), icon: Box, routeName: 'inventory' },
                { name: 'Discounts & PhilHealth', href: route('discounts-philhealth'), icon: Tag, routeName: 'discounts-philhealth' },
                { name: 'Reports & Logs', href: route('reports-logs'), icon: ClipboardList, routeName: 'reports-logs' },
            ],
        },
    ];

    // Cashier navigation
    const cashierNavigation = [
        {
            name: 'Main Navigation',
            children: [
                { 
                    name: 'Transactions', 
                    href: route('cashier.transactions.index'), 
                    icon: Plus, 
                    routeName: 'cashier.transactions.index'
                },
                { name: 'Patients', href: route('patients.index'), icon: Users, routeName: 'patients.index' },
            ],
        },
        {
            name: 'Management',
            children: [
                { 
                    name: 'Transaction History', 
                    href: route('cashier.transactions.history'), 
                    icon: History,
                    routeName: 'cashier.transactions.history'
                },
            ],
        },
        
    ];

    // Lab Staff navigation (Lab Test Queue and Inventory)
    const labStaffNavigation = [
        {
            name: 'Laboratory',
            children: [
                { name: 'Lab Test Queue', href: route('lab-test-queue'), icon: Beaker, routeName: 'lab-test-queue' },
                { name: 'Patient Results', href: route('lab-test-queue.patient-results'), icon: Send, routeName: 'lab-test-queue.patient-results' },
                { name: 'Result History', href: route('lab-test-queue.result-history'), icon: FileText, routeName: 'lab-test-queue.result-history' },
            ],
        },
        {
            name: 'Configuration',
            children: [
                { name: 'Inventory', href: route('inventory'), icon: Box, routeName: 'inventory' },
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
                <div className="h-16 flex items-center px-6 bg-white/20 border-black/50">
                    <img src="/images/logo.png" alt="Logo" className="h-8" />
                    <span className="ml-3 text-lg font-semibold text-black">BP Diagnostic</span>
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
                                    item.routeName && route().current(item.routeName)
                                        ? "bg-[#990000] text-white"
                                        : "text-black hover:bg-[#990000]/10 hover:text-[#990000]"
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
                                    const isActive = subItem.routeName
                                        ? route().current(subItem.routeName)
                                        : false;
                                    
                                    return (
                                        <Link
                                            key={subItem.name}
                                            href={subItem.href}
                                            className={cn(
                                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                                isActive
                                                    ? "bg-[#990000] text-white"
                                                    : "text-black hover:bg-[#990000]/10 hover:text-[#990000]"
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
                <div className="absolute bottom-0 left-0 right-0 p-4 border-black">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300">
                        <div className="h-10 w-10 rounded-full bg-red-900 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                            {(user?.name || 'User').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-black truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-black capitalize truncate">{userRole?.replace('_', ' ') || 'User'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="mt-2 flex w-full items-center px-3 py-2 text-sm font-medium bg-[#ac3434] text-white rounded-md hover:bg-[#990000] transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
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

            {/* Logout Modal */}
            <LogoutModal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
            />

            {/* Success Modal */}
            <SuccessModal
                show={showSuccessModal}
                message={successMessage}
                onClose={() => setShowSuccessModal(false)}
            />
        </div>
    );
}