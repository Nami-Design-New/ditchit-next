"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import { ListFilter, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import useUrlFilters from "@/hooks/useFilterParams";
import AccordionFilter from "./AccordionFilter";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FilterSideBar({
  categories,
}: {
  categories: Category[];
}) {
  const { getParam, setParam } = useUrlFilters();
  const [openFilter, setOpenFilter] = useState(false);
  const [searchValue, setSearchValue] = useState(getParam("search") ?? "");
  const t = useTranslations("common");
  const searchParams = useSearchParams();

  useEffect(() => {
    setSearchValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  console.log("search value", searchValue);

  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex-1 w-full p-1 relative bg-[#f3f3f3] border border-[#e6e6e6] rounded-xl"
        onSubmit={(e) => {
          e.preventDefault();
          setParam("search", searchValue);
        }}
      >
        <input
          type="search"
          name="search"
          id="search"
          value={searchValue}
          placeholder={t("search")}
          onChange={(e) => setSearchValue(e.target.value)}
          className="rounded-[100px] p-2 border-none min-h-[40px] bg-transparent placeholder:text-[var(--grayColor)] text-[var(--darkColor)] text-[14px] w-full"
        />

        <button
          type="submit"
          className="absolute end-1 top-[4px] bottom-[4px] p-0 w-9 flex items-center justify-center rounded-xl text-[var(--whiteColor)] bg-[var(--mainColor)]"
        >
          <Search height={20} width={20} />
        </button>
      </form>

      <button
        className="ms-auto flex md:hidden items-center gap-2 text-[14px]"
        onClick={() => setOpenFilter(true)}
      >
        <ListFilter width={16} height={16} /> {t("sort_by")}
      </button>

      <AnimatePresence>
        {openFilter && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed top-0 end-0 w-[100vw] h-[100vh] bg-white z-[9999] p-5 flex flex-col gap-6 overflow-y-auto md:hidden"
          >
            <button
              className="ms-auto w-7 h-7 min-h-[28px] flex items-center justify-center text-[14px] border rounded-full"
              onClick={() => setOpenFilter(false)}
            >
              <X width={16} height={16} />
            </button>

            <div className="w-full rounded-xl border border-[var(--lightBorderColor)]">
              <AccordionFilter categories={categories} />
            </div>
            <button
              className=" flex items-center justify-center bg-green-500 text-[14px] border rounded-full px-12 py-3 text-white mt-auto"
              onClick={() => setOpenFilter(false)}
            >
              See Results
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:flex flex-col gap-6">
        <div className="w-full rounded-xl border border-[var(--lightBorderColor)]">
          <AccordionFilter categories={categories} />
        </div>
      </div>
      <Link
        href={"/posts"}
        className=" flex items-center justify-center py-3  mt-auto hover:scale-105"
      >
        {t("remove_filter")}
      </Link>
    </div>
  );
}
