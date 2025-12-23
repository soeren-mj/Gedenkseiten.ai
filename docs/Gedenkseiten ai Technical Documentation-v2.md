# Gedenkseiten.ai Technical Documentation

# Project Overview

**Project Name:** Gedenkseiten.ai

**Type:** SaaS Platform for Memorial/Commemoration Pages

**Last Updated:** [DATE]

**Version:** 1.2

---

# 1. System Architecture Overview

### Tech Stack Requirements

- **Frontend:** React, Next.js, Tailwind CSS
- **Backend:** Node.js (Next.js API Routes)
- **Database:** PostgreSQL with Supabase
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Payment Processing:** Stripe
- **Hosting:** Vercel

### Key Features

- [ ]  User Registration/Login
- [ ]  Memorial Page Creation
- [ ]  Search function for memorial pages (on home page)
- [ ]  Media Upload (Photos/Videos)
- [ ]  Guest Book/Comments (signup for visitors)
- [ ]  Payment/Subscription Management
- [ ]  Admin Dashboard
- [ ]  Multi-language Support (German/English)

---

# 2. User Flow Documentation

## 2.1 Landing Page

**Screenshot:** [Landing page with gradient background and search functionality]

![Landing page with gradient background and search functionality](Gedenkseiten%20ai%20Technical%20Documentation%20209314b1b14781e9ab65fbfcbbe35a47/Bildschirmfoto_2025-06-04_um_05.17.36.png)

**Description:**

The landing page features a modern dark theme with a vibrant gradient background (red to pink to purple to green). It introduces Gedenkseiten.ai as a digital memorial platform powered by AI, allowing users to create and share memorial pages quickly.

**Navigation Bar Elements:**
- Logo + “Gedenkseiten.ai” (clickable → returns to home)
- “IN PLANUNG - Vorsorge” (In Planning - Pre-planning) → Future feature
- “IN PLANUNG - Todesfall” (In Planning - Death case) → Future feature

- “NEU - Gedenkseiten” (NEW - Memorial pages) → Current/Active section
- “Jetzt starten” button (Get started) → Registration/Login flow
- Dark mode toggle (moon icon)

**Hero Section:**
- Badge: “NEU und mit der Power von KI” (NEW and powered by AI)
- Main heading: “Digitale Gedenkseiten: Die moderne Art, Erinnerungen zu bewahren”
- Subheading: Description of the platform’s purpose
- User avatars with count: “Menschen wie du, die bereits angemeldet sind” (shows social proof)

**User Actions:**
- Click “Jetzt starten” (primary CTA) → Goes to Registration/Login
- Search bar: “Gedenkseite finden” → Search existing memorial pages
- Click “Seite teilen” → Share functionality (social media share modal)
- Click navigation items → Respective sections (some marked as “in planning”)
- Toggle dark/light mode → Theme switch

**Technical Requirements:**
- Next.js with Tailwind CSS for styling
- Gradient background using CSS (background-image or Tailwind gradient classes)
- Search functionality with debouncing (min 3 characters)
- Real-time user count from Supabase
- Responsive design with mobile-first approach
- Lazy loading for user avatars
- Dark mode support using next-themes
- Smooth scroll animations
- A11y compliance (WCAG 2.1 AA)

**API Endpoints Needed:**

```
GET /api/memorials/search?q={searchTerm}
Response: {
  results: [{
    id: string,
    name: string,
    slug: string,
    profileImage: string,
    birthDate: string,
    deathDate: string
  }],
  total: number
}

GET /api/stats/user-count
Response: {
  count: number
}
```

---

## 2.2 User Registration

**Screenshot:** [Registration page with multiple sign-up options]

![desktop.png](Gedenkseiten%20ai%20Technical%20Documentation%20209314b1b14781e9ab65fbfcbbe35a47/desktop.png)

**Description:**

Clean registration page with multiple authentication options. Uses passwordless email authentication for email sign-ups, requiring only an email address with verification via magic link. Complies with German DOI (Double Opt-In) requirements.

**Page Elements:**
- Header: “Deine Wahl.” (Your Choice)
- Subheader: “Erstelle dein persönliches Memorial Journey Konto”
- Multiple sign-up methods (social providers + email)
- Login link for existing users
- Legal compliance notice with links

**Sign-up Methods:**
1. **Google**: “Mit Google fortfahren”
2. **Apple**: “Mit Apple fortfahren”

3. **Microsoft**: “Mit Microsoft fortfahren”
4. **Passkey**: “Mit Passkey fortfahren”
5. **Email**: “Mit E-Mail-Adresse fortfahren” (Passwordless)

**User Flow:**
- Select authentication method → Respective OAuth flow or email input
- Email method → Enter email → Receive magic link → Verify email (DOI)
- Social auth → OAuth consent → Auto-create account
- Already registered? → Click “Einloggen” link
- All methods require accepting Terms & Privacy Policy
- **After successful registration → Redirect to Dashboard (Section 2.2.1)**

---

### 2.2.1 User Dashboard (After Registration)

**Screenshot:** [Dashboard showing welcome message and memorial management]

![empty-V2.jpg](Gedenkseiten%20ai%20Technical%20Documentation%20209314b1b14781e9ab65fbfcbbe35a47/empty-V2.jpg)

![invite-V2.jpg](Gedenkseiten%20ai%20Technical%20Documentation%20209314b1b14781e9ab65fbfcbbe35a47/invite-V2.jpg)

**Description:**

The user dashboard is the first screen users see after successful registration/login. It shows a personalized welcome message and allows users to create their first memorial page or manage existing ones. The dashboard has two variations depending on how the user registered.

### Variation A: Standard Registration

**Page Elements:**
- Header: “Gedenkseiten.ai” branding and bell icon for notifications
- sidebar left with user, settings, notifications (to set e-mail notifications for new messages), privacy 
- User info: Profile picture and name (e.g., “Peter Williams, Kostenfreier Account”)
- Welcome message: “Hi [NAME], schön das du da bist!” with “Lege eine Gedenkseite an und halte ein Stück Leben unvergessen.”
- Section: “Deine Gedenkseiten” (Your Memorial Pages)
- Empty state: Dashed box with “+” icon and “Gedenkseite hinzufügen” (Add memorial page)

### Variation B: Invited User Registration

**Page Elements:**
- Personalized welcome: “Hi [NAME], schön das du da bist!”
- Invitation notification card:
- Envelope icon
- Title: “Einladung zu einer Gedenkseite”
- From: “Von: [Inviter Name]” (e.g., “BM Birgit Musterfrau”)
- To: “Zu: [Memorial Name]” (e.g., “MK Michael Korzensländer”)
- Create memorial option: “+” with “Gedenkseite hinzufügen”

---

## 2.3 Create Memorial Page

**Description:**

Multi-step process for creating a new memorial page. The flow is designed to be quick and simple, collecting only essential information first, then offering additional customization options.

---

### 2.3.1 Memorial Type Selection

**Screenshot:** [Memorial type selection modal]

