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
    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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
        // -----------------------------------------------------------------------------------------------------
        // @ Tags - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/apps/tasks/tag')
            .reply(({ request }) => {
                // Get the tag
                const newTag = cloneDeep(request.body.tag);

                // Generate a new GUID
                newTag.id = FuseMockApiUtils.guid();

                // Unshift the new tag
                this._tags.unshift(newTag);

                return [200, newTag];
            });

        // Post partner
        this._fuseMockApiService
            .onPost('api/apps/tasks/partner')
            .reply(({ request }) => {
                // Get the partner
                const newPartner = cloneDeep(request.body.partner);

                // Generate a new GUID
                newPartner.id = FuseMockApiUtils.guid();

                // Unshift the new tag
                this.partners.unshift(newPartner);

                return [200, newPartner];
            });

        this._fuseMockApiService
            .onPost('api/apps/tasks/category')
            .reply(({ request }) => {
                // Get the partner
                const newCategory = cloneDeep(request.body.category);

                // Generate a new GUID
                newCategory.id = FuseMockApiUtils.guid();

                // Unshift the new tag
                this.categories.unshift(newCategory);

                return [200, newCategory];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Tags - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/apps/tasks/tag')
            .reply(({ request }) => {
                // Get the id and tag
                const id = request.body.id;
                const tag = cloneDeep(request.body.tag);

                // Prepare the updated tag
                let updatedTag = null;

                // Find the tag and update it
                this._tags.forEach((item, index, tags) => {
                    if (item.id === id) {
                        // Update the tag
                        tags[index] = assign({}, tags[index], tag);

                        // Store the updated tag
                        updatedTag = tags[index];
                    }
                });

                return [200, updatedTag];
            });

        this._fuseMockApiService
            .onPatch('api/apps/tasks/partner')
            .reply(({ request }) => {
                // Get the id and partner
                const id = request.body.id;
                const partner = cloneDeep(request.body.partner);

                // Prepare the updated partner
                let updatedPartner = null;

                // Find the partner and update it
                this.partners.forEach((item, index, partners) => {
                    if (item.id === id) {
                        // Update the partner
                        partners[index] = assign({}, partners[index], partner);

                        // Store the updated partner
                        updatedPartner = partners[index];
                    }
                });

                return [200, updatedPartner];
            });

        this._fuseMockApiService
            .onPatch('api/apps/tasks/category')
            .reply(({ request }) => {
                // Get the id and category
                const id = request.body.id;
                const category = cloneDeep(request.body.category);

                // Prepare the updated partner
                let updatedCategory = null;

                // Find the partner and update it
                this.categories.forEach((item, index, categories) => {
                    if (item.id === id) {
                        // Update the partner
                        categories[index] = assign(
                            {},
                            categories[index],
                            category
                        );

                        // Store the updated partner
                        updatedCategory = categories[index];
                    }
                });

                return [200, updatedCategory];
            });
        // -----------------------------------------------------------------------------------------------------
        // @ Tag - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete('api/apps/tasks/tag')
            .reply(({ request }) => {
                // Get the id
                const id = request.params.get('id');

                // Find the tag and delete it
                const index = this._tags.findIndex((item) => item.id === id);
                this._tags.splice(index, 1);

                // Get the tasks that have the tag
                const tasksWithTag = this._tasks.filter(
                    (task) => task.tags.indexOf(id) > -1
                );

                // Iterate through them and remove the tag
                tasksWithTag.forEach((task) => {
                    task.tags.splice(task.tags.indexOf(id), 1);
                });

                return [200, true];
            });
        // Delete partner
        this._fuseMockApiService
            .onDelete('api/apps/tasks/partner')
            .reply(({ request }) => {
                // Get the id
                const id = request.params.get('id');

                // Find the partner and delete it
                const index = this.partners.findIndex((item) => item.id === id);
                this.partners.splice(index, 1);

                // Get the tasks that have the partner
                const tasksWithPartner = this._tasks.filter(
                    (task) => task.partners.indexOf(id) > -1
                );

                // Iterate through them and remove the partner
                tasksWithPartner.forEach((task) => {
                    task.partners.splice(task.partners.indexOf(id), 1);
                });

                return [200, true];
            });

        this._fuseMockApiService
            .onDelete('api/apps/tasks/category')
            .reply(({ request }) => {
                // Get the id
                const id = request.params.get('id');

                // Find the category and delete it
                const index = this.categories.findIndex(
                    (item) => item.id === id
                );
                this.categories.splice(index, 1);

                // Get the tasks that have the category
                const taskWithCategory = this._tasks.filter(
                    (task) => task.categories.indexOf(id) > -1
                );

                // Iterate through them and remove the taskWithCategory
                taskWithCategory.forEach((task) => {
                    task.categories.splice(task.categories.indexOf(id), 1);
                });

                return [200, true];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Tasks - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService.onGet('api/apps/tasks/all').reply(() => {
            // Clone the tasks
            const tasks = cloneDeep(this._tasks);

            // Sort the tasks by order
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
                // Generate a new task
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
