'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { InlineDatePicker } from '@/components/forms/InlineDatePicker';
import { personBasicInfoSchema, type PersonBasicInfo } from '@/lib/validation/memorial-schema';
import { format } from 'date-fns';

/**
 * Optional field configuration
 */
type OptionalField = {
  id: string;
  label: string;
  required?: boolean;
};

const OPTIONAL_FIELDS: OptionalField[] = [
  { id: 'gender', label: 'Geschlecht' },
  { id: 'salutation', label: 'Ansprache' },
  { id: 'title', label: 'Titel' },
  { id: 'first_name', label: 'Vorname', required: true },
  { id: 'second_name', label: 'Zweiter Vorname' },
  { id: 'third_name', label: 'Dritter Vorname' },
  { id: 'nickname', label: 'Spitzname' },
  { id: 'name_suffix', label: 'Namenszusatz' },
  { id: 'last_name', label: 'Nachname', required: true },
  { id: 'birth_name', label: 'Geburtsname' },
];

/**
 * StammdatenForm Props
 */
type StammdatenFormProps = {
  mode: 'wizard' | 'edit';
  initialData?: Partial<PersonBasicInfo>;
  onSubmit: (data: PersonBasicInfo) => void | Promise<void>;
  onChange?: (data: Partial<PersonBasicInfo>) => void;
  formId?: string;
  error?: string | null; // Error message to display near save button
};

/**
 * StammdatenForm Component
 *
 * Reusable form for person basic info that works in two modes:
 * - wizard: Auto-save on change, no submit button
 * - edit: Read-only with Edit button, then Save/Cancel buttons
 */
export function StammdatenForm({
  mode,
  initialData = {},
  onSubmit,
  onChange,
  formId = 'stammdaten-form',
  error = null,
}: StammdatenFormProps) {
  // Edit mode state
  const [isEditing, setIsEditing] = useState(mode === 'wizard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Field picker state
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Initialize selectedFields based on initialData
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    const initialFields = ['first_name', 'last_name']; // Required fields
    const optionalFieldIds = OPTIONAL_FIELDS.map(f => f.id);

    // Add fields that have values in initialData
    optionalFieldIds.forEach(fieldId => {
      const value = initialData[fieldId as keyof PersonBasicInfo];
      if (value && value !== '' && !initialFields.includes(fieldId)) {
        initialFields.push(fieldId);
      }
    });

    return initialFields;
  });

  // Date picker state
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [showDeathPicker, setShowDeathPicker] = useState(false);

  // Relationship custom field visibility
  const [showCustomRelationship, setShowCustomRelationship] = useState(
    initialData?.relationship_degree === 'Sonstiges'
  );

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isValid, dirtyFields },
  } = useForm<PersonBasicInfo>({
    resolver: zodResolver(personBasicInfoSchema),
    mode: 'onChange',
    defaultValues: initialData,
  });

  // Watch form changes (for wizard auto-save and edit mode change detection)
  useEffect(() => {
    if (mode === 'wizard') {
      const subscription = watch((value) => {
        onChange?.(value as Partial<PersonBasicInfo>);
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, onChange, mode]);

  // Auto-add filled fields to selectedFields
  useEffect(() => {
    const subscription = watch((value) => {
      const fieldsToAdd: string[] = [];

      OPTIONAL_FIELDS.forEach(field => {
        const fieldValue = value[field.id as keyof PersonBasicInfo];
        if (fieldValue && fieldValue !== '' && !selectedFields.includes(field.id)) {
          fieldsToAdd.push(field.id);
        }
      });

      if (fieldsToAdd.length > 0) {
        setSelectedFields(prev => [...prev, ...fieldsToAdd]);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, selectedFields]);

  // Watch relationship_degree to toggle custom field
  useEffect(() => {
    const subscription = watch((value) => {
      const relationshipDegree = value.relationship_degree;
      setShowCustomRelationship(relationshipDegree === 'Sonstiges');

      // Clear custom text if not "Sonstiges" (only if it has a value to prevent infinite loop)
      if (relationshipDegree !== 'Sonstiges' && value.relationship_custom) {
        setValue('relationship_custom', '', { shouldDirty: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // Handle form submission
  const handleFormSubmit = async (data: PersonBasicInfo) => {
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
      setValue(fieldId as keyof PersonBasicInfo, '');
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  // Determine if field has changed (for accent color)
  const isFieldDirty = (fieldName: keyof PersonBasicInfo) => {
    return mode === 'edit' && isEditing && dirtyFields[fieldName];
  };

  // Render field input
  const renderField = (field: OptionalField) => {
    if (!selectedFields.includes(field.id)) return null;

    const isDirty = isFieldDirty(field.id as keyof PersonBasicInfo);
    const textColorClass = isDirty ? 'text-accent' : 'text-primary';
    const isDisabled = mode === 'edit' && !isEditing;

    switch (field.id) {
      case 'first_name':
        return (
          <div key={field.id}>
            <div className="flex items-center px-3 py-2 border-b border-main">
              <label htmlFor="first_name" className="text-body-s text-primary w-40">
                Vorname <span className="text-accent-red">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                placeholder="Max"
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
                {...register('last_name')}
                className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${textColorClass} disabled:opacity-60`}
              />
            </div>
            {errors.last_name && (
              <p className="px-4 pb-2 text-body-s text-accent-red">{errors.last_name.message}</p>
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
              {...register('salutation')}
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
              {...register(field.id as keyof PersonBasicInfo)}
              className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${textColorClass} disabled:opacity-60`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-[611px] mx-auto">
      {/* Edit Button (only in edit mode, when not editing) */}
      {mode === 'edit' && !isEditing && (
        <div className="mb-4 flex justify-end">
          <Button variant="secondary" size="xs" onClick={() => setIsEditing(true)}>
            Bearbeiten
          </Button>
        </div>
      )}

      {/* Form */}
      <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="gap-3 flex flex-col">
        {/* Name Section */}
        <div>
          <h3 className="text-webapp-group text-primary px-2 mb-2">Name</h3>
          <div className={`${mode === 'edit' && !isEditing ? 'bg-bw-opacity-40' : 'bg-bw'} rounded-xs overflow-hidden`}>
            {!isPickerOpen ? (
              <>
                {/* Show selected fields */}
                {OPTIONAL_FIELDS.map((field) => renderField(field))}

                {/* Weitere Felder Button (only when editing) */}
                {(mode === 'wizard' || isEditing) && (
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="flex items-center px-3 py-2 w-full text-left text-body-s text-interactive-link-default hover:bg-tertiary/50 transition-colors"
                  >
                    Weitere Felder hinzufügen
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Field Picker - Checkbox List */}
                {OPTIONAL_FIELDS.map((field) => (
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

        {/* Relationship Degree Section */}
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
                {...register('relationship_degree')}
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
                  {...register('relationship_custom')}
                  className={`flex-1 text-body-s bg-transparent border-0 focus:outline-none focus:ring-0 text-right placeholder:text-inverted-secondary pr-3 ${isFieldDirty('relationship_custom') ? 'text-accent' : 'text-primary'} disabled:opacity-60`}
                />
              </div>
            )}
          </div>
        </div>
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
