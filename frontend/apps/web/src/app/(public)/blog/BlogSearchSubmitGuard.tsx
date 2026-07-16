"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type BlogSearchSubmitGuardProps = {
  category?: string;
  tag?: string;
};

const normalizeFilterValue = (value?: string | null) => value?.trim() ?? "";

export function BlogSearchSubmitGuard({ category, tag }: BlogSearchSubmitGuardProps) {
  const router = useRouter();
  const activeCategory = normalizeFilterValue(category);
  const activeTag = normalizeFilterValue(tag);

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>(".nl-blog-filter");

    if (!form) {
      return undefined;
    }

    const handleSubmit = (event: SubmitEvent) => {
      const formData = new FormData(form);
      const searchInput = form.querySelector<HTMLInputElement>("[data-blog-search-input='true']");
      const nextQuery = normalizeFilterValue(searchInput?.value ?? formData.get("q")?.toString());
      const nextParams = new URLSearchParams();

      if (nextQuery) {
        nextParams.set("q", nextQuery);
      }

      if (activeCategory) {
        nextParams.set("category", activeCategory);
      }

      if (activeTag) {
        nextParams.set("tag", activeTag);
      }

      const nextSearch = nextParams.toString();
      const nextPath = `/blog${nextSearch ? `?${nextSearch}` : ""}`;
      const currentPath = `${window.location.pathname}${window.location.search}`;

      if (!nextQuery && !activeCategory && !activeTag) {
        event.preventDefault();

        const input = form.elements.namedItem("q");
        if (input instanceof HTMLInputElement) {
          input.value = "";
        }

        if (currentPath !== "/blog") {
          window.history.replaceState(window.history.state, "", "/blog");
        }

        return;
      }

      event.preventDefault();

      if (currentPath !== nextPath) {
        router.push(nextPath, { scroll: false });
      }
    };

    form.dataset.blogSearchReady = "true";
    form.addEventListener("submit", handleSubmit);

    return () => {
      delete form.dataset.blogSearchReady;
      form.removeEventListener("submit", handleSubmit);
    };
  }, [activeCategory, activeTag, router]);

  return null;
}
