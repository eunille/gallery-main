import { Component, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { DataserviceService } from '../services/dataservice.service';
import swal from 'sweetalert2';
import { ModalComponent } from '../modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

declare var $: any;
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {
  // Properties
  selectedFile: File | null = null;
  selectedFiles: File[] = [];
  fileSizeError: string | null = null;
  selectedFileName: string | null = null;  // Add this property
  images: any[] = [];
  error: string | undefined;
  selectedImage: any;
  isLightboxOpen = false;
  dragOver = false;
  imagePreview: string | ArrayBuffer | null = null;
  username: string = '';
  userId: string | null = localStorage.getItem('user_id') || '';
  selectedUserId: string = ''; // Ensure it's initialized to an empty string
  isGalleryActive = true;

  setActiveLink(link: string): void {
    this.isGalleryActive = (link === 'gallery');
    if (this.isGalleryActive) {
      this.getAllUploads(); // Call your method to fetch all uploads if needed
    } else {
      this.showAllImages(); // Call your method to fetch user's uploads
    }
  }


  @ViewChild('exampleModal') modal?: ElementRef;
  @ViewChild('dropZone') dropZone?: ElementRef;
  @Output() delete = new EventEmitter<any>();

  constructor(private dataService: DataserviceService, private http: HttpClient, private router: Router,public dialog: MatDialog) {
    this.userId = localStorage.getItem('user_id') || '';
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Guest';
    this.fetchImages();
  }

  // Getter for formatted username with first letter capitalized
  get formattedUsername(): string {
    if (!this.username) return 'Guest';
    return this.username.charAt(0).toUpperCase() + this.username.slice(1);
  }

  // UI Methods
  openEditModal(): void {
    $('#editModal').modal('show');
  }

  closeEditModal(): void {
    $('#editModal').modal('hide');
  }

  openModal(): void {
    $('#exampleModal').modal('show');
  }

  closeModal(): void {
    $('#exampleModal').modal('hide');
    this.resetModal();
  }

  // File Handling Methods
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        this.fileSizeError = 'File size exceeds 20 MB';
        this.selectedFileName = null;
        this.selectedFiles = []; // Reset selected files
        
      } else {
        this.selectedFileName = file.name;
        this.fileSizeError = null;
        this.selectedFiles = [file]; // Set selected files
        
      }
    }
  }

  triggerFileInput(): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '90vw'
      // height: '50vh'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        this.selectedFiles = result.map((file: any) => file.file);
        this.uploadFile();
      }
    });
  }
  

  handleFile(file: File): void {
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        this.fileSizeError = 'File size exceeds 20 MB';
        this.selectedFile = null;
        this.imagePreview = null;
      } else {
        this.fileSizeError = null;
        this.selectedFile = file;
        this.previewImage(file);
      }
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadFile(): void {
    if (this.selectedFiles.length > 0) {
      const filesData: any[] = [];
      const formData = new FormData();

      // Read each file and prepare its data
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64File = reader.result as string;
          const fileContent = base64File.split(',')[1]; // Extract base64 content

          filesData.push({
            fileContent: fileContent,
            fileName: file.name,
            fileType: file.type
          });

          if (filesData.length === this.selectedFiles.length) {
            // Log filesData to check its structure
            console.log('Files Data:', filesData);

            // Add data to FormData
            formData.append('filesData', JSON.stringify(filesData));
            formData.append('userId', localStorage.getItem('user_id') || '');
            formData.append('userName', localStorage.getItem('username') || '');

            // Log FormData content
            formData.forEach((value, key) => {
              console.log(`FormData Key: ${key}, Value: ${value}`);
            });

            // Send encoded FormData
            this.dataService.sendApiRequest('uploadImage', {
              filesData: filesData,
              userId: localStorage.getItem('user_id'),
              userName: localStorage.getItem('username')
            }).subscribe(
              (response: any) => {
                console.log('Server Response:', response);

                if (response && response.code !== undefined) {
                  if (response.code === 200) {
                    swal.fire({
                      icon: 'success',
                      title: 'Upload Successful',
                      text: response.message
                    });
                    this.fetchImages();
                  } else {
                    swal.fire({
                      icon: 'error',
                      title: 'Upload Failed',
                      text: response.message || 'An unknown error occurred.'
                    });
                  }
                } else {
                  swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'Unexpected response format from the server.'
                  });
                }
              },
              (error: any) => {
                console.error('Error uploading images', error);
                swal.fire({
                  icon: 'error',
                  title: 'Upload Failed',
                  text: 'Error uploading images. Please try again.'
                });
              }
            );

            // Clear selected files and hide upload icon after uploading
            this.selectedFiles = [];
          
          }
        };

        reader.readAsDataURL(file); // Read file as data URL
      });
    } else {
      console.error('No files selected');
      swal.fire({
        icon: 'error',
        title: 'No Files Selected',
        text: 'Please select files to upload.'
      });
    }
  }

  // Drag and Drop Methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
    this.dropZone?.nativeElement.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    this.dropZone?.nativeElement.classList.remove('drag-over');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    this.dropZone?.nativeElement.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleFile(file);
    }
  }

  // Image Management Methods
  fetchImages(): void {
    this.dataService.recieveApiRequest('getImages').subscribe(
      (response: any) => {
        this.images = response;
        // Filter images based on selectedUserId
        if (this.selectedUserId) {
          this.images = this.images.filter(image => image.user_id.toString() === this.selectedUserId);
        }
      },
      (error) => {
        console.error('Error fetching images:', error);
        this.error = error.message || 'Failed to fetch images';
      }
    );
  }
  
  getAllUploads(): void {
    this.selectedUserId = ''; // Clear user-specific filter to show all images
    this.fetchImages(); // Fetch images with the new filter
  }
  // selectedUserId: string = ''; // Store the selected userId
  setUserId(userId: string): void {
    this.selectedUserId = userId || ''; // Ensure selectedUserId is a string
    this.fetchImages(); // Fetch images with the new filter
  }
  

  showAllImages(): void {
    this.selectedUserId = this.userId || ''; // Ensure selectedUserId is a string
    this.fetchImages(); // Fetch images with the new filter
  }
  
  

  deleteImage(image: any): void {
    if (!image || !image.image_id) {
      console.error('No image selected for deletion.');
      return;
    }

    swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.sendApiRequest('deleteImage', { image_id: image.image_id }).subscribe(
          (response: any) => {
            if (response.code === 200) {
              this.fetchImages();
              swal.fire({
                title: 'Deleted!',
                text: 'Your image has been deleted.',
                icon: 'success',
                timer: 2000
              });
            } else {
              swal.fire({
                title: 'Error!',
                text: 'There was an error deleting the image.',
                icon: 'error'
              });
            }
          },
          (error: any) => {
            console.error('Error deleting image', error);
            swal.fire({
              title: 'Error!',
              text: 'There was an error deleting the image.',
              icon: 'error'
            });
          }
        );
      }
    });
  }
 
  // Lightbox Methods
  openLightbox(image: any): void {
    this.selectedImage = image;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.selectedImage = null;
    this.isLightboxOpen = false;
  }

  // Method to handle update image event from LightboxComponent
  handleUpdateImage(): void {
    this.fetchImages();
  }

  // Reset modal content
  resetModal(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileSizeError = null;
  }

  logout() {
    swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.logout(); // Call logout function in dataservice
  
        // Navigate to login page before showing the success message
        this.router.navigate(['/login']).then(() => {
          // Show a success message after navigation
          swal.fire({
            icon: 'success',
            title: 'Logged out',
            text: 'You have been successfully logged out.',
            confirmButtonText: 'OK'
          });
        });
      }
    });
  }
  navigateToMyGallery() {
    this.router.navigate(['/mygallery']);
  }

}
