"use client";

import { useEffect } from "react";

import type { DiagramMode } from "@/entities/wireframe/wireframe.types";

export function useEditorHotkeys({
  mode,
  selectedCount,
  undo,
  redo,
  copyDiagramSelection,
  pasteDiagramClipboard,
  duplicateDiagramSelection,
  deleteDiagramSelection,
  copySelected,
  pasteClipboard,
  duplicateShape,
  deleteSelected,
}: {
  mode: DiagramMode;
  selectedCount: number;
  undo: () => void;
  redo: () => void;
  copyDiagramSelection: () => void;
  pasteDiagramClipboard: () => void;
  duplicateDiagramSelection: () => void;
  deleteDiagramSelection: () => void;
  copySelected: () => void;
  pasteClipboard: () => void;
  duplicateShape: () => void;
  deleteSelected: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const key = event.key.toLowerCase();
      const isTextEditing = target?.matches("input, textarea, select, [contenteditable='true']");
      if (isTextEditing && !((event.metaKey || event.ctrlKey) && key === "r")) return;
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && (key === "y" || key === "r")) {
        event.preventDefault();
        redo();
        return;
      }
      if (mode === "diagram") {
        if ((event.metaKey || event.ctrlKey) && key === "c") {
          event.preventDefault();
          copyDiagramSelection();
          return;
        }
        if ((event.metaKey || event.ctrlKey) && key === "v") {
          event.preventDefault();
          pasteDiagramClipboard();
          return;
        }
        if ((event.metaKey || event.ctrlKey) && key === "d") {
          event.preventDefault();
          duplicateDiagramSelection();
          return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          deleteDiagramSelection();
        }
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "v") {
        event.preventDefault();
        pasteClipboard();
        return;
      }
      if (selectedCount === 0) return;
      if ((event.metaKey || event.ctrlKey) && key === "c") {
        event.preventDefault();
        copySelected();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "d") {
        event.preventDefault();
        duplicateShape();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    copyDiagramSelection,
    copySelected,
    deleteDiagramSelection,
    deleteSelected,
    duplicateDiagramSelection,
    duplicateShape,
    mode,
    pasteClipboard,
    pasteDiagramClipboard,
    redo,
    selectedCount,
    undo,
  ]);
}
