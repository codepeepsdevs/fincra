import { useMutation } from "@tanstack/react-query";
import { loginRequest, registerRequest } from "./auth.apis";
import { AxiosError, AxiosResponse } from "axios";

export const useLogin = (
  onError: (error: AxiosError<{ message: string }>) => void,
  onSuccess: (data: AxiosResponse) => void
) => {
  return useMutation({
    mutationFn: loginRequest,
    onError,
    onSuccess,
  });
};

export const useRegister = (
  onError: (error: AxiosError<{ message: string }>) => void,
  onSuccess: (data: AxiosResponse) => void
) => {
  return useMutation({
    mutationFn: registerRequest,
    onError,
    onSuccess,
  });
};
