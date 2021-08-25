import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

@Component({
    selector: 'app-panel-view',
    templateUrl: './panel-view.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class PanelViewComponent implements OnInit, OnDestroy {
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private fuseMediaWatcherService: FuseMediaWatcherService) {}

    ngOnInit(): void {
        this.fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
            });
    }

    ngOnDestroy(): void {
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
    }
}
