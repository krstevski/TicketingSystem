import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { assign } from 'lodash-es';
import * as moment from 'moment';
import {
    Category,
    Partner,
    Tag,
    Task,
    Client,
} from 'app/modules/admin/tasks/tasks.types';
import { TasksListComponent } from 'app/modules/admin/tasks/list/list.component';
import { TasksService } from 'app/modules/admin/tasks/tasks.service';

@Component({
    selector: 'tasks-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    @ViewChild('partnersPanelOrigin') private partnersPanelOrigin: ElementRef;
    @ViewChild('categoriesPanelOrigin')
    private categoriesPanelOrigin: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('categoriesPanel') private categoriesPanel: TemplateRef<any>;
    @ViewChild('partnersPanel') private partnersPanel: TemplateRef<any>;
    @ViewChild('titleField') private _titleField: ElementRef;

    tags: Tag[];
    partners: Partner[];
    categories: Category[];
    tagsEditMode: boolean = false;
    partnersEditMode: boolean = false;
    categoriesEditMode: boolean = false;
    filteredTags: Tag[];
    filteredPartners: Partner[];
    filteredCategories: Category[];
    clients: Client[];
    task: Task;
    taskForm: FormGroup;
    tasks: Task[];
    workHours: number[];
    private _tagsPanelOverlayRef: OverlayRef;
    private partnersPanelOverlayRef: OverlayRef;
    private categoriesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    panelOpenState: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _tasksListComponent: TasksListComponent,
        private _tasksService: TasksService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._tasksListComponent.matDrawer.open();

        // Create the task form
        this.taskForm = this._formBuilder.group({
            id: [''],
            type: [''],
            title: [''],
            notes: [''],
            completed: [false],
            dueDate: [null],
            priority: [0],
            tags: [[]],
            partners: [[]],
            categories: [[]],
            client: [0],
            order: [0],
            workHours: [0],
        });

        // Get the tags
        this._tasksService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: Tag[]) => {
                this.tags = tags;
                this.filteredTags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._tasksService.partners$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((partners: Partner[]) => {
                this.partners = partners;
                this.filteredPartners = partners;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._tasksService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: Category[]) => {
                this.categories = categories;
                this.filteredCategories = categories;
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
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Task[]) => {
                this.tasks = tasks;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the task
        this._tasksService.task$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Task) => {
                // Open the drawer in case it is closed
                this._tasksListComponent.matDrawer.open();

                // Get the task
                this.task = task;

                // Patch values to the form from the task
                this.taskForm.patchValue(task, { emitEvent: false });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Update task when there is a value change on the task form
        this.taskForm.valueChanges
            .pipe(
                tap((value) => {
                    // Update the task object
                    this.task = assign(this.task, value);
                }),
                debounceTime(300),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((value) => {
                // Update the task on the server
                this._tasksService.updateTask(value.id, value).subscribe();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for NavigationEnd event to focus on the title field
        this._router.events
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter((event) => event instanceof NavigationEnd)
            )
            .subscribe(() => {
                // Focus on the title field
                this._titleField.nativeElement.focus();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Listen for matDrawer opened change
        this._tasksListComponent.matDrawer.openedChange
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter((opened) => opened)
            )
            .subscribe(() => {
                // Focus on the title element
                this._titleField.nativeElement.focus();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }

        if (this.partnersPanelOverlayRef) {
            this.partnersPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._tasksListComponent.matDrawer.close();
    }

    /**
     * Toggle the completed status
     */
    toggleCompleted(): void {
        // Get the form control for 'completed'
        const completedFormControl = this.taskForm.get('completed');

        // Toggle the completed status
        completedFormControl.setValue(!completedFormControl.value);
    }

    /**
     * Open tags panel
     */
    openTagsPanel(): void {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(64)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                ]),
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {
            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement
                .querySelector('input')
                .focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(
            this._tagsPanel,
            this._viewContainerRef
        );

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {
            // If overlay exists and attached...
            if (
                this._tagsPanelOverlayRef &&
                this._tagsPanelOverlayRef.hasAttached()
            ) {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    openPartnersPanel(): void {
        // Create the overlay
        this.partnersPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this.partnersPanelOrigin.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(64)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                ]),
        });

        // Subscribe to the attachments observable
        this.partnersPanelOverlayRef.attachments().subscribe(() => {
            // Focus to the search input once the overlay has been attached
            this.partnersPanelOverlayRef.overlayElement
                .querySelector('input')
                .focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(
            this.partnersPanel,
            this._viewContainerRef
        );

        // Attach the portal to the overlay
        this.partnersPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this.partnersPanelOverlayRef.backdropClick().subscribe(() => {
            // If overlay exists and attached...
            if (
                this.partnersPanelOverlayRef &&
                this.partnersPanelOverlayRef.hasAttached()
            ) {
                // Detach it
                this.partnersPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredPartners = this.partners;

                // Toggle the edit mode off
                this.partnersEditMode = false;
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    openCategoriesPanel(): void {
        // Create the overlay
        this.categoriesPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this.categoriesPanelOrigin.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(64)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                ]),
        });

        // Subscribe to the attachments observable
        this.categoriesPanelOverlayRef.attachments().subscribe(() => {
            // Focus to the search input once the overlay has been attached
            this.categoriesPanelOverlayRef.overlayElement
                .querySelector('input')
                .focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(
            this.categoriesPanel,
            this._viewContainerRef
        );

        // Attach the portal to the overlay
        this.categoriesPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this.categoriesPanelOverlayRef.backdropClick().subscribe(() => {
            // If overlay exists and attached...
            if (
                this.categoriesPanelOverlayRef &&
                this.categoriesPanelOverlayRef.hasAttached()
            ) {
                // Detach it
                this.categoriesPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredCategories = this.categories;

                // Toggle the edit mode off
                this.partnersEditMode = false;
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    togglePartnersEditMode(): void {
        this.partnersEditMode = !this.partnersEditMode;
    }

    toggleCategoriesEditMode(): void {
        this.categoriesEditMode = !this.categoriesEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter((tag) =>
            tag.title.toLowerCase().includes(value)
        );
    }

    filterPartners(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredPartners = this.partners.filter((partner) =>
            partner.firstName.toLowerCase().includes(value)
        );
    }

    filterCategories(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredCategories = this.categories.filter((category) =>
            category.name.toLowerCase().includes(value)
        );
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no tag available...
        if (this.filteredTags.length === 0) {
            // Create the tag
            this.createTag(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = this.task.tags.find((id) => id === tag.id);

        // If the found tag is already applied to the task...
        if (isTagApplied) {
            // Remove the tag from the task
            this.deleteTagFromTask(tag);
        } else {
            // Otherwise add the tag to the task
            this.addTagToTask(tag);
        }
    }

    filterPartnersInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no tag available...
        if (this.filteredPartners.length === 0) {
            // Create the tag
            this.createPartner(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const partner = this.filteredPartners[0];
        const isPartnerApplied = this.task.partners.find(
            (id) => id === partner.id
        );

        // If the found tag is already applied to the task...
        if (isPartnerApplied) {
            // Remove the tag from the task
            this.deletePartnerFromTask(partner);
        } else {
            // Otherwise add the tag to the task
            this.addPartnerToTask(partner);
        }
    }

    filterCategoriesInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no tag available...
        if (this.filteredCategories.length === 0) {
            // Create the tag
            this.createCategory(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const category = this.filteredCategories[0];
        const isCategoryApplied = this.task.categories.find(
            (id) => id === category.id
        );

        // If the found tag is already applied to the task...
        if (isCategoryApplied) {
            // Remove the tag from the task
            this.deleteCategoryFromTask(category);
        } else {
            // Otherwise add the tag to the task
            this.addCategoryToTask(category);
        }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void {
        const tag = {
            title,
        };

        // Create tag on the server
        this._tasksService.createTag(tag).subscribe((response) => {
            // Add the tag to the task
            this.addTagToTask(response);
        });
    }

    createPartner(firstName: string): void {
        const partner = {
            firstName,
        };

        // Create tag on the server
        this._tasksService.createPartner(partner).subscribe((response) => {
            // Add the tag to the task
            this.addPartnerToTask(response);
        });
    }

    createCategory(name: string): void {
        const category = {
            name,
        };

        // Create tag on the server
        this._tasksService.createCategory(category).subscribe((response) => {
            // Add the tag to the task
            this.addCategoryToTask(response);
        });
    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    updateTagTitle(tag: Tag, event): void {
        // Update the title on the tag
        tag.title = event.target.value;

        // Update the tag on the server
        this._tasksService
            .updateTag(tag.id, tag)
            .pipe(debounceTime(300))
            .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updatePartnerName(partner: Partner, event): void {
        // Update the title on the tag
        partner.firstName = event.target.value;

        // Update the tag on the server
        this._tasksService
            .updatePartner(partner.id, partner)
            .pipe(debounceTime(300))
            .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateCategoryName(category: Category, event): void {
        // Update the title on the tag
        category.name = event.target.value;

        // Update the tag on the server
        this._tasksService
            .updateCategory(category.id, category)
            .pipe(debounceTime(300))
            .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete the tag
     *
     * @param tag
     */
    deleteTag(tag: Tag): void {
        // Delete the tag from the server
        this._tasksService.deleteTag(tag.id).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    deletePartner(partner: Partner): void {
        // Delete the tag from the server
        this._tasksService.deletePartner(partner.id).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    deleteCategory(category: Category): void {
        // Delete the tag from the server
        this._tasksService.deleteCategory(category.id).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add tag to the task
     *
     * @param tag
     */
    addTagToTask(tag: Tag): void {
        // Add the tag
        this.task.tags.unshift(tag.id);

        // Update the task form
        this.taskForm.get('tags').patchValue(this.task.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    addPartnerToTask(partner: Partner): void {
        // Add the tag
        this.task.partners.unshift(partner.id);

        // Update the task form
        this.taskForm.get('partners').patchValue(this.task.partners);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    addCategoryToTask(category: Category): void {
        // Add the tag
        this.task.categories.unshift(category.id);

        // Update the task form
        this.taskForm.get('categories').patchValue(this.task.categories);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete tag from the task
     *
     * @param tag
     */
    deleteTagFromTask(tag: Tag): void {
        // Remove the tag
        this.task.tags.splice(
            this.task.tags.findIndex((item) => item === tag.id),
            1
        );

        // Update the task form
        this.taskForm.get('tags').patchValue(this.task.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    deletePartnerFromTask(partner: Partner): void {
        // Remove the partner
        this.task.partners.splice(
            this.task.partners.findIndex((item) => item === partner.id),
            1
        );

        // Update the task form
        this.taskForm.get('partners').patchValue(this.task.partners);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    deleteCategoryFromTask(category: Category): void {
        // Remove the category
        this.task.categories.splice(
            this.task.categories.findIndex((item) => item === category.id),
            1
        );

        // Update the task form
        this.taskForm.get('categories').patchValue(this.task.categories);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle task tag
     *
     * @param tag
     */
    toggleTaskTag(tag: Tag): void {
        if (this.task.tags.includes(tag.id)) {
            this.deleteTagFromTask(tag);
        } else {
            this.addTagToTask(tag);
        }
    }

    toggleTaskPartner(partner: Partner): void {
        if (this.task.partners.includes(partner.id)) {
            this.deletePartnerFromTask(partner);
        } else {
            this.addPartnerToTask(partner);
        }
    }

    toggleTaskCategory(category: Category): void {
        if (this.task.categories.includes(category.id)) {
            this.deleteCategoryFromTask(category);
        } else {
            this.addCategoryToTask(category);
        }
    }

    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(
            inputValue === '' ||
            this.tags.findIndex(
                (tag) => tag.title.toLowerCase() === inputValue.toLowerCase()
            ) > -1
        );
    }

    shouldShowCreatePartnerButton(inputValue: string): boolean {
        return !!!(
            inputValue === '' ||
            this.partners.findIndex(
                (partner) =>
                    partner.firstName.toLowerCase() === inputValue.toLowerCase()
            ) > -1
        );
    }

    shouldShowCreateCategoryButton(inputValue: string): boolean {
        return !!!(
            inputValue === '' ||
            this.categories.findIndex(
                (category) =>
                    category.name.toLowerCase() === inputValue.toLowerCase()
            ) > -1
        );
    }

    /**
     * Set the task priority
     *
     * @param priority
     */
    setTaskPriority(priority): void {
        // Set the value
        this.taskForm.get('priority').setValue(priority);
    }

    /**
     * Check if the task is overdue or not
     */
    isOverdue(): boolean {
        return moment(this.task.dueDate, moment.ISO_8601).isBefore(
            moment(),
            'days'
        );
    }

    /**
     * Delete the task
     */
    deleteTask(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Избриши задача',
            message:
                'Дали сте сигурни дека сакате да ја избришите задачата? Задачата нема да можи да се врати',
            // 'Are you sure you want to delete this task? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Избриши',
                },
                cancel: {
                    label: 'Откажи',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current task's id
                const id = this.task.id;

                // Get the next/previous task's id
                const currentTaskIndex = this.tasks.findIndex(
                    (item) => item.id === id
                );
                const nextTaskIndex =
                    currentTaskIndex +
                    (currentTaskIndex === this.tasks.length - 1 ? -1 : 1);
                const nextTaskId =
                    this.tasks.length === 1 && this.tasks[0].id === id
                        ? null
                        : this.tasks[nextTaskIndex].id;

                // Delete the task
                this._tasksService.deleteTask(id).subscribe((isDeleted) => {
                    // Return if the task wasn't deleted...
                    if (!isDeleted) {
                        return;
                    }

                    // Navigate to the next task if available
                    if (nextTaskId) {
                        this._router.navigate(['../', nextTaskId], {
                            relativeTo: this._activatedRoute,
                        });
                    }
                    // Otherwise, navigate to the parent
                    else {
                        this._router.navigate(['../'], {
                            relativeTo: this._activatedRoute,
                        });
                    }
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
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
