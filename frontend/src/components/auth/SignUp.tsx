"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import { DarkLogo, LightLogo } from "../../../public/images";
import CustomButton from "../shared/Button";
import Input from "../shared/Input";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRegister } from "@/api/auth/auth.queries";

const schema = yup.object().shape({
  fullName: yup.string().required("Full name is required"),

  email: yup
    .string()
    .email("Email format is not valid")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Passwords must match")
    .required("Confirm password is required"),
});

type SignUpFormData = yup.InferType<typeof schema>;

const SignUp = () => {
  const router = useRouter();
  const form = useForm<SignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
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

  const onSuccess = () => {
    toast.dismiss();
    toast.success("Signup successful");
    router.replace("/login");
  };

  const { mutate: registerUser, isPending: registerPending } = useRegister(
    onError,
    onSuccess
  );

  const onSubmit = (data: SignUpFormData) => {
    registerUser({
      fullname: data.fullName,
      email: data.email,
      password: data.password,
    });
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

      <div className="relative w-full lg:w-1/2 flex items-center justify-center py-15 z-10">
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
            <h2 className="font-semibold text-2xl">Create your Account</h2>

            <form
              className="w-full flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="text-left flex flex-col gap-1">
                <Input
                  label="Full Name"
                  type="text"
                  id="fullName"
                  placeholder="Enter your full name"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <span className="text-red-500 text-xs">
                    {errors.fullName.message}
                  </span>
                )}
              </div>

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

              <div className="text-left flex flex-col gap-1">
                <Input
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  placeholder="Enter your password"
                  {...register("confirmPassword")}
                />

                {errors.confirmPassword && (
                  <span className="text-red-500 text-xs">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <CustomButton
                type="submit"
                isLoading={registerPending}
                disabled={!isValid}
                className={classNames(
                  "mt-2 text-white py-4 text-lg",
                  !isValid && "opacity-70 cursor-not-allowed"
                )}
              >
                Create Account
              </CustomButton>

              <a
                onClick={() => router.push("/login")}
                className="text-primary font-semibold cursor-pointer text-lg mt-5"
              >
                Login To Existing Account
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
