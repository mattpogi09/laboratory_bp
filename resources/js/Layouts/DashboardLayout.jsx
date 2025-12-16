import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import LogoutModal from "@/Components/LogoutModal";
import SuccessModal from "@/Components/SuccessModal";
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
    FileText,
    Menu,
    X,
    Wallet,
} from "lucide-react";

export default function DashboardLayout({ children, auth }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
        {
            name: "Dashboard",
            href: route("dashboard"),
            icon: LayoutDashboard,
            routeName: "dashboard",
        },
        {
            name: "Management",
            children: [
                {
                    name: "Patients",
                    href: route("patients.index"),
                    icon: Users,
                    routeName: "patients.index",
                },
                {
                    name: "User Management",
                    href: route("users.index"),
                    icon: UserCog,
                    routeName: "users.index",
                },
                {
                    name: "Service Management",
                    href: route("services.index"),
                    icon: Settings,
                    routeName: "services.index",
                },
            ],
        },
        {
            name: "Configuration",
            children: [
                {
                    name: "Inventory",
                    href: route("inventory"),
                    icon: Box,
                    routeName: "inventory",
                },
                {
                    name: "Discounts & PhilHealth",
                    href: route("discounts-philhealth"),
                    icon: Tag,
                    routeName: "discounts-philhealth",
                },
                {
                    name: "Cash Reconciliation",
                    href: route("admin.reconciliation.index"),
                    icon: Wallet,
                    routeName: "admin.reconciliation.index",
                },
                {
                    name: "Reports & Logs",
                    href: route("reports-logs"),
                    icon: ClipboardList,
                    routeName: "reports-logs",
                },
            ],
        },
    ];

    // Cashier navigation
    const cashierNavigation = [
        {
            name: "Main Navigation",
            children: [
                {
                    name: "Transactions",
                    href: route("cashier.transactions.index"),
                    icon: Plus,
                    routeName: "cashier.transactions.index",
                },
                {
                    name: "Patients",
                    href: route("patients.index"),
                    icon: Users,
                    routeName: "patients.index",
                },
            ],
        },
        {
            name: "Management",
            children: [
                {
                    name: "Transaction History",
                    href: route("cashier.transactions.history"),
                    icon: History,
                    routeName: "cashier.transactions.history",
                },
                {
                    name: "Cash Reconciliation",
                    href: route("cashier.reconciliation.index"),
                    icon: ClipboardList,
                    routeName: "cashier.reconciliation.index",
                },
            ],
        },
    ];

    // Lab Staff navigation (Lab Test Queue and Inventory)
    const labStaffNavigation = [
        {
            name: "Laboratory",
            children: [
                {
                    name: "Lab Test Queue",
                    href: route("lab-test-queue"),
                    icon: Beaker,
                    routeName: "lab-test-queue",
                },
                {
                    name: "Patient Results",
                    href: route("lab-test-queue.patient-results"),
                    icon: Send,
                    routeName: "lab-test-queue.patient-results",
                },
                {
                    name: "Result History",
                    href: route("lab-test-queue.result-history"),
                    icon: FileText,
                    routeName: "lab-test-queue.result-history",
                },
            ],
        },
        {
            name: "Configuration",
            children: [
                {
                    name: "Inventory",
                    href: route("inventory"),
                    icon: Box,
                    routeName: "inventory",
                },
            ],
        },
    ];

    // Select navigation based on role
    const navigation =
        userRole === "admin"
            ? adminNavigation
            : userRole === "lab_staff"
            ? labStaffNavigation
            : cashierNavigation;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-4">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                >
                    {isSidebarOpen ? (
                        <X className="h-6 w-6 text-gray-700" />
                    ) : (
                        <Menu className="h-6 w-6 text-gray-700" />
                    )}
                </button>
                <div className="flex items-center ml-3">
                    <img src="/images/logo.png" alt="Logo" className="h-8" />
                    <span className="ml-2 text-lg font-semibold text-black">
                        BP Diagnostic
                    </span>
                </div>
            </div>

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white text-black transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none",
                    "lg:translate-x-0",
                    !isSidebarOpen && "-translate-x-full"
                )}
            >
                {/* Logo - Hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex h-16 items-center px-6 bg-white border-b border-gray-200">
                    <img src="/images/logo.png" alt="Logo" className="h-8" />
                    <span className="ml-3 text-lg font-semibold text-black">
                        BP Diagnostic
                    </span>
                </div>

                {/* Mobile Header inside Sidebar */}
                <div className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="h-8"
                        />
                        <span className="ml-2 text-lg font-semibold text-black">
                            BP Diagnostic
                        </span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                    >
                        <X className="h-5 w-5 text-gray-700" />
                    </button>
                </div>

                {/* Navigation */}
                <nav
                    className="mt-6 px-3 space-y-1 overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 240px)" }}
                >
                    {navigation.map((item) =>
                        !item.children ? (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() =>
                                    window.innerWidth < 1024 &&
                                    setIsSidebarOpen(false)
                                }
                                className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors touch-manipulation",
                                    item.routeName &&
                                        route().current(item.routeName)
                                        ? "bg-[#990000] text-white"
                                        : "text-black hover:bg-[#990000]/10 hover:text-[#990000]"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
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
                                            onClick={() =>
                                                window.innerWidth < 1024 &&
                                                setIsSidebarOpen(false)
                                            }
                                            className={cn(
                                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors touch-manipulation",
                                                isActive
                                                    ? "bg-[#990000] text-white"
                                                    : "text-black hover:bg-[#990000]/10 hover:text-[#990000]"
                                            )}
                                        >
                                            <subItem.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                            {subItem.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        )
                    )}
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium">
                        <div className="h-10 w-10 rounded-full bg-red-900 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                            {(user?.name || "User").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-black truncate">
                                {user?.name || "User"}
                            </p>
                            <p className="text-xs text-gray-600 capitalize truncate">
                                {userRole?.replace("_", " ") || "User"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setShowLogoutModal(true);
                            window.innerWidth < 1024 && setIsSidebarOpen(false);
                        }}
                        className="mt-2 flex w-full items-center px-3 py-2 text-sm font-medium bg-[#ac3434] text-white rounded-md hover:bg-[#990000] transition-colors touch-manipulation"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    "pt-16 lg:pt-0",
                    "lg:ml-64"
                )}
            >
                <main className="py-4 sm:py-6">
                    <div className="mx-auto px-4 sm:px-6">{children}</div>
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
