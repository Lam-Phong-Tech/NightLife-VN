export const adminTopbarFiltersVisibilityEvent = 'nightlife:admin-topbar-filters-visibility';

export type AdminTopbarFiltersVisibilityDetail = {
  hidden: boolean;
};

export function setAdminTopbarFiltersHidden(hidden: boolean) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<AdminTopbarFiltersVisibilityDetail>(
      adminTopbarFiltersVisibilityEvent,
      { detail: { hidden } },
    ),
  );
}
