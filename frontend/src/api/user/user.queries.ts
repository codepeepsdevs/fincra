import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fundAccount,
  getFxConversionChartData,
  getFxConversionHistory,
  getUserAccounts,
} from "./user.apis";
import { AxiosError, AxiosResponse } from "axios";

export const useGetUserAccounts = () => {
  return useQuery({
    queryKey: ["user-accounts"],
    queryFn: getUserAccounts,
  });
};

export const useFundAccount = (
  onError: (error: AxiosError<{ message: string }>) => void,
  onSuccess: (data: AxiosResponse) => void
) => {
  return useMutation({
    mutationFn: fundAccount,
    onError,
    onSuccess,
  });
};

export const useGetFxConversionHistory = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["fx-conversion-history", page, limit],
    queryFn: () => getFxConversionHistory({ page, limit }),
  });
};

export const useGetFxConversionChartData = (period: string) => {
  return useQuery({
    queryKey: ["fx-conversion-chart-data", period],
    queryFn: () => getFxConversionChartData({ period }),
  });
};
