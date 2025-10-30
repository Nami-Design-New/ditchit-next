"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useHomeFilter } from "@/features/listing/store";
import { saveLocationFilters } from "@/features/listing/action";
import { SHIPPING_METHODS } from "@/utils/constants";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useMemo,
  useCallback,
} from "react";
import { useTranslations } from "next-intl";
import { Input } from "../ui/input";
import { getCoordinates } from "@/utils/getCoordinatesByZipCode";
import { toast } from "sonner";
import { Country } from "@/types/country";
import SelectField from "../shared/SelectField";
import { getCookie, setCookie } from "@/lib/utils";
import { User } from "@/types/user";
import LocationSearchMap from "./LocationPicker";

interface SearchByModalProps {
  show: boolean;
  handleClose: () => void;
  countries: Country[];
  user: User | null;
}

export default function SearchByModal({
  show,
  handleClose,
  countries,
  user,
}: SearchByModalProps) {
  const t = useTranslations("common");

  // -------------------------
  // Initial Country
  // -------------------------
  const cookieCountry = getCookie("countryId");
  const initialCountry =
    cookieCountry ||
    user?.country_id?.toString() ||
    countries[0]?.id?.toString() ||
    "";

  const { filter, setFilter } = useHomeFilter();
  const [isPending, startTransition] = useTransition();

  const [selectedCountry, setSelectedCountry] =
    useState<string>(initialCountry);

  // Memoize the country object to avoid causing loops on re-render
  const countryData = useMemo(
    () => countries.find((el) => el.id === Number(selectedCountry)) || null,
    [countries, selectedCountry]
  );

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
    kilometers: number;
  } | null>(null);

  const selectedMethod = filter.delivery_method;

  // -------------------------
  // ZIP Code Handling
  // -------------------------
  const zipCodeCache = useRef<{
    [zipCode: string]: {
      latitude: number;
      longitude: number;
      address: string;
      timestamp: number;
    };
  }>({});

  const zipCodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastZipCodeRef = useRef<string>("");

  const fetchCoordinates = async (zipCode: string) => {
    if (!zipCode || zipCode === lastZipCodeRef.current) return;
    lastZipCodeRef.current = zipCode;

    const cached = zipCodeCache.current[zipCode];
    if (cached && Date.now() - cached.timestamp < 3600000) {
      setFilter({
        latitude: String(cached.latitude),
        longitude: String(cached.longitude),
        address: cached.address,
      });
      return;
    }

    try {
      const result = await getCoordinates(zipCode);
      if (!result) throw new Error("Invalid ZIP");
      zipCodeCache.current[zipCode] = { ...result, timestamp: Date.now() };
      setFilter({
        latitude: String(result.latitude),
        longitude: String(result.longitude),
        address: result.address,
      });
    } catch (err) {
      console.error(err);
      setFilter({ latitude: "", longitude: "", address: "" });
      toast.error(t("zipcode_error") || "Invalid ZIP code");
    }
  };

  const handleZipInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipCode = e.target.value;
    setFilter({ zip_code: zipCode });

    if (zipCodeTimeoutRef.current) clearTimeout(zipCodeTimeoutRef.current);
    zipCodeTimeoutRef.current = setTimeout(
      () => fetchCoordinates(zipCode),
      800
    );
  };

  useEffect(() => {
    return () => {
      if (zipCodeTimeoutRef.current) clearTimeout(zipCodeTimeoutRef.current);
    };
  }, []);

  // -------------------------
  // Country change handler
  // -------------------------
  const handleCountryChange = (val: string) => {
    setSelectedCountry(val);
    setSelectedLocation(null);

    // Reset filters safely
    setFilter({
      zip_code: "",
      latitude: "",
      longitude: "",
      address: "",
      kilometers: 60,
      delivery_method: filter.delivery_method,
    });
  };

  // -------------------------
  // Apply / Save Filters
  // -------------------------
  const handleApplyFilters = () => {
    if (zipCodeTimeoutRef.current) clearTimeout(zipCodeTimeoutRef.current);

    startTransition(() => {
      const lat = selectedLocation?.lat || filter.latitude;
      const lng = selectedLocation?.lng || filter.longitude;
      const address = selectedLocation?.address || filter.address;

      if (!lat || !lng) {
        toast.error(
          t("location_required") || "Please select a valid location."
        );
        return;
      }

      setFilter({ latitude: String(lat), longitude: String(lng), address });
      saveLocationFilters({
        zip_code: String(filter.zip_code),
        latitude: String(lat),
        longitude: String(lng),
        address,
        kilometers: String(filter.kilometers || 60),
      });

      // Save current country selection
      setCookie("countryId", selectedCountry);
      handleClose();
    });
  };
  const handleMapChange = useCallback(
    (pos: { lat: number; lng: number; address?: string }) => {
      setSelectedLocation({
        ...pos,
        kilometers: filter.kilometers || 60,
      });
    },
    [filter.kilometers]
  );
  // -------------------------
  // Render
  // -------------------------
  return (
    <Dialog open={show} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md p-6 rounded-lg shadow-xl space-y-6 overflow-y-auto max-h-[95vh]">
        <DialogHeader className="relative">
          <DialogTitle className="text-[28px] font-bold">
            {t("location")}
          </DialogTitle>
          <DialogClose className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 focus:outline-none" />
        </DialogHeader>

        {/* Delivery Methods */}
        <div className="flex flex-col gap-1">
          <Label className="font-bold mb-2">{t("delivery_methods")}</Label>
          <RadioGroup
            value={selectedMethod || ""}
            onValueChange={(val) => setFilter({ delivery_method: val })}
            className="flex flex-col gap-3"
          >
            {SHIPPING_METHODS.map((item) => (
              <div
                key={item.value}
                className="flex items-center gap-3 rtl:flex-row-reverse"
              >
                <RadioGroupItem
                  value={item.value}
                  id={item.value}
                  className="border-[1px] border-[var(--darkColor)] data-[state=checked]:bg-[var(--mainColor)] data-[state=checked]:border-[var(--mainColor)]"
                />
                <Label htmlFor={item.value}>{t(item.name)}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Country Select */}
        <SelectField
          label={t("country")}
          id="country_id"
          value={selectedCountry}
          onChange={handleCountryChange}
          options={countries.map((c) => ({
            label: c.title || "",
            value: c.id?.toString() || "",
          }))}
          placeholder={t("search")}
        />

        {/* ZIP or Map */}
        {selectedCountry === "1" ? (
          <div className="flex flex-col gap-6">
            <div className="grid w-full gap-1 relative">
              <Label htmlFor="zip" className="font-bold mb-2">
                {t("enter_zip")}
              </Label>
              <Input
                id="zip"
                placeholder={t("enter_zip")}
                value={filter.zip_code || ""}
                onChange={handleZipInput}
                className="px-4 h-[48px] rounded-[12px] border-[var(--lightBorderColor)]"
              />
            </div>
            <input
              id="address"
              readOnly
              value={filter.address || ""}
              className="px-2 text-xs -mt-5 h-[28px] border-[var(--lightBorderColor)] border-t-0 border-r-0 border-l-0 shadow-none"
            />
          </div>
        ) : (
          <div className="py-2 space-y-4">
            <h1 className="font-semibold -mt-8 mb-0">{t("search")}</h1>
            {/* ✅ Enhanced map component */}
            <LocationSearchMap
              key={countryData?.code}
              countryData={countryData || undefined}
              onChange={handleMapChange}
            />
          </div>
        )}

        {/* Distance Range */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="distanceRange" className="font-bold">
            {t("miles")}:
          </Label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="distanceRange"
              min="0"
              max="100"
              step="1"
              value={filter.kilometers || 60}
              onChange={(e) =>
                setFilter({ kilometers: Number(e.target.value) })
              }
              className="flex-1 h-[10px] rounded-full bg-[#ddd] accent-[var(--mainColor)] appearance-none"
            />
            <div className="relative min-w-[100px] px-6 py-2 bg-[var(--mainColor)] text-white rounded-md flex justify-center items-center gap-1 text-sm">
              <span className="font-bold">
                {filter.kilometers === 100
                  ? t("maximum")
                  : `${filter.kilometers} ${t("miles")}`}
              </span>
              <div className="absolute w-4 h-4 bg-[var(--mainColor)] rotate-45 start-[-8px] top-1/2 -translate-y-1/2 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Apply */}
        <div className="flex items-center gap-2 mb-0">
          <button
            className="w-full px-4 py-2 rounded-full bg-[var(--mainColor)] text-white font-medium"
            onClick={handleApplyFilters}
            disabled={isPending}
          >
            {isPending ? t("loading") : t("change")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
