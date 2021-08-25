import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import {
    Category,
    Partner,
    Tag,
    Task,
} from 'app/modules/admin/tasks/tasks.types';

@Injectable({
    providedIn: 'root',
})
export class TasksService {
    // Private
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
    private partners: BehaviorSubject<Partner[] | null> = new BehaviorSubject(
        null
    );
    private categories: BehaviorSubject<Category[] | null> =
        new BehaviorSubject(null);

    private _task: BehaviorSubject<Task | null> = new BehaviorSubject(null);
    private _tasks: BehaviorSubject<Task[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]> {
        return this._tags.asObservable();
    }

    get partners$(): Observable<Partner[]> {
        return this.partners.asObservable();
    }

    get categories$(): Observable<Category[]> {
        return this.categories.asObservable();
    }

    /**
     * Getter for task
     */
    get task$(): Observable<Task> {
        return this._task.asObservable();
    }

    /**
     * Getter for tasks
     */
    get tasks$(): Observable<Task[]> {
        return this._tasks.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get tags
     */
    getTags(): Observable<Tag[]> {
        return this._httpClient.get<Tag[]>('api/apps/tasks/tags').pipe(
            tap((response: any) => {
                this._tags.next(response);
            })
        );
    }

    getPartners(): Observable<Partner[]> {
        return this._httpClient.get<Partner[]>('api/apps/tasks/partners').pipe(
            tap((response: any) => {
                this.partners.next(response);
            })
        );
    }

    getCategories(): Observable<Category[]> {
        return this._httpClient
            .get<Category[]>('api/apps/tasks/categories')
            .pipe(
                tap((response: any) => {
                    this.categories.next(response);
                })
            );
    }

    /**
     * Crate tag
     *
     * @param tag
     */
    createTag(tag: Tag): Observable<Tag> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient.post<Tag>('api/apps/tasks/tag', { tag }).pipe(
                    map((newTag) => {
                        // Update the tags with the new tag
                        this._tags.next([...tags, newTag]);

                        // Return new tag from observable
                        return newTag;
                    })
                )
            )
        );
    }

    createPartner(partner: Partner): Observable<Partner> {
        return this.partners$.pipe(
            take(1),
            switchMap((partners) =>
                this._httpClient
                    .post<Partner>('api/apps/tasks/partner', { partner })
                    .pipe(
                        map((newPartner) => {
                            // Update the partners with the new partner
                            this.partners.next([...partners, newPartner]);

                            // Return new partner from observable
                            return newPartner;
                        })
                    )
            )
        );
    }

    createCategory(category: Category): Observable<Category> {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) =>
                this._httpClient
                    .post<Category>('api/apps/tasks/category', { category })
                    .pipe(
                        map((newCategory) => {
                            // Update the partners with the new partner
                            this.categories.next([...categories, newCategory]);

                            // Return new partner from observable
                            return newCategory;
                        })
                    )
            )
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: Tag): Observable<Tag> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient
                    .patch<Tag>('api/apps/tasks/tag', {
                        id,
                        tag,
                    })
                    .pipe(
                        map((updatedTag) => {
                            // Find the index of the updated tag
                            const index = tags.findIndex(
                                (item) => item.id === id
                            );

                            // Update the tag
                            tags[index] = updatedTag;

                            // Update the tags
                            this._tags.next(tags);

                            // Return the updated tag
                            return updatedTag;
                        })
                    )
            )
        );
    }

    updatePartner(id: number, partner: Partner): Observable<Partner> {
        return this.partners$.pipe(
            take(1),
            switchMap((partners) =>
                this._httpClient
                    .patch<Partner>('api/apps/tasks/partner', {
                        id,
                        partner,
                    })
                    .pipe(
                        map((updatedPartner) => {
                            // Find the index of the updated partner
                            const index = partners.findIndex(
                                (item) => item.id === id
                            );

                            // Update the partner
                            partners[index] = updatedPartner;

                            // Update the partners
                            this.partners.next(partners);

                            // Return the updated partner
                            return updatedPartner;
                        })
                    )
            )
        );
    }

    updateCategory(id: number, category: Category): Observable<Category> {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) =>
                this._httpClient
                    .patch<Category>('api/apps/tasks/category', {
                        id,
                        category,
                    })
                    .pipe(
                        map((updatedCategory) => {
                            // Find the index of the updated partner
                            const index = categories.findIndex(
                                (item) => item.id === id
                            );

                            // Update the partner
                            categories[index] = updatedCategory;

                            // Update the categories
                            this.categories.next(categories);

                            // Return the updated partner
                            return updatedCategory;
                        })
                    )
            )
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient
                    .delete('api/apps/tasks/tag', { params: { id } })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted tag
                            const index = tags.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the tag
                            tags.splice(index, 1);

                            // Update the tags
                            this._tags.next(tags);

                            // Return the deleted status
                            return isDeleted;
                        }),
                        filter((isDeleted) => isDeleted),
                        switchMap((isDeleted) =>
                            this.tasks$.pipe(
                                take(1),
                                map((tasks) => {
                                    // Iterate through the tasks
                                    tasks.forEach((task) => {
                                        const tagIndex = task.tags.findIndex(
                                            (tag) => tag === id
                                        );

                                        // If the task has a tag, remove it
                                        if (tagIndex > -1) {
                                            task.tags.splice(tagIndex, 1);
                                        }
                                    });

                                    // Return the deleted status
                                    return isDeleted;
                                })
                            )
                        )
                    )
            )
        );
    }

    deletePartner(id: number): Observable<boolean> {
        return this.partners$.pipe(
            take(1),
            switchMap((partners) =>
                this._httpClient
                    .delete('api/apps/tasks/partner', { params: { id } })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted partner
                            const index = partners.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the partner
                            partners.splice(index, 1);

                            // Update the partners
                            this.partners.next(partners);

                            // Return the deleted status
                            return isDeleted;
                        }),
                        filter((isDeleted) => isDeleted),
                        switchMap((isDeleted) =>
                            this.tasks$.pipe(
                                take(1),
                                map((tasks) => {
                                    // Iterate through the tasks
                                    tasks.forEach((task) => {
                                        const partnerIndex =
                                            task.partners.findIndex(
                                                (partner) => partner === id
                                            );

                                        // If the task has a partner, remove it
                                        if (partnerIndex > -1) {
                                            task.partners.splice(
                                                partnerIndex,
                                                1
                                            );
                                        }
                                    });

                                    // Return the deleted status
                                    return isDeleted;
                                })
                            )
                        )
                    )
            )
        );
    }

    deleteCategory(id: number): Observable<boolean> {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) =>
                this._httpClient
                    .delete('api/apps/tasks/category', { params: { id } })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted category
                            const index = categories.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the category
                            categories.splice(index, 1);

                            // Update the categories
                            this.categories.next(categories);

                            // Return the deleted status
                            return isDeleted;
                        }),
                        filter((isDeleted) => isDeleted),
                        switchMap((isDeleted) =>
                            this.tasks$.pipe(
                                take(1),
                                map((tasks) => {
                                    // Iterate through the tasks
                                    tasks.forEach((task) => {
                                        const categoryIndex =
                                            task.categories.findIndex(
                                                (category) => category === id
                                            );

                                        // If the task has a category, remove it
                                        if (categoryIndex > -1) {
                                            task.categories.splice(
                                                categoryIndex,
                                                1
                                            );
                                        }
                                    });

                                    // Return the deleted status
                                    return isDeleted;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Get tasks
     */
    getTasks(): Observable<Task[]> {
        return this._httpClient.get<Task[]>('api/apps/tasks/all').pipe(
            tap((response) => {
                this._tasks.next(response);
            })
        );
    }

    /**
     * Update tasks orders
     *
     * @param tasks
     */
    updateTasksOrders(tasks: Task[]): Observable<Task[]> {
        return this._httpClient.patch<Task[]>('api/apps/tasks/order', {
            tasks,
        });
    }

    /**
     * Search tasks with given query
     *
     * @param query
     */
    searchTasks(query: string): Observable<Task[] | null> {
        return this._httpClient.get<Task[] | null>('api/apps/tasks/search', {
            params: { query },
        });
    }

    /**
     * Get task by id
     */
    getTaskById(id: string): Observable<Task> {
        return this._tasks.pipe(
            take(1),
            map((tasks) => {
                // Find the task
                const task = tasks.find((item) => item.id === id) || null;

                // Update the task
                this._task.next(task);

                // Return the task
                return task;
            }),
            switchMap((task) => {
                if (!task) {
                    return throwError(
                        'Could not find task with id of ' + id + '!'
                    );
                }

                return of(task);
            })
        );
    }

    /**
     * Create task
     *
     * @param type
     */
    createTask(type: string): Observable<Task> {
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient
                    .post<Task>('api/apps/tasks/task', { type })
                    .pipe(
                        map((newTask) => {
                            // Update the tasks with the new task
                            this._tasks.next([newTask, ...tasks]);

                            // Return the new task
                            return newTask;
                        })
                    )
            )
        );
    }

    /**
     * Update task
     *
     * @param id
     * @param task
     */
    updateTask(id: string, task: Task): Observable<Task> {
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient
                    .patch<Task>('api/apps/tasks/task', {
                        id,
                        task,
                    })
                    .pipe(
                        map((updatedTask) => {
                            // Find the index of the updated task
                            const index = tasks.findIndex(
                                (item) => item.id === id
                            );

                            // Update the task
                            tasks[index] = updatedTask;

                            // Update the tasks
                            this._tasks.next(tasks);

                            // Return the updated task
                            return updatedTask;
                        }),
                        switchMap((updatedTask) =>
                            this.task$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the task if it's selected
                                    this._task.next(updatedTask);

                                    // Return the updated task
                                    return updatedTask;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the task
     *
     * @param id
     */
    deleteTask(id: string): Observable<boolean> {
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient
                    .delete('api/apps/tasks/task', { params: { id } })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted task
                            const index = tasks.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the task
                            tasks.splice(index, 1);

                            // Update the tasks
                            this._tasks.next(tasks);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }
}
