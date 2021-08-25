import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'new-task',
    templateUrl: './new-task.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class NewTaskComponent {
    formFieldHelpers: string[] = [''];

    constructor() {}

    getFormFieldHelpersAsString(): string {
        return this.formFieldHelpers.join(' ');
    }
}
