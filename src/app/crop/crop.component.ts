import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-crop-dialog',
  templateUrl: './crop.component.html',
  styleUrls: ['./crop.component.scss']
})
export class CropComponent implements AfterViewInit {
  cropSettings = { x: 0, y: 0, width: 100, height: 100 };
  croppedImage: string | null = null;
  selectedShape: 'square' | 'circle' | 'rectangle' | 'triangle' | 'polygon' | 'star' | 'heart' = 'square'; // Default shape
  originalImageWidth: number = 0;
  originalImageHeight: number = 0;

  constructor(
    public dialogRef: MatDialogRef<CropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageSrc: string }
  ) {}

  ngAfterViewInit(): void {
    this.setupImage();
  }

  setupImage(): void {
    const imageElement = document.getElementById('imageElement') as HTMLImageElement;
    if (imageElement) {
      imageElement.crossOrigin = 'anonymous'; // Set cross-origin attribute
      imageElement.onload = () => this.onImageLoad();
    }
  }

  onImageLoad(): void {
    const imageElement = document.getElementById('imageElement') as HTMLImageElement;
    if (imageElement) {
      this.originalImageWidth = imageElement.naturalWidth;
      this.originalImageHeight = imageElement.naturalHeight;

      // Set initial crop settings to the full size of the image
      this.cropSettings = {
        x: 0,
        y: 0,
        width: this.originalImageWidth,
        height: this.originalImageHeight
      };

      this.updatePreview(this.data.imageSrc); // Display the full image initially
    }
  }

  cropImage(shape: 'square' | 'circle' | 'rectangle' | 'triangle' | 'polygon' | 'star' | 'heart'): void {
    this.selectedShape = shape;
    const imageElement = document.getElementById('imageElement') as HTMLImageElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx || !imageElement) return;

    const cropSize = 0.8; // Adjust this value as needed
    let cropWidth, cropHeight;

    if (shape === 'square') {
      cropWidth = cropHeight = Math.min(this.originalImageWidth, this.originalImageHeight) * cropSize;
      const cropX = (this.originalImageWidth - cropWidth) / 2;
      const cropY = (this.originalImageHeight - cropHeight) / 2;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        imageElement,
        cropX, cropY,
        cropWidth, cropHeight,
        0, 0,
        cropWidth, cropHeight
      );
    } else if (shape === 'circle') {
      canvas.width = this.originalImageWidth;
      canvas.height = this.originalImageHeight;

      ctx.drawImage(
        imageElement,
        0, 0,
        this.originalImageWidth, this.originalImageHeight
      );

      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(this.originalImageWidth / 2, this.originalImageHeight / 2, Math.min(this.originalImageWidth, this.originalImageHeight) / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else if (shape === 'rectangle') {
      const rectangleWidth = this.originalImageWidth * cropSize;
      const rectangleHeight = this.originalImageHeight * cropSize * 0.5; // rectangle aspect ratio

      canvas.width = rectangleWidth;
      canvas.height = rectangleHeight;

      ctx.drawImage(
        imageElement,
        (this.originalImageWidth - rectangleWidth) / 2, (this.originalImageHeight - rectangleHeight) / 2,
        rectangleWidth, rectangleHeight,
        0, 0,
        rectangleWidth, rectangleHeight
      );
    } else if (shape === 'triangle') {
      canvas.width = this.originalImageWidth;
      canvas.height = this.originalImageHeight;

      ctx.drawImage(
        imageElement,
        0, 0,
        this.originalImageWidth, this.originalImageHeight
      );

      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.moveTo(this.originalImageWidth / 2, 0);
      ctx.lineTo(0, this.originalImageHeight);
      ctx.lineTo(this.originalImageWidth, this.originalImageHeight);
      ctx.closePath();
      ctx.fill();
    } else if (shape === 'polygon') {
      // Example for hexagon
      canvas.width = this.originalImageWidth;
      canvas.height = this.originalImageHeight;

      ctx.drawImage(
        imageElement,
        0, 0,
        this.originalImageWidth, this.originalImageHeight
      );

      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      const sides = 6;
      const radius = Math.min(this.originalImageWidth, this.originalImageHeight) / 2;
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        ctx.lineTo(this.originalImageWidth / 2 + radius * Math.cos(angle), this.originalImageHeight / 2 + radius * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
    } else if (shape === 'star') {
      canvas.width = this.originalImageWidth;
      canvas.height = this.originalImageHeight;

      ctx.drawImage(
        imageElement,
        0, 0,
        this.originalImageWidth, this.originalImageHeight
      );

      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      const points = 5;
      const outerRadius = Math.min(this.originalImageWidth, this.originalImageHeight) / 2;
      const innerRadius = outerRadius / 2.5;
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points;
        ctx.lineTo(this.originalImageWidth / 2 + radius * Math.cos(angle), this.originalImageHeight / 2 + radius * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
    } else if (shape === 'heart') {
      canvas.width = this.originalImageWidth;
      canvas.height = this.originalImageHeight;

      ctx.drawImage(
        imageElement,
        0, 0,
        this.originalImageWidth, this.originalImageHeight
      );

      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      const topCurveHeight = this.originalImageHeight * 0.3;
      ctx.moveTo(this.originalImageWidth / 2, this.originalImageHeight / 2 + topCurveHeight / 2);
      ctx.bezierCurveTo(
        this.originalImageWidth / 2 - this.originalImageWidth / 4, this.originalImageHeight / 2 - topCurveHeight,
        0, this.originalImageHeight / 2 + topCurveHeight,
        this.originalImageWidth / 2, this.originalImageHeight
      );
      ctx.bezierCurveTo(
        this.originalImageWidth, this.originalImageHeight / 2 + topCurveHeight,
        this.originalImageWidth / 2 + this.originalImageWidth / 4, this.originalImageHeight / 2 - topCurveHeight,
        this.originalImageWidth / 2, this.originalImageHeight / 2 + topCurveHeight / 2
      );
      ctx.closePath();
      ctx.fill();
    }

    const preview = document.getElementById('preview') as HTMLDivElement;
    if (preview) {
      preview.style.backgroundImage = `url(${canvas.toDataURL()})`;
      preview.style.backgroundSize = 'contain';
      preview.style.backgroundPosition = 'center';
      preview.style.width = `${canvas.width}px`;
      preview.style.height = `${canvas.height}px`;
    }

    this.croppedImage = canvas.toDataURL();
  }

  updatePreview(imageSrc: string): void {
    const preview = document.getElementById('preview') as HTMLDivElement;
    if (preview) {
      const imageElement = document.getElementById('imageElement') as HTMLImageElement;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (imageElement && ctx) {
        canvas.width = this.originalImageWidth;
        canvas.height = this.originalImageHeight;
        ctx.drawImage(imageElement, 0, 0, this.originalImageWidth, this.originalImageHeight);
        preview.style.backgroundImage = `url(${canvas.toDataURL()})`;
        preview.style.backgroundSize = 'contain';
        preview.style.backgroundPosition = 'center';
        preview.style.width = `${this.originalImageWidth}px`;
        preview.style.height = `${this.originalImageHeight}px`;
      }
    }
  }

  resetCrop(): void {
    this.updatePreview(this.data.imageSrc);
    this.croppedImage = null;
    this.selectedShape = 'square';
  }

  crop(): void {
    this.dialogRef.close({ croppedImage: this.croppedImage });
  }
}
