import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import html2canvas from 'html2canvas';
import { DataserviceService } from '../services/dataservice.service';
import { EditcommentComponent } from '../editcomment/editcomment.component';
import { MatDialog } from '@angular/material/dialog';
import { CropComponent } from '../crop/crop.component';
import Swal from 'sweetalert2';

// Assuming you have a Comment interface defined somewhere
interface Comment {
  comment_id: string;
  user_id: string;
  username: string;
  image_id: string; // Add image_id property
  comment_text: string;
  // Add any other properties if needed
}


@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.scss']
})
export class LightboxComponent {
  @Input() selectedImage: any;
  @Output() updateImageEvent = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<any>();
  @Output() download = new EventEmitter<string>();

  filterSettings: any = {
    blackWhite: 'grayscale(100%)',
    film: 'sepia(50%) contrast(85%) brightness(110%)',
    clear: 'brightness(120%) contrast(110%)',
    warm: 'sepia(30%) saturate(150%)',
    fresh: 'brightness(105%) saturate(130%)',
  };

  selectedFilter: string = '';
  currentFilter: string = '';

  showEditOptions = false; // Toggle to show/hide edit options

  @ViewChild('imageElement') imageElement: ElementRef<HTMLImageElement> | undefined;

  comments: Comment[] = [];
  newComment: string = ''; // Model for new comment input
  userId: string | null = localStorage.getItem('user_id');

  constructor(private elementRef: ElementRef, private dataService: DataserviceService, public dialog: MatDialog) {
    this.userId = localStorage.getItem('user_id');
    this.fetchComments();
  }


  formatUploadedDate(uploadedAt: any): string {
    if (!uploadedAt) {
      return 'Unknown date';
    }

    // Ensure uploadedAt is a Date object
    const uploadedDate = new Date(uploadedAt);

    // Calculate time difference
    const now = new Date();
    const diffMs = now.getTime() - uploadedDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 0) {
      // Handle future dates, if necessary
      return 'Uploaded in the future?';
    } else if (diffDays === 0) {
      // Today
      if (diffHours === 0) {
        // Less than an hour ago
        if (diffMinutes === 0) {
          return 'Posted just now';
        } else {
          return `Posted ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
      } else if (diffHours === 1) {
        return 'Posted an hour ago';
      } else {
        return `Posted ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      }
    } else if (diffDays === 1) {
      // Yesterday
      return 'Posted yesterday';
    } else if (diffDays <= 3) {
      // 2 or 3 days ago
      return `Posted ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      // More than 3 days ago
      return uploadedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  }

  closeLightbox(): void {
    this.close.emit();
  }

  deleteImage(): void {
    this.delete.emit(this.selectedImage);
  }

  onDownload(imageFileName: string) {
    this.download.emit(imageFileName);
  }

  // applyFilter(filterType: string, value: number): void {
  //   this.filterSettings[filterType] = value;
  //   this.applyFilters();
  // }

  // resetFilters(): void {
  //   this.filterSettings.brightness = 100;
  //   this.filterSettings.contrast = 100;
  //   this.filterSettings.saturate = 100;
  //   this.filterSettings.grayscale = 0;
  //   this.filterSettings.sepia = 0;
  //   this.filterSettings.blur = 0;

  //   // Optionally, apply the filters immediately after resetting
  //   this.applyFilters();
  // }

  ngAfterViewInit(): void {
    this.loadImage();
  }


  loadImage() {
    if (this.imageElement && this.selectedImage) {
      console.log('Selected image:', this.selectedImage);
      console.log('Image src:', `http://localhost/galleryy/gallery-api/uploads/${this.selectedImage.file_name}`);

      this.imageElement.nativeElement.crossOrigin = 'anonymous';
      this.imageElement.nativeElement.src = `http://localhost/galleryy/gallery-api/uploads/${this.selectedImage.file_name}`;
    } else {
      console.error('Image element or selected image is not available.');
      console.log('Image element:', this.imageElement);
      console.log('Selected image:', this.selectedImage);
    }
  }


