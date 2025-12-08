import { create } from "zustand";
import { Category } from "@/types/category";

interface CategoryStore {
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category) => void;
  clearCategory: () => void;
}

export const useCategoryStore = create < CategoryStore > ((set) => ({
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  clearCategory: () => set({ selectedCategory: null }),
}));
