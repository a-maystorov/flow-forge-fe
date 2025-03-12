import theme from '@/themes/mantine-theme';
import { notifications } from '@mantine/notifications';
import notificationClasses from '../styles/Notifications.module.css';

export const showSuccessNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: theme.colors['main-purple'][0],
    classNames: notificationClasses,
  });
};

export const showErrorNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'red',
    classNames: notificationClasses,
  });
};

export const showInfoNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'blue',
    classNames: notificationClasses,
  });
};

export const showWarningNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'yellow',
    classNames: notificationClasses,
  });
};

export const notifyUser = {
  success: showSuccessNotification,
  error: showErrorNotification,
  info: showInfoNotification,
  warning: showWarningNotification,
};

export { notifications };
