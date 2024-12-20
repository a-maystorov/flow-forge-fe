import { Button, ButtonProps, Tooltip } from '@mantine/core';
import { ReactNode } from 'react';

interface Props extends Omit<ButtonProps, 'children'> {
  label: string;
  icon?: ReactNode;
  tooltip?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}

export default function ActionButton({
  label,
  icon,
  tooltip,
  isLoading = false,
  isDisabled = false,
  variant = 'default',
  ...buttonProps
}: Props) {
  const getButtonStyle = (): ButtonProps => {
    switch (variant) {
      case 'primary':
        return { variant: 'filled', color: 'blue' };
      case 'danger':
        return { variant: 'filled', color: 'red' };
      default:
        return { variant: 'light', color: 'gray' };
    }
  };

  const button = (
    <Button
      {...getButtonStyle()}
      {...buttonProps}
      loading={isLoading}
      disabled={isDisabled}
      leftSection={icon}
    >
      {label}
    </Button>
  );

  if (tooltip) {
    return <Tooltip label={tooltip}>{button}</Tooltip>;
  }

  return button;
}
