import { useMutation, useQuery } from "@tanstack/react-query";
import { convertCurrency, getConversionRate } from "./fx.apis";
import { AxiosError, AxiosResponse } from "axios";

export const useGetCoversionRate = (
  fromCurrency: string,
  toCurrency: string,
  amount: number
) => {
  return useQuery({
    queryKey: ["conversion-rate", fromCurrency, toCurrency],
    queryFn: () => getConversionRate({ fromCurrency, toCurrency, amount }),
    enabled: false,
  });
};

export const useConvertCurrency = (
  onError: (error: AxiosError<{ message: string }>) => void,
  onSuccess: (data: AxiosResponse) => void
) => {
  return useMutation({
    mutationFn: convertCurrency,
    onError,
    onSuccess,
  });
};
