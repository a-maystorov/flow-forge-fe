import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core';
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
import React from 'react';
import { useCreateTask } from '../../hooks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  boardId: string;
}

interface FormValues {
  title: string;
  description: string;
}

const sanitizerConfig = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'hr',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'img',
    'sub',
    'sup',
    'span',
    'div',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'data-*'],
  ALLOW_DATA_ATTR: true,
};

export function CreateTaskModal({ isOpen, onClose, columnId, boardId }: Props) {
  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
    },
  });

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
    content: form.values.description,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const sanitizedHtml = DOMPurify.sanitize(html, sanitizerConfig);

      // Only update if content actually changed to prevent loops
      if (sanitizedHtml !== form.values.description) {
        form.setFieldValue('description', sanitizedHtml);
      }
    },
  });

  // Update editor when form values change (e.g., on reset)
  React.useEffect(() => {
    if (editor && editor.getHTML() !== form.values.description) {
      editor.commands.setContent(form.values.description);
    }
  }, [editor, form.values.description]);

  const { createTask, isCreatingTask } = useCreateTask(boardId, columnId);

  const handleSubmit = (values: FormValues) => {
    const sanitizedValues = {
      ...values,
      description: DOMPurify.sanitize(values.description, sanitizerConfig),
    };

    createTask(sanitizedValues, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Add New Task" size="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="e.g. Take coffee break"
            required
            {...form.getInputProps('title')}
          />

          <Box>
            <Text fw={500} size="md">
              Description
            </Text>

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
          </Box>

          <Button type="submit" fullWidth loading={isCreatingTask}>
            Create Task
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
