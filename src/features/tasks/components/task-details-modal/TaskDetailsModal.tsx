import Task from '@/models/Task';
import { Box, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, RichTextEditor } from '@mantine/tiptap';
import Highlight from '@tiptap/extension-highlight';
import SubScript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { useUpdateTask } from '../../hooks';
import { RichTextContent, sanitizerConfig } from '../rich-text-content/RichTextContent';

interface TaskForm {
  title: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  boardId: string;
  columnId: string;
}

export function TaskDetailsModal({ isOpen, onClose, task, boardId, columnId }: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const form = useForm<TaskForm>({
    initialValues: {
      title: '',
      description: '',
    },
    validate: {
      title: (value) => (value.trim() ? null : 'Title is required'),
    },
  });

  const { updateTask, isUpdatingTask } = useUpdateTask(boardId, columnId, task?._id || '');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const sanitizedHtml = DOMPurify.sanitize(html, sanitizerConfig);
      form.setFieldValue('description', sanitizedHtml);
    },
  });

  useEffect(() => {
    if (task) {
      form.setValues({
        title: task.title,
        description: task.description || '',
      });
      setEditingTitle(false);
      setEditingDescription(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]); // Deliberately omitting form from dependencies to prevent infinite updates

  useEffect(() => {
    if (editor && form.values.description) {
      editor.commands.setContent(form.values.description);
    }
  }, [editor, form.values.description]);

  if (!task) {
    return null;
  }

  const handleSubmit = form.onSubmit((values) => {
    let finalDescription = values.description;
    if (editingDescription && editor) {
      const currentEditorHtml = editor.getHTML();
      finalDescription = DOMPurify.sanitize(currentEditorHtml, sanitizerConfig);
    }

    updateTask(
      {
        title: values.title,
        description: finalDescription,
      },
      {
        onSuccess: () => {
          setEditingTitle(false);
          setEditingDescription(false);
        },
      }
    );
  });

  const handleCancel = () => {
    form.setValues({
      title: task.title,
      description: task.description || '',
    });
    setEditingTitle(false);
    setEditingDescription(false);
  };

  const handleEnterDescriptionEditMode = () => {
    setEditingDescription(true);
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Task Details" size="xl" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Box>
            <Text fw={700} size="lg">
              Title
            </Text>

            {editingTitle ? (
              <TextInput {...form.getInputProps('title')} autoFocus required />
            ) : (
              <Text
                onClick={() => setEditingTitle(true)}
                style={{ cursor: 'pointer', padding: '8px 0' }}
              >
                {form.values.title}
              </Text>
            )}
          </Box>

          <Box>
            <Text fw={700} size="lg">
              Description
            </Text>

            {editingDescription ? (
              <RichTextEditor editor={editor}>
                <RichTextEditor.Toolbar sticky stickyOffset={55}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.Hr />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.AlignLeft />
                    <RichTextEditor.AlignCenter />
                    <RichTextEditor.AlignJustify />
                    <RichTextEditor.AlignRight />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Undo />
                    <RichTextEditor.Redo />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
              </RichTextEditor>
            ) : form.values.description ? (
              <RichTextContent
                html={form.values.description}
                onClick={handleEnterDescriptionEditMode}
              />
            ) : (
              <Text
                onClick={handleEnterDescriptionEditMode}
                style={{ cursor: 'pointer', padding: '8px 0' }}
              >
                No description
              </Text>
            )}
          </Box>

          {(editingTitle || editingDescription) && (
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={handleCancel} disabled={isUpdatingTask}>
                Cancel
              </Button>
              <Button type="submit" loading={isUpdatingTask}>
                Save Changes
              </Button>
            </Group>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
