"use client";

import { useEffect, useState } from "react";

const EDITOR_PANELS_STORAGE_KEY = "maketar-editor-panels";

type EditorPanelVisibility = {
  library: boolean;
  properties: boolean;
};

function readEditorPanelVisibility(): EditorPanelVisibility {
  if (typeof window === "undefined") return { library: true, properties: true };

  try {
    const raw = window.localStorage.getItem(EDITOR_PANELS_STORAGE_KEY);
    if (!raw) return { library: true, properties: true };
    const parsed = JSON.parse(raw) as Partial<EditorPanelVisibility>;
    return {
      library: parsed.library ?? true,
      properties: parsed.properties ?? true,
    };
  } catch {
    return { library: true, properties: true };
  }
}

export function useEditorPanelVisibility() {
  const [showLibraryPanel, setShowLibraryPanel] = useState(() => readEditorPanelVisibility().library);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(() => readEditorPanelVisibility().properties);

  useEffect(() => {
    window.localStorage.setItem(
      EDITOR_PANELS_STORAGE_KEY,
      JSON.stringify({ library: showLibraryPanel, properties: showPropertiesPanel }),
    );
  }, [showLibraryPanel, showPropertiesPanel]);

  return { showLibraryPanel, setShowLibraryPanel, showPropertiesPanel, setShowPropertiesPanel };
}
