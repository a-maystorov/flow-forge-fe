import { useCallback } from 'react';

export interface UseConfirmationDialogsOptions {
  onCloseCallback?: () => void;
  onDeleteCallback?: () => void;
  onCompleteCallback?: () => void;
}

export interface UseConfirmationDialogsResult {
  confirmClose: (hasUnsavedChanges: boolean) => void;
  confirmDelete: (entityName?: string) => void;
  confirmToggleCompletion: (isCompleting: boolean, entityName?: string) => void;
}

/**
 * A custom hook to manage confirmation dialogs for common actions
 * like closing with unsaved changes, deleting items, and marking items as completed.
 */
export function useConfirmationDialogs({
  onCloseCallback,
  onDeleteCallback,
  onCompleteCallback,
}: UseConfirmationDialogsOptions): UseConfirmationDialogsResult {
  const confirmClose = useCallback(
    (hasUnsavedChanges: boolean) => {
      if (hasUnsavedChanges) {
        if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
          onCloseCallback?.();
        }
      } else {
        onCloseCallback?.();
      }
    },
    [onCloseCallback]
  );

  const confirmDelete = useCallback(
    (entityName?: string) => {
      const message = entityName
        ? `Are you sure you want to delete this ${entityName}? This action cannot be undone.`
        : 'Are you sure you want to delete this? This action cannot be undone.';
      if (window.confirm(message)) {
        onDeleteCallback?.();
      }
    },
    [onDeleteCallback]
  );

  const confirmToggleCompletion = useCallback(
    (isCompleting: boolean, entityName?: string) => {
      // Only ask for confirmation when marking as completed
      if (isCompleting) {
        const message = entityName
          ? `Are you sure you want to mark this ${entityName} as completed?`
          : 'Are you sure you want to mark this as completed?';
        if (window.confirm(message)) {
          onCompleteCallback?.();
        }
      } else {
        onCompleteCallback?.();
      }
    },
    [onCompleteCallback]
  );

  return {
    confirmClose,
    confirmDelete,
    confirmToggleCompletion,
  };
}
