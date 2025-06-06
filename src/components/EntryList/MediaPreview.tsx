import React from 'react';
import { MediaAttachment } from '../../types';
import './MediaPreview.css';

interface MediaPreviewProps {
  media: MediaAttachment[];
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ media }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="media-preview-container">
      <div className="media-preview-grid">
        {media.slice(0, 4).map((attachment, index) => (
          <div key={attachment.id} className="media-preview-item">
            {attachment.type === 'image' ? (
              <img 
                src={attachment.thumbnail || attachment.url} 
                alt={attachment.fileName}
                className="preview-image"
              />
            ) : (
              <div className="video-preview-item">
                {attachment.thumbnail ? (
                  <img 
                    src={attachment.thumbnail} 
                    alt={attachment.fileName}
                    className="preview-image"
                  />
                ) : (
                  <div className="video-placeholder">
                    🎥
                  </div>
                )}
                <div className="video-indicator">▶️</div>
              </div>
            )}
            
            {index === 3 && media.length > 4 && (
              <div className="more-media-overlay">
                +{media.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaPreview;