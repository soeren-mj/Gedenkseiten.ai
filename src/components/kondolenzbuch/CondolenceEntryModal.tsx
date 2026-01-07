'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EntryCard, UploadedImage } from '@/components/kondolenzbuch/EntryCard';
import LoginModal from '@/components/auth/LoginModal';
import { useToast } from '@/contexts/ToastContext';
import { createClient } from '@/lib/supabase/client';
import type { CondolenceEntryWithDetails, CondolenceEntryImage } from '@/lib/supabase';

const MAX_CHARS = 2000;
const MAX_IMAGES = 12;

interface CondolenceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memorialId: string;
  bookId: string;
  mode: 'create' | 'edit';
  existingEntry?: CondolenceEntryWithDetails;
  onSuccess: () => void;
  // User info
  isAuthenticated: boolean;
  currentUserId?: string;
  userName?: string;
  userAvatar?: string | null;
}

/**
 * CondolenceEntryModal
 *
 * Modal for creating or editing condolence book entries.
 * Layout matches the /eintrag page (two columns: description left, entry card right).
 * Shows LoginModal when unauthenticated user tries to save.
 */
export function CondolenceEntryModal({
  isOpen,
  onClose,
  memorialId,
  bookId,
  mode,
  existingEntry,
  onSuccess,
  isAuthenticated,
  currentUserId,
  userName = 'Unbekannt',
  userAvatar = null,
}: CondolenceEntryModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [replaceImageIndex, setReplaceImageIndex] = useState<number | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Initialize form when editing
  useEffect(() => {
    if (mode === 'edit' && existingEntry) {
      setContent(existingEntry.content);
      const entryImages = existingEntry.images as CondolenceEntryImage[] | undefined;
      if (entryImages) {
        setImages(
          entryImages
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((img) => ({
              id: img.id,
              url: img.image_url,
              isNew: false,
            }))
        );
      }
    } else {
      setContent('');
      setImages([]);
    }
  }, [mode, existingEntry, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setImages([]);
      setShowLoginModal(false);
    }
  }, [isOpen]);

  const handleContentChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setContent(value);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      if (newImages[index].isNew && newImages[index].url.startsWith('blob:')) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleMoveImage = (fromIndex: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    setImages((prev) => {
      const newImages = [...prev];
      const temp = newImages[fromIndex];
      newImages[fromIndex] = newImages[newIndex];
      newImages[newIndex] = temp;
      return newImages;
    });
  };

  const handleChangeImage = (index: number) => {
    setReplaceImageIndex(index);
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Datei zu groß', `${file.name} ist zu groß (max 2MB).`);
      setReplaceImageIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (replaceImageIndex !== null) {
      // Replacing existing image
      setImages((prev) => {
        const newImages = [...prev];
        const oldImage = newImages[replaceImageIndex];
        if (oldImage.isNew && oldImage.url.startsWith('blob:')) {
          URL.revokeObjectURL(oldImage.url);
        }
        newImages[replaceImageIndex] = {
          url: URL.createObjectURL(file),
          file,
          isNew: true,
        };
        return newImages;
      });
      setReplaceImageIndex(null);
    } else {
      // Adding new images
      const remainingSlots = MAX_IMAGES - images.length;
      if (remainingSlots <= 0) {
        showToast('error', 'Limit erreicht', `Maximale Anzahl von ${MAX_IMAGES} Bildern erreicht.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const filesToAdd = files.slice(0, remainingSlots);
      const validFiles = filesToAdd.filter((f) => {
        if (f.size > 2 * 1024 * 1024) {
          showToast('error', 'Datei zu groß', `${f.name} ist zu groß (max 2MB).`);
          return false;
        }
        return true;
      });

      const newImages: UploadedImage[] = validFiles.map((f) => ({
        url: URL.createObjectURL(f),
        file: f,
        isNew: true,
      }));

      setImages((prev) => [...prev, ...newImages]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      showToast('error', 'Fehler', 'Bitte schreibe einen Text.');
      return;
    }

    // If not authenticated, show login modal
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      // Upload new images first
      const uploadedImageUrls: string[] = [];
      for (const img of images) {
        if (img.isNew && img.file) {
          setIsUploading(true);
          const fileExt = img.file.name.split('.').pop();
          const fileName = `entries/${currentUserId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('condolence-images')
            .upload(fileName, img.file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            showToast('error', 'Upload-Fehler', 'Fehler beim Hochladen eines Bildes.');
            setIsSaving(false);
            setIsUploading(false);
            return;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from('condolence-images').getPublicUrl(fileName);

          uploadedImageUrls.push(publicUrl);
        } else {
          uploadedImageUrls.push(img.url);
        }
      }
      setIsUploading(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      if (mode === 'edit' && existingEntry) {
        // Update existing entry
        const { error: updateError } = await db
          .from('condolence_entries')
          .update({
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingEntry.id);

        if (updateError) throw updateError;

        // Delete old images
        await db
          .from('condolence_entry_images')
          .delete()
          .eq('entry_id', existingEntry.id);

        // Insert new images
        if (uploadedImageUrls.length > 0) {
          const imageRecords = uploadedImageUrls.map((url, index) => ({
            entry_id: existingEntry.id,
            image_url: url,
            sort_order: index,
          }));

          const { error: imagesError } = await db
            .from('condolence_entry_images')
            .insert(imageRecords);

          if (imagesError) throw imagesError;
        }

        showToast('success', 'Gespeichert', 'Eintrag aktualisiert!');
      } else {
        // Create new entry
        const { data: newEntry, error: insertError } = await db
          .from('condolence_entries')
          .insert({
            book_id: bookId,
            user_id: currentUserId,
            content: content.trim(),
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            showToast('error', 'Fehler', 'Du hast bereits einen Eintrag in diesem Kondolenzbuch.');
          } else {
            throw insertError;
          }
          setIsSaving(false);
          return;
        }

        // Insert images
        if (uploadedImageUrls.length > 0 && newEntry) {
          const imageRecords = uploadedImageUrls.map((url, index) => ({
            entry_id: newEntry.id,
            image_url: url,
            sort_order: index,
          }));

          const { error: imagesError } = await db
            .from('condolence_entry_images')
            .insert(imageRecords);

          if (imagesError) throw imagesError;
        }

        showToast('success', 'Gespeichert', 'Eintrag erstellt!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      showToast('error', 'Fehler', 'Fehler beim Speichern.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Cleanup object URLs
    images.forEach((img) => {
      if (img.isNew && img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const isValid = content.trim().length > 0;
  const canAddMoreImages = images.length < MAX_IMAGES;
  const isEditMode = mode === 'edit';

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay - z-[100] to be above Navbar (z-[90]) */}
      <div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
        onClick={handleBackdropClick}
      >
        {/* Modal Container - Fullscreen on mobile, centered on desktop */}
        <div className="w-full h-full sm:h-auto sm:max-h-[calc(100vh-3rem)] sm:max-w-6xl bg-bw-opacity-40 backdrop-blur-3xl sm:rounded-md shadow-xl flex flex-col overflow-hidden border-t sm:border border-main">
          {/* Scrollable Content Area - Only this area scrolls */}
          <div className="flex-1 overflow-y-auto px-4">
            {/* Two Column Layout */}
            <div className="flex flex-col lg:flex-row">
              {/* Left Column - Description */}
              <div className="w-full lg:max-w-xs p-6 flex flex-col justify-center">
                <h2 className="text-webapp-section text-bw mb-4">
                  {isEditMode ? 'Eintrag ändern' : 'Eintrag verfassen'}
                </h2>
                <p className="text-body-m text-primary">
                  {isEditMode ? (
                    <>
                      Hallo {userName?.split(' ')[0]},<br />
                      ändere deinen Kondolenzeintrag.
                      <br />
                      <span className="text-body-m text-primary">
                        Du hast Platz für maximal 2.000 Wörter und kannst 12 Bilder hinzufügen.
                      </span>
                    </>
                  ) : (
                    <>
                      Hallo{isAuthenticated ? ` ${userName?.split(' ')[0]}` : ''},<br />
                      schreibe deinen Kondolenzeintrag.
                      <br />
                      <span className="text-body-m text-primary">
                        Du hast Platz für maximal 2.000 Wörter und kannst 12 Bilder hinzufügen.
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Right Column - Entry Editor (no separate scroll) */}
              <div className="w-full lg:max-w-lg p-6 flex flex-col items-center justify-center">
                <div className="inline-flex flex-col items-center gap-4">
                  {/* Entry Card */}
                  <EntryCard
                    editMode
                    userName={userName}
                    userAvatar={userAvatar}
                    content={content}
                    onContentChange={handleContentChange}
                    images={images}
                    onDeleteImage={handleDeleteImage}
                    onMoveImage={handleMoveImage}
                    onChangeImage={handleChangeImage}
                    maxChars={MAX_CHARS}
                  />

                  {/* Character Counter */}
                  <div className="text-body-s text-tertiary">
                    {content.length}/{MAX_CHARS} Zeichen
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Add Images Button */}
                  {canAddMoreImages ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<ImagePlus className="w-4 h-4" />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Bilder hinzufügen
                    </Button>
                  ) : (
                    <div className="text-body-s text-tertiary">
                      Maximale Anzahl von {MAX_IMAGES} Bildern erreicht
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer - Always visible at bottom */}
          <div className="flex-shrink-0 flex justify-center p-4 border-t border-main bg-bw-opacity-40 backdrop-blur-md">
            <div className="flex items-center p-1 bg-bw-opacity-80 backdrop-blur-md rounded-full shadow-lg">
              {/* Abbrechen Button */}
              <div className="rounded-full">
                <Button
                  variant="text"
                  size="sm"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={handleCancel}
                >
                  Abbrechen
                </Button>
              </div>
              {/* Fertig Button */}
              <div
                className={`rounded-full px-2 ${
                  !isValid || isSaving
                    ? 'bg-interactive-disabled'
                    : 'bg-interactive-primary-default hover:bg-interactive-primary-hover'
                }`}
              >
                <Button
                  variant="text"
                  size="sm"
                  onClick={handleSave}
                  disabled={!isValid || isSaving}
                  loading={isSaving}
                  className={
                    !isValid || isSaving
                      ? ''
                      : '!text-interactive-default hover:!text-interactive-default'
                  }
                >
                  Fertig
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal for unauthenticated users */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl={`/gedenkseite/${memorialId}`}
        title="Anmelden um fortzufahren"
      />
    </>
  );
}
