import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TasksService } from 'app/modules/admin/tasks-alt/tasks.service';
import {
    Category,
    Client,
    Partner,
    Tag,
    Task,
} from 'app/modules/admin/tasks-alt/tasks.types';

@Injectable({
    providedIn: 'root',
})
export class TasksTagsResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Tag[]> {
        return this._tasksService.getTags();
    }
}

@Injectable({
    providedIn: 'root',
})
export class TasksResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Task[]> {
        return this._tasksService.getTasks();
    }
}

@Injectable({
    providedIn: 'root',
})
export class TasksTaskResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _router: Router, private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Task> {
        return this._tasksService.getTaskById(route.paramMap.get('id')).pipe(
            // Error here means the requested task is not available
            catchError((error) => {
                // Log the error
                console.error(error);

                // Get the parent url
                const parentUrl = state.url.split('/').slice(0, -1).join('/');

                // Navigate to there
                this._router.navigateByUrl(parentUrl);

                // Throw an error
                return throwError(error);
            })
        );
    }
}

@Injectable({
    providedIn: 'root',
})
export class TasksPartnersResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Partner[]> {
        return this._tasksService.getPartners();
    }
}

@Injectable({
    providedIn: 'root',
})
export class TasksCategoriesResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Category[]> {
        return this._tasksService.getCategories();
    }
}

@Injectable({
    providedIn: 'root',
})
export class TasksWorkHoursResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<number[]> {
        return this._tasksService.getWorkHours();
    }
}

@Injectable({
    providedIn: 'root',
})
export class TasksClientResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Client[]> {
        return this._tasksService.getClients();
    }
}
