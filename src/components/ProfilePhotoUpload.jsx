import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, User, Loader, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadProfilePhoto, updateUserProfile } from '../services/supabaseService';
import { toast } from 'react-toastify';

const ProfilePhotoUpload = ({ currentPhotoUrl, onPhotoUpdate, size = 'large' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuth();


  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
    xlarge: 'h-6 w-6'
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
        setShowUploadModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!previewUrl || !fileInputRef.current?.files[0]) return;

    setIsUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      
      // Upload photo to Supabase Storage
      const uploadResult = await uploadProfilePhoto(user.uid, file);
      
      if (uploadResult.success) {
        // Update user profile with new photo URL
        const updateResult = await updateUserProfile(user.uid, {
          photo_url: uploadResult.data.publicUrl
        });

        if (updateResult.success) {
          // Update user data in context to re-render immediately
          updateUser({ photoURL: uploadResult.data.publicUrl });
          
          // Call callback if provided
          if (onPhotoUpdate) {
            onPhotoUpdate(uploadResult.data.publicUrl);
          }

          toast.success('Profile photo updated successfully!');

          setShowUploadModal(false);
          setPreviewUrl(null);
        } else {
          toast.error('Failed to update profile');
        }
      } else {
        if (uploadResult.error?.includes('bucket') || uploadResult.error?.includes('storage')) {
          toast.error('Storage not configured. Please contact administrator.');
        } else {
          toast.error(uploadResult.error || 'Failed to upload photo');
        }
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      const updateResult = await updateUserProfile(user.uid, {
        photo_url: null
      });

      if (updateResult.success) {
        updateUser({ photoURL: null });
        if (onPhotoUpdate) {
          onPhotoUpdate(null);
        }
        toast.success('Profile photo removed successfully!');

      } else {
        toast.error('Failed to remove photo');
      }
    } catch (error) {
      console.error('Error removing profile photo:', error);
      toast.error('Failed to remove photo');
    } finally {
      setIsUploading(false);
    }
  };

  const displayPhotoUrl = currentPhotoUrl || user?.photoURL;

  return (
    <>
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden cursor-pointer relative`}
          onClick={() => fileInputRef.current?.click()}
        >
          {displayPhotoUrl ? (
            <img
              src={displayPhotoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback user icon */}
          <div 
            className={`w-full h-full flex items-center justify-center ${displayPhotoUrl ? 'hidden' : 'flex'}`}
            style={{ display: displayPhotoUrl ? 'none' : 'flex' }}
          >
            <User className={`${iconSizes[size]} text-white`} />
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <Camera className={`${iconSizes[size]} text-white`} />
          </motion.div>

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <Loader className={`${iconSizes[size]} text-white animate-spin`} />
            </div>
          )}
        </motion.div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Remove photo button (only show if photo exists) */}
        {displayPhotoUrl && size === 'large' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePhoto();
            }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </motion.button>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !isUploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Update Profile Photo</h3>
                <button
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isUploading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !previewUrl}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Update Photo</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfilePhotoUpload;
