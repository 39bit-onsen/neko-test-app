import { MediaAttachment } from '../types';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/mov',
  'video/avi'
];

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: 'サポートされていないファイル形式です'
    };
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `ファイルサイズが${sizeMB}MBを超えています`
    };
  }

  return { isValid: true };
};

export const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const generateThumbnail = (file: File, maxSize: number = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('video/')) {
      // For videos, create a thumbnail from first frame
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        canvas.width = maxSize;
        canvas.height = (video.videoHeight * maxSize) / video.videoWidth;
        
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => reject(new Error('Failed to generate video thumbnail'));
      video.src = URL.createObjectURL(file);
    } else {
      // For images, create a smaller version
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        const aspectRatio = img.height / img.width;
        canvas.width = maxSize;
        canvas.height = maxSize * aspectRatio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => reject(new Error('Failed to generate image thumbnail'));
      img.src = URL.createObjectURL(file);
    }
  });
};

export const createMediaAttachment = async (file: File): Promise<MediaAttachment> => {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
  let processedFile: File | Blob = file;

  // Compress images
  if (mediaType === 'image' && file.size > 1024 * 1024) { // 1MB threshold
    try {
      processedFile = await compressImage(file);
    } catch (error) {
      console.warn('Image compression failed, using original file:', error);
    }
  }

  // Generate thumbnail
  const thumbnail = await generateThumbnail(file);

  // Create object URL for the processed file
  const url = URL.createObjectURL(processedFile);

  return {
    id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: mediaType,
    url,
    fileName: file.name,
    mimeType: file.type,
    size: processedFile.size,
    thumbnail,
    file: processedFile instanceof File ? processedFile : new File([processedFile], file.name, { type: file.type })
  };
};

export const revokeMediaUrl = (media: MediaAttachment) => {
  URL.revokeObjectURL(media.url);
  if (media.thumbnail && media.thumbnail.startsWith('blob:')) {
    URL.revokeObjectURL(media.thumbnail);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};