import { showNotification } from '@mantine/notifications';
import { DeviceFloppy, Trash } from 'tabler-icons-react';

export function notifyResetPartitions() {
  showNotification({
    title: 'Groups Reset',
    message: 'As your team changed, the groups have been reset.',
  });
}

export function notifyLoadedInitial() {
  showNotification({
    title: 'Load Successful',
    message: 'Loaded your previous configuration from local browser storage.',
  });
}

export function notifyLoad() {
  showNotification({
    title: 'Save Successful',
    message: 'Saved your configuration to local browser storage.',
    icon: <DeviceFloppy size={16} />,
  });
}

export function notifyDelete() {
  showNotification({
    title: 'Delete Successful',
    message: 'Deleted stored configuration.',
    icon: <Trash size={16} />,
  });
}
