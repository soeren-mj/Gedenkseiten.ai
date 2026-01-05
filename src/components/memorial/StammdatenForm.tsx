'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef } from 'react';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { InlineDatePicker } from '@/components/forms/InlineDatePicker';
import { InlineAutocomplete, InlineAutocompleteList } from '@/components/forms/InlineAutocomplete';
import { personBasicInfoSchema, petBasicInfoSchema, type PersonBasicInfo, type PetBasicInfo } from '@/lib/validation/memorial-schema';
import { format } from 'date-fns';

/**
 * Animal Type / Breed Interfaces (from Wizard)
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

/**
 * Optional field configuration
 */
type OptionalField = {
  id: string;
  label: string;
  required?: boolean;
  forType: 'person' | 'pet' | 'both';
};

const OPTIONAL_FIELDS: OptionalField[] = [
  { id: 'gender', label: 'Geschlecht', forType: 'both' },
  { id: 'salutation', label: 'Ansprache', forType: 'person' },
  { id: 'title', label: 'Titel', forType: 'person' },
  { id: 'first_name', label: 'Vorname', required: true, forType: 'person' },
  { id: 'first_name', label: 'Name deines Tieres', required: true, forType: 'pet' },
  { id: 'second_name', label: 'Zweiter Vorname', forType: 'person' },
  { id: 'third_name', label: 'Dritter Vorname', forType: 'person' },
  { id: 'nickname', label: 'Spitzname', forType: 'both' },
  { id: 'name_suffix', label: 'Namenszusatz', forType: 'person' },
  { id: 'last_name', label: 'Nachname', required: true, forType: 'person' },
  { id: 'birth_name', label: 'Geburtsname', forType: 'person' },
];

// Helper to filter fields by memorial type
const getFieldsForType = (memorialType: 'person' | 'pet') => {
  return OPTIONAL_FIELDS.filter(f => f.forType === memorialType || f.forType === 'both');
};

// Combined form data type
type FormData = PersonBasicInfo | PetBasicInfo;

/**
 * StammdatenForm Props
 */
type StammdatenFormProps = {
  mode: 'wizard' | 'edit';
  memorialType?: 'person' | 'pet'; // defaults to 'person' for backward compatibility
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void | Promise<void>;
  onChange?: (data: Partial<FormData>) => void;
  onValidityChange?: (isValid: boolean) => void;
  formId?: string;
  error?: string | null; // Error message to display near save button
};

/**
 * StammdatenForm Component
 *
 * Reusable form for person/pet basic info that works in two modes:
 * - wizard: Auto-save on change, no submit button
 * - edit: Read-only with Edit button, then Save/Cancel buttons
 */