**Modal Elements:**
- Header: “Neue Gedenkseite erstellen”
- Question: “Welche Art von Gedenkseite möchtest du anlegen?”
- Cancel button: “Abbrechen”
- Four memorial type options (cards with images)

**Memorial Types:**

### Available in V1:

1. **Eine Person** (Single Person)
    - Icon: Person silhouette
    - Description: “Ideal für eine zu gedenkende Person”
    - Type: Single page memorial
2. **Ein Tier** (Pet/Animal)
    - Icon: Pet/animal image
    - Description: “Für ein Tier dem eine Gedenkseite gewidmet werden soll”
    - Type: Single page memorial (same structure as Person)

### Coming Soon (Not in V1):

1. **Familie** (Family) - PREMIUM
    - Badge: “PREMIUM”
    - Icon: Family group
    - Description: “Für Familien die gern gemeinsam auf einer Gedenkseite erscheinen wollen”
    - Type: Multi-page memorial
2. **Ereignis** (Event) - PREMIUM
    - Badge: “PREMIUM”
    - Icon: Event/memorial flowers
    - Description: “Ideal für Unfälle und Ereignisse mit mehreren Verstorbenen”
    - Type: Multi-page memorial

---

### 2.3.2 Basic Information Form

**Screenshot:** [Person and Animal creation forms]

**Form Header:**
- Title: “Neue Gedenkseite erstellen”
- Progress indicator: “Schritt 1 von 2”
- Question: “Für wen möchtest du eine Gedenkseite anlegen?”

### Person Memorial Form Fields:

**Name Section:**
- Vorname* (First name) - Required
- Nachname* (Last name) - Required
- “Weitere Felder hinzufügen” (Add more fields) - Optional link

**Geburtsinformationen (Birth Information):**
- Geburtsdatum* (Birth date) - Required, date picker
- Geburtsort (Birth place) - Optional

**Sterbeinformationen (Death Information):**
- Sterbedatum* (Death date) - Required, date picker
- Sterbeort (Death place) - Optional

### Animal Memorial Form Fields:

**Name Section:**
- Vorname* (Pet name) - Required
- “Weitere Felder hinzufügen” (Add more fields) - Optional link

**Klassifizierung (Classification):**
- Tierart (Animal type) - e.g., “Hund” (Dog)
- Rassengruppe (Breed group) - e.g., “Retriever”
- Rasse (Breed) - e.g., “Golden Retriever”

**Birth & Death Information:**
- Same as person form

**Common Elements:**
- Privacy notice: “*Pflichtfeld – Du kannst später entscheiden, ob die Gedenkseite öffentlich oder privat sein soll.”
- “Fertig” button - Disabled until all required fields are filled
- “Abbrechen” button - Return to previous screen

---

### 2.3.3 Avatar Selection

**Screenshot:** [Avatar display options modal]

**Modal Elements:**
- Header: “Neue Gedenkseite erstellen”
- Progress: “Schritt 2 von 2”
- Title: “Wähle eine Darstellung”
- Large preview area showing current selection
- Subtitle: “Wähle deine favorisierte Darstellung”
- Three avatar options
- “Fertig” button (always enabled)
- “Zurück” button to return to previous step

**Avatar Options:**

1. **Initialen** (Initials) - Default
    - Auto-generated from name fields
    - Displayed in circular badge with gradient background
2. **Icon**
    - Person memorial: Human silhouette icon
    - Animal memorial: Animal/paw icon
3. **Bild** (Image)
    - Upload custom photo
    - Max file size: 2 MB
    - Image editing options:
        - Shape: Square or Circle
        - Scale: Zoom in/out
        - Position: Drag to reposition

---

### 2.3.4 Creation Success & Content Options

**Screenshot:** [Congratulations modal with content options]

**Description:**

After completing the basic memorial creation, users see a success message and are presented with optional content sections they can add to personalize the memorial page.

**Modal Elements:**
- Success message: “Glückwunsch.” in red
- Subtitle: “du bist so gut wie fertig”
- Explanation text: “Du hast bereits genügend Informationen angegeben, um deine Seite zu veröffentlichen. Füge weitere Inhalte hinzu, um deine Seite erlebbarer zu gestalten.”
- “Fertig” button at bottom

**Content Sections:**

### Kostenfreie Inhalte (Free Content):

1. **Spruch** (Quote/Saying) - Empfehlung (Recommended)
    - Description: “Als dezentes Element ist der Spruch die erste persönliche Note und wie eine kurze Nachricht zu sehen (stellvertretend dem Grabsteinspruch). Für Besucher ist er einfacher zu konsumieren als der Nachruf.”
    - Action button: “Schreiben”
2. **Nachruf** (Obituary) - Empfehlung (Recommended)
    - Description: “Mit dem Nachruf hast du die Möglichkeit eine Würdigung des Lebens und der Leistungen zu hinterlassen.”
    - Action button: “Schreiben”
3. **Kondolenzbuch** (Condolence Book) - Empfehlung (Recommended)
    - Description: “Erstelle eine Möglichkeit für Gäste ihre Anteilnahme und persönlichen Worte zu verewigen.”
    - Action button: “Erstellen”
4. **Termine** (Events/Dates)
    - Description: “Füge Termine und Jahrestage hinzu.”
    - Action button: “Erstellen”

### Premium Inhalte (Premium Content):

1. **Erinnerungen** (Memories) - Premium
    - Description: “Erinnerungen sind Foto und Video Rückblicke die du erstellen kannst.”
    - Action button: “Erstellen”
2. **Familienstammbaum** (Family Tree) - Bald verfügbar (Coming Soon)
    - Grayed out/disabled
    - Action button: “Anlegen” (disabled)

---

### 2.3.5 Quote and Obituary Editor

**Screenshot:** [Combined Quote and Obituary editor modal]

**Description:**

Both “Schreiben” buttons for Spruch (Quote) and Nachruf (Obituary) lead to the same modal where users can add both pieces of content in one place. This streamlines the content creation process.

**Modal Elements:**
- Header: “Neue Gedenkseite erstellen”
- Back button: “< Zurück”
- Title: “Spruch und Nachruf”
- Subtitle: “Verleihe deiner Gedenkseite eine persönliche Note”
- Two content sections
- “Fertig” button at bottom

**Content Sections:**

### 1. Spruch (Memorial Quote)

- Label: “Spruch”
- Character limit: “Maximal 160 Zeichen”
- Input: Single-line or small textarea
- Placeholder: “Schreibe etwas…”
- Description: “Als dezentes Element ist der Spruch die erste persönliche Note und wie eine kurze Nachricht zu sehen (stellvertretend dem Grabstein-spruch). Für Besucher ist er einfacher zu konsumieren als der Nachruf.”
- Character counter: Shows remaining characters

### 2. Nachruf (Obituary)

- Label: “Nachruf”
- Character limit: 5,000 characters (suggested)
- Input: Large textarea (plain text only in V1)
- Placeholder: “Schreibe etwas…”
- Description: “Mit dem Nachruf hast du die Möglichkeit eine Würdigung des Lebens und der Leistungen zu hinterlassen.”
- No visible character counter (due to length)

