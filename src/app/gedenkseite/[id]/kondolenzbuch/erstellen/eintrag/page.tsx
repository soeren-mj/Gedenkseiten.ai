'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ImagePlus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import BackendHeader from '@/components/dashboard/BackendHeader';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import { useMemorial } from '@/contexts/MemorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import { createClient } from '@/lib/supabase/client';
import type { CondolenceEntry, CondolenceEntryImage } from '@/lib/supabase';

const MAX_CHARS = 2000;
const MAX_IMAGES = 12;

interface UploadedImage {
  id?: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

/**
 * Eintrag (Entry) Editor Page
 *
 * Wizard-style page for creating or editing a condolence book entry.
 * Layout: Left side description, Right side entry editor card.
 */
export default function EintragPage() {
  const { memorial } = useMemorial();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editEntryId = searchParams.get('edit');
  const isEditMode = !!editEntryId;

  // Form state
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [bookId, setBookId] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);

  // User display info
  const userName = user?.name || user?.email?.split('@')[0] || 'Unbekannt';
  const userAvatar = user?.avatar_url || null;

  // Fetch existing entry if editing
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // First get the condolence book for this memorial
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: book } = await (supabase as any)
        .from('condolence_books')
        .select('id')
        .eq('memorial_id', memorial.id)
        .single();

      if (book) {
        setBookId(book.id);
      }

      // If editing, fetch the entry
      if (editEntryId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: entry, error } = await (supabase as any)
          .from('condolence_entries')
          .select(`
            *,
            images:condolence_entry_images(*)
          `)
          .eq('id', editEntryId)
          .single();

        if (error || !entry) {
          showToast('error', 'Fehler', 'Eintrag nicht gefunden.');
          router.push(`/gedenkseite/${memorial.id}/verwalten/kondolenzbuch`);
          return;
        }

        const typedEntry = entry as CondolenceEntry & { images?: CondolenceEntryImage[] };

        // Verify user owns this entry
        if (typedEntry.user_id !== user?.id) {
          showToast('error', 'Fehler', 'Du kannst nur deinen eigenen Eintrag bearbeiten.');
          router.push(`/gedenkseite/${memorial.id}/verwalten/kondolenzbuch`);
          return;
        }

        setContent(typedEntry.content);
        setImages(
          (typedEntry.images || [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((img) => ({
              id: img.id,
              url: img.image_url,
              isNew: false,
            }))
        );
      }

      setIsLoading(false);
    }

    fetchData();
  }, [editEntryId, memorial.id, user?.id, router, showToast]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setContent(value);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      showToast('error', 'Limit erreicht', `Maximale Anzahl von ${MAX_IMAGES} Bildern erreicht.`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    // Validate file sizes (max 2MB)
    const validFiles = filesToAdd.filter((file) => {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'Datei zu groß', `${file.name} ist zu groß (max 2MB).`);
        return false;
      }
      return true;
    });

    // Create preview URLs
    const newImages: UploadedImage[] = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isNew: true,
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Open carousel view when images are added
    if (newImages.length > 0) {
      setCarouselIndex(images.length); // Go to first new image
      setShowCarousel(true);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      // Revoke object URL if it's a local preview
      if (newImages[index].isNew && newImages[index].url.startsWith('blob:')) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });

    // Adjust carousel index if needed
    if (carouselIndex >= images.length - 1 && carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
    }

    // Close carousel if no images left
    if (images.length <= 1) {
      setShowCarousel(false);
    }
  };

  const handleMoveImage = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? carouselIndex - 1 : carouselIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    setImages((prev) => {
      const newImages = [...prev];
      const temp = newImages[carouselIndex];
      newImages[carouselIndex] = newImages[newIndex];
      newImages[newIndex] = temp;
      return newImages;
    });
    setCarouselIndex(newIndex);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      showToast('error', 'Fehler', 'Bitte schreibe einen Text.');
      return;
    }

    if (!bookId) {
      showToast('error', 'Fehler', 'Kondolenzbuch nicht gefunden.');
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
          const fileName = `entries/${user?.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

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

      if (isEditMode && editEntryId) {
        // Update existing entry
        const { error: updateError } = await db
          .from('condolence_entries')
          .update({
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editEntryId);

        if (updateError) throw updateError;

        // Delete old images
        await db
          .from('condolence_entry_images')
          .delete()
          .eq('entry_id', editEntryId);

        // Insert new images
        if (uploadedImageUrls.length > 0) {
          const imageRecords = uploadedImageUrls.map((url, index) => ({
            entry_id: editEntryId,
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
            user_id: user?.id,
            content: content.trim(),
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            // Unique constraint violation
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

      router.push(`/gedenkseite/${memorial.id}/verwalten/kondolenzbuch`);
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
    router.push(`/gedenkseite/${memorial.id}/verwalten/kondolenzbuch`);
  };

  const isValid = content.trim().length > 0;
  const canAddMoreImages = images.length < MAX_IMAGES;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-dark-mode flex items-center justify-center">
        <div className="animate-pulse text-secondary">Laden...</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-light-dark-mode">
      {/* Header */}
      <BackendHeader actionLabel="Digitales Kondolenzbuch erstellen" />

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Left Column - Description */}
            <div className="lg:w-1/3 flex flex-col gap-4">
              <h1 className="text-webapp-section text-primary">
                Eintrag verfassen
              </h1>
              <p className="text-body-m text-secondary">
                Hallo {user?.name?.split(' ')[0] || 'User'}, schreibe deinen
                eigenen Kondolenzeintrag.
              </p>
              <p className="text-body-m text-tertiary">
                Du kannst deinem Eintrag einen Text mit maximal 2.000 Wörtern und 12
                Bildern hinzufügen.
              </p>
            </div>

            {/* Right Column - Entry Editor Card */}
            <div className="lg:w-2/3 flex flex-col items-center gap-6">
              {/* Entry Card */}
              <div className="w-full max-w-[450px] bg-bw-opacity-40 rounded-md shadow-card p-1">
                <div className="bg-light-dark-mode rounded-sm flex flex-col">
                  {/* User Header */}
                  <div className="flex items-center gap-3 p-4 pb-0">
                    <InitialsAvatar
                      name={userName}
                      imageUrl={userAvatar}
                      size="sm"
                    />
                    <span className="text-body-m text-primary font-medium">
                      {userName}
                    </span>
                  </div>

                  {/* Image Carousel (when images exist and carousel is open) */}
                  {showCarousel && images.length > 0 && (
                    <div className="px-4 pt-4">
                      {/* Carousel View */}
                      <div className="relative">
                        <div className="flex items-center justify-center gap-2">
                          {/* Previous image preview */}
                          {carouselIndex > 0 && (
                            <div className="w-12 h-[200px] flex-shrink-0 overflow-hidden rounded-xs opacity-50">
                              <img
                                src={images[carouselIndex - 1].url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Current image */}
                          <div className="relative flex-1 max-w-[280px] h-[280px] rounded-sm overflow-hidden">
                            <img
                              src={images[carouselIndex].url}
                              alt={`Bild ${carouselIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(carouselIndex)}
                              className="absolute bottom-3 left-3 p-2 bg-negative/80 hover:bg-negative text-white rounded-full transition-colors"
                              aria-label="Bild löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Next image preview */}
                          {carouselIndex < images.length - 1 && (
                            <div className="w-12 h-[200px] flex-shrink-0 overflow-hidden rounded-xs opacity-50">
                              <img
                                src={images[carouselIndex + 1].url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-3">
                          <button
                            type="button"
                            onClick={() => handleMoveImage('left')}
                            disabled={carouselIndex === 0}
                            className="flex items-center gap-1 text-body-s text-interactive-primary-default disabled:text-interactive-disabled disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            nach links
                          </button>
                          <span className="text-body-s text-secondary">
                            Bild {carouselIndex + 1} verschieben
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveImage('right')}
                            disabled={carouselIndex === images.length - 1}
                            className="flex items-center gap-1 text-body-s text-interactive-primary-default disabled:text-interactive-disabled disabled:cursor-not-allowed"
                          >
                            nach rechts
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Grid (when images exist but carousel is closed) */}
                  {!showCarousel && images.length > 0 && (
                    <div className="px-4 pt-4">
                      <div className="flex gap-2 flex-wrap">
                        {images.slice(0, 4).map((img, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setCarouselIndex(index);
                              setShowCarousel(true);
                            }}
                            className="relative w-16 h-16 rounded-xs overflow-hidden bg-secondary"
                          >
                            <img
                              src={img.url}
                              alt={`Bild ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                        {images.length > 4 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCarouselIndex(4);
                              setShowCarousel(true);
                            }}
                            className="w-16 h-16 rounded-xs border border-card flex items-center justify-center bg-secondary"
                          >
                            <span className="text-body-m text-interactive-primary-default font-medium">
                              +{images.length - 4}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Text Area */}
                  <div className="p-4 flex-1">
                    <textarea
                      value={content}
                      onChange={handleContentChange}
                      placeholder="Schreibe etwas..."
                      className="w-full min-h-[200px] bg-transparent text-body-m text-primary placeholder:text-tertiary resize-none focus:outline-none"
                      autoFocus={!isEditMode}
                    />
                  </div>

                  {/* Add Images Button */}
                  {canAddMoreImages ? (
                    <div className="px-4 pb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary border border-card rounded-sm hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        <ImagePlus className="w-5 h-5" />
                        <span className="text-body-m">
                          Bilder hinzufügen (Optional)
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 pb-4">
                      <div className="w-full py-3 text-center text-body-s text-tertiary bg-secondary rounded-sm">
                        Maximale Anzahl von {MAX_IMAGES} Bilder erreicht
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Counter */}
              <div className="text-body-s text-tertiary">
                {content.length}/{MAX_CHARS} Zeichen
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Pill */}
      <div className="sticky bottom-0 flex justify-center p-4">
        <div className="flex items-center p-1 bg-bw-opacity-40 backdrop-blur-md rounded-full shadow-lg">
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
          {/* Fertig Button - farbiger Hintergrund */}
          <div className={`rounded-full ${!isValid || isSaving ? 'bg-interactive-disabled' : 'bg-interactive-primary-default hover:bg-interactive-primary-hover'}`}>
            <Button
              variant="text"
              size="sm"
              rightIcon={<ChevronRightIcon size={16} />}
              onClick={handleSave}
              disabled={!isValid || isSaving}
              loading={isSaving}
              className={!isValid || isSaving ? '' : '!text-interactive-default hover:!text-interactive-default'}
            >
              Fertig
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
