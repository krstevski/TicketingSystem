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
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    takeUntil,
} from 'rxjs/operators';
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
        categoryMultiple: BehaviorSubject<number[] | number>;
        partnerMultiple: BehaviorSubject<number[] | number>;
        priority: BehaviorSubject<number>;
        client: BehaviorSubject<number>;
        hideCompleted: BehaviorSubject<boolean>;
    } = {
        categoryMultiple: new BehaviorSubject(0),
        partnerMultiple: new BehaviorSubject(0),
        priority: new BehaviorSubject(0),
        client: new BehaviorSubject(0),
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
            priority: new FormControl('all'),
            clients: new FormControl('all'),
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
        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(500))
            .subscribe((tasks: Task[]) => {
                this.tasks = this.filteredTasks = tasks;
                // console.log('Getting all tasks');
                // Update the counts
                this.tasksCount.total = this.tasks.filter(
                    (task) => task.type === 'task'
                ).length;
                this.tasksCount.completed = this.tasks.filter(
                    (task) => task.type === 'task' && task.completed
                ).length;
                this.tasksCount.incomplete =
                    this.tasksCount.total - this.tasksCount.completed;

                if (this.filters.hideCompleted.getValue()) {
                    console.log(
                        'Filtering..... ' +
                            this.filters.hideCompleted.getValue()
                    );

                    this.filteredTasks = this.filteredTasks.filter(
                        (task) => task.completed == false
                    );
                }

                this._changeDetectorRef.markForCheck();

                // Update the count on the navigation
                setTimeout(() => {
                    // Get the component -> navigation data -> item
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

        combineLatest([this.filters.hideCompleted]).subscribe(
            ([hideCompleted]) => {
                this.filteredTasks = this.tasks;
                if (hideCompleted) {
                    this.filteredTasks = this.filteredTasks.filter(
                        (task) => task.completed == false
                    );
                }
                this._changeDetectorRef.markForCheck();
            }
        );
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

                if (event.key === '.') {
                    this.createTask('section');
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    filterCompleted(change: MatSlideToggleChange): void {
        this.filters.hideCompleted.next(change.checked);
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