---

### 2.3.6 Kondolenzbuch (Condolence Book) Setup

**Description:**

The condolence book feature allows visitors to leave messages and memories. It includes a customizable cover page and supports text entries with optional images.

---

### 2.3.6.1 Condolence Book Cover Creation

**Screenshot:** [Condolence book cover customization screens]

**Cover Customization Options:**

### 1. Background Selection

Three types of backgrounds available:

**A. Color Backgrounds**
- 6 pre-selected colors in palette
- Colors shown as circular swatches
- One-click selection

**B. Pre-selected Images**
- 6 curated background images
- Professional, appropriate for memorial context
- Optimized for text overlay

**C. Custom Image Upload**
- “Hintergrundbild hinzufügen” button
- Max file size: 2 MB
- Supported formats: JPG, PNG, WebP
- Automatic optimization for web display

### 2. Cover Text

- Editable title field
- Default: “In Erinnerung an unsere liebe Mutter und Freundin.”
- Character limit: 100 characters
- Text color toggle: White/Black (based on background contrast)

### 3. Profile Display Option

- Toggle: “Eigenes Profil anzeigen”
- When enabled, shows:
    - Avatar (from memorial or admin profile)
    - Name (e.g., “Peter Williams”)
- Position: Bottom center of cover

---

### 2.3.6.2 Condolence Book Activation

**Screen Elements:**
- Success message: “Dein Kondolenzbuch sieht schon gut aus.”
- Instruction: “Lade nachher Personen ein, um es weiter zu füllen.”
- Cover preview (showing customized design)
- “Eintrag verfassen” button (Write entry)
- “Fertig” button (Complete setup)

---

### 2.3.6.3 Writing a Condolence Entry

**Entry Form Elements:**

1. **Author Display**
    - Profile picture
    - Name (auto-filled from user account)
2. **Text Entry**
    - Large textarea
    - Placeholder: “Schreibe etwas…”
    - Character limit: 2000 characters
    - Plain text only (no formatting in V1)
3. **Image Upload (Optional)**
    - “Bilder hinzufügen (Optional)” button
    - Max 16 images per entry
    - Max 2 MB per image
    - Supported formats: JPG, PNG, WebP
    - Grid display of uploaded images
    - “+4” indicator when more than 4 images
4. **Actions**
    - “Fertig” button (Submit entry)

---

### 2.3.6.4 Condolence Book Display

**Display Elements:**
- Customized cover at top
- Entry cards showing:
- Author avatar and name
- Message text (with line breaks preserved)
- Uploaded images in grid (max 4 visible, “+X” for more)
- Timestamp
- “Eintrag verfassen” button for visitors
- Pagination for multiple entries

---

### 2.3.6.5 Image Lightbox

**Lightbox Features:**
- Full-screen overlay with semi-transparent background
- Large image display (maintains aspect ratio)
- Navigation: “Vorheriges” (Previous) / “Nächstes” (Next)
- Image counter: “6 Bilder ansehen” (View 6 images)
- Auto-play option: “automatische Wiedergabe” (automatic playback)
- Close button: “Schließen”
- Keyboard navigation (arrow keys, ESC to close)

---

### 2.3.6.6 Admin Management View

**Management Features:**

1. **Sort Options**
    - Dropdown: “Sortierung: Neueste zuerst ↕️”
    - Options:
        - “Neueste zuerst” (Newest first)
        - “Älteste zuerst” (Oldest first)
2. **Entry Moderation**
    - Each entry shows in a card with:
        - Author info (avatar, name)
        - Full message text
        - Attached images with “+X” indicator
        - Approval status (dotted border for pending)
    - Action buttons:
        - ❌ “Eintrag freigeben” (Reject/Hide entry)
        - ✅ (Approve entry)

---

### 2.3.7 Visitor Signup for Condolences

**Modal Elements:**
- Header: “Hinterlasse eine Nachricht”
- Subtitle: “Melde dich kurz an, um deine Anteilnahme für [Name] zu zeigen”
- Social login options
- Email option
- Privacy note

**Signup Flow for Condolence Writers:**

1. **Social Login Options** (Fastest)
    - “Mit Google fortfahren” → One-click signup
    - “Mit Apple fortfahren” → For iOS users
    - Auto-fills name from social profile
2. **Email Signup** (Passwordless)
    - Name field (required)
    - Email field (required)
    - No password required
    - Magic link sent to email

---

### 2.3.8 Writing a Condolence Message

**Editor Elements:**
- Memorial context (photo + name of deceased)
- Message textarea
- Character counter (e.g., “0/1000”)
- “Vorschau” (Preview) button
- “Absenden” (Submit) button
- “Abbrechen” (Cancel) button

**Message Guidelines Shown:**
- “Teilen Sie eine Erinnerung oder sprechen Sie Ihr Beileid aus”
- “Bitte respektvoll und würdevoll”

---

### 2.3.9 Termine (Events/Important Dates)

**Description:**

The Termine feature allows memorial admins to add important dates and events related to the deceased. The system automatically generates anniversary reminders and allows custom events to be added.

---

### 2.3.9.1 Events Overview

**Page Elements:**
- Header: “Termine”
- Subtitle: “Welche bedeutenden Termine stehen noch bevor?”
- Event list (when populated)
- “Neuen Termin hinzufügen” button
- “Fertig” button to return to overview

**System-Generated Events (Automatic):**
- Death anniversaries: “10. Todestag”, “25. Todestag”, etc.
- Birthday remembrances: “Wäre heute 100 Jahre alt”
- Generated based on birth/death dates from memorial data
- Recurring annually

---

### 2.3.9.2 Add Event Modal

**Form Fields:**

1. **Art** (Event Type)
    - Dropdown with common event types:
        - Seebestattung (Sea burial)
        - Beerdigung (Burial)
        - Trauerfeier (Memorial service)
        - Beisetzung (Interment)
        - Einäscherung (Cremation)
        - Gedenkfeier (Remembrance ceremony)
        - Sonstiges (Other)
2. **Event Name/Title**
    - Text field for custom event name
    - Pre-filled based on selected type
3. **Location**
    - Two input options:
        - Google Maps integration (search and select)
        - Free text input
    - Shows formatted address after selection
4. **Date & Time**
    - **Ganztägig** (All day) toggle
    - **Beginn** (Start): Date picker + Time picker
    - **Ende** (End): Date picker + Time picker
    - iOS-style date/time pickers
5. **Funeral Director** (Optional)
    - Field label: “Bestatter” with info icon
    - Input options:
        - Search via Google Maps/Places API
        - Manual text entry
    - Displays business name and address

**Burial Type Selection** (When “Bestattung” selected):
- Additional dropdown appears
- German burial types:
1. Erdbestattung (Ground burial)
2. Feuerbestattung (Cremation)
3. Seebestattung (Sea burial)
4. Waldbestattung (Forest burial)
5. Anonyme Bestattung (Anonymous burial)
6. Diamantbestattung (Diamond burial)
7. Weltraumbestattung (Space burial)

---

### 2.3.10 Erinnerungen (Memories) - Premium Feature

**Description:**

Erinnerungen allows users to create photo and video galleries that tell stories about the deceased’s life. Similar to WhatsApp Status or Instagram Stories, these are visual narratives with optional text descriptions.

---

### 2.3.10.1 Memories Overview (Empty State)

**Page Elements:**
- Header: “Erinnerungen” with PREMIUM badge
- Description: “Halte Erinnerungen mit Foto- und Video-Rückblicken fest und zeige mehr über das Leben der Person.”
- “Neue Erinnerung erstellen” button (primary CTA)
- “Beispiel:” section showing preview
- Example memory card: “Familienzeit” with play button

---

### 2.3.10.2 Create New Memory

**Form Elements:**

1. **Title Image**
    - Dashed box with “+” icon
    - “Titelbild hinzufügen” button
    - Upload requirements:
        - Max 5MB per image
        - JPG, PNG, WebP formats
        - Recommended: 16:9 aspect ratio
2. **Title Field**
    - Label: “Titel der Erinnerung”
    - Helper text: “Wir empfehlen einen kurzen prägnanten Titel wie z.B. ‘Gärtnerei als Leidenschaft’ oder ‘Familienzeit’”
    - Character limit: 50 characters
3. **Add Photos Section**
    - “Fotos hinzufügen” button
    - Supports batch upload
    - Grid preview of selected images

---

### 2.3.10.3 Memory Content Management

**Features:**

1. **Image Grid Display**
    - Thumbnail grid of all uploaded images
    - Drag-and-drop reordering
    - Visual order indicators
2. **Image Actions**
    - Delete individual images (trash icon)
    - Add more images (+ button)
    - Edit image description/caption
3. **Text Descriptions**
    - Optional text field for each image
    - Character limit: 200 per image
    - Displayed as overlay on image during playback
4. **Slideshow Settings**
    - Duration per image: 3-10 seconds (default: 5)
    - Transition effect: Fade/Slide
    - Auto-play option

---

### 2.3.10.4 Memory Gallery View (Filled State)

**Page Elements:**

1. **Created Memory Card**
    - Cover image thumbnail
    - Title: “Familienzeit”
    - Action buttons:
        - 🗑️ Delete
        - ✏️ Edit
        - ▶️ Preview/Play
2. **Add New Memory**
    - Dashed box with “+”
    - “Neue Erinnerung hinzufügen”

---

### 2.3.10.5 Memory Playback Experience

**Playback Features:**

1. **Full-Screen Display**
    - Image fills viewport
    - Ken Burns effect (subtle zoom/pan)
    - Smooth transitions between images
2. **Text Overlay**
    - Caption displayed at bottom
    - Semi-transparent background for readability
    - Fade in/out with image transitions
3. **Navigation Controls**
    - Previous/Next arrows
    - Progress indicator (dots or bar)
    - Play/Pause button
    - Close (X) button
4. **Auto-advance**
    - Configurable duration (3-10 seconds)
    - Pauses on user interaction
    - Resumes after 3 seconds of inactivity

---

## 2.4 Memorial Page View (Public)

**Description:**

The memorial page is the public-facing view where visitors can learn about the deceased, share memories, and interact with various content sections. The layout dynamically adapts based on available content to avoid empty spaces and provide the best user experience.

---

### 2.4.1 Dynamic Layout System

**Description:**

The memorial page uses an intelligent layout system that adjusts based on the amount of content available.

### Layout Variations:

**1. Minimal Content (Empty State)**
- **Left Column**: Profile section (fixed width)
- **Right Column**: Comments/Posts section (full height, full width)
- Comments section expands to fill available space when no other content exists

**2. With Comments Only**
- Profile remains on left
- Comments section takes full right side
- No empty spaces or gaps
- Optimal for newly created memorials

**3. With Additional Content**
- Profile stays on left
- New content (Nachruf, Erinnerungen, Wissenswertes) appears in right column
- Comments section moves below other content
- Grid layout adjusts automatically

**4. Full Content Layout**
- All sections visible in organized grid
- Priority content (Nachruf, Wissenswertes) at top
- Interactive content (Erinnerungen, Termine) in middle
- Social content (Kondolenzbuch, Comments) at bottom

---

### 2.4.1 Hero Section Components

**Description:**

The hero section contains the main memorial information, displayed in a two-column layout with profile on the left and content sections on the right.

---

### 2.4.1.1 Profile Section (Left Column)

**Elements:**
- Profile photo (large, rounded)
- Full name
- Birth date (✱ symbol) and death date (✝ symbol)
- Location (city)
- Memorial quote (if added)

**Technical Notes:**
- Fixed width: 300px on desktop
- Sticky positioning on scroll
- Contains essential memorial information

---

### 2.4.1.2 Nachruf (Obituary) - Right Column Top

**Description:**

Text-based obituary section displaying the written tribute.

**Elements:**
- Section header: “Nachruf”
- Obituary text (plain text, up to 5000 characters)
- Line breaks preserved
- Expandable if text is long (Show more/Show less)

**Display Logic:**
- Only shows if obituary text exists
- Takes full width of right column
- Elegant typography for readability

---

### 2.4.1.3 Wissenswertes (Notable Facts/Achievements)

**Description:**

Customizable achievement/fact badges that highlight important aspects of the deceased’s life.

**Features:**
- Grid of achievement badges
- Each badge contains:
- Icon (from library or emoji)
- Text (max 36 characters)
- User-defined entries
- Visual, scannable format

**Examples:**
- 🏃 “Marathon Frankfurt 2018”
- 🎭 “Komparse in Fluch der Karibik”
- 🌍 “Greenpeace Mitglied”
- 🎵 “Leidenschaft für Musik”
- ⚽ “FC Bayern Fan seit 1965”

**Technical Implementation:**

```tsx
interface Achievement {
  id: string;  memorialId: string;  icon: string; // emoji or icon identifier  text: string; // max 36 chars  order: number;}
// Icon selection optionsconst iconOptions = {
  // Sports & Activities  sports: ['🏃', '⚽', '🏊', '🚴', '⛷️', '🏌️', '🎾', '🏀'],  // Arts & Culture  arts: ['🎭', '🎨', '🎵', '🎸', '📚', '✍️', '📷', '🎬'],  // Career & Service  career: ['👨‍⚕️', '👩‍🏫', '👮', '👨‍🚒', '⚖️', '🔬', '💼', '🏭'],  // Causes & Memberships  causes: ['🌍', '🕊️', '❤️', '🌱', '🤝', '🎗️', '🏛️', '⛪'],  // Hobbies & Interests  hobbies: ['🎣', '🌻', '🍳', '🧩', '♟️', '🎯', '🎲', '🏕️'],  // Travel & Places  travel: ['✈️', '🗺️', '🏔️', '🏖️', '🚢', '🏛️', '🗼', '🌎']
};
```

