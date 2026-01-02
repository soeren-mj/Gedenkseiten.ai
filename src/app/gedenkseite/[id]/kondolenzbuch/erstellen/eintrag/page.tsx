'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ImagePlus } from 'lucide-react';
import BackendHeader from '@/components/dashboard/BackendHeader';
import { useMemorial } from '@/contexts/MemorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { EntryCard, UploadedImage } from '@/components/kondolenzbuch/EntryCard';
import { createClient } from '@/lib/supabase/client';
import type { CondolenceEntry, CondolenceEntryImage } from '@/lib/supabase';

const MAX_CHARS = 2000;
const MAX_IMAGES = 12;

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

  const handleContentChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setContent(value);
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

  // State for tracking which image index to replace
  const [replaceImageIndex, setReplaceImageIndex] = useState<number | null>(null);

  const handleChangeImage = (index: number) => {
    setReplaceImageIndex(index);
    fileInputRef.current?.click();
  };

  const handleImageSelectForReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // If we're replacing an existing image
    if (replaceImageIndex !== null) {
      setImages((prev) => {
        const newImages = [...prev];
        // Revoke old object URL if it's a local preview
        const oldImage = newImages[replaceImageIndex];
        if (oldImage.isNew && oldImage.url.startsWith('blob:')) {
          URL.revokeObjectURL(oldImage.url);
        }
        // Replace with new image
        newImages[replaceImageIndex] = {
          url: URL.createObjectURL(file),
          file,
          isNew: true,
        };
        return newImages;
      });
      setReplaceImageIndex(null);
    } else {
      // Adding new images (existing behavior)
      const remainingSlots = MAX_IMAGES - images.length;
      if (remainingSlots <= 0) {
        showToast('error', 'Limit erreicht', `Maximale Anzahl von ${MAX_IMAGES} Bildern erreicht.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const filesToAdd = files.slice(0, remainingSlots);

      // Validate file sizes (max 2MB)
      const validFiles = filesToAdd.filter((f) => {
        if (f.size > 2 * 1024 * 1024) {
          showToast('error', 'Datei zu groß', `${f.name} ist zu groß (max 2MB).`);
          return false;
        }
        return true;
      });

      // Create preview URLs
      const newImages: UploadedImage[] = validFiles.map((f) => ({
        url: URL.createObjectURL(f),
        file: f,
        isNew: true,
      }));

      setImages((prev) => [...prev, ...newImages]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    <main className="flex flex-col h-screen bg-light-dark-mode">
      {/* Header */}
      <BackendHeader actionLabel="Digitales Kondolenzbuch erstellen" />

      {/* Main Content - Two Column Layout */}
      <div className="pt-4 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:h-[80vh]">
            {/* Left Column - Description */}
            <div className="w-full lg:max-w-xs p-5 flex flex-col items-center lg:items-start justify-center lg:justify-end">
              <div className="flex flex-col gap-2 max-w-lg">
              <h1 className="text-webapp-section text-primary text-center lg:text-left">
                Eintrag verfassen
              </h1>
              <p className="text-body-m text-secondary text-center lg:text-left">
                Hallo {user?.name?.split(' ')[0] || 'User'}, schreibe deinen
                eigenen Kondolenzeintrag.
              <br />
              <span className="text-body-m text-secondary">
                Du kannst deinem Eintrag einen Text mit maximal 2.000 Zeichen und 12
                Bildern hinzufügen.
                </span>
              </p>
              </div>
            </div>

            {/* Right Column - Entry Editor */}
            <div className="max-w-lg flex w-full justify-center mx-auto lg:mx-0 pb-10">
              {/* Content Wrapper */}
              <div className="inline-flex flex-col items-center gap-6">
                {/* Entry Card Container */}
                <div className="">
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
                </div>

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
                  onChange={handleImageSelectForReplace}
                  className="hidden"
                />

                {/* Add Images Button - AUSSERHALB der Card */}
                {canAddMoreImages ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<ImagePlus className="w-4 h-4" />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Bilder hinzufügen (Optional)
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
          <div className={`rounded-full px-2 ${!isValid || isSaving ? 'bg-interactive-disabled' : 'bg-interactive-primary-default hover:bg-interactive-primary-hover'}`}>
            <Button
              variant="text"
              size="sm"
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
