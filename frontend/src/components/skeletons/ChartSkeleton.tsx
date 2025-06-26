const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[300px] max-h-[400px] flex flex-col animate-pulse">
      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-48"></div>

        <div className="flex items-center gap-3">
          {/* Currency Selection Checkboxes */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>

          {/* Period Selector */}
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Chart Container */}
        <div className="flex-1 bg-gray-50 rounded-lg relative overflow-hidden">
          {/* Chart Lines */}
          <div className="absolute inset-0 p-4">
            {/* Y-axis labels */}
            <div className="h-full flex flex-col justify-between">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded w-12"></div>
              ))}
            </div>
          </div>

          {/* Chart Content */}
          <div className="absolute inset-0 p-4 pl-16 pt-8">
            {/* Grid Lines */}
            <div className="h-full flex flex-col justify-between">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border-b border-gray-100"></div>
              ))}
            </div>

            {/* Chart Lines Animation */}
            <div className="absolute inset-0 p-4 pl-16 pt-8">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Animated chart lines */}
                <path
                  d="M0,80 Q20,60 40,70 T80,50 T100,30"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                <path
                  d="M0,70 Q20,50 40,60 T80,40 T100,20"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <path
                  d="M0,60 Q20,40 40,50 T80,30 T100,10"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </svg>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pl-16">
            <div className="flex justify-between">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-3 bg-gray-200 rounded w-8"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSkeleton;
