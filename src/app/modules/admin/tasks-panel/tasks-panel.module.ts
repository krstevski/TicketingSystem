import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelViewComponent } from './panel-view/panel-view.component';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { MatInputModule } from '@angular/material/input';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FuseNavigationModule } from '@fuse/components/navigation/navigation.module';
import { NewTaskComponent } from './new-task/new-task.component';
import { AllTasksComponent } from './all-tasks/all-tasks.component';

const routes: Route[] = [
    {
        path: '',
        component: PanelViewComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'all-tasks' },
            { path: 'new-task', component: NewTaskComponent },
            { path: 'all-tasks', component: AllTasksComponent },
        ],
    },
];

@NgModule({
    declarations: [
        PanelViewComponent,
        SidebarComponent,
        NewTaskComponent,
        AllTasksComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSidenavModule,
        MatTabsModule,
        MatProgressBarModule,
        FuseNavigationModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatFormFieldModule,
        MatMomentDateModule,
        MatSelectModule,
        MatInputModule,
        FuseHighlightModule,
    ],
})
export class TasksPanelModule {}
