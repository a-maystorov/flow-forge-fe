import { useUser } from '@/features/auth/hooks';
import { Alert, Anchor, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { format, isValid, parseISO } from 'date-fns';
import { useState } from 'react';
import { ConvertAccountModal } from './ConvertAccountModal';

export function TemporaryAccountBanner() {
  const { user } = useUser();
  const [opened, { open, close }] = useDisclosure(false);
  const [isHidden, setIsHidden] = useState(false);

  if (!user || !user.isTemporary || isHidden) {
    return null;
  }

  const expirationMessage = user.expiresAt ? (
    (() => {
      const expiresDate = parseISO(user.expiresAt);
      const isValidDate = isValid(expiresDate);
      const formattedDate = isValidDate ? format(expiresDate, 'MMMM dd, yyyy') : 'unknown date';
      const daysLeft = isValidDate
        ? Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return (
        <>
          will expire on {formattedDate}
          {daysLeft !== null && ` (${daysLeft} days left)`}
        </>
      );
    })()
  ) : (
    <>has a limited duration</>
  );

  return (
    <>
      <Alert
        title="Temporary Account"
        color="blue"
        withCloseButton
        onClose={() => setIsHidden(true)}
      >
        <Text size="sm" mb="sm">
          Your temporary account {expirationMessage}. Register to keep your board and data.
        </Text>
        <Group justify="flex-end">
          <Anchor component="button" size="sm" onClick={open}>
            Register now
          </Anchor>
        </Group>
      </Alert>

      <ConvertAccountModal opened={opened} onClose={close} />
    </>
  );
}
