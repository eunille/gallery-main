import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editcomment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editcomment.component.html',
  styleUrl: './editcomment.component.scss'
})
export class EditcommentComponent {
  editedText: string;

  constructor(
    public dialogRef: MatDialogRef<EditcommentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { commentText: string }
  ) {
    this.editedText = data.commentText; // Initialize edited text with existing comment text
  }

  save(): void {
    this.dialogRef.close(this.editedText);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
