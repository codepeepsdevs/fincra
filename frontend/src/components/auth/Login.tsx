"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import React from "react";
import Image from "next/image";
import { DarkLogo, LightLogo } from "../../../public/images";
import CustomButton from "../shared/Button";
import Input from "../shared/Input";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import { useLogin } from "@/api/auth/auth.queries";
import { AxiosError, AxiosResponse } from "axios";
import { User } from "@/constants/types";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import useUserStore from "@/store/user.store";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email format is not valid")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

type LoginFormData = yup.InferType<typeof schema>;

const Login = () => {
  const router = useRouter();

  const { setUser, setIsLoggedIn } = useUserStore();

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isValid } = formState;

  const onError = (error: AxiosError<{ message: string }>) => {
    toast.dismiss();
    const errorMessage = error?.response?.data?.message;
    toast.error(errorMessage || "An error occurred");
  };

  const onSuccess = (response: AxiosResponse) => {
    toast.dismiss();
    const user: User = response?.data?.data?.user;
    const token: string = response?.data?.data?.token;

    Cookies.set("accessToken", token);
    setUser(user);
    setIsLoggedIn(true);
    toast.success("Login successful");
    router.push("/dashboard");
  };

  const { mutate: login, isPending: loginPending } = useLogin(
    onError,
    onSuccess
  );

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="w-full min-h-screen relative flex justify-end bg-auth-bg">
      <div
        className="absolute top-0 left-0 w-full lg:w-1/2 h-full"
        style={{
          backgroundImage:
            "linear-gradient(194deg, #4b3399 28%, #4b3393 44%, #f8ce78 0, #f8ce78 46%, #f5f4f7 0, #f5f4f7)",
          zIndex: 0,
        }}
      ></div>

      {/* Right content */}
      <div className="relative w-full lg:w-1/2  flex items-center justify-center py-10 z-10">
        <div className="w-[90%] sm:w-[80%] md:w-[50%] lg:w-[60%] xl:w-[55%] 2xl:w-[50%] flex flex-col items-center gap-4">
          <Image
            alt="Logo"
            src={DarkLogo}
            className="lg:flex hidden w-25 md:w-30 h-8 md:h-10"
          />
          <Image
            alt="Logo"
            src={LightLogo}
            className="lg:hidden flex w-25 md:w-30 h-8 md:h-10"
          />

          <div className="w-full bg-white text-black rounded-2xl text-center flex flex-col gap-6 p-8 2xl:p-10 pt-12">
            <h2 className="font-semibold text-2xl">Login</h2>

            <form
              className="w-full flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="text-left flex flex-col gap-1">
                <Input
                  label="Email Address"
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="text-left flex flex-col gap-1">
                <Input
                  label="Password"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  {...register("password")}
                />

                {errors.password && (
                  <span className="text-red-500 text-xs">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <CustomButton
                isLoading={loginPending}
                disabled={!isValid}
                type="submit"
                className={classNames(
                  "mt-2 text-white py-4 text-lg",
                  !isValid && "opacity-70 cursor-not-allowed"
                )}
              >
                Log in
              </CustomButton>

              <a
                onClick={() => router.push("/signup")}
                className="text-primary font-semibold cursor-pointer text-lg mt-5"
              >
                Create Account
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
