import { request } from "@/utils/axios";
import { ILogin, IRegister } from "./auth.types";

export const registerRequest = async (formdata: IRegister) => {
  return request({ url: "/auth/signup", method: "post", data: formdata });
};

export const loginRequest = async (formdata: ILogin) => {
  return request({ url: "/auth/login", method: "post", data: formdata });
};
