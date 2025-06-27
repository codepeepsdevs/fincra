"use client";

import { useGetFxConversionChartData } from "@/api/user/user.queries";
import ChartSkeleton from "@/components/skeletons/ChartSkeleton";
import { chartOptions, currencyColors, periodOptions } from "@/constants";
import { ConversionData } from "@/constants/types";
import React, { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";

const ConversionChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([
    "USD",
    "EUR",
    "GBP",
    "NGN",
  ]);
  const [chartDataBackend, setChartDataBackend] = useState<any>([]);

  const { data: _data, isPending } =
    useGetFxConversionChartData(selectedPeriod);

  useEffect(() => {
    if (_data) {
      setChartDataBackend(_data?.data?.data || []);
    }
  }, [_data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const datasets = selectedCurrencies.map((currency) => ({
      label: `${currency} Conversions`,
      data: chartDataBackend?.map(
        (item: any) => item[currency as keyof ConversionData] as number
      ),
      borderColor: currencyColors[currency as keyof typeof currencyColors],
      backgroundColor: `${
        currencyColors[currency as keyof typeof currencyColors]
      }20`,
      tension: 0.4,
      fill: false,
    }));

    return {
      labels: chartDataBackend?.map((item: any) => {
        const date = new Date(item.date);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }),
      datasets,
    };
  }, [chartDataBackend, selectedCurrencies]);

  if (isPending) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 flex-1 w-full min-w-[300px] max-h-[450px] flex flex-col">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold">Conversions Over Time</h3>

        <div className="flex items-center gap-3">
          {/* Currency Selection */}
          <div className="flex items-center gap-2">
            {Object.keys(currencyColors).map((currency) => (
              <label key={currency} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedCurrencies.includes(currency)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCurrencies([...selectedCurrencies, currency]);
                    } else {
                      setSelectedCurrencies(
                        selectedCurrencies.filter((c) => c !== currency)
                      );
                    }
                  }}
                  className="w-3 h-3"
                  style={{
                    accentColor:
                      currencyColors[currency as keyof typeof currencyColors],
                  }}
                />
                <span className="text-xs md:text-sm">{currency}</span>
              </label>
            ))}
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
        <Line
          data={chartData}
          options={{
            ...chartOptions,
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};

export default ConversionChart;
