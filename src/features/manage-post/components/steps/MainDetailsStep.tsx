"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import InputField from "@/components/shared/InputField";
import MediaUpload from "@/lib/media/MediaUpload";
import ZipMapSearch from "@/components/shared/ZipMapSearch";
import FormFooter from "../FormFooter";
import SelectField from "@/components/shared/SelectField";
import { Country } from "@/types/country";
import { useState, useEffect } from "react";
import { getCookie } from "@/lib/utils";
import { getCountries } from "@/services/getCountries";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCategoryStore } from "../../store";

type propTypes = {
  next: () => void;
  back: () => void;
  countries: Country[];
};

export default function MainDetailsStep({ next, back, countries }: propTypes) {
  const {
    control,
    register,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [countryOptions, setCountryOptions] = useState<Country[]>(countries);
  const [countriesHasMore, setCountriesHasMore] = useState<boolean>(true);
  const [countriesLoading, setCountriesLoading] = useState<boolean>(false);
  const [countryPage, setCountryPage] = useState<number>(1);
  const locale = useLocale();
  const selectedCountryId = watch("country_id");
  const countryData = countryOptions.find(
    (c) => c.id.toString() === selectedCountryId
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // النوع الحالي من URL
  const [selectedTypeBtn, setSelectedTypeBtn] = useState("");
  const handleClick = (selectedType: string) => {
    setSelectedTypeBtn(selectedType);
    router.push(`?type=${selectedType}`);
  };
  const { selectedCategory } = useCategoryStore();

  const buttonClasses = (btnType: string) =>
    `border border-[var(--lightBorderColor)] !rounded-[14px] aspect-square w-[calc(50%-2px)] flex flex-col justify-center items-center gap-2 text-[14px] capitalize px-4 py-2 ${
      type === btnType ? "bg-green-500 text-white" : "text-[var(--darkColor)]"
    }`;

  const t = useTranslations("manage_post");
  const [countryId, setCountryId] = useState<string>(
    getCookie("countryId") || watch("country_id") || ""
  );
  // Keep state in sync if country_id in form changes externally (e.g., editing post)
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        name === "country_id" &&
        value.country_id &&
        value.country_id !== countryId
      ) {
        setCountryId(value.country_id as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, countryId]);

  useEffect(() => {
    if (countryId) {
      setValue("country_id", countryId, { shouldValidate: true });
    }
  }, [countryId, setValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await trigger([
      "title",
      "description",
      "image",
      "address",
      "latitude",
      "longitude",
      "country_id",
    ]);
    if (isValid) next();
  };

  const loadMoreCountries = async () => {
    if (countriesLoading || !countriesHasMore) return;
    try {
      setCountriesLoading(true);
      const nextPage = countryPage + 1;
      const res = await getCountries(locale, nextPage, 15);
      const newItems = res.data?.data || [];

      // Deduplicate by id
      const existingIds = new Set(countryOptions.map((c) => c.id));
      const merged = [
        ...countryOptions,
        ...newItems.filter((c) => !existingIds.has(c.id)),
      ];
      setCountryOptions(merged);
      setCountryPage(nextPage);
      setCountriesHasMore(Boolean(res.data?.next_page_url));
    } catch (error) {
      console.error("Failed to load more countries", error);
      setCountriesHasMore(false);
    } finally {
      setCountriesLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCategory) return;

    if (selectedCategory.type === "service") {
      router.replace("?type=service");
    } else if (selectedCategory.type === "job") {
      router.replace("?type=hiring");
    }
  }, [selectedCategory, router]);

  return (
    <>
      {" "}
      {selectedCategory?.type === "product" && (
        <div className="flex gap-5 h-32 ">
          <button
            onClick={() => handleClick("wanted")}
            className={buttonClasses("wanted")}
          >
            <Image
              className={`transition-all ${selectedTypeBtn == "wanted" ? "filter brightness-0 invert" : ""}`}
              src="/icons/wanted.svg"
              alt="wanted"
              width={40}
              height={40}
            />
            <span>{"wanted"}</span>
          </button>

          <button
            onClick={() => handleClick("sale")}
            className={buttonClasses("sale")}
          >
            <Image
              className={`transition-all ${selectedTypeBtn == "sale" ? "filter brightness-0 invert" : ""}`}
              src="/icons/sell.svg"
              alt="sell"
              width={40}
              height={40}
            />
            <span>{"sell"}</span>
          </button>
        </div>
      )}
      <form className="flex flex-col gap-[16px]" onSubmit={handleSubmit}>
        <div className="flex gap-4 md:flex-row flex-col">
          <MediaUpload
            name="image"
            label={t("cover_image")}
            className="min-w-[236px]"
          />
          <MediaUpload
            name="images"
            label={t("post_images")}
            multiple
            maxFiles={4}
            className="w-full"
          />
        </div>

        <InputField
          label={t("title")}
          id="title"
          placeholder={t("enter_title")}
          {...register("title")}
          error={
            errors.title?.message
              ? t(errors.title?.message as string)
              : undefined
          }
        />

        <InputField
          label={t("description")}
          id="description"
          placeholder={t("enter_description")}
          {...register("description")}
          error={
            errors.description?.message
              ? t(errors.description?.message as string)
              : undefined
          }
        />

        <Controller
          name="country_id"
          control={control}
          render={({ field }) => {
            const allCountryOptions =
              countryOptions?.map((country) => ({
                label: country.title,
                value: country.id.toString(),
              })) || [];

            return (
              <SelectField
                label={t("country")}
                id="country_id"
                value={countryId || field.value}
                onChange={(val) => {
                  field.onChange(val);
                  setCountryId(val);
                  setValue("zip_code", "");
                  console.log("val :", val);
                }}
                onLoadMore={loadMoreCountries}
                hasMore={countriesHasMore}
                loading={countriesLoading}
                options={allCountryOptions}
                placeholder={t("select_country")}
                error={
                  errors.country_id?.message
                    ? t(errors.country_id?.message as string)
                    : undefined
                }
              />
            );
          }}
        />

        {countryId === "1" && (
          <>
            <InputField
              label={t("zip_code")}
              id="zip_code"
              placeholder={t("enter_zip")}
              {...register("zip_code")}
              error={
                errors.zip_code?.message
                  ? t(errors.zip_code?.message as string)
                  : undefined
              }
            />

            <input
              id="address"
              readOnly
              value={watch("address")}
              {...register("address")}
              className="px-2 text-xs -mt-5 h-[28px] border-[var(--lightBorderColor)] border-t-0 border-r-0 border-l-0 shadow-none"
            />
          </>
        )}

        {countryId !== "1" && countryData ? (
          <ZipMapSearch country={countryData} countryId={countryId} />
        ) : (
          <div className="hidden">
            {countryData && (
              <ZipMapSearch country={countryData} countryId={countryId} />
            )}
          </div>
        )}

        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />

        <FormFooter back={back} />
      </form>
    </>
  );
}
