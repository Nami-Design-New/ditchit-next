import { Accordion } from "@/components/ui/accordion";
import { Category } from "@/types/category";
import Categoryfilter from "./Categoryfilter";
import PriceFilter from "./PriceFilter";
import SortBy from "./SortBy";
import Condition from "./Condition";
// import Type from "./Type";

export default function AccordionFilter({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-3"
      className="w-full"
    >
      <SortBy />
      <Condition />
      <Categoryfilter categories={categories} />
      {/* <Type /> */}
      <PriceFilter />
    </Accordion>
  );
}