**Display Layout:**
- Grid: 2 columns on mobile, 3-4 on desktop
- Each badge: icon + text in pill/card format
- Subtle background color
- Maximum 12 achievements (to prevent clutter)

---

### 2.4.1.4 Erinnerungen (Memories Preview)

**Description:**

Preview section showing memory galleries in the hero area.

**Elements:**
- Section header: “Erinnerungen”
- Grid of memory thumbnails (2-3 visible)
- Play button overlay on each
- “Alle anzeigen” (Show all) link if more than 3

**Interaction:**
- Click thumbnail → Opens full-screen memory player
- Click “Show all” → Scrolls to full memories section

---

### 2.4.2 Social Interactions Bar

**Description:**

Prominent interaction bar placed directly below the hero section, allowing visitors to express emotions and appreciation.

**Location:**
- Immediately after hero box
- Full width of content area
- Sticky on mobile scroll

**Elements:**

1. **Heart (❤️)** - Love/Remembrance
    - Counter: Shows total hearts
    - Filled when user has reacted
2. **Candle (🕯️)** - Light a candle
    - Counter: Shows lit candles
    - Animation on click
3. **Flower (🌹)** - Leave a flower
    - Counter: Shows flowers left
    - Multiple flower types available
4. **Dove (🕊️)** - Peace/Rest
    - Counter: Shows doves sent
    - Gentle animation
5. **Folded Hands (🙏)** - Prayer/Respect
    - Counter: Shows prayers
    - Cultural sensitivity

**Technical Implementation:**

```tsx
interface MemorialReactions {
  hearts: number;  candles: number;  flowers: number;  doves: number;  prayers: number;  userReactions: {
    hasHeart: boolean;    hasCandle: boolean;    hasFlower: boolean;    hasDove: boolean;    hasPrayer: boolean;  };}
```

**Visual Design:**
- Clean, modern button design
- Subtle hover effects
- Active state clearly visible
- Smooth count animations
- Mobile-optimized touch targets

**Interaction Details:**
- **Anonymous users**: Can view counts but must login to react
- **Logged-in users**: Can toggle each reaction on/off
- **Visual feedback**: Immediate UI update with server sync
- **Animations**: Subtle scale/glow effect on interaction
- **Mobile**: Haptic feedback on supported devices

---

### 2.4.3 Beiträge (Comments/Feed Section)

**Description:**

The Beiträge section is a dynamic comment feed where users can post multiple times (unlike the condolence book’s one-entry limit). It supports rich content including text, headlines with icons, and images in various layouts.

**Key Differences from Condolence Book:**
- **Multiple posts allowed** per user
- **More flexible content** options
- **Feed-style layout** with newest first
- **Individual reactions** per post

---

### 2.4.3.1 Content Creation Options

**Post Types:**
Users can create posts with any combination of:

1. **Text Only**
    - Rich text support (bold, italic only)
    - 15-line limit before collapse
    - “Mehr lesen” (Read more) expansion
2. **Headline with Icon**
    - Same 5 icons as reactions: ❤️ 🕯️ 🌹 🕊️ 🙏
    - Short headline text
    - Acts as visual emphasis
3. **Images**
    - Single portrait image: Full width display
    - Single landscape image: Full height display
    - Multiple images: Grid with max 4 visible (+X indicator)
4. **Combined Content**
    - Any combination of above
    - Flexible formatting

**Technical Implementation:**

```tsx
interface BeitragPost {
  id: string;  memorialId: string;  userId: string;  authorName: string;  authorAvatar: string;  headline?: {
    icon: '❤️' | '🕯️' | '🌹' | '🕊️' | '🙏';    text: string;  };  content?: {
    text: string;    isExpanded: boolean;  };  images?: {
    urls: string[];    layout: 'portrait' | 'landscape' | 'grid';  };  reactions: ReactionCounts;  createdAt: Date;  updatedAt: Date;}
// Determine image layoutconst getImageLayout = (images: Image[]): ImageLayout => {
  if (images.length === 1) {
    const aspectRatio = images[0].width / images[0].height;    return aspectRatio > 1.2 ? 'landscape' : 'portrait';  }
  return 'grid';};
```

---

### 2.4.3.2 Post Display Layouts

**Single Image - Portrait (Full Width)**

```
┌─────────────────────┐
│  [Author Info]      │
├─────────────────────┤
│                     │
│    Image            │
│    (portrait)       │
│                     │
├─────────────────────┤
│  [Caption/Text]     │
│  [Reactions]        │
└─────────────────────┘
```

**Single Image - Landscape (Full Height)**

```
┌─────────────────────┐
│  [Author Info]      │
├─────────────────────┤
│ ╔═════════════════╗ │
│ ║                 ║ │
│ ║   Landscape     ║ │
│ ║     Image       ║ │
│ ║                 ║ │
│ ╚═════════════════╝ │
├─────────────────────┤
│  [Caption/Text]     │
│  [Reactions]        │
└─────────────────────┘
```

**Multiple Images - Grid**

```
┌─────────────────────┐
│  [Author Info]      │
├─────────────────────┤
│ ┌───┬───┬───┬───┐  │
│ │ 1 │ 2 │ 3 │ 4 │  │
│ └───┴───┴───┴───┘  │
│      [+4 more]      │
├─────────────────────┤
│  [Caption/Text]     │
│  [Reactions]        │
└─────────────────────┘
```

---

### 2.4.3.3 Enhanced Lightbox

**Screenshot:** [Updated lightbox with navigation header]

**Lightbox Components:**

1. **Header Navigation**
    - Left: Author avatar and name
    - Right: Close button (X)
    - Semi-transparent background
2. **Image Display**
    - Centered image
    - Maintains aspect ratio
    - Pinch-to-zoom on mobile
3. **Pagination**
    - Dot indicators below image
    - Active dot highlighted
4. **Controls**
    - Previous arrow (left)
    - Play/Pause button (center)
        - Play: Auto-advance enabled
        - Pause: Manual navigation only
    - Next arrow (right)

**Implementation:**

```tsx
const EnhancedLightbox = ({ images, author, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);  const [isPlaying, setIsPlaying] = useState(false);  return (
    <div className="lightbox-overlay">      {/* Header */}
      <div className="lightbox-header">        <div className="author-info">          <img src={author.avatar} alt="" />          <span>{author.name}</span>        </div>        <button className="close-btn" onClick={onClose}>×</button>      </div>      {/* Image */}
      <div className="image-container">        <img src={images[currentIndex]} alt="" />      </div>      {/* Pagination dots */}
      <div className="pagination-dots">        {images.map((_, idx) => (
          <span
            key={idx}
            className={idx === currentIndex ? 'active' : ''}
            onClick={() => setCurrentIndex(idx)}
          />        ))}
      </div>      {/* Controls */}
      <div className="controls">        <button onClick={prevImage}>←</button>        <button onClick={() => setIsPlaying(!isPlaying)}>          {isPlaying ? '⏸' : '▶'}
        </button>        <button onClick={nextImage}>→</button>      </div>    </div>  );};
```

