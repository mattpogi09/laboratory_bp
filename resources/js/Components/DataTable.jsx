import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';

/**
 * Standardized DataTable Component
 * Provides consistent table styling across the entire application
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions
 * @param {Array} props.data - Array of data rows
 * @param {Object} props.pagination - Pagination object from Laravel
 * @param {Function} props.onSort - Sort handler function
 * @param {Object} props.filters - Current filter state
 * @param {string} props.emptyMessage - Message when no data
 */
export default function DataTable({ 
    columns = [], 
    data = [], 
    pagination = null,
    onSort = null,
    filters = {},
    emptyMessage = "No data available"
}) {
    const handleSort = (column) => {
        if (column.sortable && onSort) {
            onSort(column.key);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            {columns.map((column, index) => (
                                <th 
                                    key={index}
                                    className={`px-4 py-3 text-${column.align || 'left'} text-sm font-medium text-gray-700`}
                                >
                                    {column.sortable ? (
                                        <div 
                                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                            onClick={() => handleSort(column)}
                                        >
                                            {column.header}
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    ) : (
                                        column.header
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr 
                                    key={rowIndex}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {columns.map((column, colIndex) => (
                                        <td 
                                            key={colIndex}
                                            className={`px-4 py-3 text-${column.align || 'left'} text-sm text-gray-900`}
                                        >
                                            {column.render ? column.render(row) : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => pagination.prev_page_url && router.visit(pagination.prev_page_url)}
                                disabled={!pagination.prev_page_url}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <span className="text-sm text-gray-600 hidden sm:block">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <button
                                onClick={() => pagination.next_page_url && router.visit(pagination.next_page_url)}
                                disabled={!pagination.next_page_url}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
