"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { PostDetailsResponse } from "../post-details/types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PostFormData, postFormDataSchema } from "./schema";
import clientAxios from "@/lib/axios/clientAxios";
import { useCategoryStore } from "./store";

const PostFormContext = createContext<{
  step: number;
  next: () => void;
  back: () => void;
  savePost: (data: PostFormData) => void;
  savePromote: (data: PostFormData) => void;
  isSavingNormal: boolean;
  isSavingPromote: boolean;
} | null>(null);

export const usePostForm = () => {
  const ctx = useContext(PostFormContext);
  if (!ctx) throw new Error("PostFormContext is not available");
  return ctx;
};

export default function PostFormProvider({
  children,
  type,
  post,
}: {
  post?: PostDetailsResponse;
  type?: string;
  children: ReactNode;
}) {
  const { selectedCategory } = useCategoryStore();
  const [step, setStep] = useState(0);
  const router = useRouter();
  const t = useTranslations("manage_post");

  const methods = useForm<PostFormData>({
    resolver: zodResolver(postFormDataSchema),
    mode: "onChange",
    defaultValues: {
      type: post?.type || type,
      category_id: post?.category.id || 0,

      image: post?.image || undefined,
      images: post?.images?.map((img) => img.image) || [],
      title: post?.title || "",
      description: post?.description || "",
      zip_code: post?.zip_code || "",
      address: post?.description || "",
      latitude: post?.latitude || 0,
      longitude: post?.longitude || 0,
      country_id: post?.country?.id?.toString() || "",

      condition: post?.condition || undefined,
      features: post?.features?.map((f) => f.value) || [],
      options:
        post?.options?.map((opt) => ({
          category_option_id: opt.category_option_id,
          value: opt.value,
        })) || [],

      price: post?.price?.toString() || "",
      is_promote: post?.is_promoted === true ? 1 : 0,
      firm_price: post?.firm_price === true ? 1 : 0,
      virtual_tour: post?.virtual_tour === true ? 1 : 0,

      delivery_method:
        post?.delivery_method === "Local + Shipping"
          ? "both"
          : post?.delivery_method,
    },
  });

  // Shared save logic
  const handleSaveRequest = async (data: PostFormData) => {
    const endpoint = post?.id ? `/posts/${post.id}` : "/posts";
    const formData = new FormData();
    console.log(selectedCategory);

    Object.entries(data).forEach(([key, value]) => {
      if (key === "image" || key === "images") return;
      // if (key === "condition" && !selectedCategory?.is_condition) return;

      if (
        key === "condition" &&
        (selectedCategory?.type == "service" || selectedCategory?.type == "job")
      )
        return;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            Object.entries(item).forEach(([k, v]) => {
              formData.append(`${key}[${index}][${k}]`, v);
            });
          } else {
            formData.append(`${key}[]`, item);
          }
        });
      } else {
        formData.append(key, value as string);
      }
    });

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (Array.isArray(data.images)) {
      const fileImages = data.images.filter((img) => img instanceof File);
      fileImages.forEach((img) => {
        formData.append("images[]", img);
      });
    }

    if (post?.id) {
      formData.append("_method", "PUT");
    }

    return await clientAxios.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const onSuccess = (res: {
    data: { code: number; data?: { link?: string }; message?: string };
  }) => {
    if (res.data.code === 200) {
      if (res.data.data?.link) {
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        window.open(
          res.data.data.link,
          "PaymentPopup",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        window.addEventListener("message", (event) => {
          if (event.data.status === "success") {
            toast.success(t("post_published_promoted"));
          } else if (event.data.status === "failed") {
            toast.error(t("promote_error"));
          }
        });
      } else {
        toast.success(t("post_saved"));
      }
      router.push("/profile");
    } else {
      toast.error(res.data.message);
    }
  };

  const onError = (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message || t("something_went_wrong");
    toast.error(message);
  };

  const onSettled = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("close-post-modal"));
    }
  };

  const { mutate: saveNormal, isPending: isSavingNormal } = useMutation({
    mutationFn: handleSaveRequest,
    onSuccess,
    onError,
    onSettled,
  });

  const { mutate: savePromote, isPending: isSavingPromote } = useMutation({
    mutationFn: (data: PostFormData) =>
      handleSaveRequest({ ...data, is_promote: 1 }),
    onSuccess,
    onError,
    onSettled,
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const contextValue = useMemo(
    () => ({
      step,
      next,
      back,
      savePost: saveNormal,
      savePromote,
      isSavingNormal,
      isSavingPromote,
    }),
    [step, saveNormal, savePromote, isSavingNormal, isSavingPromote]
  );

  return (
    <PostFormContext.Provider value={contextValue}>
      <FormProvider {...methods}>{children}</FormProvider>
    </PostFormContext.Provider>
  );
}
