import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import DynamicOPtions from "../DynamicOPtions";
import ExtraFeatures from "../ExtraFeatures";
import SelectField from "@/components/shared/SelectField";
import FormFooter from "../FormFooter";
import { useCategoryStore } from "../../store";

type propTypes = {
  next: () => void;
  back: () => void;
  categoryOptions?: {
    id: number;
    title: string;
    type: "input" | "select";
    values: { id: number; title: string }[];
  }[];
};

export default function MoreDetailsStep({
  next,
  back,
  categoryOptions = [],
}: propTypes) {
  const {
    trigger,
    control,
    formState: { errors },
  } = useFormContext();

  const t = useTranslations("manage_post");

  const { selectedCategory } = useCategoryStore();
  console.log("selectedCategory", selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await trigger(["features", "condition", "options"]);

    if (isValid) next();
  };

  return (
    <form className="flex flex-col gap-[16px]" onSubmit={handleSubmit}>
      {/* {selectedCategory?.is_condition && ( */}
      {selectedCategory?.type == "product" && (
        <Controller
          name="condition"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("condition")}
              id="condition"
              placeholder={t("select_condition")}
              error={
                errors.condition?.message
                  ? t(errors.condition?.message as string)
                  : undefined
              }
              value={field.value}
              onChange={field.onChange}
              options={[
                { label: t("new"), value: "new" },
                { label: t("used"), value: "used" },
              ]}
            />
          )}
        />
      )}
      <DynamicOPtions categoryOptions={categoryOptions} />

      <ExtraFeatures />

      <FormFooter back={back} />
    </form>
  );
}
