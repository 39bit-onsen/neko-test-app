import React, { useRef, useState } from 'react';
import { MediaAttachment } from '../../types';
import { createMediaAttachment, formatFileSize, SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES } from '../../utils/mediaUtils';
import './MediaUpload.css';

interface MediaUploadProps {
  media: MediaAttachment[];
  onChange: (media: MediaAttachment[]) => void;
  maxFiles?: number;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ 
  media, 
  onChange, 
  maxFiles = 5 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const supportedTypes = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding files would exceed max limit
    if (media.length + files.length > maxFiles) {
      setUploadError(`最大${maxFiles}個のファイルまでアップロードできます`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newMediaAttachments: MediaAttachment[] = [];

      for (const file of files) {
        try {
          const mediaAttachment = await createMediaAttachment(file);
          newMediaAttachments.push(mediaAttachment);
        } catch (error) {
          console.error('Failed to process file:', file.name, error);
          setUploadError(`${file.name}: ${error instanceof Error ? error.message : 'アップロードに失敗しました'}`);
        }
      }

      if (newMediaAttachments.length > 0) {
        onChange([...media, ...newMediaAttachments]);
      }
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    const updatedMedia = media.filter(m => m.id !== mediaId);
    onChange(updatedMedia);
  };

  const handleCaptionChange = (mediaId: string, caption: string) => {
    const updatedMedia = media.map(m => 
      m.id === mediaId ? { ...m, caption } : m
    );
    onChange(updatedMedia);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length === 0) return;

    // Check if adding files would exceed max limit
    if (media.length + files.length > maxFiles) {
      setUploadError(`最大${maxFiles}個のファイルまでアップロードできます`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newMediaAttachments: MediaAttachment[] = [];

      for (const file of files) {
        try {
          const mediaAttachment = await createMediaAttachment(file);
          newMediaAttachments.push(mediaAttachment);
        } catch (error) {
          console.error('Failed to process file:', file.name, error);
          setUploadError(`${file.name}: ${error instanceof Error ? error.message : 'アップロードに失敗しました'}`);
        }
      }

      if (newMediaAttachments.length > 0) {
        onChange([...media, ...newMediaAttachments]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="media-upload">
      <div className="media-upload-header">
        <label>写真・動画</label>
        <span className="media-count">{media.length}/{maxFiles}</span>
      </div>

      {/* Upload Area */}
      <div 
        className="media-upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={supportedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          {isUploading ? (
            <div className="uploading">
              <div className="upload-spinner"></div>
              <p>アップロード中...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📸</div>
              <p>クリックまたはドラッグ&ドロップでファイルを追加</p>
              <p className="upload-hint">
                画像: JPG, PNG, WebP, GIF (最大5MB)<br/>
                動画: MP4, WebM, MOV, AVI (最大20MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="upload-error">
          <p>{uploadError}</p>
          <button onClick={() => setUploadError(null)}>×</button>
        </div>
      )}

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="media-preview">
          <h4>添付ファイル ({media.length})</h4>
          <div className="media-grid">
            {media.map(attachment => (
              <div key={attachment.id} className="media-item">
                <div className="media-preview-container">
                  {attachment.type === 'image' ? (
                    <img 
                      src={attachment.url} 
                      alt={attachment.fileName}
                      className="media-preview-image"
                    />
                  ) : (
                    <div className="video-preview">
                      {attachment.thumbnail ? (
                        <img 
                          src={attachment.thumbnail} 
                          alt={attachment.fileName}
                          className="video-thumbnail"
                        />
                      ) : (
                        <div className="video-placeholder">
                          <span>🎥</span>
                        </div>
                      )}
                      <div className="video-overlay">
                        <span className="play-icon">▶️</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    className="remove-media-btn"
                    onClick={() => handleRemoveMedia(attachment.id)}
                    title="削除"
                  >
                    ×
                  </button>
                </div>
                
                <div className="media-info">
                  <div className="media-filename">{attachment.fileName}</div>
                  <div className="media-size">{formatFileSize(attachment.size)}</div>
                  
                  <input
                    type="text"
                    placeholder="キャプション（任意）"
                    value={attachment.caption || ''}
                    onChange={(e) => handleCaptionChange(attachment.id, e.target.value)}
                    className="caption-input"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;