---

### 2.4.3.4 Text Collapse/Expand

**Behavior:**
- Text limited to 15 lines initially
- “Mehr lesen” link appears if exceeded
- Smooth expand animation
- “Weniger anzeigen” (Show less) option when expanded

**Implementation:**

```tsx
const CollapsibleText = ({ text, maxLines = 15 }) => {
  const [isExpanded, setIsExpanded] = useState(false);  const shouldCollapse = countLines(text) > maxLines;  return (
    <div className="text-content">      <div className={`text ${!isExpanded && shouldCollapse ? 'line-clamp-15' : ''}`}>        {renderRichText(text)} {/* Bold/italic support */}
      </div>      {shouldCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-toggle"        >          {isExpanded ? 'Weniger anzeigen' : 'Mehr lesen'}
        </button>      )}
    </div>  );};
```

---

### 2.4.3.5 Post Reactions

**Elements:**
- Same 5 reaction types as main memorial
- Displayed below each post
- Individual counters per post
- Toggle on/off functionality

**Layout:**

```
[❤️ 12] [🕯️ 8] [🌹  5] [🕊️ 3] [🙏  15]
```

---

### 2.4.3.6 User Permissions

**Regular Users:**
- Create unlimited posts
- Delete own posts (no edit in V1)
- React to any post
- Report inappropriate content

**Memorial Admin:**
- Delete any post
- Receive notifications (optional setting)
- Moderate content
- Pin important posts (future feature)

**Technical Implementation:**

```tsx
interface BeitragPermissions {
  canPost: boolean;  canDelete: (postId: string, userId: string, isAdmin: boolean) => boolean;  canModerate: boolean;  notificationsEnabled: boolean;}
const permissions: BeitragPermissions = {
  canPost: user.isAuthenticated,  canDelete: (postId, userId, isAdmin) => {
    // Users can delete own posts, admins can delete any    return post.userId === userId || isAdmin;  },  canModerate: user.role === 'memorial_admin',  notificationsEnabled: user.preferences.beitragNotifications};
```

**Admin Notification Settings:**

```tsx
interface AdminNotificationPreferences {
  newBeitrag: boolean;  newCondolence: boolean;  newReaction: boolean;  moderationRequired: boolean;  emailFrequency: 'immediate' | 'daily' | 'weekly';}
```

---

### 2.4.3.7 Feed Management

**Sorting:**
- Default: Newest first (chronological)
- No other sorting options in V1
- Pagination or infinite scroll for many posts

**Database Schema:**

```sql
CREATE TABLE beitrag_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  headline_icon TEXT,
  headline_text TEXT,
  content_text TEXT,
  content_rich_text JSONB, -- Store bold/italic formatting  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete);
CREATE TABLE beitrag_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES beitrag_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE beitrag_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES beitrag_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  reaction_type TEXT CHECK (reaction_type IN ('heart', 'candle', 'flower', 'dove', 'prayer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);
```

---

# Memorial Page Settings Documentation

## 2.5 Memorial Page Administration

### 2.5.1 Accessing Memorial Settings

**Navigation:**

- From Dashboard → Click on memorial name
- Opens memorial admin panel with left sidebar navigation

**Sidebar Structure:**

```
Gedenkseiten-Inhalte
├── 👤 Stammdaten angeben
├── 🎨 Darstellung
├── ✏️ Spruch und Nachruf
├── 📖 Kondolenzbuch [NEUE BEITRÄGE]
├── 😊 Wissenswertes
├── 📅 Termine
├── 🎬 Erinnerungen [PREMIUM]
├── 💬 Gedenkbeiträge [NEUE BEITRÄGE]
└── 🌳 Familienstammbaum [BALD VERFÜGBAR]

Einstellungen
├── 📧 Einladungen
├── 🔗 Verknüpfungen [BALD VERFÜGBAR]
└── 🔒 Privatsphäre

```

---

### 2.5.2 Gedenkbeiträge (Feed Management)

**Description:**
Admin interface for moderating the memorial feed where visitors post messages, images, and reactions.

**Features:**

### Notification Banner

- Yellow banner: "5 neuer Einträge" (5 new entries)
- Info text: "Die Beiträge sind automatisch freigegeben. Als Administrator hast du die Möglichkeit Beiträge zu löschen. Der jeweilige Nutzer erhält darüber eine Benachrichtigung."
- Posts are auto-approved (no pre-moderation in V1)

### Post Management

- Each post shows:
    - Author avatar and name
    - "NEU" badge for recent posts
    - Post date
    - Three-dot menu (⋮) → Delete option only
- No edit functionality in V1
- Deletion sends notification to post author

### Post Types Displayed

1. **Text posts** with reactions
2. **Image posts** with grid layout (+X indicator)
3. **Combined posts** with icon headlines (🕊️) and text

**Technical Implementation:**

```tsx
interface AdminFeedView {
  newPostsCount: number;
  posts: BeitragPost[];
  canDelete: true; // Admins always can delete
  notifyOnDelete: true; // System sends notification
}

// Admin action
DELETE /api/memorials/:id/posts/:postId
Response: {
  success: boolean;
  notificationSent: boolean;
}

```

---

### 2.5.3 Kondolenzbuch (Condolence Book Moderation)

**Description:**
Moderation queue for condolence book entries requiring approval before public display.

**UI Elements:**

### Notification Banner

- "Ein neuer Eintrag ins Kondolenzbuch."
- "Du kannst den Eintrag annehmen oder ablehnen. Er wird erst sichtbar, wenn du ihn annimmst."

### Moderation Interface

- **Sort dropdown**: "Neueste zuerst ↕️"
- **Entry cards** with:
    - Dotted border (indicates pending status)
    - Author info (avatar + name)
    - Entry content
    - Image attachments (+X indicator)
    - Action buttons:
        - ❌ "Eintrag freigeben" (Reject)
        - ✅ (Approve)

### Cover Display

- Shows customized condolence book cover
- Preview of how it appears on memorial page

**Approval Workflow:**

1. New entries appear with dotted border
2. Admin reviews content
3. Approve → Entry becomes public
4. Reject → Entry removed, author notified

---

### 2.5.4 Privatsphäre (Privacy Settings)

**Page Header:**

- Title: "Seite erstellen"
- Subtitle: "Halte Erinnerungen mit Foto- und Video-Rückblicken fest und zeige mehr über das Leben der Person."

**Privacy Levels:**

### 1. Öffentlich (Public) - Default

- Toggle: ON (green)
- Description: "Deine Gedenkseite ist öffentlich zu finden und erscheint auch in der Suche"
- Full public access
- Appears in search results
- Anyone can view

### 2. Privat (Private)

- Toggle: OFF
- Description: "Deine Seite ist privat und nur über einen Einladungs-Link zu erreichen. In unserer Suche erscheint nur der Name, Personen dürfen eine Anfrage auf Zugriff stellen"
- Invite-link access only
- Shows in search with name only
- "Kontakt aufnehmen" (Contact admin) button instead of direct access
- Users can request access

