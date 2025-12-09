import { useEffect, useState } from "react";
import { useFormContext, SubmitHandler } from "react-hook-form";
import { SHIPPING_METHODS } from "@/utils/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { usePostForm } from "../../PostFormProvider";
import { useTranslations } from "next-intl";
import type { PostFormData } from "../../schema";
import InputField from "@/components/shared/InputField";
import BoostAndPublish from "@/components/modals/BoostAndPublish";
import FormFooter from "../FormFooter";
import { toast } from "sonner";

export default function PriceDetailsStep({
  back,
  postId,
}: {
  back: () => void;
  postId?: number;
}) {
  const {
    register,
    watch,
    trigger,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useFormContext<PostFormData>();

  const [show, setShow] = useState(false);
  const [deliveryError, setDeliveryError] = useState(false);
  const { savePost, savePromote, isSavingNormal, isSavingPromote } =
    usePostForm();
  const selectedDelivery = watch("delivery_method");
  const t = useTranslations("manage_post");

  const handleNextClick = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check offline status
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error(t("offline"));
      return;
    }

    const isValid = await trigger("price");
    if (!selectedDelivery) {
      setDeliveryError(true);
      return;
    } else {
      setDeliveryError(false);
    }

    if (isValid) {
      if (postId) {
        handleSubmit(onSubmit)();
      } else {
        setShow(true);
      }
    } else {
      toast.error(t("form_error"));
    }
  };

  useEffect(() => {
    const handleCloseModal = () => setShow(false);
    window.addEventListener("close-post-modal", handleCloseModal);
    return () =>
      window.removeEventListener("close-post-modal", handleCloseModal);
  }, []);

  const onSubmit: SubmitHandler<PostFormData> = (data) => savePost(data);
  const onSubmitWithPromote: SubmitHandler<PostFormData> = (data) =>
    savePromote(data);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleNextClick}>
      <InputField
        label={t("price")}
        id="price"
        placeholder="$0.00"
        {...register("price")}
        error={errors.price?.message ? t(errors.price?.message) : undefined}
        className="w-full"
      />

      <div className="my-3 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="firm_price"
            checked={watch("firm_price") === 1}
            onCheckedChange={(checked) =>
              setValue("firm_price", checked ? 1 : 0)
            }
          />
          <Label htmlFor="firm_price">{t("firm_price")}</Label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="virtual_tour"
            checked={watch("virtual_tour") === 1}
            onCheckedChange={(checked) =>
              setValue("virtual_tour", checked ? 1 : 0)
            }
          />
          <Label htmlFor="virtual_tour">{t("virtual_tour")}</Label>
        </div>
      </div>
      <div>
        <h6 className="font-bold text-sm mb-2">{t("delivery_methods")}</h6>
        <div className="flex gap-2 md:flex-row flex-col">
          {SHIPPING_METHODS.map((method) => (
            <label
              key={method.value}
              htmlFor={method.value}
              className={`w-full rounded-[8px] border cursor-pointer py-3 px-4 text-center shadow-xs transition-all duration-300 ease-in-out hover:bg-[var(--mainColor)] hover:text-white
                ${
                  selectedDelivery === method.value
                    ? "bg-[var(--mainColor)] text-white border-[var(--mainColor)]"
                    : "border-[var(--lightBorderColor)]"
                }`}
            >
              <input
                type="radio"
                id={method.value}
                value={method.value}
                {...register("delivery_method")}
                className="hidden"
              />
              {method.name}
            </label>
          ))}
        </div>
        
        {deliveryError && (
          <p className="text-red-500 mt-2 text-xs">
            {t("choose_delivery_methods")}
          </p>
        )}
      </div>

      <FormFooter

        back={back}
        nextBtnText={postId ? t("update_post") : t("confirm_publish")}
      />

      <BoostAndPublish
        show={show}
        isPromoting={isSavingPromote}
        isSaving={isSavingNormal}
        handleClose={() => setShow(false)}
        addPost={handleSubmit(onSubmit)}
        addAndPromote={handleSubmit(onSubmitWithPromote)}
      />
    </form>
  );
}
