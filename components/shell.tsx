import {
  AppShell,
  Burger,
  Divider,
  Group,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import * as React from 'react';
import { useRef } from 'react';
import {
  Affiliate,
  DeviceFloppy,
  Download,
  GridDots,
  LayoutDashboard,
  Share,
  Stack2,
  Trash,
  Upload,
  UserPlus,
} from 'tabler-icons-react';
import { useTeamContext } from '../providers/team';
import { notifyDelete, notifyLoad } from '../utils/notifications';
import { deleteStorage, exportJSON, saveToStorage } from '../utils/persistence';
import Importer from './persistence';

const navItems = [
  {
    icon: <LayoutDashboard size={16} />,
    color: 'blue',
    label: 'Overview',
    path: '/',
  },
  {
    icon: <UserPlus size={16} />,
    color: 'blue',
    label: 'Members',
    path: '/members',
  },
  {
    icon: <Share size={16} />,
    color: 'blue',
    label: 'Live Poll',
    path: '/poll',
  },
  {
    icon: <GridDots size={16} />,
    color: 'blue',
    label: 'Connections',
    path: '/connections',
  },
  {
    icon: <Affiliate size={16} />,
    color: 'blue',
    label: 'Graph',
    path: '/graph',
  },
  {
    icon: <Stack2 size={16} />,
    color: 'blue',
    label: 'Groups',
    path: '/groups',
  },
];

function NavbarContent({ hide }: { hide: () => void }) {
  const theme = useMantineTheme();

  const { members, setMembers, partitions, setPartitions, getDiagonalMatrix, setDiagonalMatrix } = useTeamContext();
  const openFileRef = useRef<() => void>() as React.MutableRefObject<() => void>;

  const persistenceItems = [
    {
      icon: <Download size={16} />,
      color: 'blue',
      label: 'Export',
      handler: () =>
        exportJSON('default', {
          team: { members, connectedness: getDiagonalMatrix() },
          partitions,
        }),
    },
    {
      icon: <Upload size={16} />,
      color: 'blue',
      label: 'Import',
      handler: () => openFileRef.current(),
    },
    {
      icon: <DeviceFloppy size={16} />,
      color: 'blue',
      label: 'Save',
      handler: () => {
        saveToStorage('default', {
          team: { members, connectedness: getDiagonalMatrix() },
          partitions,
        });
        notifyLoad();
      },
    },
    {
      icon: <Trash size={16} />,
      color: 'blue',
      label: 'Delete',
      handler: () => {
        deleteStorage('default');
        setPartitions([]);
        setMembers([]);
        notifyDelete();
      },
    },
  ];

  const buttonStyle = {
    display: 'block',
    width: '100%',
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    // color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    // "&:hover": {
    //   backgroundColor:
    //     theme.colorScheme === "dark"
    //       ? theme.colors.dark[6]
    //       : theme.colors.gray[0],
    // },
  };

  return (
    <>
      {navItems.map((item) => (
        <Link href={item.path} key={item.label} onClick={hide}>
          <UnstyledButton style={buttonStyle}>
            <Group>
              <ThemeIcon color={item.color} variant="light">
                {item.icon}
              </ThemeIcon>
              <Text size="sm">{item.label}</Text>
            </Group>
          </UnstyledButton>
        </Link>
      ))}
      <Divider style={{ marginTop: '16px', marginBottom: '16px' }} />
      {persistenceItems.map((item) => (
        <UnstyledButton style={buttonStyle} onClick={item.handler} key={item.label}>
          <Group>
            <ThemeIcon color={item.color} variant="light">
              {item.icon}
            </ThemeIcon>
            <Text size="sm">{item.label}</Text>
          </Group>
        </UnstyledButton>
      ))}
      <Importer
        setMembers={setMembers}
        setDiagonalMatrix={setDiagonalMatrix}
        setPartitions={setPartitions}
        openFileRef={openFileRef}
      />
      <Divider style={{ marginTop: '16px', marginBottom: '16px' }} />
      <Group justify="center">
        <Text size="sm">
          Version: <Link href={process.env.NEXT_PUBLIC_VERSION_URL!}>{process.env.NEXT_PUBLIC_VERSION_LABEL}</Link>
        </Text>
      </Group>
    </>
  );
}

export default function Shell({ children, nav }: { children: any; nav: boolean }) {
  const theme = useMantineTheme();
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      navbar={
        nav
          ? {
              breakpoint: 'md',
              width: 180,
              collapsed: { mobile: !opened },
            }
          : undefined
      }
      header={{
        height: 70,
      }}
      padding="xl"
    >
      <AppShell.Header>
        <Group h="100%" px="sm">
          <Burger opened={opened} onClick={toggle} size="sm" color={theme.colors.gray[6]} hiddenFrom="md" />
          <Title order={1}>Mesh:up</Title>
        </Group>
      </AppShell.Header>
      {nav && (
        <AppShell.Navbar p="md">
          <NavbarContent hide={close} />
        </AppShell.Navbar>
      )}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
