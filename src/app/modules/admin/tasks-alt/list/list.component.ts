import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, combineLatest, fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import {
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import {
    Category,
    Partner,
    Tag,
    Task,
    Client,
} from 'app/modules/admin/tasks-alt/tasks.types';
import { TasksService } from 'app/modules/admin/tasks-alt/tasks.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    test: number[] = [1, 2, 3, 4, 5];
    drawerMode: 'side' | 'over';
    selectedTask: Task;
    tags: Tag[];
    partners: Partner[];
    categories: Category[];
    workHours: number[];
    clients: Client[];
    tasks: Task[];
    filteredTasks: Task[];
    filters: {
        categoryMultiple: BehaviorSubject<number[]>;
        partnerMultiple: BehaviorSubject<number[]>;
        priority: BehaviorSubject<number>;
        client: BehaviorSubject<number>;
        hideCompleted: BehaviorSubject<boolean>;
    } = {
        categoryMultiple: new BehaviorSubject([]),
        partnerMultiple: new BehaviorSubject([]),
        priority: new BehaviorSubject(-1),
        client: new BehaviorSubject(-1),
        hideCompleted: new BehaviorSubject(false),
    };
    priorities: number[] = [1, 2, 3];
    tasksCount: any = {
        completed: 0,
        incomplete: 0,
        total: 0,
    };
    filterForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _tasksService: TasksService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnInit(): void {
        this.filterForm = new FormGroup({
            category: new FormControl(''),
            partners: new FormControl(''),
            priority: new FormControl(-1),
            clients: new FormControl(-1),
        });

        this._tasksService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: Tag[]) => {
                this.tags = tags;
                this._changeDetectorRef.markForCheck();
            });

        this._tasksService.partners$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((partners: Partner[]) => {
                this.partners = partners;
                this._changeDetectorRef.markForCheck();
            });

        this._tasksService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: Category[]) => {
                this.categories = categories;
                this._changeDetectorRef.markForCheck();
            });

        this._tasksService.workHours$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((workHours: number[]) => {
                this.workHours = workHours;
                this._changeDetectorRef.markForCheck();
            });

        this._tasksService.clients$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((clients: Client[]) => {
                this.clients = clients;
                this._changeDetectorRef.markForCheck();
            });

        // Get the tasks
        this.getTasks();

        this._tasksService.task$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Task) => {
                this.selectedTask = task;

                this._changeDetectorRef.markForCheck();
            });

        this._fuseMediaWatcherService
            .onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {
                this.drawerMode = state.matches ? 'side' : 'over';
                this._changeDetectorRef.markForCheck();
            });

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(
                    (event) =>
                        (event.ctrlKey === true || event.metaKey) && // Ctrl or Cmd
                        (event.key === '/' || event.key === '.') // '/' or '.' key
                )
            )
            .subscribe((event: KeyboardEvent) => {
                if (event.key === '/') {
                    this.createTask('task');
                }

                // if (event.key === '.') {
                //     this.createTask('section');
                // }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private getTasks(): void {
        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(500))
            .subscribe((tasks: Task[]) => {
                this.tasks = this.filteredTasks = tasks;
                this.tasksCount.total = this.tasks.filter(
                    (task) => task.type === 'task'
                ).length;
                this.tasksCount.completed = this.tasks.filter(
                    (task) => task.type === 'task' && task.completed
                ).length;
                this.tasksCount.incomplete =
                    this.tasksCount.total - this.tasksCount.completed;

                this.reFilterTasks(tasks);

                this._changeDetectorRef.markForCheck();

                setTimeout(() => {
                    const mainNavigationComponent =
                        this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                            'mainNavigation'
                        );

                    // If the main navigation component exists...
                    if (mainNavigationComponent) {
                        const mainNavigation =
                            mainNavigationComponent.navigation;
                        const menuItem = this._fuseNavigationService.getItem(
                            'task-alt',
                            mainNavigation
                        );

                        menuItem.subtitle =
                            this.tasksCount.incomplete + ' преостанати задачи';

                        mainNavigationComponent.refresh();
                    }
                });
            });

        combineLatest([
            this.filters.hideCompleted,
            this.filters.categoryMultiple,
            this.filters.partnerMultiple,
            this.filters.priority,
            this.filters.client,
        ]).subscribe(
            ([
                hideCompleted,
                categoryMultiple,
                partnerMultiple,
                priority,
                client,
            ]) => {
                if (this.tasks)
                    this.filteredTasks = this.tasks.filter(
                        (task) => task.type !== 'section'
                    );

                if (categoryMultiple.length > 0) {
                    this.filteredTasks = this.filteredTasks.filter((task) => {
                        return task.categories.some((category) => {
                            return categoryMultiple.includes(category);
                        });
                    });
                }

                if (partnerMultiple.length > 0) {
                    this.filteredTasks = this.filteredTasks.filter((task) => {
                        return task.partners.some((partner) => {
                            return partnerMultiple.includes(partner);
                        });
                    });
                }

                if (priority != -1) {
                    this.filteredTasks = this.filteredTasks.filter(
                        (task) => task.priority == priority
                    );
                }

                if (client != -1) {
                    this.filteredTasks = this.filteredTasks.filter(
                        (task) => task.client == client
                    );
                }

                if (hideCompleted) {
                    this.filteredTasks = this.filteredTasks.filter(
                        (task) => task.completed == false
                    );
                }
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    filterCompleted(change: MatSlideToggleChange): void {
        this.filters.hideCompleted.next(change.checked);
        this._changeDetectorRef.markForCheck();
    }

    filterTasksByCategory(change: MatSelectChange): void {
        this.filters.categoryMultiple.next(change.value);
        this._changeDetectorRef.markForCheck();
    }

    filterTasksByPartner(change: MatSelectChange): void {
        this.filters.partnerMultiple.next(change.value);
        this._changeDetectorRef.markForCheck();
    }

    filterTasksByPriority(change: MatSelectChange): void {
        this.filters.priority.next(change.value);
        this._changeDetectorRef.markForCheck();
    }

    filterTasksByClient(change: MatSelectChange): void {
        this.filters.client.next(change.value);
        this._changeDetectorRef.markForCheck();
    }

    clearFilters(): void {
        this.filters.categoryMultiple.next([]);
        this.filters.partnerMultiple.next([]);
        this.filters.priority.next(-1);
        this.filters.client.next(-1);
        this.filterForm.get('category').setValue([]);
        this.filterForm.get('partners').setValue([]);
        this.filterForm.get('priority').setValue(-1);
        this.filterForm.get('clients').setValue(-1);
        this.getTasks();
        this._changeDetectorRef.markForCheck();
    }

    reFilterTasks(tasks: Task[]): void {
        if (tasks) {
            this.tasks = tasks.filter((task) => task.type !== 'section');
            this.filteredTasks = this.tasks;
        }

        if (this.filters.categoryMultiple.getValue().length > 0) {
            this.filteredTasks = this.filteredTasks.filter((task) => {
                return task.categories.some((category) => {
                    return this.filters.categoryMultiple
                        .getValue()
                        .includes(category);
                });
            });
        }

        if (this.filters.partnerMultiple.getValue().length > 0) {
            this.filteredTasks = this.filteredTasks.filter((task) => {
                return task.partners.some((partner) => {
                    return this.filters.partnerMultiple
                        .getValue()
                        .includes(partner);
                });
            });
        }

        if (this.filters.priority.getValue() != -1) {
            this.filteredTasks = this.filteredTasks.filter(
                (task) => task.priority == this.filters.priority.getValue()
            );
        }

        if (this.filters.client.getValue() != -1) {
            this.filteredTasks = this.filteredTasks.filter(
                (task) => task.client == this.filters.client.getValue()
            );
        }

        if (this.filters.hideCompleted.getValue()) {
            this.filteredTasks = this.filteredTasks.filter(
                (task) => task.completed == false
            );
        }
    }
    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create task
     *
     * @param type
     */
    createTask(type: 'task' | 'section'): void {
        this._tasksService.createTask(type).subscribe((newTask) => {
            this._router.navigate(['./', newTask.id], {
                relativeTo: this._activatedRoute,
            });
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Toggle the completed status
     * of the given task
     *
     * @param task
     */
    toggleCompleted(task: Task): void {
        task.completed = !task.completed;
        this._tasksService.updateTask(task.id, task).subscribe();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Task dropped
     *
     * @param event
     */
    dropped(event: CdkDragDrop<Task[]>): void {
        moveItemInArray(
            event.container.data,
            event.previousIndex,
            event.currentIndex
        );
        this._tasksService.updateTasksOrders(event.container.data).subscribe();
        this._changeDetectorRef.markForCheck();
    }

    // TODO: Create filters here

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
