import { cn } from '@/lib/utils';

const variants = {
    default: 'text-gray-900',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
};

export default function StatsCards({ stats }) {
    const cards = [
        {
            label: "Today's Transactions",
            value: stats?.todayTransactions ?? 0,
            variant: 'default',
        },
        {
            label: 'Pending Lab',
            value: stats?.pendingLab ?? 0,
            variant: 'warning',
        },
        {
            label: 'In Progress',
            value: stats?.inProgressLab ?? 0,
            variant: 'info',
        },
        {
            label: 'Completed Today',
            value: stats?.completedToday ?? 0,
            variant: 'success',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {cards.map((card) => (
                <div key={card.label} className="rounded-xl bg-white p-5 shadow">
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <p className={cn('mt-2 text-3xl font-semibold', variants[card.variant])}>
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

