"use client";

import { useEffect, useState } from "react";
import { AvatarUpload } from "@/components/shared/AvatarUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/features/auth/store";
import { editProfileFormValues, editProfileSchema } from "../schema";
import InputField from "@/components/shared/InputField";
import clientAxios from "@/lib/axios/clientAxios";
import ZipMapSearch from "@/components/shared/ZipMapSearch";
import { Country } from "@/types/country";
import SelectField from "@/components/shared/SelectField";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getCountries } from "@/services/getCountries";
import { saveLocationFilters } from "@/features/listing/action";

export default function EditProfileForm({
  countries,
}: {
  countries: Country[];
}) {
  const locale = useLocale();
  const [countryOptions, setCountryOptions] = useState<Country[]>(countries);
  const [countryPage, setCountryPage] = useState<number>(1);
  const [countriesHasMore, setCountriesHasMore] = useState<boolean>(true);
  const [countriesLoading, setCountriesLoading] = useState<boolean>(false);
  const { user, setUser } = useAuthStore();
  const [isPending, setIsPending] = useState(false);
  const t = useTranslations("auth");

  const methods = useForm<editProfileFormValues>({
    mode: "onChange",
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      zip_code: "",
      address: "",
      country_id: "",
      phone: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = methods;

  //  Reset form once user data is ready (after refresh)
  useEffect(() => {
    if (user?.id) {
      reset({
        name: user.name,
        email: user.email,
        zip_code: user.zip_code?.toString(),
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        country_id: user.country_id?.toString() ?? "",
        phone: user.phone || "",
      });
    }
  }, [user, reset]);

  //*********** sure country list includes user's country
  useEffect(() => {
    if (!user?.country) return;

    const exists = countryOptions.some((c) => c.id === user.country.id);

    if (!exists) {
      // Ensure the object satisfies the Country type (provide missing center_lat/center_lng)
      const countryToAdd = {
        ...(user.country as  Partial<Country>),
        center_lat: (user.country as  Partial<Country>).center_lat ?? 0,
        center_lng: (user.country as  Partial<Country>).center_lng ?? 0,
      } as Country;

      setCountryOptions((prev) => [...prev, countryToAdd]);
    }
  }, [user, countryOptions]);

  const selectedCountryId = watch("country_id");
  const countryData = countryOptions.find(
    (c) => c.id.toString() === selectedCountryId
  );

  // 🧩 Don’t render form until user exists (so default values are ready)
  if (!user) {
    return <div className="text-center py-10">{t("loading")}</div>;
  }

  const handleFormSubmit = async (data: editProfileFormValues) => {
    setIsPending(true);
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "image" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    try {
      const res = await clientAxios.post("/profile/updateProfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.data.code === 200) {
        // console.log("edit profile", res.data);

        setUser(res.data.data.user);
        saveLocationFilters({
          zip_code: String(res.data.data.user.zip_code),
          latitude: res.data.data.user.latitude,
          longitude: res.data.data.user.longitude,
          address: res.data.data.user.address,
          countryId: res.data.data.user.country_id,
        });
        toast.success(t("update"));
      } else {
        toast.error(res?.data.message || "update profile failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(t("something_went_wrong"));
    } finally {
      setIsPending(false);
    }
  };

  const loadMoreCountries = async () => {
    if (countriesLoading || !countriesHasMore) return;
    try {
      setCountriesLoading(true);
      const nextPage = countryPage + 1;
      const res = await getCountries(locale, nextPage, 15);
      const newItems = res.data?.data || [];
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

  // console.log(
  //   "searchByModal country",
  //   countryOptions,
  //   countryPage,
  //   countryData,
  //   user.country
  // );
  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-[16px]"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <AvatarUpload
          onImageChange={(file) => setValue("image", file)}
          initialImage={user?.image}
        />

        <InputField
          label={t("user_name")}
          id="username"
          placeholder={t("user_name")}
          {...register("name")}
          error={errors.name?.message ? t(errors.name?.message) : undefined}
        />

        <InputField
          disabled
          label={t("email")}
          type="email"
          id="email"
          placeholder={t("email")}
          {...register("email")}
          error={errors.email?.message ? t(errors.email?.message) : undefined}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                {t("phone_number")}
              </label>

              <PhoneInput
                country={user?.country?.code?.toLowerCase() || "us"}
                value={field.value || ""}
                onChange={(phone) => field.onChange(phone)}
                enableSearch
                searchPlaceholder={t("search_country")}
                inputProps={{ id: "phone", name: "phone", required: true }}
                inputStyle={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid var(--lightBorderColor)",
                  padding: "10px 12px 10px 48px",
                  fontSize: "14px",
                }}
                buttonStyle={{ borderRadius: "8px 0 0 8px" }}
                dropdownStyle={{ zIndex: 10000 }}
              />

              {errors.phone?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {t(errors.phone.message)}
                </p>
              )}
            </div>
          )}
        />

        {/* ✅ Country select now shows correct value after refresh */}
        <Controller
          name="country_id"
          control={control}
          render={({ field }) => {
            const allCountryOptions =
              countryOptions?.map((country) => ({
                label: country.title,
                value: country.id.toString(),
              })) || [];

            // Determine selected country correctly
            // const selectedCountry =
            //   field.value || user?.country_id?.toString() || "";
            const selectedCountry =
              field.value || user?.country_id?.toString() || "";


            return (
              <SelectField
                label={t("country")}
                id="country_id"
                value={selectedCountry}
                onChange={(selectedValue) => field.onChange(selectedValue)}
                options={allCountryOptions}
                onLoadMore={loadMoreCountries}
                hasMore={countriesHasMore}
                loading={countriesLoading}
                placeholder={t("select_country")}
                error={
                  errors.country_id?.message
                    ? t(errors.country_id?.message)
                    : undefined
                }
              />
            );
          }}
        />

        {watch("country_id") === "1" && (
          <>
            <InputField
              label={t("zip_code")}
              id="zip_code"
              placeholder={t("enter_zip")}
              {...register("zip_code")}
              error={
                errors.zip_code?.message
                  ? t(errors.zip_code?.message)
                  : undefined
              }
            />
            <input
              id="address"
              readOnly
              {...register("address")}
              className="px-2 text-xs -mt-5 h-[28px] border-[var(--lightBorderColor)] border-t-0 border-r-0 border-l-0 shadow-none"
            />
          </>
        )}

        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />

        {watch("country_id") !== "1" ? (
          <ZipMapSearch
            countryId={watch("country_id")}
            country={countryData as Country}
          />
        ) : (
          <div className="hidden">
            <ZipMapSearch
              countryId={watch("country_id")}
              country={countryData as Country}
            />
          </div>
        )}

        <button
          type="submit"
          className="customBtn rounded-full w-fit px-12 ms-auto me-0 mt-4"
          disabled={isPending}
        >
          {isPending ? t("loading") : t("update")}
        </button>
      </form>
    </FormProvider>
  );
}


// ///////////////// code before handle reload country select issue ////////////////
// "use client";

// import { useEffect, useState } from "react";
// import { AvatarUpload } from "@/components/shared/AvatarUpload";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Controller, FormProvider, useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { useLocale, useTranslations } from "next-intl";
// import { useAuthStore } from "@/features/auth/store";
// import { editProfileFormValues, editProfileSchema } from "../schema";
// import InputField from "@/components/shared/InputField";
// import clientAxios from "@/lib/axios/clientAxios";
// import ZipMapSearch from "@/components/shared/ZipMapSearch";
// import { Country } from "@/types/country";
// import SelectField from "@/components/shared/SelectField";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import { getCountries } from "@/services/getCountries";
// import { saveLocationFilters } from "@/features/listing/action";

// export default function EditProfileForm({
//   countries,
// }: {
//   countries: Country[];
// }) {
//   const locale = useLocale();
//   const [countryOptions, setCountryOptions] = useState<Country[]>(countries);
//   const [countryPage, setCountryPage] = useState<number>(1);
//   const [countriesHasMore, setCountriesHasMore] = useState<boolean>(true);
//   const [countriesLoading, setCountriesLoading] = useState<boolean>(false);
//   const { user, setUser } = useAuthStore();
//   const [isPending, setIsPending] = useState(false);
//   const t = useTranslations("auth");

//   const methods = useForm<editProfileFormValues>({
//     mode: "onChange",
//     resolver: zodResolver(editProfileSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       zip_code: "",
//       address: "",
//       country_id: "",
//       phone: "",
//     },
//   });

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     reset,
//     control,
//     watch,
//     formState: { errors },
//   } = methods;

//   //  Reset form once user data is ready (after refresh)
//   useEffect(() => {
//     if (user?.id) {
//       reset({
//         name: user.name,
//         email: user.email,
//         zip_code: user.zip_code?.toString(),
//         address: user.address,
//         latitude: user.latitude,
//         longitude: user.longitude,
//         country_id: user.country_id?.toString() ?? "",
//         phone: user.phone || "",
//       });
//     }
//   }, [user, reset]);

//   const selectedCountryId = watch("country_id");
//   const countryData = countryOptions.find(
//     (c) => c.id.toString() === selectedCountryId
//   );

//   // 🧩 Don’t render form until user exists (so default values are ready)
//   if (!user) {
//     return <div className="text-center py-10">{t("loading")}</div>;
//   }

//   const handleFormSubmit = async (data: editProfileFormValues) => {
//     setIsPending(true);
//     const formData = new FormData();

//     Object.entries(data).forEach(([key, value]) => {
//       if (value !== undefined && value !== null) {
//         if (key === "image" && value instanceof File) {
//           formData.append(key, value);
//         } else {
//           formData.append(key, value.toString());
//         }
//       }
//     });

//     try {
//       const res = await clientAxios.post("/profile/updateProfile", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (res?.data.code === 200) {
//         console.log('edit profile' , res.data);

//         setUser(res.data.data.user);
//         saveLocationFilters({
//           zip_code: String(res.data.data.user.zip_code),
//           latitude: res.data.data.user.latitude,
//           longitude: res.data.data.user.longitude,
//           address: res.data.data.user.address,
//           countryId: res.data.data.user.country_id,
//         });
//         toast.success(t("update"));
//       } else {
//         toast.error(res?.data.message || "update profile failed");
//       }
//     } catch (error) {
//       console.error("Submit error:", error);
//       toast.error(t("something_went_wrong"));
//     } finally {
//       setIsPending(false);
//     }
//   };

//   const loadMoreCountries = async () => {
//     if (countriesLoading || !countriesHasMore) return;
//     try {
//       setCountriesLoading(true);
//       const nextPage = countryPage + 1;
//       const res = await getCountries(locale, nextPage, 15);
//       const newItems = res.data?.data || [];
//       const existingIds = new Set(countryOptions.map((c) => c.id));
//       const merged = [
//         ...countryOptions,
//         ...newItems.filter((c) => !existingIds.has(c.id)),
//       ];
//       setCountryOptions(merged);
//       setCountryPage(nextPage);
//       setCountriesHasMore(Boolean(res.data?.next_page_url));
//     } catch (error) {
//       console.error("Failed to load more countries", error);
//       setCountriesHasMore(false);
//     } finally {
//       setCountriesLoading(false);
//     }
//   };

//   return (
//     <FormProvider {...methods}>
//       <form
//         className="flex flex-col gap-[16px]"
//         onSubmit={handleSubmit(handleFormSubmit)}
//       >
//         <AvatarUpload
//           onImageChange={(file) => setValue("image", file)}
//           initialImage={user?.image}
//         />

//         <InputField
//           label={t("user_name")}
//           id="username"
//           placeholder={t("user_name")}
//           {...register("name")}
//           error={errors.name?.message ? t(errors.name?.message) : undefined}
//         />

//         <InputField
//           disabled
//           label={t("email")}
//           type="email"
//           id="email"
//           placeholder={t("email")}
//           {...register("email")}
//           error={errors.email?.message ? t(errors.email?.message) : undefined}
//         />

//         <Controller
//           name="phone"
//           control={control}
//           render={({ field }) => (
//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="phone"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 {t("phone_number")}
//               </label>

//               <PhoneInput
//                 country={user?.country?.code?.toLowerCase() || "us"}
//                 value={field.value || ""}
//                 onChange={(phone) => field.onChange(phone)}
//                 enableSearch
//                 searchPlaceholder={t("search_country")}
//                 inputProps={{ id: "phone", name: "phone", required: true }}
//                 inputStyle={{
//                   width: "100%",
//                   borderRadius: "8px",
//                   border: "1px solid var(--lightBorderColor)",
//                   padding: "10px 12px 10px 48px",
//                   fontSize: "14px",
//                 }}
//                 buttonStyle={{ borderRadius: "8px 0 0 8px" }}
//                 dropdownStyle={{ zIndex: 10000 }}
//               />

//               {errors.phone?.message && (
//                 <p className="text-red-500 text-xs mt-1">
//                   {t(errors.phone.message)}
//                 </p>
//               )}
//             </div>
//           )}
//         />

//         {/* ✅ Country select now shows correct value after refresh */}
//         <Controller
//           name="country_id"
//           control={control}
//           render={({ field }) => {
//             const allCountryOptions =
//               countryOptions?.map((country) => ({
//                 label: country.title,
//                 value: country.id.toString(),
//               })) || [];

//             // Determine selected country correctly
//             const selectedCountry =
//               field.value || user?.country_id?.toString() || "";

//             return (
//               <SelectField
//                 label={t("country")}
//                 id="country_id"
//                 value={selectedCountry}
//                 onChange={(selectedValue) => field.onChange(selectedValue)}
//                 options={allCountryOptions}
//                 onLoadMore={loadMoreCountries}
//                 hasMore={countriesHasMore}
//                 loading={countriesLoading}
//                 placeholder={t("select_country")}
//                 error={
//                   errors.country_id?.message
//                     ? t(errors.country_id?.message)
//                     : undefined
//                 }
//               />
//             );
//           }}
//         />

//         {watch("country_id") === "1" && (
//           <>
//             <InputField
//               label={t("zip_code")}
//               id="zip_code"
//               placeholder={t("enter_zip")}
//               {...register("zip_code")}
//               error={
//                 errors.zip_code?.message
//                   ? t(errors.zip_code?.message)
//                   : undefined
//               }
//             />
//             <input
//               id="address"
//               readOnly
//               {...register("address")}
//               className="px-2 text-xs -mt-5 h-[28px] border-[var(--lightBorderColor)] border-t-0 border-r-0 border-l-0 shadow-none"
//             />
//           </>
//         )}

//         <input type="hidden" {...register("latitude")} />
//         <input type="hidden" {...register("longitude")} />

//         {watch("country_id") !== "1" ? (
//           <ZipMapSearch
//             countryId={watch("country_id")}
//             country={countryData as Country}
//           />
//         ) : (
//           <div className="hidden">
//             <ZipMapSearch
//               countryId={watch("country_id")}
//               country={countryData as Country}
//             />
//           </div>
//         )}

//         <button
//           type="submit"
//           className="customBtn rounded-full w-fit px-12 ms-auto me-0 mt-4"
//           disabled={isPending}
//         >
//           {isPending ? t("loading") : t("update")}
//         </button>
//       </form>
//     </FormProvider>
//   );
// }
