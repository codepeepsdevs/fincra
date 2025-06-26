const BalanceSkeleton = () => {
  return (
    <div className="flex items-center justify-center gap-4 p-6 rounded-xl border border-[#F4F4F4] animate-pulse">
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
};

export default BalanceSkeleton;
