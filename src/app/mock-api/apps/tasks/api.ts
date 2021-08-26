import { Injectable } from '@angular/core';
import { assign, cloneDeep } from 'lodash-es';
import { FuseMockApiUtils } from '@fuse/lib/mock-api/mock-api.utils';
import { FuseMockApiService } from '@fuse/lib/mock-api/mock-api.service';
import {
    tags as tagsData,
    tasks as tasksData,
    partners as partnersData,
    categories as categoriesData,
    workHours as workHoursData,
    clients as clientsData,
} from 'app/mock-api/apps/tasks/data';

@Injectable({
    providedIn: 'root',
})
export class TasksMockApi {
    private _tags: any[] = tagsData;
    private _tasks: any[] = tasksData;
    private partners: any[] = partnersData;
    private categories: any[] = categoriesData;
    private workHours: any[] = workHoursData;
    private clients: any[] = clientsData;

    constructor(private _fuseMockApiService: FuseMockApiService) {
        this.registerHandlers();
    }
    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Tags - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/tasks/tags')
            .reply(() => [200, cloneDeep(this._tags)]);

        this._fuseMockApiService
            .onGet('api/apps/tasks/partners')
            .reply(() => [200, cloneDeep(this.partners)]);

        this._fuseMockApiService
            .onGet('api/apps/tasks/categories')
            .reply(() => [200, cloneDeep(this.categories)]);

        this._fuseMockApiService
            .onGet('api/apps/tasks/workhours')
            .reply(() => [200, cloneDeep(this.workHours)]);

        this._fuseMockApiService
            .onGet('api/apps/tasks/clients')
            .reply(() => [200, cloneDeep(this.clients)]);
        // -----------------------------------------------------------------------------------------------------
        // @ Tags - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/apps/tasks/tag')
            .reply(({ request }) => {
                const newTag = cloneDeep(request.body.tag);
                newTag.id = FuseMockApiUtils.guid();
                this._tags.unshift(newTag);

                return [200, newTag];
            });

        this._fuseMockApiService
            .onPost('api/apps/tasks/partner')
            .reply(({ request }) => {
                const newPartner = cloneDeep(request.body.partner);
                newPartner.id = FuseMockApiUtils.guid();
                this.partners.unshift(newPartner);

                return [200, newPartner];
            });

        this._fuseMockApiService
            .onPost('api/apps/tasks/category')
            .reply(({ request }) => {
                const newCategory = cloneDeep(request.body.category);
                newCategory.id = FuseMockApiUtils.guid();
                this.categories.unshift(newCategory);

                return [200, newCategory];
            });

        this._fuseMockApiService
            .onPost('api/apps/tasks/client')
            .reply(({ request }) => {
                // Get the partner
                const newClient = cloneDeep(request.body.client);
                newClient.id = FuseMockApiUtils.guid();
                this.categories.unshift(newClient);

                return [200, newClient];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Tags - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/apps/tasks/tag')
            .reply(({ request }) => {
                const id = request.body.id;
                const tag = cloneDeep(request.body.tag);
                let updatedTag = null;
                this._tags.forEach((item, index, tags) => {
                    if (item.id === id) {
                        tags[index] = assign({}, tags[index], tag);
                        updatedTag = tags[index];
                    }
                });

                return [200, updatedTag];
            });

        this._fuseMockApiService
            .onPatch('api/apps/tasks/partner')
            .reply(({ request }) => {
                const id = request.body.id;
                const partner = cloneDeep(request.body.partner);
                let updatedPartner = null;
                this.partners.forEach((item, index, partners) => {
                    if (item.id === id) {
                        partners[index] = assign({}, partners[index], partner);
                        updatedPartner = partners[index];
                    }
                });

                return [200, updatedPartner];
            });

        this._fuseMockApiService
            .onPatch('api/apps/tasks/category')
            .reply(({ request }) => {
                const id = request.body.id;
                const category = cloneDeep(request.body.category);
                let updatedCategory = null;

                this.categories.forEach((item, index, categories) => {
                    if (item.id === id) {
                        categories[index] = assign(
                            {},
                            categories[index],
                            category
                        );

                        updatedCategory = categories[index];
                    }
                });

                return [200, updatedCategory];
            });

        this._fuseMockApiService
            .onPatch('api/apps/tasks/client')
            .reply(({ request }) => {
                const id = request.body.id;
                const client = cloneDeep(request.body.client);
                let updatedClient = null;

                this.clients.forEach((item, index, clients) => {
                    if (item.id === id) {
                        clients[index] = assign({}, clients[index], client);

                        updatedClient = clients[index];
                    }
                });

                return [200, updatedClient];
            });
        // -----------------------------------------------------------------------------------------------------
        // @ Tag - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete('api/apps/tasks/tag')
            .reply(({ request }) => {
                const id = request.params.get('id');
                const index = this._tags.findIndex((item) => item.id === id);
                this._tags.splice(index, 1);
                const tasksWithTag = this._tasks.filter(
                    (task) => task.tags.indexOf(id) > -1
                );
                tasksWithTag.forEach((task) => {
                    task.tags.splice(task.tags.indexOf(id), 1);
                });

                return [200, true];
            });
        this._fuseMockApiService
            .onDelete('api/apps/tasks/partner')
            .reply(({ request }) => {
                const id = request.params.get('id');
                const index = this.partners.findIndex((item) => item.id === id);
                this.partners.splice(index, 1);
                const tasksWithPartner = this._tasks.filter(
                    (task) => task.partners.indexOf(id) > -1
                );
                tasksWithPartner.forEach((task) => {
                    task.partners.splice(task.partners.indexOf(id), 1);
                });

                return [200, true];
            });

        this._fuseMockApiService
            .onDelete('api/apps/tasks/category')
            .reply(({ request }) => {
                const id = request.params.get('id');
                const index = this.categories.findIndex(
                    (item) => item.id === id
                );
                this.categories.splice(index, 1);
                const taskWithCategory = this._tasks.filter(
                    (task) => task.categories.indexOf(id) > -1
                );
                taskWithCategory.forEach((task) => {
                    task.categories.splice(task.categories.indexOf(id), 1);
                });

                return [200, true];
            });

        this._fuseMockApiService
            .onDelete('api/apps/tasks/client')
            .reply(({ request }) => {
                const id = request.params.get('id');
                const index = this.clients.findIndex((item) => item.id === id);
                this.clients.splice(index, 1);
                const taskWithClient = this._tasks.filter(
                    (task) => task.clients.indexOf(id) > -1
                );
                taskWithClient.forEach((task) => {
                    task.clients.splice(task.clients.indexOf(id), 1);
                });

                return [200, true];
            });
        // -----------------------------------------------------------------------------------------------------
        // @ Tasks - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService.onGet('api/apps/tasks/all').reply(() => {
            const tasks = cloneDeep(this._tasks);
            tasks.sort((a, b) => a.order - b.order);

            return [200, tasks];
        });

