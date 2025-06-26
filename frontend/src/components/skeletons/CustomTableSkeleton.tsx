const TableSkeleton = () => {
  return (
    <div className="overflow-x-auto rounded border border-gray-100 shadow">
      <table className="min-w-full bg-white">
        <thead className="bg-[#1C065A] text-white">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Date/Time</th>
            <th className="px-4 py-3 text-left font-semibold">From</th>
            <th className="px-4 py-3 text-left font-semibold">To</th>
            <th className="px-4 py-3 text-left font-semibold">Amount</th>
            <th className="px-4 py-3 text-left font-semibold">Rate</th>
            <th className="px-4 py-3 text-left font-semibold">Converted</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr
              key={index}
              className={`text-sm ${
                index % 2 === 0 ? "bg-white" : "bg-gray-100"
              }`}
            >
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
