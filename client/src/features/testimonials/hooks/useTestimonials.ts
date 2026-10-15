import { useState, useCallback } from "react";
import type { TestimonialItem } from "../../../lib/types";
import { useTestimonialsQuery } from "./testimonials.queries";

export interface LightboxState {
  photos: string[];
  currentIndex: number;
  author?: string;
}

export function useTestimonials() {
  const query = useTestimonialsQuery();
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const loadReviews = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const reviews: TestimonialItem[] = query.data ?? [];

  return {
    reviews,
    loading: query.isLoading,
    visibleCount,
    setVisibleCount,
    isModalOpen,
    setIsModalOpen,
    lightbox,
    setLightbox,
    loadReviews,
  };
}
