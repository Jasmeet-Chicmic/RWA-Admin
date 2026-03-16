import { Skeleton } from "@/components/atoms/Skeleton";

const PromoCodeTableLoading = () => {
  return (
    <main className="flex-1 overflow-y-auto animate-pulse px-4 mt-[20px] space-y-6">
      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-72 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {[...Array(8)].map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-4 rounded" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-16 rounded-md" />
                </td>
                <td className="px-4 py-3 space-x-2">
                  <Skeleton className="inline-block h-8 w-16 rounded-md" />
                  <Skeleton className="inline-block h-8 w-16 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col lg:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-4 lg:space-y-0">
        {/* Page size & count */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-40" />
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-md" />
          ))}
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </main>
  );
};

export default PromoCodeTableLoading;
