# Supabase Storage Setup: Condolence Images

## Bucket Configuration

### Step 1: Create Bucket
1. Open Supabase Dashboard → Storage
2. Click "New Bucket"
3. Configuration:
   - **Name:** `condolence-images`
   - **Public bucket:** NO (we control access via RLS)
   - **File size limit:** 2MB (2097152 bytes)
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

### Step 2: Prerequisites
Run migration first:
- `/supabase/migrations/20251222_create_condolence_tables.sql`

---

### Step 3: Apply RLS Policies

Navigate to Storage → condolence-images → Policies

#### Policy 1: Authenticated Upload
**Name:** `Authenticated users can upload condolence images`
**Operation:** INSERT
**Target roles:** authenticated
**Policy Definition:**
```sql
bucket_id = 'condolence-images'
```

#### Policy 2: Users Update Own Images
**Name:** `Users can update own condolence images`
**Operation:** UPDATE
**Target roles:** authenticated
**Policy Definition:**
```sql
bucket_id = 'condolence-images'
AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 3: Users Delete Own Images
**Name:** `Users can delete own condolence images`
**Operation:** DELETE
**Target roles:** authenticated
**Policy Definition:**
```sql
bucket_id = 'condolence-images'
AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: Public Read Access
**Name:** `Condolence images readable`
**Operation:** SELECT
**Target roles:** Leave empty (defaults to all/public)
**Policy Definition:**
```sql
bucket_id = 'condolence-images'
```

## File Naming Convention

```
condolence-images/
  ├── covers/
  │   └── {memorial_id}/
  │       └── cover_{timestamp}.jpg      # Cover background image
  └── entries/
      └── {user_id}/
          └── {entry_id}/
              └── image_{sort_order}_{timestamp}.jpg  # Entry images
```

## Setup Checklist

### Prerequisites
- [ ] Migration `20251222_create_condolence_tables.sql` executed

### Storage Setup
- [ ] Bucket "condolence-images" created
- [ ] File size limit set to 2MB
- [ ] Allowed MIME types configured (jpg, png, webp)

### RLS Policies
- [ ] Policy 1 (Authenticated Upload) applied
- [ ] Policy 2 (Update own) applied
- [ ] Policy 3 (Delete own) applied
- [ ] Policy 4 (Public read) applied

### Testing
- [ ] Upload test successful
- [ ] Public URL test successful