### 3. Volle Kontrolle (Full Control) - PREMIUM/COMING SOON

- Toggle: OFF (grayed out)
- Badges: "PREMIUM" "COMING SOON"
- Description: "Du hast die volle Kontrolle. Entscheide in den Einstellungen, wie deine Seite zu finden ist und wer Zugriff erhält. Zusätzlich zum Einladungs-Link kannst du deine Seite mit einem Passwort sichern."
- Additional password protection
- Advanced access controls
- Not available in V1

**Technical Implementation:**

```tsx
enum PrivacyLevel {
  PUBLIC = 'public',      // Default
  PRIVATE = 'private',    // Invite-only
  FULL_CONTROL = 'full'   // Premium - not in V1
}

interface MemorialPrivacy {
  level: PrivacyLevel;
  inviteLink?: string;     // Generated for private
  showInSearch: boolean;   // true for all levels
  directAccess: boolean;   // false for private
  passwordProtected?: boolean; // Premium feature
}

```

---

### 2.5.5 Einladungen (Invitations)

**Description:**
Manage who has access to private memorial pages through invitation system.

**Page Elements:**

### Header Section

- Title: "Personen einladen"
- Subtitle: "Lade Menschen ein damit ihr gemeinsam eine diverse Erinnerung für [Name] erschafft."
- "Einladungs-Link kopieren" button (copies invite link)

### Invitation Search

- Search bar: "Wen möchtest du einladen?"
- Searches by name or email
- Voice input option

### Invited Users List

Shows all invited users with:

- Avatar (initials if no photo)
- Name
- Email address
- Role dropdown:
    - **Mitglied** (Member) - Default
    - **Administrator** - Can manage memorial
- Status indicator:
    - **Ausstehend** (Pending) - Invitation sent
    - **Angenommen** (Accepted) - Active user
- Three-dot menu (⋮) → "Einladung löschen" (Delete invitation)

**Invitation Flow:**

1. Enter email/search for user
2. Select role (Member/Administrator)
3. Send invitation
4. Track status (Pending → Accepted)
5. Manage/revoke access as needed

**Role Permissions:**

| Permission | Mitglied | Administrator |
| --- | --- | --- |
| View memorial | ✓ | ✓ |
| Post in feed | ✓ | ✓ |
| Add condolences | ✓ | ✓ |
| Delete own posts | ✓ | ✓ |
| Delete any post | ✗ | ✓ |
| Moderate condolences | ✗ | ✓ |
| Edit memorial | ✗ | ✓ |
| Manage invitations | ✗ | ✓ |
| Change privacy | ✗ | ✓ |

---

### 2.5.6 Verknüpfungen (Connections) - NOT IN V1

**Status:** BALD VERFÜGBAR (Coming Soon)

**Description:**
Future feature for connecting individual person pages to family or event memorial pages.

**Shown Elements:**

- Memorial ID: "ID: 9982-RTF3-881U"
- Info box explaining the feature
- "Gedenkseite verknüpfen" button (disabled)

**Use Case (Future):**

- User creates family memorial page
- Also creates detailed individual pages for family members
- Links them together for navigation
- Visitors can move between connected pages

**Remove from V1 Documentation**

---

### Database Updates for V1

```sql
-- Privacy settings
ALTER TABLE memorials ADD COLUMN privacy_level VARCHAR(20) DEFAULT 'public';
ALTER TABLE memorials ADD COLUMN invite_link UUID DEFAULT gen_random_uuid();

-- Invitations
CREATE TABLE memorial_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  role VARCHAR(20) DEFAULT 'member',
  status VARCHAR(20) DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(memorial_id, invited_email)
);

-- Admin notifications
CREATE TABLE admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'new_post', 'new_condolence', 'access_request'
  count INTEGER DEFAULT 0,
  last_reset TIMESTAMPTZ DEFAULT NOW()
);

```

### API Endpoints for Memorial Settings

```tsx
// Privacy management
PUT /api/memorials/:id/privacy
Body: { level: 'public' | 'private' }

// Invitation management
POST /api/memorials/:id/invitations
Body: { email: string, role: 'member' | 'administrator' }

GET /api/memorials/:id/invitations
Response: { invitations: Invitation[] }

DELETE /api/memorials/:id/invitations/:inviteId

// Feed moderation
GET /api/memorials/:id/admin/posts?status=new
DELETE /api/memorials/:id/posts/:postId

// Condolence moderation
GET /api/memorials/:id/condolences?status=pending
PUT /api/memorials/:id/condolences/:id/approve
PUT /api/memorials/:id/condolences/:id/reject

```

## 2.6 Memorial Page Search

### 2.6.1 Search Modal Overview

**Description:**
Global search function allowing users to find memorial pages of people or pets. Accessible from the main navigation and landing page.

**Modal Header:**

- Title: "Gedenkseite finden"
- Subtitle: "Mit der Suchfunktion kannst du Angehörige und andere Personen finden."
- Close button (X) in top-left corner

---

### 2.6.2 Search States

### State 1: Default (Empty)

**Elements:**

- Search input field
- Placeholder text: "Wen suchst du?"
- Microphone icon for voice input
- Empty results area
- Clean, minimal interface

**Behavior:**

- Opens with focus on search field
- Ready for immediate typing
- No results shown until user starts typing

---

### State 2: Active Search (With Results)

**Search Query Display:**

- Shows current search term (e.g., "Michael Schumapsum")
- Clear button (X) to reset search

**Results Section:**

- Result count: "2 Einträge gefunden"
- Memorial cards showing:
    - Profile picture or initials
    - Full name
    - Privacy status badge (if private)
    - Action icon (arrow → or mail icon)

**Result Types:**

1. **Public Memorial**
    - Standard avatar/photo
    - Name display
    - Arrow icon (→) indicating direct access
    - Click → Navigate to memorial page
2. **Private Memorial**
    - Initials avatar (e.g., "TS")
    - "PRIVAT" badge in purple
    - Name display
    - Mail icon (✉️) for contact
    - Click → Opens contact form

**Additional Results:**

- Section: "Weitere ähnliche Treffer deiner Suche"
- Shows related/similar results
- Same card format as main results

---

### State 3: No Results Found

**Elements:**

- Search query shown with clear button
- Message: "Keine Einträge gefunden."
- Explanation heading: "Das kann folgende Ursachen haben:"
- Bullet points:
    - "Es gibt keine Gedenkseite mit der Person"
    - "Die Privatsphäre einer passenden Gedenkseite verbietet es einen passenden Treffer in der Suche anzuzeigen"
- CTA Section:
    - "Wie möchtest du weitermachen, möchtest du eine Gedenkseite anlegen?"
    - Button: "Gedenkseite anlegen"

---

### 2.6.3 Contact Memorial Admin

**Modal Title:** "Inhaber kontaktieren"
**Subtitle:** "Gibt deine Daten an, damit der Inhaber sieht, wer sich bei ihm meldet."

**Form Fields:**

