'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { InitialsPreview } from '@/components/memorial/InitialsPreview';
import { CircularIconButton } from '@/components/ui/CircularIconButton';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client-legacy';

type AvatarType = 'initials' | 'image';

export interface AvatarSelectionProps {
  memorialType?: 'person' | 'pet'; // Kept for backward compatibility, no longer used
  firstName: string;
  lastName?: string;
  initialAvatarType?: 'initials' | 'image';
  initialAvatarUrl?: string | null;
  onChange: (data: { avatar_type: AvatarType; avatar_url?: string }) => Promise<void>;
}

/**
 * AvatarSelection Component
 *
 * Reusable component for selecting memorial avatar:
 * - Initials (auto-generated from name)
 * - Image (user upload)
 *
 * Used in:
 * - Wizard: /gedenkseite/neu/[type]/avatar
 */
export function AvatarSelection({
  // memorialType is kept in props for backward compatibility but no longer used
  firstName,
  lastName = '',
  initialAvatarType = 'initials',
  initialAvatarUrl = null,
  onChange,
}: AvatarSelectionProps) {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<AvatarType>(initialAvatarType);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle file selection and upload to Supabase
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset errors
    setUploadError(null);

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Datei zu groß. Maximal 2 MB erlaubt.');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Nur JPG, PNG und WebP werden unterstützt.');
      return;
    }

    // Create preview URL (local object URL for immediate preview)
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedType('image');
    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const supabase = createClient();

      // Generate unique filename: userId-timestamp.ext
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log('[Avatar Upload] Starting upload:', {
        fileName,
        fileSize: file.size,
        fileType: file.type,
        userId: user?.id,
      });

      // Upload file to memorial-avatars bucket
      const { data, error } = await supabase.storage
        .from('memorial-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.error('[Avatar Upload] Upload error:', error);
        setUploadError('Fehler beim Hochladen. Bitte versuche es erneut.');
        setPreviewUrl(null);
        setSelectedType('initials');
        return;
      }

      console.log('[Avatar Upload] Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memorial-avatars')
        .getPublicUrl(filePath);

      console.log('[Avatar Upload] Public URL:', publicUrl);

      // Clean up blob URL to free memory
      URL.revokeObjectURL(objectUrl);

      // Update preview URL with permanent Supabase URL
      setPreviewUrl(publicUrl);

      // Call onChange with new image data
      await onChange({
        avatar_type: 'image',
        avatar_url: publicUrl,
      });

    } catch (err) {
      console.error('Unexpected upload error:', err);
      setUploadError('Ein unerwarteter Fehler ist aufgetreten.');
      setPreviewUrl(null);
      setSelectedType('initials');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle selection of initials
  const handleTypeSelect = async (type: 'initials') => {
    setSelectedType(type);
    setPreviewUrl(null);

    // Call onChange immediately for auto-save
    await onChange({
      avatar_type: type,
      avatar_url: undefined,
    });
  };

  // Render preview content based on selected type
  const renderPreview = (size: 'large' | 'small') => {
    const dimensions = size === 'large' ? 'w-[350px] h-[350px]' : 'w-16 h-16';
    const initialsSize = size === 'large' ? 120 : 64;

    if (selectedType === 'initials') {
      return (
        <div className={`${dimensions} flex items-center justify-center bg-accent border border-main rounded-${size === 'large' ? 'md' : 'full'}`}>
          <InitialsPreview firstName={firstName} lastName={lastName} size={initialsSize} showBackground={false} />
        </div>
      );
    }

    if (selectedType === 'image' && previewUrl) {
      return (
        <div className={`${dimensions} relative rounded-${size === 'large' ? 'md' : 'full'} overflow-hidden`}>
          <Image
            src={previewUrl}
            alt="Avatar Preview"
            fill
            className="object-cover"
          />
        </div>
      );
    }

    // Placeholder for image type without upload
    return (
      <div className={`${dimensions} flex items-center justify-center bg-tertiary rounded-${size === 'large' ? 'md' : 'full'} border-2 border-dashed border-main`}>
        <ImageIcon className="w-12 h-12 text-primary" />
      </div>
    );
  };

  return (
    <>
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-webapp-subsection text-bw mb-8">
          Wähle deine Darstellung
        </h1>
      </div>

      {/* Large Square Preview */}
      <div className="mb-4 flex justify-center">
        {renderPreview('large')}
      </div>

      {/* Small Circular Preview */}
      <div className="mb-7 flex justify-center">
        {renderPreview('small')}
      </div>

      {/* Selection Title */}
      <div className="mb-5 text-center">
        <p className="text-webapp-group text-secondary">
          Wähle deine favorisierte Darstellung
        </p>
      </div>

      {/* CircularIconButtons */}
      <div className="flex justify-center px-3 gap-12 max-w-[280px] mx-auto">
        <CircularIconButton
          icon={
            <div className="flex items-center justify-center w-full h-full">
              <InitialsPreview firstName={firstName} lastName={lastName} size={48} showBackground={false} />
            </div>
          }
          label="Initialen"
          selected={selectedType === 'initials'}
          onClick={() => handleTypeSelect('initials')}
          size="md"
        />

        <CircularIconButton
          icon={<ImageIcon className="w-full h-full" />}
          label="Bild"
          selected={selectedType === 'image'}
          size="md"
          onClick={() => document.getElementById('avatar-image-upload')?.click()}
        />
        <input
          id="avatar-image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="mt-4 text-center">
          <p className="text-body-s text-secondary">Bild wird hochgeladen...</p>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="mt-4 text-center">
          <p className="text-body-s text-red-500">{uploadError}</p>
        </div>
      )}
    </>
  );
}
