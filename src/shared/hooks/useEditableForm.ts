import { UseFormReturnType, useForm } from '@mantine/form';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useState } from 'react';
import { sanitizerConfig } from '../constants/html';

export interface BaseEditableFormValues {
  title: string;
  description: string;
}

export interface RegularTask extends BaseEditableFormValues {
  type: 'task';
}

export interface SubtaskValues extends BaseEditableFormValues {
  type: 'subtask';
  completed: boolean;
}

export type EditableFormValues = RegularTask | SubtaskValues;

export interface UseEditableFormOptions<T extends EditableFormValues> {
  initialValues: T;
  onUpdate?: (values: T) => void;
  entityData?: {
    title: string;
    description?: string;
    completed?: boolean;
    type: 'task' | 'subtask';
  } | null;
}

export interface UseEditableFormResult<T extends EditableFormValues> {
  form: UseFormReturnType<T>;
  isEditing: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  handleFormSubmit: (values: T) => void;
  sanitizeContent: (content: string) => string;
}

/**
 * A custom hook to manage editable forms with rich text descriptions.
 * Handles form state, editing mode, and HTML sanitization.
 */
export function useEditableForm<T extends EditableFormValues>({
  initialValues,
  onUpdate,
  entityData,
}: UseEditableFormOptions<T>): UseEditableFormResult<T> {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<T>({
    initialValues,
  });

  // Update form values when entity data changes or becomes available
  useEffect(() => {
    if (entityData) {
      const sanitizedDescription = DOMPurify.sanitize(
        entityData.description || '',
        sanitizerConfig
      );

      const baseValues = {
        title: entityData.title,
        description: sanitizedDescription,
        type: entityData.type,
      };

      // Add completed property for subtasks
      const newValues =
        entityData.type === 'subtask' && entityData.completed !== undefined
          ? {
              ...baseValues,
              completed: entityData.completed,
            }
          : baseValues;

      form.setValues(newValues as T);
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityData]); // Deliberately omitting form from dependencies to prevent infinite updates

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    if (entityData) {
      const baseValues = {
        title: entityData.title,
        description: entityData.description || '',
        type: entityData.type,
      };

      const newValues =
        entityData.type === 'subtask' && entityData.completed !== undefined
          ? {
              ...baseValues,
              completed: entityData.completed,
            }
          : baseValues;

      form.setValues(newValues as T);
      setIsEditing(false);
    }
  }, [form, entityData]);

  const sanitizeContent = useCallback((content: string): string => {
    return DOMPurify.sanitize(content, sanitizerConfig);
  }, []);

  const handleFormSubmit = useCallback(
    (values: T) => {
      if (!entityData || !onUpdate) {
        return;
      }

      const finalDescription = sanitizeContent(values.description);
      const updatedValues = { ...values, description: finalDescription } as T;

      onUpdate(updatedValues);
      form.setValues(updatedValues);
      setIsEditing(false);
    },
    [form, entityData, onUpdate, sanitizeContent]
  );

  return {
    form,
    isEditing,
    startEditing,
    cancelEditing,
    handleFormSubmit,
    sanitizeContent,
  };
}