export function StammdatenForm({
  mode,
  memorialType = 'person',
  initialData = {},
  onSubmit,
  onChange,
  onValidityChange,
  formId = 'stammdaten-form',
  error = null,
}: StammdatenFormProps) {
  const isPet = memorialType === 'pet';
  const fieldsForType = getFieldsForType(memorialType);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(mode === 'wizard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Field picker state
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Initialize selectedFields based on initialData and memorialType
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    // Required fields depend on memorial type
    const initialFields = isPet ? ['first_name'] : ['first_name', 'last_name'];
    const optionalFieldIds = fieldsForType.map(f => f.id);

    // Add fields that have values in initialData
    optionalFieldIds.forEach(fieldId => {
      const value = initialData[fieldId as keyof FormData];
      if (value && value !== '' && !initialFields.includes(fieldId)) {
        initialFields.push(fieldId);
      }
    });

    return initialFields;
  });

  // Date picker state
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [showDeathPicker, setShowDeathPicker] = useState(false);

  // Relationship custom field visibility (only for persons)
  const [showCustomRelationship, setShowCustomRelationship] = useState(
    !isPet && (initialData as Partial<PersonBasicInfo>)?.relationship_degree === 'Sonstiges'
  );

  // ============================================================================
  // PET-SPECIFIC: Animal cascade states (from Wizard)
  // ============================================================================
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

  // Animal cascade data
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const [breedGroups, setBreedGroups] = useState<BreedGroup[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingBreedGroups, setLoadingBreedGroups] = useState(false);
  const [loadingBreeds, setLoadingBreeds] = useState(false);

  // Form setup with Zod validation - use correct schema based on memorial type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isValid, dirtyFields },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isPet ? petBasicInfoSchema : personBasicInfoSchema) as any,
    mode: 'onChange',
    defaultValues: initialData,
  });

  // Watch form changes (for wizard auto-save and edit mode change detection)
  useEffect(() => {
    if (mode === 'wizard') {
      const subscription = watch((value) => {
        onChange?.(value as Partial<FormData>);
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, onChange, mode]);

  // Auto-add filled fields to selectedFields
  useEffect(() => {
    const subscription = watch((value) => {
      const fieldsToAdd: string[] = [];

      fieldsForType.forEach(field => {
        const fieldValue = value[field.id as keyof FormData];
        if (fieldValue && fieldValue !== '' && !selectedFields.includes(field.id)) {
          fieldsToAdd.push(field.id);
        }
      });

      if (fieldsToAdd.length > 0) {
        setSelectedFields(prev => [...prev, ...fieldsToAdd]);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, selectedFields, fieldsForType]);

  // Watch relationship_degree to toggle custom field (only for persons)
  useEffect(() => {
    if (isPet) return; // Skip for pets

    const subscription = watch((value) => {
      const personValue = value as Partial<PersonBasicInfo>;
      const relationshipDegree = personValue.relationship_degree;
      setShowCustomRelationship(relationshipDegree === 'Sonstiges');

      // Clear custom text if not "Sonstiges" (only if it has a value to prevent infinite loop)
      if (relationshipDegree !== 'Sonstiges' && personValue.relationship_custom) {
        setValue('relationship_custom' as keyof FormData, '' as never, { shouldDirty: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, isPet]);

  // Report validity changes to parent (for wizard mode button state)
  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  // ============================================================================
  // PET-SPECIFIC: Click-outside detection for inline autocompletes (from Wizard)
  // ============================================================================
  useEffect(() => {
    if (!isPet) return;

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
  }, [isPet]);

  // ============================================================================
  // PET-SPECIFIC: Load animal types on mount (from Wizard)
  // ============================================================================
  useEffect(() => {
    if (!isPet) return;

    setLoadingTypes(true);
    fetch('/api/animals/types')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setAnimalTypes(data.data || []);
        } else {
          console.error('[StammdatenForm] API error:', data.error);
        }
        setLoadingTypes(false);
      })
      .catch((err) => {
        console.error('[StammdatenForm] Fetch error:', err);
        setLoadingTypes(false);
      });
  }, [isPet]);

  // PET-SPECIFIC: Watch animal_type_id for cascade
  const selectedAnimalTypeId = watch('animal_type_id' as keyof FormData) as number | undefined;
  const selectedBreedGroupId = watch('breed_group_id' as keyof FormData) as number | undefined;
  const selectedBreedId = watch('breed_id' as keyof FormData) as number | undefined;

  // ============================================================================
  // PET-SPECIFIC: Load breed groups AND all breeds when animal type changes (from Wizard)
  // ============================================================================
  useEffect(() => {
    if (!isPet || !selectedAnimalTypeId) {
      setBreedGroups([]);
      setBreeds([]);
      return;
    }

    // Load breed groups
    setLoadingBreedGroups(true);
    fetch(`/api/animals/breed-groups/${selectedAnimalTypeId}`)
      .then((res) => res.json())
      .then((data) => {
        setBreedGroups(data.data || []);
        setLoadingBreedGroups(false);
      })
      .catch(() => {
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
      .catch(() => {
        setLoadingBreeds(false);
      });

    // Reset dependent fields
    setValue('breed_group_id' as keyof FormData, undefined as never);
    setValue('breed_id' as keyof FormData, undefined as never);
  }, [selectedAnimalTypeId, setValue, isPet]);

  // ============================================================================
  // PET-SPECIFIC: Filter breeds when breed group changes (from Wizard)
  // ============================================================================
  useEffect(() => {
    if (!isPet) return;

    if (selectedBreedGroupId && selectedAnimalTypeId) {
      // Re-fetch breeds filtered by breed group
      setLoadingBreeds(true);
      fetch(`/api/animals/breeds/${selectedBreedGroupId}`)
        .then((res) => res.json())
        .then((data) => {
          setBreeds(data.data || []);
          setLoadingBreeds(false);
        })
        .catch(() => {
          setLoadingBreeds(false);
        });

      // Reset breed selection when breed group changes
      setValue('breed_id' as keyof FormData, undefined as never);
    } else if (!selectedBreedGroupId && selectedAnimalTypeId) {
      // Breed group was cleared - reload ALL breeds for animal type
      setLoadingBreeds(true);
      fetch(`/api/animals/breeds-by-type/${selectedAnimalTypeId}`)
        .then((res) => res.json())
        .then((data) => {
          setBreeds(data.data || []);
          setLoadingBreeds(false);
        })
        .catch(() => {
          setLoadingBreeds(false);
        });
    }
  }, [selectedBreedGroupId, selectedAnimalTypeId, setValue, isPet]);

  // ============================================================================
  // PET-SPECIFIC: Auto-fill breed group when breed is selected directly (from Wizard)
  // ============================================================================
  useEffect(() => {
    if (!isPet) return;

    if (selectedBreedId && !selectedBreedGroupId) {
      // Find the breed in the breeds array and auto-set breed_group_id
      const selectedBreed = breeds.find(b => b.Rassen_ID === selectedBreedId);
      if (selectedBreed?.FK_Rassengruppe_ID) {
        setValue('breed_group_id' as keyof FormData, selectedBreed.FK_Rassengruppe_ID as never);
      }
    }
  }, [selectedBreedId, selectedBreedGroupId, breeds, setValue, isPet]);

  // Handle form submission
  const handleFormSubmit = async (data: FormData) => {
    if (mode === 'edit') {
      setIsSubmitting(true);
      try {
        await onSubmit(data);
        setIsEditing(false);
        setShowSuccess(true);
        reset(data); // Reset dirty fields after successful save
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('Error saving form:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onSubmit(data);
    }
  };

  // Handle cancel in edit mode
  const handleCancel = () => {
    reset(initialData);
    setIsEditing(false);
  };

  // Toggle field selection
  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
      setValue(fieldId as keyof FormData, '' as never);
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  // Determine if field has changed (for accent color)
  const isFieldDirty = (fieldName: keyof FormData) => {
    return mode === 'edit' && isEditing && dirtyFields[fieldName as keyof typeof dirtyFields];
  };

  // ============================================================================
  // PET-SPECIFIC: Helper functions for exclusive opening (from Wizard)
  // ============================================================================
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

    const isDirty = isFieldDirty(field.id as keyof FormData);
    const textColorClass = isDirty ? 'text-accent' : 'text-primary';
    const isDisabled = mode === 'edit' && !isEditing;

    switch (field.id) {
      case 'first_name':
        return (
          <div key={`${field.id}-${field.forType}`}>
            <div className="flex items-center px-3 py-2 border-b border-main">
              <label htmlFor="first_name" className="text-body-s text-primary w-40">
                {field.label} <span className="text-accent-red">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                placeholder={isPet ? 'z.B. Bella, Max, Luna' : 'Max'}
                disabled={isDisabled}
                {...register('first_name')}
                className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${textColorClass} disabled:opacity-60`}
              />
            </div>
            {errors.first_name && (
              <p className="px-4 pb-2 text-body-s text-accent-red">{errors.first_name.message}</p>
            )}
          </div>
        );

      case 'last_name':
        return (
          <div key={field.id}>
            <div className="flex items-center px-3 py-2 border-b border-main">
              <label htmlFor="last_name" className="text-body-s text-primary w-40">
                Nachname <span className="text-accent-red">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                placeholder="Schmidt"
                disabled={isDisabled}
                {...register('last_name' as keyof FormData)}
                className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${textColorClass} disabled:opacity-60`}
              />
            </div>
            {(errors as { last_name?: { message?: string } }).last_name && (
              <p className="px-4 pb-2 text-body-s text-accent-red">{(errors as { last_name?: { message?: string } }).last_name?.message}</p>
            )}
          </div>
        );

      case 'gender':
        // Pet has only männlich/weiblich, Person has more options
        return (
          <div key={field.id} className="flex items-center px-3 py-2 border-b border-main">
            <label className="text-body-s text-primary w-40">Geschlecht</label>
            <Select
              options={isPet ? [
                { value: '', label: 'Bitte auswählen' },
                { value: 'männlich', label: 'Männlich' },
                { value: 'weiblich', label: 'Weiblich' },
              ] : [
                { value: '', label: 'Bitte auswählen' },
                { value: 'männlich', label: 'Männlich' },
                { value: 'weiblich', label: 'Weiblich' },
                { value: 'divers', label: 'Divers' },
                { value: 'keine Angabe', label: 'Keine Angabe' },
              ]}
              disabled={isDisabled}
              {...register('gender')}
            />
          </div>
        );

      case 'salutation':
        return (
          <div key={field.id} className="flex items-center px-3 py-2 border-b border-main">
            <label className="text-body-s text-primary w-40">Ansprache</label>
            <Select
              options={[
                { value: '', label: 'Bitte auswählen' },
                { value: 'Herr', label: 'Herr' },
                { value: 'Frau', label: 'Frau' },
                { value: 'keine Angabe', label: 'Keine Angabe' },
              ]}
              disabled={isDisabled}
              {...register('salutation' as keyof FormData)}
            />
          </div>
        );

      case 'title':
      case 'nickname':
      case 'second_name':
      case 'third_name':
      case 'birth_name':
      case 'name_suffix':
        return (
          <div key={field.id} className="flex items-center px-3 py-2 border-b border-main">
            <label htmlFor={field.id} className="text-body-s text-primary w-40">
              {field.label}
            </label>
            <input
              id={field.id}
              type="text"
              placeholder={field.label}
              disabled={isDisabled}
              {...register(field.id as keyof FormData)}
              className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${textColorClass} disabled:opacity-60`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="">
      {/* Edit Button (only in edit mode, when not editing) */}
      {mode === 'edit' && !isEditing && (
        <div className="mb-4 flex justify-end">
          <Button variant="secondary" size="xs" onClick={() => setIsEditing(true)}>
            Bearbeiten
          </Button>
        </div>
      )}

      {/* Form */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form id={formId} onSubmit={handleSubmit(handleFormSubmit as any)} className="gap-3 flex flex-col">
        {/* Name Section */}
        <div>
          <h3 className="text-webapp-group text-primary px-2 mb-2">Name</h3>
          <div className={`${mode === 'edit' && !isEditing ? 'bg-bw-opacity-40' : 'bg-bw'} rounded-xs overflow-hidden`}>
            {!isPickerOpen ? (
              <>
                {/* Show selected fields - use fieldsForType for type-specific fields */}
                {fieldsForType.map((field) => renderField(field))}

                {/* Weitere Felder Button (only when editing) */}
                {(mode === 'wizard' || isEditing) && (
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="flex items-center px-3 py-2 w-full text-left text-body-s text-link-default hover:bg-tertiary/50 transition-colors"
                  >
                    Weitere Felder hinzufügen
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Field Picker - Checkbox List */}
                {fieldsForType.map((field) => (
                  <label
                    key={`${field.id}-${field.forType}`}
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
                  className="flex items-center justify-center px-3 py-2 w-full text-body-s text-link-default hover:bg-tertiary/50 transition-colors"
                >
                  Fertig
                </button>
              </>
            )}
          </div>
        </div>

        {/* ============================================================================ */}
        {/* PET-SPECIFIC: Animal Classification Section (from Wizard) */}
        {/* ============================================================================ */}
        {isPet && (
          <div>
            <h3 className="text-webapp-group text-primary px-2 mb-2">Klassifikation (optional)</h3>
            <div className={`${mode === 'edit' && !isEditing ? 'bg-bw-opacity-40' : 'bg-bw'} rounded-xs overflow-hidden`}>
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
                          setValue('animal_type_id' as keyof FormData, Number(value) as never);
                        }
                      }}
                      onOpenChange={(open) => {
                        if (mode === 'edit' && !isEditing) return;
                        if (open) openAnimalTypeList();
                        else setShowAnimalTypeList(false);
                      }}
                      onClear={() => setValue('animal_type_id' as keyof FormData, undefined as never)}
                      isOpen={showAnimalTypeList}
                      searchValue={animalTypeSearch}
                      onSearchChange={setAnimalTypeSearch}
                      loading={loadingTypes}
                      disabled={mode === 'edit' && !isEditing}
                    />
                  </div>
                </div>

                {/* Row 2: Inline List */}
                {showAnimalTypeList && (mode === 'wizard' || isEditing) && (
                  <div className="px-3 py-3 border-b border-main">
                    <InlineAutocompleteList
                      options={animalTypes.map((t) => ({ value: t.Tierart_ID.toString(), label: t.Tierart_Name }))}
                      value={selectedAnimalTypeId?.toString()}
                      onChange={(value) => {
                        setValue('animal_type_id' as keyof FormData, Number(value) as never);
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
                          setValue('breed_group_id' as keyof FormData, Number(value) as never);
                        }
                      }}
                      onOpenChange={(open) => {
                        if (mode === 'edit' && !isEditing) return;
                        if (open) openBreedGroupList();
                        else setShowBreedGroupList(false);
                      }}
                      onClear={() => {
                        setValue('breed_group_id' as keyof FormData, undefined as never);
                        setValue('breed_id' as keyof FormData, undefined as never);
                      }}
                      isOpen={showBreedGroupList}
                      searchValue={breedGroupSearch}
                      onSearchChange={setBreedGroupSearch}
                      disabled={!selectedAnimalTypeId || (mode === 'edit' && !isEditing)}
                      loading={loadingBreedGroups}
                    />
                  </div>
                </div>

                {/* Row 2: Inline List */}
                {showBreedGroupList && (mode === 'wizard' || isEditing) && (
                  <div className="px-3 py-3 border-b border-main">
                    <InlineAutocompleteList
                      options={breedGroups.map((g) => ({ value: g.Rassengruppe_ID.toString(), label: g.Rassengruppe_Name }))}
                      value={selectedBreedGroupId?.toString()}
                      onChange={(value) => {
                        setValue('breed_group_id' as keyof FormData, Number(value) as never);
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
                          setValue('breed_id' as keyof FormData, Number(value) as never);
                        }
                      }}
                      onOpenChange={(open) => {
                        if (mode === 'edit' && !isEditing) return;
                        if (open) openBreedList();
                        else setShowBreedList(false);
                      }}
                      onClear={() => setValue('breed_id' as keyof FormData, undefined as never)}
                      isOpen={showBreedList}
                      searchValue={breedSearch}
                      onSearchChange={setBreedSearch}
                      disabled={!selectedAnimalTypeId || (mode === 'edit' && !isEditing)}
                      loading={loadingBreeds}
                    />
                  </div>
                </div>

                {/* Row 2: Inline List */}
                {showBreedList && (mode === 'wizard' || isEditing) && (
                  <div className="px-3 py-3">
                    <InlineAutocompleteList
                      options={breeds.map((b) => ({ value: b.Rassen_ID.toString(), label: b.Rasse_Name }))}
                      value={selectedBreedId?.toString()}
                      onChange={(value) => {
                        setValue('breed_id' as keyof FormData, Number(value) as never);
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
        )}

        {/* Birth Information Section */}
        <div>
          <h3 className="text-webapp-group text-primary px-2 mb-2">Geburtsinformationen</h3>
          <div className={`${mode === 'edit' && !isEditing ? 'bg-bw-opacity-40' : 'bg-bw'} rounded-xs overflow-hidden`}>
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
                      onClick={() => (mode === 'wizard' || isEditing) && setShowBirthPicker(!showBirthPicker)}
                      disabled={mode === 'edit' && !isEditing}
                      className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right ${isFieldDirty('birth_date') ? 'text-accent' : 'text-primary'} disabled:opacity-60`}
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
              {showBirthPicker && (mode === 'wizard' || isEditing) && (
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
                        defaultYear={1964}
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
                disabled={mode === 'edit' && !isEditing}
                {...register('birth_place')}
                className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${isFieldDirty('birth_place') ? 'text-accent' : 'text-primary'} disabled:opacity-60`}
              />
            </div>
          </div>
        </div>

        {/* Death Information Section */}
        <div>
          <h3 className="text-webapp-group text-primary px-2 mb-2">Sterbeinformationen</h3>
          <div className={`${mode === 'edit' && !isEditing ? 'bg-bw-opacity-40' : 'bg-bw'} rounded-xs overflow-hidden`}>
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
                      onClick={() => (mode === 'wizard' || isEditing) && setShowDeathPicker(!showDeathPicker)}
                      disabled={mode === 'edit' && !isEditing}
                      className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right ${isFieldDirty('death_date') ? 'text-accent' : 'text-primary'} disabled:opacity-60`}
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
              {showDeathPicker && (mode === 'wizard' || isEditing) && (
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
                        defaultYear={new Date().getFullYear()}
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
                disabled={mode === 'edit' && !isEditing}
                {...register('death_place')}
                className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${isFieldDirty('death_place') ? 'text-accent' : 'text-primary'} disabled:opacity-60`}
              />
            </div>
          </div>
        </div>

        {/* Relationship Degree Section - ONLY for persons */}
        {!isPet && (
        <div>
          <h3 className="text-webapp-group text-primary px-2">Verwandschaftsgrad</h3>
          <p className="text-body-s text-secondary px-2 mb-2">
            Welche Verbindung besteht zur verstorbenen Person?
          </p>
          <div className={`${mode === 'edit' && !isEditing ? 'bg-bw-opacity-40' : 'bg-bw'} rounded-xs overflow-hidden`}>
            {/* Relationship Degree Select */}
            <div className="flex items-center px-3 py-2 border-b border-main">
              <label className="text-body-s text-primary w-40">Verwandtschaft</label>
              <Select
                options={[
                  { value: '', label: 'Bitte auswählen' },
                  // Kern-Familie
                  { value: 'Ehemann', label: 'Ehemann', group: 'Kern-Familie' },
                  { value: 'Ehefrau', label: 'Ehefrau', group: 'Kern-Familie' },
                  { value: 'Lebenspartner/in', label: 'Lebenspartner/in', group: 'Kern-Familie' },
                  { value: 'Lebensgefährte/in', label: 'Lebensgefährte/in', group: 'Kern-Familie' },
                  { value: 'Verlobte/r', label: 'Verlobte/r', group: 'Kern-Familie' },
                  { value: 'Partner/in', label: 'Partner/in', group: 'Kern-Familie' },
                  { value: 'Ex-Ehemann', label: 'Ex-Ehemann', group: 'Kern-Familie' },
                  { value: 'Ex-Ehefrau', label: 'Ex-Ehefrau', group: 'Kern-Familie' },
                  { value: 'Vater', label: 'Vater', group: 'Kern-Familie' },
                  { value: 'Mutter', label: 'Mutter', group: 'Kern-Familie' },
                  { value: 'Sohn', label: 'Sohn', group: 'Kern-Familie' },
                  { value: 'Tochter', label: 'Tochter', group: 'Kern-Familie' },
                  { value: 'Bruder', label: 'Bruder', group: 'Kern-Familie' },
                  { value: 'Schwester', label: 'Schwester', group: 'Kern-Familie' },
                  // Erweiterte Familie
                  { value: 'Großvater', label: 'Großvater', group: 'Erweiterte Familie' },
                  { value: 'Großmutter', label: 'Großmutter', group: 'Erweiterte Familie' },
                  { value: 'Enkel', label: 'Enkel', group: 'Erweiterte Familie' },
                  { value: 'Enkelin', label: 'Enkelin', group: 'Erweiterte Familie' },
                  { value: 'Onkel', label: 'Onkel', group: 'Erweiterte Familie' },
                  { value: 'Tante', label: 'Tante', group: 'Erweiterte Familie' },
                  { value: 'Neffe', label: 'Neffe', group: 'Erweiterte Familie' },
                  { value: 'Nichte', label: 'Nichte', group: 'Erweiterte Familie' },
                  // Patchwork-Familie
                  { value: 'Stiefvater', label: 'Stiefvater', group: 'Patchwork-Familie' },
                  { value: 'Stiefmutter', label: 'Stiefmutter', group: 'Patchwork-Familie' },
                  { value: 'Stiefsohn', label: 'Stiefsohn', group: 'Patchwork-Familie' },
                  { value: 'Stieftochter', label: 'Stieftochter', group: 'Patchwork-Familie' },
                  { value: 'Stiefbruder', label: 'Stiefbruder', group: 'Patchwork-Familie' },
                  { value: 'Stiefschwester', label: 'Stiefschwester', group: 'Patchwork-Familie' },
                  { value: 'Schwiegervater', label: 'Schwiegervater', group: 'Patchwork-Familie' },
                  { value: 'Schwiegermutter', label: 'Schwiegermutter', group: 'Patchwork-Familie' },
                  { value: 'Schwager', label: 'Schwager', group: 'Patchwork-Familie' },
                  { value: 'Schwägerin', label: 'Schwägerin', group: 'Patchwork-Familie' },
                  // Andere
                  { value: 'Beste/r Freund/in', label: 'Beste/r Freund/in', group: 'Andere' },
                  { value: 'Freund/in', label: 'Freund/in', group: 'Andere' },
                  { value: 'Sonstiges', label: 'Sonstiges', group: 'Andere' },
                ]}
                disabled={mode === 'edit' && !isEditing}
                {...register('relationship_degree' as keyof FormData)}
              />
            </div>

            {/* Custom Relationship Field (shown when "Sonstiges" selected) */}
            {showCustomRelationship && (
              <div className="flex items-center px-3 py-2">
                <label htmlFor="relationship_custom" className="text-body-s text-primary w-40 flex-shrink-0">
                  Bitte angeben
                </label>
                <input
                  id="relationship_custom"
                  type="text"
                  placeholder="z.B. Patenkind, Pflegevater, ..."
                  disabled={mode === 'edit' && !isEditing}
                  {...register('relationship_custom' as keyof FormData)}
                  className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${isFieldDirty('relationship_custom' as keyof FormData) ? 'text-accent' : 'text-primary'} disabled:opacity-60`}
                />
              </div>
            )}
          </div>
        </div>
        )}
      </form>

      {/* Save/Cancel Buttons (only in edit mode, when editing) */}
      {mode === 'edit' && isEditing && (
        <>
          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-xs dark:bg-red-900/20 dark:border-red-800">
              <p className="text-body-s text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-xs dark:bg-green-900/20 dark:border-green-800">
              <p className="text-body-s text-green-700 dark:text-green-300">
                Änderungen erfolgreich gespeichert!
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button type="submit" form={formId} disabled={!isValid || isSubmitting} loading={isSubmitting}>
              Speichern
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
