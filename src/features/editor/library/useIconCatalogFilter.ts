"use client";

import { useMemo } from "react";

import { iconCatalog, iconResultLimit, type CustomIcon } from "@/features/icons/icon-catalog";

export function useIconCatalogFilter(iconSet: string, iconSearch: string, customIcons: CustomIcon[], customPackageName: string) {
  const activeBuiltInIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();
    if (iconSet.startsWith("Mis iconos / ")) return [];
    return iconCatalog.filter(
      (icon) =>
        icon.set === iconSet &&
        (!normalizedSearch ||
          icon.name.toLowerCase().includes(normalizedSearch) ||
          icon.label.toLowerCase().includes(normalizedSearch)),
    );
  }, [iconSearch, iconSet]);

  const visibleBuiltInIcons = useMemo(() => activeBuiltInIcons.slice(0, iconResultLimit), [activeBuiltInIcons]);

  const activeCustomIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();
    return customIcons.filter(
      (icon) =>
        icon.packageName === customPackageName &&
        (!normalizedSearch || icon.name.toLowerCase().includes(normalizedSearch)),
    );
  }, [customIcons, customPackageName, iconSearch]);

  return { activeBuiltInIcons, visibleBuiltInIcons, activeCustomIcons };
}
