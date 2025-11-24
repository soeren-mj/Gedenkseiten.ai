'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { WizardLayout } from '@/components/memorial/WizardLayout';
import { ProgressIndicator } from '@/components/memorial/ProgressIndicator';
import { Select } from '@/components/forms/Select';
import { InlineAutocomplete, InlineAutocompleteList } from '@/components/forms/InlineAutocomplete';
import { InlineDatePicker } from '@/components/forms/InlineDatePicker';
import { Button } from '@/components/ui/Button';
import { petBasicInfoSchema, type PetBasicInfo } from '@/lib/validation/memorial-schema';
import { useMemorialWizard } from '@/hooks/useMemorialWizard';
import { useLocalStorageDraft } from '@/hooks/useLocalStorageDraft';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/utils/logger';

/**
 * Animal Type / Breed Interfaces
 */
interface AnimalType {
  Tierart_ID: number;
  Tierart_Name: string;
}

interface BreedGroup {
  Rassengruppe_ID: number;
  Rassengruppe_Name: string;
  FK_Tierart_ID: number;
}

interface Breed {
  Rassen_ID: number;
  Rasse_Name: string;
  FK_Rassengruppe_ID: number;
}

// Optional field configuration for pets
type OptionalField = {
  id: string;
  label: string;
  required?: boolean;
};

const PET_OPTIONAL_FIELDS: OptionalField[] = [
  { id: 'first_name', label: 'Name deines Tieres', required: true },
  { id: 'gender', label: 'Geschlecht' },
  { id: 'nickname', label: 'Spitzname' },
];

/**
 * Pet Basic Info Page - Step 1 of 3
 *
 * Collects required and optional data for a pet memorial with animal type cascade
 */
