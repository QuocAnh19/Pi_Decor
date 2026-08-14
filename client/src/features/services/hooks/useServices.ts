import { useState } from "react";
import type { ServiceCategory } from "../../../lib/types";

export function useServices() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);

  const handleOpenCategory = (category: ServiceCategory) => {
    setActiveCategory(category);
  };

  const handleCloseCategory = () => {
    setActiveCategory(null);
  };

  return {
    activeCategory,
    handleOpenCategory,
    handleCloseCategory,
  };
}
