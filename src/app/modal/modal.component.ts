import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  files: any[] = [];

  constructor(public dialogRef: MatDialogRef<ModalComponent>) { }

  onFileDrop(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.previewFile(file);
        });
      }
    }
  }


  onFileSelected(event: any) {
    const selectedFiles: File[] = Array.from(event.target.files);
    selectedFiles.forEach(file => this.previewFile(file));
  }

  previewFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.files.push({
        name: file.name,
        preview: e.target.result,
        file: file
      });
    };
    reader.readAsDataURL(file);
  }

  onDone() {
    this.dialogRef.close(this.files);
  }

  removeFile(file: any) {
    // Filter out the file from the files array
    this.files = this.files.filter(f => f !== file);
  }
  
}
