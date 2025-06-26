import ConversionContent from "@/components/dashboard/conversion/conversionContent";
import ConversionHistory from "@/components/dashboard/conversion/conversionHistory";
import React from "react";

const Conversion = () => {
  return (
    <div className="flex flex-col gap-6 h-full w-full mx-auto p-6">
      <ConversionContent />

      <ConversionHistory />
    </div>
  );
};

export default Conversion;
