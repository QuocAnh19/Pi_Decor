import { useState, useEffect, useCallback } from "react";
import { api } from "../../../lib/api";
import type { TestimonialItem } from "../../../lib/types";

export function useTestimonials() {
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const loadReviews = useCallback(() => {
    setLoading(true);
    return api
      .getTestimonials()
      .then((data) => setReviews(data))
      .catch((err) => console.warn("Failed to load approved testimonials:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    loading,
    visibleCount,
    setVisibleCount,
    isModalOpen,
    setIsModalOpen,
    lightboxImg,
    setLightboxImg,
    loadReviews,
  };
}
