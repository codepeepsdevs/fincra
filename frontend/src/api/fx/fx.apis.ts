import { request } from "@/utils/axios";

export const getConversionRate = async (data: {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}) => {
  return request({
    url: `/fx/rate?from=${data.fromCurrency}&to=${data.toCurrency}&amount=${data.amount}`,
  });
};

export const convertCurrency = async (data: {
  from: string;
  to: string;
  amount: number;
  rate: number;
}) => {
  return request({
    url: `/fx/convert`,
    method: "POST",
    data: data,
  });
};
