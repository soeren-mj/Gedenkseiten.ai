# Supabase Storage Setup: Memorial Avatars

## 🎯 Bucket Configuration

### Step 1: Create Bucket
1. Open Supabase Dashboard → Storage
2. Click "New Bucket"
3. Configuration:
   - **Name:** `memorial-avatars`
   - **Public bucket:** NO (we control access via RLS)
   - **File size limit:** 2MB (2097152 bytes)
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

### Step 2: Prerequisites - Run Migrations First!

**⚠️ IMPORTANT:** Before creating Storage Policies, you MUST run this migration:
- `/supabase/migrations/20250111_add_privacy_level_to_memorials.sql`

This adds the `privacy_level` column needed by the policies.

---

### Step 3: Apply RLS Policies

Navigate to Storage → memorial-avatars → Policies

#### Policy 1: Authenticated Upload
**Name:** `Authenticated users can upload avatars`
**Operation:** INSERT
**Target roles:** authenticated
**Policy Definition:**
```sql
bucket_id = 'memorial-avatars'
```

#### Policy 2: Users Update Own Avatars
**Name:** `Users can update own memorial avatars`
**Operation:** UPDATE
**Target roles:** authenticated
**Policy Definition:**
```sql
bucket_id = 'memorial-avatars'
AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 3: Users Delete Own Avatars
**Name:** `Users can delete own memorial avatars`
**Operation:** DELETE
**Target roles:** authenticated
**Policy Definition:**
```sql
bucket_id = 'memorial-avatars'
AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: Public Read Access (Simplified)
**Name:** `Public avatars readable`
**Operation:** SELECT
**Target roles:** Leave empty (defaults to all/public)
**Policy Definition:**
```sql
bucket_id = 'memorial-avatars'
```

**Note:** This allows public read access to all avatars in the bucket. For more granular control based on memorial privacy_level, you would need a more complex policy. For MVP, we keep it simple - avatars are publicly readable via their URL, but the URLs are not guessable (UUID-based paths).

**Alternative (if you want privacy_level check):**
If you want stricter control, use this instead:
```sql
bucket_id = 'memorial-avatars'
AND EXISTS (
  SELECT 1 FROM memorials
  WHERE id::text = (storage.foldername(name))[1]
  AND privacy_level = 'public'
)
```
**Target roles:** Leave empty (public)

## 📁 File Naming Convention

Avatar files should be stored with the following structure:
```
memorial-avatars/
  ├── {user_id}/
  │   ├── temp_avatar_{timestamp}.jpg     # Temporary upload during creation
  │   └── {memorial_id}_avatar.jpg        # Final avatar after memorial creation
```

## 🔍 Verification

After setup, test with:

```javascript
// Upload test
const { data, error } = await supabase.storage
  .from('memorial-avatars')
  .upload(`${userId}/test.jpg`, file);

// Public URL test
const { data } = supabase.storage
  .from('memorial-avatars')
  .getPublicUrl(`${userId}/test.jpg`);
```

## ⚠️ Important Notes

1. **File Size Limit:** 2MB enforced at bucket level
2. **RLS Active:** All access controlled through policies
3. **Folder Structure:** Files organized by user ID for easy cleanup
4. **Cleanup:** Consider lifecycle policy for temp files older than 24h

## 📋 Setup Checklist

### Prerequisites
- [ ] Migration `20250111_add_privacy_level_to_memorials.sql` ausgeführt

### Storage Setup
- [ ] Bucket "memorial-avatars" created
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
- [ ] RLS policies working (unauthorized users can't upload)