export default function PetBasicInfoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { formData, updateFormData, setMemorialType } = useMemorialWizard();

  // Field picker state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    const initialFields = ['first_name']; // Required field
    const optionalFieldIds = PET_OPTIONAL_FIELDS.map(f => f.id);

    // Add fields that have values in formData
    optionalFieldIds.forEach(fieldId => {
      const value = (formData as any)?.[fieldId];
      if (value && value !== '' && !initialFields.includes(fieldId)) {
        initialFields.push(fieldId);
      }
    });

    return initialFields;
  });

  // Date picker state
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [showDeathPicker, setShowDeathPicker] = useState(false);

  // Inline autocomplete state
  const [showAnimalTypeList, setShowAnimalTypeList] = useState(false);
  const [showBreedGroupList, setShowBreedGroupList] = useState(false);
  const [showBreedList, setShowBreedList] = useState(false);
  const [animalTypeSearch, setAnimalTypeSearch] = useState('');
  const [breedGroupSearch, setBreedGroupSearch] = useState('');
  const [breedSearch, setBreedSearch] = useState('');

  // Refs for click-outside detection
  const animalTypeRef = useRef<HTMLDivElement>(null);
  const breedGroupRef = useRef<HTMLDivElement>(null);
  const breedRef = useRef<HTMLDivElement>(null);

  // Animal cascade state
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const [breedGroups, setBreedGroups] = useState<BreedGroup[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingBreedGroups, setLoadingBreedGroups] = useState(false);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Auto-save draft
  const { data: draftData, setData: setDraftData } = useLocalStorageDraft<Partial<PetBasicInfo>>(
    {},
    {
      userId: user?.id || 'anonymous',
      memorialType: 'pet'
    }
  );

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<PetBasicInfo>({
    resolver: zodResolver(petBasicInfoSchema),
    mode: 'onChange',
    defaultValues: formData as Partial<PetBasicInfo>,
  });

  // Set memorial type
  useEffect(() => {
    setMemorialType('pet');
  }, [setMemorialType]);

  // Click-outside detection for inline autocompletes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Don't close if clicking a trigger button (let onOpenChange handle it)
      if (target.closest('[data-inline-autocomplete-trigger]')) return;

      // Normal click-outside logic
      if (animalTypeRef.current && !animalTypeRef.current.contains(event.target as Node)) {
        setShowAnimalTypeList(false);
      }
      if (breedGroupRef.current && !breedGroupRef.current.contains(event.target as Node)) {
        setShowBreedGroupList(false);
      }
      if (breedRef.current && !breedRef.current.contains(event.target as Node)) {
        setShowBreedList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load animal types on mount
  useEffect(() => {
    setLoadingTypes(true);
    setApiError(null);
    fetch('/api/animals/types')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setApiError('Tierarten konnten nicht geladen werden. Bitte versuche es später erneut.');
        } else {
          setAnimalTypes(data.data || []);
        }
        setLoadingTypes(false);
      })
      .catch((err) => {
        logger.error({
          context: 'PetBasicInfo:loadAnimalTypes',
          error: err,
          userId: user?.id,
        });
        setApiError('Tierarten konnten nicht geladen werden. Du kannst trotzdem fortfahren.');
        setLoadingTypes(false);
      });
  }, []);

  // Watch specific fields for cascade
  const selectedAnimalTypeId = watch('animal_type_id');
  const selectedBreedGroupId = watch('breed_group_id');

  // Update draft with subscription pattern
  useEffect(() => {
    const subscription = watch((value) => {
      setDraftData(value as Partial<PetBasicInfo>);
    });
    return () => subscription.unsubscribe();
  }, [watch, setDraftData]);

  // Auto-add filled fields to selectedFields (ensures fields remain visible on back navigation)
  useEffect(() => {
    const subscription = watch((value) => {
      const fieldsToAdd: string[] = [];

      // Check all optional fields for values
      PET_OPTIONAL_FIELDS.forEach(field => {
        const fieldValue = (value as any)?.[field.id];
        if (fieldValue && fieldValue !== '' && !selectedFields.includes(field.id)) {
          fieldsToAdd.push(field.id);
        }
      });

      // Add fields with values to selectedFields
      if (fieldsToAdd.length > 0) {
        setSelectedFields(prev => [...prev, ...fieldsToAdd]);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, selectedFields]);

  // Load breed groups AND all breeds when animal type changes
  useEffect(() => {
    if (selectedAnimalTypeId) {
      // Load breed groups
      setLoadingBreedGroups(true);
      fetch(`/api/animals/breed-groups/${selectedAnimalTypeId}`)
        .then((res) => res.json())
        .then((data) => {
          setBreedGroups(data.data || []);
          setLoadingBreedGroups(false);
        })
        .catch((err) => {
          logger.error({
            context: 'PetBasicInfo:loadBreedGroups',
            error: err,
            additionalData: { animalTypeId: selectedAnimalTypeId },
            userId: user?.id,
          });
          setLoadingBreedGroups(false);
        });

      // Load ALL breeds for this animal type (for parallel selection)
      setLoadingBreeds(true);
      fetch(`/api/animals/breeds-by-type/${selectedAnimalTypeId}`)
        .then((res) => res.json())
        .then((data) => {
          setBreeds(data.data || []);
          setLoadingBreeds(false);
        })
        .catch((err) => {
          logger.error({
            context: 'PetBasicInfo:loadBreedsByType',
            error: err,
            additionalData: { animalTypeId: selectedAnimalTypeId },
            userId: user?.id,
          });
          setLoadingBreeds(false);
        });

      // Reset dependent fields
      setValue('breed_group_id', undefined);
      setValue('breed_id', undefined);
    } else {
      setBreedGroups([]);
      setBreeds([]);
    }
  }, [selectedAnimalTypeId, setValue]);

  // Filter breeds when breed group changes (optional refinement)
  useEffect(() => {
    if (selectedBreedGroupId && selectedAnimalTypeId) {
      // Re-fetch breeds filtered by breed group
      setLoadingBreeds(true);
      fetch(`/api/animals/breeds/${selectedBreedGroupId}`)
        .then((res) => res.json())
        .then((data) => {
          setBreeds(data.data || []);
          setLoadingBreeds(false);
        })
        .catch((err) => {
          logger.error({
            context: 'PetBasicInfo:loadBreeds',
            error: err,
            additionalData: { breedGroupId: selectedBreedGroupId },
            userId: user?.id,
          });
          setLoadingBreeds(false);
        });

      // Reset breed selection when breed group changes
      setValue('breed_id', undefined);
    } else if (!selectedBreedGroupId && selectedAnimalTypeId) {
      // Breed group was cleared - reload ALL breeds for animal type
      setLoadingBreeds(true);
      fetch(`/api/animals/breeds-by-type/${selectedAnimalTypeId}`)
        .then((res) => res.json())
        .then((data) => {
          setBreeds(data.data || []);
          setLoadingBreeds(false);
        })
        .catch((err) => {
          logger.error({
            context: 'PetBasicInfo:reloadAllBreeds',
            error: err,
            additionalData: { animalTypeId: selectedAnimalTypeId },
            userId: user?.id,
          });
          setLoadingBreeds(false);
        });
    }
  }, [selectedBreedGroupId, selectedAnimalTypeId, setValue, user?.id]);

  // Auto-fill breed group when breed is selected directly
  const selectedBreedId = watch('breed_id');
  useEffect(() => {
    if (selectedBreedId && !selectedBreedGroupId) {
      // Find the breed in the breeds array and auto-set breed_group_id
      const selectedBreed = breeds.find(b => b.Rassen_ID === selectedBreedId);
      if (selectedBreed?.FK_Rassengruppe_ID) {
        setValue('breed_group_id', selectedBreed.FK_Rassengruppe_ID);
      }
    }
  }, [selectedBreedId, selectedBreedGroupId, breeds, setValue]);

  const onSubmit = (data: PetBasicInfo) => {
    updateFormData(data);
    router.push('/gedenkseite/neu/tier/avatar');
  };

  const handleBack = () => {
    router.push('/gedenkseite/neu');
  };

  // Toggle field selection
  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  // Exclusive opening helpers (only one inline list open at a time)
  const openAnimalTypeList = () => {
    setShowAnimalTypeList(true);
    setShowBreedGroupList(false);
    setShowBreedList(false);
  };

  const openBreedGroupList = () => {
    setShowAnimalTypeList(false);
    setShowBreedGroupList(true);
    setShowBreedList(false);
  };

  const openBreedList = () => {
    setShowAnimalTypeList(false);
    setShowBreedGroupList(false);
    setShowBreedList(true);
  };

  // Render field input
  const renderField = (field: OptionalField) => {
    if (!selectedFields.includes(field.id)) return null;

    switch (field.id) {
      case 'first_name':
        return (
          <div key={field.id}>
            <div className="flex items-center px-3 py-2 border-b border-main">
              <label htmlFor="first_name" className="text-body-s text-primary w-40">
                Name deines Tieres <span className="text-accent-red">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                placeholder="z.B. Bella, Max, Luna"
                autoComplete="off"
                {...register('first_name')}
                className="flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3"
              />
            </div>
            {errors.first_name && (
              <p className="px-4 pb-2 text-body-s text-accent-red">{errors.first_name.message}</p>
            )}
          </div>
        );

      case 'gender':
        return (
          <div key={field.id} className="flex items-center px-3 py-2 border-b border-main">
            <label className="text-body-s text-primary w-40">Geschlecht</label>
            <Select
              options={[
                { value: '', label: 'Bitte auswählen' },
                { value: 'männlich', label: 'Männlich' },
                { value: 'weiblich', label: 'Weiblich' },
              ]}
              {...register('gender')}
            />
          </div>
        );

      case 'nickname':
        return (
          <div key={field.id} className="flex items-center px-3 py-2 border-b border-main">
            <label htmlFor="nickname" className="text-body-s text-primary w-40">
              Spitzname
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="Spitzname"
              autoComplete="off"
              {...register('nickname')}
              className="flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <WizardLayout
      greetingText="hier kannst du den Namen, sowie die Geburts- und Sterbeinformationen angeben."
      backButtonText="Zurück"
      onBack={handleBack}
      footerContent={
        <Button type="submit" form="pet-basic-info-form" disabled={!isValid}>
          Weiter
        </Button>
      }
    >
      <ProgressIndicator currentStep={1} totalSteps={3} className="mb-8" />

      <div className="mb-12 text-center">
        <h1 className="text-webapp-subsection text-bw mb-8">
          Für wen möchtest du eine Gedenkseite anlegen?
        </h1>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-body-s text-yellow-800 dark:text-yellow-200">{apiError}</p>
        </div>
      )}

      <form id="pet-basic-info-form" onSubmit={handleSubmit(onSubmit)} className="max-w-[611px] mx-auto gap-3 flex flex-col">
        {/* Name Section */}
        <div>
          <h3 className="text-webapp-group text-primary px-2 mb-2">Name</h3>
          <div className="bg-bw rounded-xs overflow-hidden">
            {!isPickerOpen ? (
              <>
                {/* Show selected fields */}
                {PET_OPTIONAL_FIELDS.map((field) => renderField(field))}

                {/* Weitere Felder Button */}
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="flex items-center px-3 py-2 w-full text-left text-body-s text-interactive-link-default hover:bg-tertiary/50 transition-colors"
                >
                  Weitere Felder hinzufügen
                </button>
              </>
            ) : (
              <>
                {/* Field Picker - Checkbox List */}
                {PET_OPTIONAL_FIELDS.map((field) => (
                  <label
                    key={field.id}
                    className="flex items-center px-3 py-2 border-b border-main last:border-b-0 cursor-pointer hover:bg-tertiary/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.id)}
                      disabled={field.required}
                      onChange={() => toggleField(field.id)}
                      className="mr-3 w-4 h-4 text-interactive-primary-default rounded border-main focus:ring-2 focus:ring-interactive-primary-default disabled:opacity-50"
                    />
                    <span className={`text-body-s ${field.required ? 'text-secondary' : 'text-primary'}`}>
                      {field.label}
                      {field.required && <span className="text-accent-red ml-1">*</span>}
                    </span>
                  </label>
                ))}

                {/* Fertig Button */}
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="flex items-center justify-center px-3 py-2 w-full text-body-s text-interactive-link-default hover:bg-tertiary/50 transition-colors"
                >
                  Fertig
                </button>
              </>
            )}
          </div>
        </div>

        {/* Animal Classification */}
        <div>
          <h3 className="text-webapp-group text-primary px-2 mb-2">Klassifikation (optional)</h3>
          <div className="bg-bw rounded-xs overflow-hidden">
            {/* Animal Type */}
            <div ref={animalTypeRef}>
              {/* Row 1: Label + Trigger */}
              <div className="flex items-center px-3 py-2 border-b border-main">
                <label className="text-body-s text-primary w-40 flex-shrink-0">
                  Tierart
                </label>
                <div className="flex-1">
                  <InlineAutocomplete
                    placeholder={loadingTypes ? 'Lädt...' : 'z.B. Hund, Katze'}
                    options={animalTypes.map((t) => ({ value: t.Tierart_ID.toString(), label: t.Tierart_Name }))}
                    value={selectedAnimalTypeId?.toString()}
                    onChange={(value) => {
                      if (value) {
                        setValue('animal_type_id', Number(value));
                      }
                    }}
                    onOpenChange={(open) => {
                      if (open) openAnimalTypeList();
                      else setShowAnimalTypeList(false);
                    }}
                    onClear={() => setValue('animal_type_id', undefined)}
                    isOpen={showAnimalTypeList}
                    searchValue={animalTypeSearch}
                    onSearchChange={setAnimalTypeSearch}
                    loading={loadingTypes}
                  />
                </div>
              </div>

              {/* Row 2: Inline List */}
              {showAnimalTypeList && (
                <div className="px-3 py-3 border-b border-main">
                  <InlineAutocompleteList
                    options={animalTypes.map((t) => ({ value: t.Tierart_ID.toString(), label: t.Tierart_Name }))}
                    value={selectedAnimalTypeId?.toString()}
                    onChange={(value) => {
                      setValue('animal_type_id', Number(value));
                      setShowAnimalTypeList(false);
                    }}
                    searchValue={animalTypeSearch}
                    onSearchChange={setAnimalTypeSearch}
                  />
                </div>
              )}
            </div>

            {/* Breed Group */}
            <div ref={breedGroupRef}>
              {/* Row 1: Label + Trigger */}
              <div className="flex items-center px-3 py-2 border-b border-main">
                <label className="text-body-s text-primary w-40 flex-shrink-0">
                  Rassengruppe
                </label>
                <div className="flex-1">
                  <InlineAutocomplete
                    placeholder={
                      !selectedAnimalTypeId
                        ? 'Wähle zuerst Tierart'
                        : loadingBreedGroups
                        ? 'Lädt...'
                        : 'Rassengruppe wählen'
                    }
                    options={breedGroups.map((g) => ({ value: g.Rassengruppe_ID.toString(), label: g.Rassengruppe_Name }))}
                    value={selectedBreedGroupId?.toString()}
                    onChange={(value) => {
                      if (value) {
                        setValue('breed_group_id', Number(value));
                      }
                    }}
                    onOpenChange={(open) => {
                      if (open) openBreedGroupList();
                      else setShowBreedGroupList(false);
                    }}
                    onClear={() => {
                      setValue('breed_group_id', undefined);
                      setValue('breed_id', undefined);
                    }}
                    isOpen={showBreedGroupList}
                    searchValue={breedGroupSearch}
                    onSearchChange={setBreedGroupSearch}
                    disabled={!selectedAnimalTypeId}
                    loading={loadingBreedGroups}
                  />
                </div>
              </div>

              {/* Row 2: Inline List */}
              {showBreedGroupList && (
                <div className="px-3 py-3 border-b border-main">
                  <InlineAutocompleteList
                    options={breedGroups.map((g) => ({ value: g.Rassengruppe_ID.toString(), label: g.Rassengruppe_Name }))}
                    value={selectedBreedGroupId?.toString()}
                    onChange={(value) => {
                      setValue('breed_group_id', Number(value));
                      setShowBreedGroupList(false);
                    }}
                    searchValue={breedGroupSearch}
                    onSearchChange={setBreedGroupSearch}
                  />
                </div>
              )}
            </div>

            {/* Breed */}
            <div ref={breedRef}>
              {/* Row 1: Label + Trigger */}
              <div className="flex items-center px-3 py-2">
                <label className="text-body-s text-primary w-40 flex-shrink-0">
                  Rasse
                </label>
                <div className="flex-1">
                  <InlineAutocomplete
                    placeholder={
                      !selectedAnimalTypeId
                        ? 'Wähle zuerst Tierart'
                        : loadingBreeds
                        ? 'Lädt...'
                        : 'Rasse wählen'
                    }
                    options={breeds.map((b) => ({ value: b.Rassen_ID.toString(), label: b.Rasse_Name }))}
                    value={selectedBreedId?.toString()}
                    onChange={(value) => {
                      if (value) {
                        setValue('breed_id', Number(value));
                      }
                    }}
                    onOpenChange={(open) => {
                      if (open) openBreedList();
                      else setShowBreedList(false);
                    }}
                    onClear={() => setValue('breed_id', undefined)}
                    isOpen={showBreedList}
                    searchValue={breedSearch}
                    onSearchChange={setBreedSearch}
                    disabled={!selectedAnimalTypeId}
                    loading={loadingBreeds}
                  />
                </div>
              </div>

              {/* Row 2: Inline List */}
              {showBreedList && (
                <div className="px-3 py-3">
                  <InlineAutocompleteList
                    options={breeds.map((b) => ({ value: b.Rassen_ID.toString(), label: b.Rasse_Name }))}
                    value={selectedBreedId?.toString()}
                    onChange={(value) => {
                      setValue('breed_id', Number(value));
                      setShowBreedList(false);
                    }}
                    searchValue={breedSearch}
                    onSearchChange={setBreedSearch}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Birth Information Section */}
        <div>
          <h3 className="text-webapp-group text-primary px-2 mb-2">Geburtsinformationen</h3>
          <div className="bg-bw rounded-xs overflow-hidden">
            {/* Birth Date */}
            <div>
              <div className="flex items-center px-3 py-2 border-b border-main">
                <label htmlFor="birth_date" className="text-body-s text-primary w-40 flex-shrink-0">
                  Geburtsdatum <span className="text-accent-red">*</span>
                </label>
                <Controller
                  name="birth_date"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => setShowBirthPicker(!showBirthPicker)}
                      className="flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right text-primary"
                      suppressHydrationWarning
                    >
                      {field.value ? format(new Date(field.value), 'dd.MM.yyyy') : 'TT.MM.JJJJ'}
                    </button>
                  )}
                />
              </div>
              {errors.birth_date && (
                <p className="px-3 pb-2 text-body-s text-accent-red">{errors.birth_date.message}</p>
              )}

              {/* Inline Date Picker */}
              {showBirthPicker && (
                <div className="px-3 py-3 border-b border-main">
                  <Controller
                    name="birth_date"
                    control={control}
                    render={({ field }) => (
                      <InlineDatePicker
                        value={field.value}
                        onChange={(date) => {
                          field.onChange(date);
                          setShowBirthPicker(false);
                        }}
                        defaultYear={2014}
                        onClose={() => setShowBirthPicker(false)}
                      />
                    )}
                  />
                </div>
              )}
            </div>

            {/* Birth Place */}
            <div className="flex items-center px-3 py-2">
              <label htmlFor="birth_place" className="text-body-s text-primary w-40 flex-shrink-0">
                Geburtsort
              </label>
              <input
                id="birth_place"
                type="text"
                placeholder="Ort"
                {...register('birth_place')}
                className="flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3"
              />
            </div>
          </div>
        </div>

        {/* Death Information Section */}
        <div>
          <h3 className="text-webapp-group text-primary px-2 mb-2">Sterbeinformationen</h3>
          <div className="bg-bw rounded-xs overflow-hidden">
            {/* Death Date */}
            <div>
              <div className="flex items-center px-3 py-2 border-b border-main">
                <label htmlFor="death_date" className="text-body-s text-primary w-40 flex-shrink-0">
                  Sterbedatum <span className="text-accent-red">*</span>
                </label>
                <Controller
                  name="death_date"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => setShowDeathPicker(!showDeathPicker)}
                      className="flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right text-primary"
                      suppressHydrationWarning
                    >
                      {field.value ? format(new Date(field.value), 'dd.MM.yyyy') : 'TT.MM.JJJJ'}
                    </button>
                  )}
                />
              </div>
              {errors.death_date && (
                <p className="px-3 pb-2 text-body-s text-accent-red">{errors.death_date.message}</p>
              )}

              {/* Inline Date Picker */}
              {showDeathPicker && (
                <div className="px-3 py-3 border-b border-main">
                  <Controller
                    name="death_date"
                    control={control}
                    render={({ field }) => (
                      <InlineDatePicker
                        value={field.value}
                        onChange={(date) => {
                          field.onChange(date);
                          setShowDeathPicker(false);
                        }}
                        defaultYear={2024}
                        onClose={() => setShowDeathPicker(false)}
                      />
                    )}
                  />
                </div>
              )}
            </div>

            {/* Death Place */}
            <div className="flex items-center px-3 py-2">
              <label htmlFor="death_place" className="text-body-s text-primary w-40 flex-shrink-0">
                Sterbeort
              </label>
              <input
                id="death_place"
                type="text"
                placeholder="Ort"
                {...register('death_place')}
                className="flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3"
              />
            </div>
          </div>
        </div>
      </form>
    </WizardLayout>
  );
}
