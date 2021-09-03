/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'task0',
        title: 'Task',
        type: 'basic',
        icon: 'heroicons_outline:clipboard-list',
        link: '/tasks-panel',
    },
    {
        id: 'task',
        title: 'Задачи',
        type: 'basic',
        icon: 'heroicons_outline:check-circle',
        link: '/tasks',
    },

    {
        id: 'task-alt',
        title: 'Задачи-alt',
        type: 'basic',
        icon: 'heroicons_outline:check-circle',
        link: '/tasks-alt',
        subtitle: '',
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
