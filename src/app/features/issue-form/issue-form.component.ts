import { Component } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { IssueFormGroup } from '../../forms/issue-form-group';
import { FormArray, FormGroup } from '@angular/forms';

const yaml = require('js-yaml');

@Component({
  selector: 'app-issue-form',
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.scss'],
})
export class IssueFormComponent {
  form: IssueFormGroup = new IssueFormGroup();
  clipboardSuccess: boolean = false;
  clipboardError: boolean = false;
  scrollableItem!: { position: number };

  get controls(): FormGroup[] {
    return (this.form.get('body') as FormArray).controls as FormGroup[];
  }

  resetIssue(): void {
    this.form = new IssueFormGroup();
  }

  drop(event: CdkDragDrop<string[]>): void {
    this.moveItemInFormArray(
      this.form.get('body') as FormArray,
      event.previousIndex,
      event.currentIndex,
    );
  }

  moveItemInFormArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
    const dir = toIndex > fromIndex ? 1 : -1;

    const item = formArray.at(fromIndex);
    for (let i = fromIndex; i * dir < toIndex * dir; i = i + dir) {
      const current = formArray.at(i + dir);
      formArray.setControl(i, current);
    }
    formArray.setControl(toIndex, item);
  }

  async copyToClipboard(): Promise<void> {
    this.clipboardSuccess = false;
    this.clipboardError = false;
    const body = [
      ...this.form.value.body,
      {
        type: 'markdown',
        attributes: {
          value:
            'This template was generated with [Issue Forms Creator](https://www.issue-forms-creator.app/)',
        },
      },
    ];

    if (this.form.invalid) {
      this.clipboardError = true;
      setTimeout(() => (this.clipboardError = false), 2000);
      return;
    }

    const formattedIssue = yaml.dump({
      ...this.form.value,
      body,
    });
    await navigator.clipboard.writeText(formattedIssue);

    this.clipboardSuccess = true;
    setTimeout(() => (this.clipboardSuccess = false), 1000);
  }

  scrollToError(index: number): void {
    this.scrollableItem = Object.assign({ position: index });
  }
}