1. **Name** (Required)
    - Text input
    - Example: "z.B. Jochen Schmidt"
    - Pre-filled if user is logged in
2. **E-Mail** (Required)
    - Email input
    - Example: "z.B. [jochen123@gmail.com](mailto:jochen123@gmail.com)"
    - Pre-filled if user is logged in
3. **Nachricht** (Message)
    - Textarea
    - Placeholder: "Schreibe ein paar Zeilen, damit der Seiteninhaber weiß, was du von ihm willst."
    - Multi-line input
4. **Privacy Consent**
    - Checkbox (Required)
    - Text: "Ich stimme den Datenschutzbestimmungen zu."
    - Link to privacy policy
5. **Submit Button**
    - "Nachricht absenden"
    - Disabled until all required fields filled

**Flow:**

1. User clicks mail icon on private memorial
2. Contact form opens
3. User fills required information
4. Submits request
5. Admin receives notification
6. Admin can approve/deny access

---

### 2.6.4 Technical Implementation

**Search Behavior:**

```tsx
interface SearchConfig {
  minCharacters: 3;          // Minimum chars to trigger search
  debounceDelay: 300;        // Milliseconds delay
  maxResults: 10;            // Results per page
  searchFields: ['name', 'birthName', 'nickname'];
}

interface SearchResult {
  id: string;
  name: string;
  profileImage?: string;
  isPrivate: boolean;
  birthDate?: string;        // For disambiguation
  deathDate?: string;
  location?: string;
}

```

**API Endpoints:**

```tsx
// Search memorials
GET /api/memorials/search?q={searchTerm}
Response: {
  results: SearchResult[],
  total: number,
  suggestions: SearchResult[]  // "Weitere ähnliche Treffer"
}

// Contact private memorial admin
POST /api/memorials/:id/contact
Body: {
  name: string,
  email: string,
  message: string
}
Response: {
  success: boolean,
  message: string
}

```

**Privacy Logic:**

```tsx
// Search visibility rules
if (memorial.privacy === 'public') {
  return {
    ...fullMemorialData,
    actionType: 'visit',
    actionIcon: 'arrow-right'
  };
} else if (memorial.privacy === 'private') {
  return {
    id: memorial.id,
    name: memorial.name,
    isPrivate: true,
    actionType: 'contact',
    actionIcon: 'mail'
  };
}

```

**Database Indexes:**

```sql
-- Optimize search performance
CREATE INDEX idx_memorial_search ON memorials
  USING gin(to_tsvector('german', name || ' ' || COALESCE(birth_name, '')));

CREATE INDEX idx_memorial_privacy ON memorials(privacy_level);
CREATE INDEX idx_memorial_active ON memorials(is_active);

```

---

### 2.6.5 UX Considerations

**Search Experience:**

- **Instant feedback**: Results appear as user types
- **Clear states**: Loading, results, no results
- **Privacy respect**: Private memorials show limited info
- **Smart matching**: Handles typos and variations
- **Voice input**: Accessibility feature

**Performance:**

- Debounced search to reduce server load
- Cached results for repeated searches
- Optimized queries with proper indexing
- Lazy loading for profile images

**Accessibility:**

- Keyboard navigation support
- Screen reader friendly
- Clear focus indicators
- Voice input option
- High contrast for badges

**Mobile Optimization:**

- Full-screen modal on mobile
- Large touch targets
- Optimized keyboard behavior
- Smooth scrolling results

## 2.7 User Account Management - Documentation Updates for V1

### 1. Profile Picture Management ✓

- **Implementation**: Hover over profile image to activate change function
- **Interaction**: Upload new photo on hover state
- **Constraints**: Max 2MB, JPG/PNG/WebP

### 2. Language Settings

- **V1 Update**: German only
- **Future**: Multi-language support (German/English) planned for later versions
- **Remove from V1**: Language toggle in settings

### 3. Theme Preferences ✓

- **Headline**: "Darstellung"
- **Subheadline**: "Dark Mode"
- **Description**: "Die Darstellung wird anhand der Browser-Einstellung gewählt. Die Standard-Einstellung ist Light Mode. Du kannst die Einstellung hier nach belieben anpassen."
- **Options**: Toggle between Light/Dark mode
- **Default**: Follows browser preference

### 4. Authentication Clarification

- **Primary Method**: Magic link (passwordless email authentication)
- **Password Field Purpose**:
    - Optional security enhancement after initial magic link signup
    - Users can add password for traditional login alongside magic link
    - "Wähle ein sicheres Passwort um dich einzuloggen"
- **Both methods available**: Email magic link OR email + password

### 5. Memorial Management ✓

- **Location**: Dashboard only (not in account settings)
- **Features accessible from dashboard**:
    - List of created memorial pages
    - Memorial page settings
    - Privacy controls (public/private toggle)
    - Invitation management per memorial
    - Quick access to edit each memorial

### 6. Account Status Display ✓

- Shows "Kostenfreier Account" or "Premium Account"
- Visible in dashboard header

### 7. Notification Settings - V1 Update

- **Email Frequency**: Immediate only in V1
- **Future versions**: Add daily/weekly digest options
- **Current toggles**:
    - Aktivitäten auf deinen Gedenkseiten (immediate)
    - Freigaben (immediate)
    - Erinnerungen (immediate)
    - Neue Funktionen (immediate)

### 8. Privacy Controls ✓

- **Location**: Within individual memorial page settings (accessed from dashboard)
- **Not in**: General account settings

### 9. Invitation Management ✓

- **Location**: Within individual memorial page settings (accessed from dashboard)
- **Features**:
    - Send invitations
    - View pending invitations
    - Manage invitation list

### 10. Security Features

- **Not planned for V1**
- **Future consideration**: Login history, active sessions, 2FA

**Database Schema Updates for V1**

```tsx
// User notification preferences - V1 simplified
interface UserNotificationPreferences {
  memorialActivity: boolean;      // Aktivitäten auf deinen Gedenkseiten
  moderationRequired: boolean;    // Freigaben
  reminders: boolean;            // Erinnerungen
  newFeatures: boolean;          // Neue Funktionen
  // Remove emailFrequency for V1 - all immediate
}

// User preferences
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'; // Theme preference
  language: 'de';                     // German only in V1
  notifications: UserNotificationPreferences;
}

```

**API Endpoints Affected**

```tsx
// Update user theme preference
PUT /api/user/preferences/theme
Body: { theme: 'light' | 'dark' | 'system' }

// Update notification settings (immediate only in V1)
PUT /api/user/preferences/notifications
Body: {
  memorialActivity: boolean,
  moderationRequired: boolean,
  reminders: boolean,
  newFeatures: boolean
}

```

# 3. Database Schema

[Database schemas and technical implementation details continue…]

# 4. Security Considerations

[Security details…]

# 5. Performance Requirements

[Performance specifications…]

# 6. Third-Party Integrations

[Integration details…]

# 7. Development Phases

[Phase breakdown…]

# 8. Testing Requirements

[Testing specifications…]