  updateImage() {
    const imageFileName = this.selectedImage?.file_name;
    const canvas = document.createElement('canvas');

    if (this.imageElement && this.imageElement.nativeElement.complete) {
      canvas.width = this.imageElement.nativeElement.width;
      canvas.height = this.imageElement.nativeElement.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.filter = this.currentFilter;
        ctx.drawImage(this.imageElement.nativeElement, 0, 0, canvas.width, canvas.height);

        try {
          const dataURL = canvas.toDataURL('image/jpeg');
          const base64Content = dataURL.split(',')[1];

          const data = {
            fileName: imageFileName,
            fileContent: base64Content
          };

          this.dataService.sendApiRequest('updateImage', data).subscribe(
            (response: any) => {
              if (response.code === 200) {
                Swal.fire({
                  icon: 'success',
                  title: 'Update Successful',
                  text: response.message
                });
                this.updateImageEvent.emit();
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Update Failed',
                  text: response.message
                });
              }
            },
            (error: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Error updating image. Please try again.'
              });
            }
          );
        } catch (error) {
          console.error('Error converting canvas to data URL', error);
        }
      } else {
        console.error('Image element is undefined, its native element is not accessible, or image source is not loaded.');
      }
    }
  }




  openCropDialog(): void {
    const dialogRef = this.dialog.open(CropComponent, {
      width: '80%',
      data: { imageSrc: `http://localhost/galleryy/gallery-api/uploads/${this.selectedImage.file_name}` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.croppedImage) {
        this.cropImage(result.croppedImage);
        this.updateImageEvent.emit();
        this.close.emit();
      }
    });
  }


  cropImage(croppedImage: string): void {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = croppedImage;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg');
        const base64Content = dataURL.split(',')[1];
        const data = {
          fileName: this.selectedImage?.file_name,
          fileContent: base64Content
        };

        this.dataService.sendApiRequest('cropImage', data).subscribe(
          (response: { code: number; message: string }) => {
            if (response.code === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Crop Successfully',
                text: response.message
              });
              this.updateImageEvent.emit();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: response.message
              });
            }
          },
          (error: any) => {
            console.error('Error updating image file', error);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'Error updating image. Please try again.'
            });
          }
        );
      }
    };
  }




  saveFiltered() {
    const imageFileName = this.selectedImage?.file_name;
    const canvas = document.createElement('canvas');
  
    if (this.imageElement && this.imageElement.nativeElement.complete) {
      canvas.width = this.imageElement.nativeElement.width;
      canvas.height = this.imageElement.nativeElement.height;
  
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.filter = this.currentFilter;
        ctx.drawImage(this.imageElement.nativeElement, 0, 0, canvas.width, canvas.height);
  
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `filtered_${imageFileName}`;
            link.click();
  
            Swal.fire({
              icon: 'success',
              title: 'Successfully Downloaded',
              text: 'The filtered image has been downloaded successfully.',
            });
          }
        }, 'image/jpeg');
      }
    }
  }
  

  fetchComments(): void {
    this.dataService.recieveApiRequest('getComments').subscribe(
      (response: any) => {
        console.log('Comments:', response); // Log all comments received
        this.comments = response; // Assuming response is an array of comments
        console.log('Current User ID:', this.userId); // Log current user ID after fetching comments
      },
      (error: any) => {
        console.error('Error fetching comments:', error);
      }
    );
  }


    addComment(): void {
      if (this.newComment.trim().length === 0) {
        console.error('Cannot add an empty comment.');
        return;
      }

      if (this.newComment.length > 150) {
        console.error('Comment exceeds maximum limit of 150 characters.');
        return;
      }

      const userId = localStorage.getItem('user_id');
      const userName = localStorage.getItem('username');
      if (!userId) {
        console.error('User ID not found in localStorage.');
        return;
      }

      // Define image_id explicitly
      const imageId = this.selectedImage?.image_id;

      const commentData = {
        user_id: userId,
        username: userName,
        image_id: imageId,
        comment_text: this.newComment.trim()
      };

      console.log('Comment Data:', commentData); // Check the commentData object before sending

      this.dataService.sendApiRequest('addComment', commentData).subscribe((response: { code: number, comment?: any, message?: string }) => {
        if (response.code === 200) {
          // Assuming response includes the new comment object
          this.fetchComments();
          if (response.comment) {
            this.comments.push(response.comment); // Add the new comment to comments array
          }
          this.newComment = ''; // Clear input after successful addition
        } else {
          console.error('Error adding comment:', response.message);
        }
      });
    }

    editComment(comment: Comment): void {
      console.log('Editing comment:', comment); // Log the comment object to see its structure

      const dialogRef = this.dialog.open(EditcommentComponent, {
        width: '500px',
        data: { commentText: comment.comment_text }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Updated comment text:', result); // Log the updated comment text

          // Update the comment locally and send API request to update on server
          const updatedComment = { ...comment, comment_text: result };

          console.log('Sending update request for comment:', updatedComment); // Log the updated comment object

          this.dataService.sendApiRequest('editComment', updatedComment).subscribe(
            (response: any) => {
              console.log('Response from server:', response); // Log the response from the server
              if (response && response.code === 200) {
                console.log('Comment updated successfully');

                  // Show success message using SweetAlert2
            Swal.fire({
              icon: 'success',
              title: 'Comment Updated',
              text: 'Your comment has been updated successfully.',
              confirmButtonText: 'OK'
            });

                // Optionally, update the comment in your local array if needed
                const index = this.comments.findIndex(c => c.comment_id === comment.comment_id);
                if (index !== -1) {
                  this.comments[index].comment_text = result;
                }
              } else {
                console.error('Error updating comment:', response.message);
              }
            },
            (error: any) => {
              console.error('Error updating comment:', error); // Log any error that occurs during API request
            }
          );
        }
      });
    }


   deleteComment(comment: Comment): void {
  const userId = localStorage.getItem('user_id');

  // Confirm deletion with SweetAlert2
  Swal.fire({
    title: 'Are you sure?',
    text: 'You won\'t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      // Ensure the current user is authorized to delete the comment
      if (!userId || comment.user_id.toString() !== userId) {
        console.error('User is not authorized to delete this comment.');
        return;
      }

      // Proceed with delete operation
      this.dataService.sendApiRequest('deleteComment', { comment_id: comment.comment_id }).subscribe(
        (response: any) => {
          console.log('Comment deleted successfully', response);
          this.fetchComments(); // Refresh comments after successful deletion
          
          Swal.fire(
            'Deleted!',
            'Your comment has been deleted.',
            'success'
          );
        },
        (error: any) => {
          console.error('Error deleting comment', error);
        }
      );
    }
  });
}







  toggleEditOptions(): void {
    this.showEditOptions = !this.showEditOptions;
    if (!this.showEditOptions) {
      this.resetFilters(); // Reset filters when hiding edit options
    }
  }

  // private applyFilters(): void {
  //   let filterString = '';
  //   for (const key in this.filterSettings) {
  //     if (Object.prototype.hasOwnProperty.call(this.filterSettings, key)) {
  //       filterString += `${key}(${this.filterSettings[key]}%) `;
  //     }
  //   }
  //   if (this.imageElement) {
  //     this.imageElement.nativeElement.style.filter = filterString.trim();
  //   }
  // }
  applyFilter(): void {
    this.currentFilter = this.filterSettings[this.selectedFilter] || '';
    if (this.imageElement) {
      this.imageElement.nativeElement.style.filter = this.currentFilter;
    }
  }

  resetFilters(): void {
    this.selectedFilter = '';
    this.currentFilter = '';
    if (this.imageElement) {
      this.imageElement.nativeElement.style.filter = '';
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation(); // Prevent click propagation to parent elements
  }

    // Function to check if input reaches maxlength
    isMaxLengthReached(): boolean {
      return this.newComment.length >= 150;
    }

}
