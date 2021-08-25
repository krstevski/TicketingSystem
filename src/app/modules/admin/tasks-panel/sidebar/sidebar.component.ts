import { Component, ViewEncapsulation } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';

@Component({
    selector: 'sidebar',
    template: `
        <div class="py-10">
            <!-- Add any extra content that might be supplied with the component -->
            <div class="extra-content">
                <ng-content></ng-content>
            </div>

            <!-- Fixed demo sidebar -->
            <div class="mx-6 text-3xl font-bold tracking-tighter">Панел</div>
            <fuse-vertical-navigation
                [appearance]="'default'"
                [navigation]="menuData"
                [inner]="true"
                [mode]="'side'"
                [name]="'demo-sidebar-navigation'"
                [opened]="true"
            ></fuse-vertical-navigation>
        </div>
    `,
    styles: [
        `
            demo-sidebar
                fuse-vertical-navigation
                .fuse-vertical-navigation-wrapper {
                box-shadow: none !important;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent {
    menuData: FuseNavigationItem[];

    constructor() {
        this.menuData = [
            {
                title: 'Дејства',
                subtitle: 'Задача, проект и тим',
                type: 'group',
                children: [
                    {
                        title: 'Нова задача',
                        type: 'basic',
                        icon: 'heroicons_outline:plus-circle',
                        link: '/tasks-panel/new-task',
                    },
                    {
                        title: 'Нов тим',
                        type: 'basic',
                        icon: 'heroicons_outline:user-group',
                    },
                    {
                        title: 'Нов корисник',
                        type: 'basic',
                        icon: 'heroicons_outline:user-add',
                    },
                    {
                        title: 'Нов Клиент',
                        type: 'basic',
                        icon: 'heroicons_outline:user-add',
                    },
                    {
                        title: 'Додели задача на корисник или тим',
                        subtitle: 'Додели задача',
                        type: 'basic',
                        icon: 'heroicons_outline:badge-check',
                    },
                ],
            },
            {
                title: 'Задачи',
                type: 'group',
                children: [
                    {
                        title: 'Сите задачи',
                        type: 'basic',
                        icon: 'heroicons_outline:clipboard-list',
                        link: '/tasks-panel/all-tasks',
                        badge: {
                            title: '0',
                            classes:
                                'px-2 bg-primary text-on-primary rounded-full',
                        },
                    },
                    {
                        title: 'Тековни задачи',
                        type: 'basic',
                        icon: 'heroicons_outline:clipboard-copy',
                    },
                    {
                        title: 'Завршени задачи',
                        type: 'basic',
                        icon: 'heroicons_outline:clipboard-check',
                    },
                    {
                        title: 'Откажани задачи',
                        type: 'basic',
                        icon: 'heroicons_outline:clipboard',
                    },
                    {
                        title: 'Мои задачи',
                        type: 'basic',
                        icon: 'heroicons_outline:user',
                    },
                    {
                        title: 'Задачи на мој тим',
                        type: 'basic',
                        icon: 'heroicons_outline:users',
                    },
                ],
            },
            {
                title: 'Поставки',
                type: 'group',
                children: [
                    {
                        title: 'Општи',
                        type: 'collapsable',
                        icon: 'heroicons_outline:cog',
                        children: [
                            {
                                title: 'Задачи',
                                type: 'basic',
                            },
                            {
                                title: 'Корисници',
                                type: 'basic',
                            },
                            {
                                title: 'Тимови',
                                type: 'basic',
                            },
                        ],
                    },
                ],
            },
        ];
    }
}
