import { useState, useMemo, useCallback } from "react";

export interface UseListFiltersOptions<T> {
  items: T[];
  initialTab?: string;
  filterFn: (item: T, query: string, activeTab: string) => boolean;
}

/**
 * Hook quản lý tìm kiếm từ khóa và lọc theo tab danh mục/trạng thái.
 * Gom logic lặp searchQuery + activeTab + useMemo lọc ở các trang quản trị.
 */
export function useListFilters<T>({
  items,
  initialTab = "all",
  filterFn,
}: UseListFiltersOptions<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => filterFn(item, q, activeTab));
  }, [items, searchQuery, activeTab, filterFn]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setActiveTab(initialTab);
  }, [initialTab]);

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredItems,
    resetFilters,
  };
}
