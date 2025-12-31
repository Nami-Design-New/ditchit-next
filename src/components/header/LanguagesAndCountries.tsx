// "use client";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import { LANGUAGES } from "@/utils/constants";
// import { useLocale, useTranslations } from "next-intl";
// import { usePathname } from "@/i18n/navigation";
// import { useSearchParams } from "next/navigation";
// import { Country } from "@/types/country";
// import Link from "next/link";
// import Image from "next/image";
// import { useQueryClient } from "@tanstack/react-query";
// import { User } from "@/types/user";
// import { getCookie } from "@/lib/utils";
// import { useState, useEffect } from "react";

// export default function LanguagesAndCountries({
//   countries,
//   profileData,
// }: {
//   countries: Country[];
//   profileData: User | null;
// }) {
//   const pathname = usePathname();
//   const locale = useLocale();
//   const searchParams = useSearchParams();
//   const queryString = searchParams.toString();
//   const queryClient = useQueryClient();
//   const t = useTranslations("common");

//   const [currentCountryFlag, setCurrentCountryFlag] = useState<string>(
//     countries.find((c) => c.code === "US")?.flag ?? "/placeholder-flag.png"
//   );

//   useEffect(() => {
//     const updateFlag = () => {
//       if (!profileData) {
//         setCurrentCountryFlag(
//           countries.find((c) => c.code === "US")?.flag ??
//             "/placeholder-flag.png"
//         );
//         return;
//       }

//       const countryFromCookie = getCookie("countryId");
//       if (countryFromCookie) {
//         const countryByCookie = countries.find(
//           (c) => c.id?.toString() === countryFromCookie
//         );
//         if (countryByCookie?.flag) {
//           setCurrentCountryFlag(countryByCookie.flag);
//           return;
//         }
//       }

//       const countryFromProfile = countries.find(
//         (c) => c.id === Number(profileData.country_id)
//       );
//       if (countryFromProfile?.flag) {
//         setCurrentCountryFlag(countryFromProfile.flag);
//         return;
//       }

//       setCurrentCountryFlag(
//         countries.find((c) => c.code === "US")?.flag ?? "/placeholder-flag.png"
//       );
//     };

//     updateFlag();

//     // مراقبة الكوكيز لو اتغيرت
//     const interval = setInterval(updateFlag, 2000); // كل ثانيتين
//     return () => clearInterval(interval);
//   }, [countries, profileData]);

//   function changeLang(newLang: string) {
//     return `/${newLang}${pathname}${queryString ? `?${queryString}` : ""}`;
//   }

//   function revalidateQueries() {
//     queryClient.clear();
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger className="flex items-center gap-2 whitespace-nowrap">
//         <Image
//           src={currentCountryFlag}
//           width={24}
//           height={16}
//           alt="current country"
//           className="w-[24px] h-[18px] object-cover rounded"
//         />
//         <span>|</span>
//         {locale.toUpperCase()}
//       </DropdownMenuTrigger>

//       <DropdownMenuContent className="bg-[var(--whiteColor)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] z-[99999] min-w-[200px] border border-[var(--lightBorderColor)]">
//         <h6 className="px-[16px] py-[8px] text-[var(--mainColor)]">
//           {t("language")}
//         </h6>

//         <div className="max-h-[360px] overflow-y-auto flex-col">
//           {Object.entries(LANGUAGES).map(([code, name]) => (
//             <DropdownMenuItem key={code} className="p-0">
//               <Link
//                 href={changeLang(code)}
//                 onClick={() => revalidateQueries()}
//                 className="flex items-center gap-2 whitespace-nowrap text-[var(--darkColor)] hover:bg-[#f1f1f1] px-3 py-2 text-[14px] w-full rounded-[8px]"
//               >
//                 {name}
//               </Link>
//             </DropdownMenuItem>
//           ))}
//         </div>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LANGUAGES } from "@/utils/constants";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Country } from "@/types/country";
import Link from "next/link";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
// import { User } from "@/types/user";
import { getCookie } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store";

export default function LanguagesAndCountries({
  countries,
  selectedCountryFromApi,
  // profileData,
}: {
  countries: Country[];
  selectedCountryFromApi: Country | null;
  // profileData: User | null;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const queryClient = useQueryClient();
  const t = useTranslations("common");
  const { user } = useAuthStore();

  const [currentCountryFlag, setCurrentCountryFlag] = useState<string>(
    selectedCountryFromApi?.flag ?? "/placeholder-flag.png"
  );

  useEffect(() => {
    const countryFromCookie = getCookie("countryId");
    let selectedCountry: Country | undefined;
    // console.log("profileData it is changed" , profileData);

    if (user && countryFromCookie) {
      // user + cookie → use cookie
      selectedCountry = countries.find(
        (c) => c.id?.toString() === countryFromCookie
      );
    } else if (user && !countryFromCookie) {
      // user + no cookie → use user's profile country
      selectedCountry = countries.find((c) => c.id === Number(user.country_id));
    } else if (!user && countryFromCookie) {
      // no user + cookie → use cookie
      selectedCountry = countries.find(
        (c) => c.id?.toString() === countryFromCookie
      );
    } else {
      // no user + no cookie → default to US
      selectedCountry = countries.find((c) => c.code === "US");
    }

    setCurrentCountryFlag(
      selectedCountryFromApi?.flag ??
        selectedCountry?.flag ??
        "/placeholder-flag.png"
    );
  }, [countries, user, selectedCountryFromApi]);

  function changeLang(newLang: string) {
    return `/${newLang}${pathname}${queryString ? `?${queryString}` : ""}`;
  }

  function revalidateQueries() {
    queryClient.clear();
  }
  // console.log("selected country", selectedCountryFromApi);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 whitespace-nowrap">
        <Image
          src={currentCountryFlag}
          width={24}
          height={16}
          alt="current country"
          className="w-[24px] h-[18px] object-cover rounded"
        />
        <span>|</span>
        {locale.toUpperCase()}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-[var(--whiteColor)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] z-[99999] min-w-[200px] border border-[var(--lightBorderColor)]">
        <h6 className="px-[16px] py-[8px] text-[var(--mainColor)]">
          {t("language")}
        </h6>

        <div className="max-h-[360px] overflow-y-auto flex-col">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <DropdownMenuItem key={code} className="p-0">
              <Link
                href={changeLang(code)}
                onClick={revalidateQueries}
                className="flex items-center gap-2 whitespace-nowrap text-[var(--darkColor)] hover:bg-[#f1f1f1] px-3 py-2 text-[14px] w-full rounded-[8px]"
              >
                {name}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
