export default function EmptyState({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 text-center max-w-md">
                {description}
            </p>
        </div>
    );
}
