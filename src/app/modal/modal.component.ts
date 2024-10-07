import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  files: any[] = [];

  constructor(public dialogRef: MatDialogRef<ModalComponent>) {}

  // Handling file drop
  onFileDrop(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Check if the file is an image
          if (file.type.startsWith('image/')) {
            this.previewFile(file);
          } else {
            alert('Only image files are allowed.');
          }
        });
      }
    }
  }

  // Handling file selection via file input
  onFileSelected(event: any) {
    const selectedFiles: File[] = Array.from(event.target.files);
    selectedFiles.forEach((file) => {
      // Check if the selected file is an image
      if (file.type.startsWith('image/')) {
        this.previewFile(file);
      } else {
        alert('Only image files are allowed.');
      }
    });
  }

  // Previewing the image file
  previewFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.files.unshift({
        name: file.name,
        preview: e.target.result,
        file: file,
      });
    };
    reader.readAsDataURL(file);
  }

  // Closing the modal with the selected files
  onDone() {
    this.dialogRef.close(this.files);
  }

  // Removing a selected file from the list
  removeFile(file: any) {
    this.files = this.files.filter((f) => f !== file);
  }
}
