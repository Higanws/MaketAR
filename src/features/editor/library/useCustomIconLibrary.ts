"use client";

import { useEffect, useMemo, useState } from "react";

import {
  builtInIconSets,
  customIconPackagesStorageKey,
  customIconsStorageKey,
  type CustomIcon,
} from "@/features/icons/icon-catalog";

export function useCustomIconLibrary() {
  const [iconSet, setIconSet] = useState("AWS");
  const [iconSearch, setIconSearch] = useState("");
  const [customPackageName, setCustomPackageName] = useState("");
  const [customPackages, setCustomPackages] = useState<string[]>(["Mis iconos"]);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [customIconsHydrated, setCustomIconsHydrated] = useState(false);

  const customPackageOptions = useMemo(
    () => customPackages.map((packageName) => `Mis iconos / ${packageName}`),
    [customPackages],
  );
  const iconPackageOptions = useMemo(
    () => [...builtInIconSets, ...customPackageOptions],
    [customPackageOptions],
  );
  const customPackageFromOption = iconSet.startsWith("Mis iconos / ")
    ? iconSet.replace("Mis iconos / ", "")
    : customPackages[0];

  useEffect(() => {
    const loadSavedIcons = window.setTimeout(() => {
      const saved = window.localStorage.getItem(customIconsStorageKey);
      const savedPackages = window.localStorage.getItem(customIconPackagesStorageKey);
      try {
        const parsedIcons = (saved ? JSON.parse(saved) : []) as Array<Partial<CustomIcon>>;
        const normalizedIcons = parsedIcons.map((icon) => ({
          id: icon.id ?? `custom-icon-${Date.now()}`,
          name: icon.name ?? "Icono",
          packageName: icon.packageName ?? "Mis iconos",
          svgSrc: icon.svgSrc ?? "",
        }));
        setCustomIcons(normalizedIcons.filter((icon) => icon.svgSrc));
        const parsedPackages = (savedPackages ? JSON.parse(savedPackages) : []) as string[];
        const packagesFromIcons = normalizedIcons.map((icon) => icon.packageName);
        setCustomPackages(Array.from(new Set(["Mis iconos", ...parsedPackages, ...packagesFromIcons])));
      } catch {
        setCustomIcons([]);
        setCustomPackages(["Mis iconos"]);
      }
      setCustomIconsHydrated(true);
    }, 0);

    return () => window.clearTimeout(loadSavedIcons);
  }, []);

  useEffect(() => {
    if (!customIconsHydrated) return;
    window.localStorage.setItem(customIconsStorageKey, JSON.stringify(customIcons));
    window.localStorage.setItem(customIconPackagesStorageKey, JSON.stringify(customPackages));
  }, [customIcons, customIconsHydrated, customPackages]);

  const createCustomPackage = () => {
    const packageName = customPackageName.trim();
    if (!packageName) return;
    setCustomPackages((current) => Array.from(new Set([...current, packageName])));
    setIconSet(`Mis iconos / ${packageName}`);
    setCustomPackageName("");
  };

  const clearCustomPackages = () => {
    setCustomIcons([]);
    setCustomPackages(["Mis iconos"]);
    window.localStorage.removeItem(customIconsStorageKey);
    window.localStorage.removeItem(customIconPackagesStorageKey);
    setIconSet("AWS");
  };

  const addCustomIcon = (icon: CustomIcon) => {
    setCustomIcons((current) => [icon, ...current]);
    setIconSet(`Mis iconos / ${icon.packageName}`);
  };

  return {
    iconSet,
    setIconSet,
    iconSearch,
    setIconSearch,
    customPackageName,
    setCustomPackageName,
    customIcons,
    customPackageFromOption,
    iconPackageOptions,
    createCustomPackage,
    clearCustomPackages,
    addCustomIcon,
  };
}
