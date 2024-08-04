import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataserviceService } from '../services/dataservice.service';
import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  selectedFile: File | null = null;
  fileSizeError: string | null = null;
  images: any[] = [];
  error: string | undefined;
  selectedImage: any;
  isLightboxOpen = false;
  dragOver = false; // Track whether drag over event is active
  imagePreview: string | ArrayBuffer | null = null; // Store the image preview URL

  @ViewChild('exampleModal') modal?: ElementRef;
  @ViewChild('dropZone') dropZone?: ElementRef;

  constructor(private dataService: DataserviceService) {}

  ngOnInit(): void {
    this.fetchImages();
  }

  // Handle file selection from file input
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.handleFile(file);
  }

  // Handle drag over event
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true; // Set dragOver to true
    this.dropZone?.nativeElement.classList.add('drag-over');
  }

  // Handle drag leave event
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false; // Set dragOver to false
    this.dropZone?.nativeElement.classList.remove('drag-over');
  }

  // Handle drop event
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false; // Set dragOver to false
    this.dropZone?.nativeElement.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleFile(file); // Call handleFile to validate and set the selectedFile
    }
  }

  // Handle file upload logic
  handleFile(file: File): void {
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        this.fileSizeError = 'File size exceeds 20 MB';
        this.selectedFile = null;
        this.imagePreview = null;
      } else {
        this.fileSizeError = null;
        this.selectedFile = file;
        this.previewImage(file); // Preview the selected image
      }
    }
  }

  // Preview the selected image
  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Upload file to server
  uploadFile(): void {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result.split(',')[1];
        const data = {
          fileName: this.selectedFile?.name,
          fileType: this.selectedFile?.type,
          fileContent: base64
        };

        this.dataService.sendApiRequest('uploadImage', data).subscribe(
          (response: any) => {
            this.closeModal(); // Close the modal after successful upload
            this.fetchImages(); // Refresh images after upload
            swal.fire({
              title: 'Upload Successful',
              text: 'Your image has been uploaded successfully.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            console.log('Image uploaded:', response);
          },
          (error: any) => {
            console.error('Error uploading image:', error);
          }
        );
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      console.error('No file selected.');
    }
  }

  // Fetch images from server
  fetchImages(): void {
    this.dataService.recieveApiRequest('getImages').subscribe(
      (response: any) => {
        console.log('Fetched images:', response);
        this.images = response;
      },
      (error) => {
        console.error('Error fetching images:', error);
        this.error = error.message || 'Failed to fetch images';
      }
    );
  }

  // Delete image from server
  deleteImage(imageId: string): void {
    if (!imageId) {
      console.error('Image ID not provided.');
      return;
    }

    this.dataService.sendApiRequest('deleteImage', { id: imageId }).subscribe(
      (response: any) => {
        console.log('Image deleted successfully:', response);
        this.fetchImages(); // Refresh images after deletion
      },
      (error: any) => {
        console.error('Error deleting image:', error);
      }
    );
  }

  // Open lightbox for viewing image details
  openLightbox(image: any): void {
    console.log('Opening lightbox for image:', image);
    this.selectedImage = image;
    this.isLightboxOpen = true;
  }

  // Close lightbox
  closeLightbox(): void {
    this.selectedImage = null;
    this.isLightboxOpen = false;
  }

  // Open Bootstrap modal
  openModal(): void {
    $('#exampleModal').modal('show');
  }

  // Close Bootstrap modal
  closeModal(): void {
    $('#exampleModal').modal('hide');
    this.resetModal(); // Reset modal content
  }

  // Reset modal content
  resetModal(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileSizeError = null;
  }
}
