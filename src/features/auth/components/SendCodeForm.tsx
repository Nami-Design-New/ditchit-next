"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useResetPasswordStore } from "../store";
import { sendCode } from "../service";
import { useTranslations } from "next-intl";
import InputField from "@/components/shared/InputField";
import Image from "next/image";

export default function SendCodeForm() {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, setIsPending] = useState<boolean>(false);
  const setEmail = useResetPasswordStore((state) => state.setEmail);
  type EmailFormValues = z.infer<typeof emailSchema>;

  const emailSchema = z.object({
    email: z.string().email(t("auth.email_validation")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>({
    mode: "onChange",
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (values: EmailFormValues) => {
    if (!navigator.onLine) {
      toast.error(t("error.offline"));
      return;
    }
    setIsPending(true);
    try {
      const res = await sendCode(values.email);

      // console.log(res);
      if (res.code === 200) {
        document.cookie = `verifyEmail=${values.email}; path=/; max-age=3600`;
        setEmail(values.email);
        router.push("/reset-password/verify-otp");
        toast.success(t("auth.code_sent", { email: values.email }));
      } else {
        toast.error(res.message || "Failed to send code");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("error.offline"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      className="isolate p-[30px] rounded-[14px] shadow-[var(--BigShadow)] border-none flex flex-col gap-[16px]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Image
        className="w-full max-h-[200px] aspect-[1] object-contain"
        src="/images/login.svg"
        alt="login"
        width={500}
        height={300}
      />

      <InputField
        label={t("auth.email")}
        type="email"
        id="email"
        placeholder={t("auth.email")}
        {...register("email")}
        error={errors.email?.message}
      />

      <button
        type="submit"
        className="customBtn w-full rounded-full mt-3"
        disabled={isPending}
      >
        {isPending ? t("auth.loading") : t("auth.send_code")}
      </button>
    </form>
  );
}
