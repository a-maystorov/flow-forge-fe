import theme from '@/themes/mantine-theme';
import { notifications } from '@mantine/notifications';

export const showSuccessNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: theme.colors['main-purple'][0],
  });
};

export const showErrorNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'red',
  });
};

export const showInfoNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'blue',
  });
};

export const showWarningNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'yellow',
  });
};

export const notifyUser = {
  success: showSuccessNotification,
  error: showErrorNotification,
  info: showInfoNotification,
  warning: showWarningNotification,
};

export { notifications };
