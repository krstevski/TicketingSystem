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
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
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
} from 'app/modules/admin/tasks/tasks.types';
import { TasksService } from 'app/modules/admin/tasks/tasks.service';

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    selectedTask: Task;
    tags: Tag[];
    partners: Partner[];
    categories: Category[];
    workHours: number[];
    clients: Client[];
    tasks: Task[];
    tasksCount: any = {
        completed: 0,
        incomplete: 0,
        total: 0,
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

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

        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Task[]) => {
                this.tasks = tasks;

                this.tasksCount.total = this.tasks.filter(
                    (task) => task.type === 'task'
                ).length;
                this.tasksCount.completed = this.tasks.filter(
                    (task) => task.type === 'task' && task.completed
                ).length;
                this.tasksCount.incomplete =
                    this.tasksCount.total - this.tasksCount.completed;

                this._changeDetectorRef.markForCheck();

                setTimeout(() => {
                    const mainNavigationComponent =
                        this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                            'mainNavigation'
                        );

                    if (mainNavigationComponent) {
                        const mainNavigation =
                            mainNavigationComponent.navigation;
                        const menuItem = this._fuseNavigationService.getItem(
                            'task',
                            mainNavigation
                        );
                        menuItem.subtitle =
                            this.tasksCount.incomplete + ' ?????????????????????? ????????????';

                        mainNavigationComponent.refresh();
                    }
                });
            });

        // Get the task
        this._tasksService.task$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Task) => {
                this.selectedTask = task;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media query change
        this._fuseMediaWatcherService
            .onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {
                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
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
                // If the '/' pressed
                if (event.key === '/') {
                    this.createTask('task');
                }

                // If the '.' pressed
                if (event.key === '.') {
                    this.createTask('section');
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create task
     *
     * @param type
     */
    createTask(type: 'task' | 'section'): void {
        // Create the task
        this._tasksService.createTask(type).subscribe((newTask) => {
            // Go to the new task
            this._router.navigate(['./', newTask.id], {
                relativeTo: this._activatedRoute,
            });

            // Mark for check
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
        // Toggle the completed status
        task.completed = !task.completed;

        // Update the task on the server
        this._tasksService.updateTask(task.id, task).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Task dropped
     *
     * @param event
     */
    dropped(event: CdkDragDrop<Task[]>): void {
        // Move the item in the array
        moveItemInArray(
            event.container.data,
            event.previousIndex,
            event.currentIndex
        );

        // Save the new order
        this._tasksService.updateTasksOrders(event.container.data).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

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
