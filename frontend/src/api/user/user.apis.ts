import { request } from "@/utils/axios";

export const getUserAccounts = async () => {
  return request({ url: `/user/accounts` });
};

export const fundAccount = async (data: {
  currency: string;
  amount: number;
}) => {
  return request({ url: `/user/fund-account`, method: "POST", data: data });
};

export const getFxConversionHistory = async (data: {
  page: number;
  limit: number;
}) => {
  return request({
    url: `/user/conversion-history?page=${data.page}&limit=${data.limit}`,
  });
};

export const getFxConversionChartData = async (data: { period: string }) => {
  return request({
    url: `/user/conversion-chart-data?period=${data.period}`,
  });
};
