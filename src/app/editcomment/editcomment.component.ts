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

/*************  ✨ Codeium Command ⭐  *************/
  /**
/******  d3791f98-453e-4036-9cac-4c03fdf2cf48  *******/
  cancel(): void {
    this.dialogRef.close();
  }
}