        // -----------------------------------------------------------------------------------------------------
        // @ Tasks Search - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/tasks/search')
            .reply(({ request }) => {
                // Get the search query
                const query = request.params.get('query');

                // Prepare the search results
                let results;

                // If the query exists...
                if (query) {
                    // Clone the tasks
                    let tasks = cloneDeep(this._tasks);

                    // Filter the tasks
                    tasks = tasks.filter(
                        (task) =>
                            (task.title &&
                                task.title
                                    .toLowerCase()
                                    .includes(query.toLowerCase())) ||
                            (task.notes &&
                                task.notes
                                    .toLowerCase()
                                    .includes(query.toLowerCase()))
                    );

                    // Mark the found chars
                    tasks.forEach((task) => {
                        const re = new RegExp(
                            '(' +
                                query.replace(
                                    /[-\/\\^$*+?.()|[\]{}]/g,
                                    '\\$&'
                                ) +
                                ')',
                            'ig'
                        );
                        task.title = task.title.replace(re, '<mark>$1</mark>');
                    });

                    // Set them as the search result
                    results = tasks;
                }
                // Otherwise, set the results to null
                else {
                    results = null;
                }

                return [200, results];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Tasks Orders - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/apps/tasks/order')
            .reply(({ request }) => {
                // Get the tasks
                const tasks = request.body.tasks;

                // Go through the tasks
                this._tasks.forEach((task) => {
                    // Find this task's index within the tasks array that comes with the request
                    // and assign that index as the new order number for the task
                    task.order = tasks.findIndex(
                        (item: any) => item.id === task.id
                    );
                });

                // Clone the tasks
                const updatedTasks = cloneDeep(this._tasks);

                return [200, updatedTasks];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Task - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/tasks/task')
            .reply(({ request }) => {
                // Get the id from the params
                const id = request.params.get('id');

                // Clone the tasks
                const tasks = cloneDeep(this._tasks);

                // Find the task
                const task = tasks.find((item) => item.id === id);

                return [200, task];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Task - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/apps/tasks/task')
            .reply(({ request }) => {
                const newTask = {
                    id: FuseMockApiUtils.guid(),
                    type: request.body.type,
                    title: '',
                    notes: null,
                    completed: false,
                    dueDate: null,
                    priority: 1,
                    tags: [],
                    partners: [],
                    categories: [],
                    workHours: 0,
                    client: null,
                    order: 0,
                };

                // Unshift the new task
                this._tasks.unshift(newTask);

                // Go through the tasks and update their order numbers
                this._tasks.forEach((task, index) => {
                    task.order = index;
                });

                return [200, newTask];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Task - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/apps/tasks/task')
            .reply(({ request }) => {
                // Get the id and task
                const id = request.body.id;
                const task = cloneDeep(request.body.task);

                // Prepare the updated task
                let updatedTask = null;

                // Find the task and update it
                this._tasks.forEach((item, index, tasks) => {
                    if (item.id === id) {
                        // Update the task
                        tasks[index] = assign({}, tasks[index], task);

                        // Store the updated task
                        updatedTask = tasks[index];
                    }
                });

                return [200, updatedTask];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Task - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete('api/apps/tasks/task')
            .reply(({ request }) => {
                // Get the id
                const id = request.params.get('id');

                // Find the task and delete it
                const index = this._tasks.findIndex((item) => item.id === id);
                this._tasks.splice(index, 1);

                return [200, true];
            });
    }
}
