/**
 * Keyboard Shortcuts Hook
 * Handles keyboard events for drill editor
 */

import { useEffect, useCallback } from "react";

export interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

export interface UseKeyboardShortcutsProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onNudgeUp?: () => void;
  onNudgeDown?: () => void;
  onNudgeLeft?: () => void;
  onNudgeRight?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onSelectAll,
  onCopy,
  onPaste,
  onDuplicate,
  onGroup,
  onUngroup,
  onNudgeUp,
  onNudgeDown,
  onNudgeLeft,
  onNudgeRight,
  onSave,
  onExport,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd + Z
      if (cmdOrCtrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((cmdOrCtrl && e.shiftKey && e.key === "z") || (cmdOrCtrl && e.key === "y")) {
        e.preventDefault();
        onRedo?.();
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDelete?.();
        return;
      }

      // Select All: Ctrl/Cmd + A
      if (cmdOrCtrl && e.key === "a") {
        e.preventDefault();
        onSelectAll?.();
        return;
      }

      // Copy: Ctrl/Cmd + C
      if (cmdOrCtrl && e.key === "c") {
        e.preventDefault();
        onCopy?.();
        return;
      }

      // Paste: Ctrl/Cmd + V
      if (cmdOrCtrl && e.key === "v") {
        e.preventDefault();
        onPaste?.();
        return;
      }

      // Duplicate: Ctrl/Cmd + D
      if (cmdOrCtrl && e.key === "d") {
        e.preventDefault();
        onDuplicate?.();
        return;
      }

      // Group: Ctrl/Cmd + G
      if (cmdOrCtrl && e.key === "g") {
        e.preventDefault();
        onGroup?.();
        return;
      }

      // Ungroup: Ctrl/Cmd + Shift + G
      if (cmdOrCtrl && e.shiftKey && e.key === "g") {
        e.preventDefault();
        onUngroup?.();
        return;
      }

      // Save: Ctrl/Cmd + S
      if (cmdOrCtrl && e.key === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }

      // Export: Ctrl/Cmd + E
      if (cmdOrCtrl && e.key === "e") {
        e.preventDefault();
        onExport?.();
        return;
      }

      // Arrow keys for nudging
      const nudgeAmount = e.shiftKey ? 10 : 1;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        onNudgeUp?.();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        onNudgeDown?.();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNudgeLeft?.();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNudgeRight?.();
        return;
      }
    },
    [
      enabled,
      onUndo,
      onRedo,
      onDelete,
      onSelectAll,
      onCopy,
      onPaste,
      onDuplicate,
      onGroup,
      onUngroup,
      onNudgeUp,
      onNudgeDown,
      onNudgeLeft,
      onNudgeRight,
      onSave,
      onExport,
    ]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}

/**
 * Get list of available shortcuts for display
 */
export function getShortcutList(): Array<{ keys: string; description: string; category: string }> {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const mod = isMac ? "⌘" : "Ctrl";

  return [
    { keys: `${mod} + Z`, description: "Undo", category: "Edit" },
    { keys: `${mod} + Shift + Z`, description: "Redo", category: "Edit" },
    { keys: `${mod} + Y`, description: "Redo (Alternative)", category: "Edit" },
    { keys: "Delete / Backspace", description: "Delete selected", category: "Edit" },
    { keys: `${mod} + A`, description: "Select all", category: "Selection" },
    { keys: `${mod} + C`, description: "Copy", category: "Edit" },
    { keys: `${mod} + V`, description: "Paste", category: "Edit" },
    { keys: `${mod} + D`, description: "Duplicate", category: "Edit" },
    { keys: `${mod} + G`, description: "Group", category: "Organization" },
    { keys: `${mod} + Shift + G`, description: "Ungroup", category: "Organization" },
    { keys: "Arrow Keys", description: "Nudge selected (1px)", category: "Transform" },
    { keys: "Shift + Arrow Keys", description: "Nudge selected (10px)", category: "Transform" },
    { keys: `${mod} + S`, description: "Save", category: "File" },
    { keys: `${mod} + E`, description: "Export", category: "File" },
  ];
}
