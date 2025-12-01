"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../store";
import { authAction } from "../actions";
import { useTranslations } from "next-intl";
import InputField from "@/components/shared/InputField";
import FormFooterLink from "@/features/auth/components/FormFooterLink";
import Image from "next/image";
import SocialAuth from "./SocialAuth";
import { saveLocationFilters } from "@/features/listing/action";
import { setCookie } from "@/lib/utils";

export default function LoginForm() {
  const [isPending, setIsPending] = useState<boolean>(false);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore((state) => state);
  const t = useTranslations("auth");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsPending(true);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    try {
      const res = await authAction(formData, "/auth/login");

      if (res.code === 200) {
        setUser(res.data.user);
        setToken(res.data.auth.token);
        // console.log("login response ", res);

        saveLocationFilters({
          zip_code: String(res.data.user.country?.zip_code),
          latitude: res.data.user.country?.center_lat,
          longitude: res.data.user.country?.center_lng,
          address: res.data.user.address,
          countryId: res.data.user.country.id,
          country: res.data.user.country.code,
          // verifyEmail:res.data.user.email,
        });
        setCookie("verifyEmail", res.data.user.email);
        router.push("/");
        toast.success(t("login_success"));
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("something_went_wrong"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="isolate p-[30px] rounded-[14px] shadow-[var(--BigShadow)] border-none flex flex-col gap-[16px]"
    >
      <Image
        className="w-full max-h-[200px] aspect-[1] object-contain"
        src="/images/login.svg"
        alt="login"
        width={500}
        height={300}
      />

      <InputField
        label={t("email")}
        type="email"
        id="email"
        placeholder={t("email")}
        {...register("email")}
        error={errors.email?.message ? t(errors.email.message) : undefined}
      />

      <InputField
        label={t("password")}
        type="password"
        id="password"
        placeholder={t("password")}
        {...register("password")}
        error={
          errors.password?.message ? t(errors.password.message) : undefined
        }
      />

      <FormFooterLink
        // question={t("forget_password")}
        linkText={t("forget_password")}
        href="/reset-password"
      />

      <button
        type="submit"
        className="customBtn w-full rounded-full"
        disabled={isPending}
      >
        {isPending ? t("loading") : t("login")}
      </button>

      <FormFooterLink
        question={t("don't_have_account")}
        linkText={t("create_new_account")}
        href="/register"
      />

      <SocialAuth />
    </form>
  );
}
