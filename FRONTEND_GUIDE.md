# 🎨 RSML Annotation Frontend - User Guide

## Overview

The RSML Annotation frontend is a React-based interface that allows administrators and approved users to annotate voice transcripts using Rich Speech Markup Language (RSML).

## Access Control

### Who Can Access?

1. **Administrators** - Automatically have full access
2. **Approved Users** - Users who have been approved by an administrator

### How to Get Access as a User

1. Register at `/register`
2. Wait for admin approval
3. Login at `/login` after approval
4. Navigate to annotation tool from your dashboard

## Features

### 🎯 Main Interface

- **Batch & File Selection** - Navigate through different batches and files
- **Segment Cards** - Each audio segment displayed in individual cards
- **Live RSML Preview** - See rendered output as you type
- **Audio Playback** - Integrated audio player for each segment
- **Navigation Controls** - Previous/Next buttons to move between files
- **Auto-save** - Save all RSML annotations at once

### 🎨 RSML Syntax Highlighting

The preview panel color-codes different RSML tags:

- 🟡 **Yellow** - Noise/Disfluency tags (`@noise`, `@cough`)
- 🔵 **Blue** - Entity tags (`#PER`, `#ORG`, `#GPE`)
- 🟢 **Green** - Code-mixing (`[word](translation)`)
- 🔴 **Red** - Mispronunciation (`<wrong>(correct)`)

### ⌨️ Keyboard Shortcuts Modal

Click the "Shortcuts" button to view:
- All available RSML tags
- Syntax examples
- Quick reference guide

## Pages & Routes

### `/login` - Login Page
- Public access
- Email and password authentication
- Redirects to appropriate dashboard after login

### `/register` - Registration Page
- Public access
- Create new user account
- Requires admin approval before access

### `/dashboard` - User Dashboard
- Protected route (requires login)
- Shows user profile information
- "Start Annotating" button (only visible if approved)
- Account status indicator

### `/admin/dashboard` - Admin Dashboard
- Admin-only route
- User management interface
- Approve/reject/delete users
- Filter users by status (all/pending/approved)
- "RSML Annotator" button for quick access

### `/annotate` - RSML Annotation Interface
- Protected route (requires login + approval)
- Main annotation tool
- Batch and file navigation
- RSML editing with live preview
- Audio playback integration

## Components Structure

### `<App />` - Main Application
- Handles routing
- Wraps everything in `AuthProvider`

### `<AuthProvider />` - Authentication Context
- Manages user state
- Provides auth methods (login, logout, isAdmin)
- Handles token persistence

### `<PrivateRoute />` - Route Protection
- Checks authentication status
- Enforces role requirements
- Handles approval checks

### `<RSMLAnnotation />` - Main Annotation Interface
Components:
- Header with shortcuts and save button
- Main content area with segment cards
- Footer with navigation and selectors
- Modal for shortcuts guide
- Toast notifications

### `<SegmentCard />` - Individual Segment
Features:
- Segment number badge
- Normalized transcript display
- RSML textarea editor
- Live preview panel
- Audio player

## State Management

### Global State (AuthContext)
```javascript
{
  user: {
    _id: string,
    name: string,
    email: string,
    role: 'admin' | 'user',
    isApproved: boolean
  },
  loading: boolean,
  login: (userData) => void,
  logout: () => void,
  isAdmin: () => boolean,
  isAuthenticated: () => boolean
}
```

### Local State (RSMLAnnotation)
```javascript
{
  batches: number[],
  files: number[],
  segments: Segment[],
  currentBatchIndex: number,
  currentFileIndex: number,
  loading: boolean,
  error: string
}
```

## API Integration

### Authentication Headers
All API calls include JWT token:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### API Endpoints Used

#### Get Batches
```
GET /api/batches
Response: { max_batch: number }
```

#### Get Files
```
GET /api/batch/:id/files
Response: { max_file: number }
```

#### Get Segments
```
GET /api/batch/:id/file/:num
Response: Segment[]
```

#### Save RSML
```
POST /api/batch/:id/file/:num/save
Body: [{ segment: number, rsml: string }]
Response: { message: string, segments_updated: number }
```

## Styling

### Color Scheme
- Primary: `#007bff` (Blue)
- Secondary: `#6c757d` (Gray)
- Success: `#28a745` (Green)
- Danger: `#dc3545` (Red)
- Background: `#fafafa` (Light Gray)

### Responsive Design
- Desktop: Full grid layout
- Tablet: 2-column grid
- Mobile: Single column, stacked layout

### Key CSS Classes
- `.rsml-container` - Main container
- `.segment-card` - Individual segment
- `.tag-*` - RSML tag styling
- `.modal-overlay` - Shortcuts modal
- `.toast` - Notification messages

## User Workflows

### Admin Workflow
1. Login → Admin Dashboard
2. Review pending users
3. Approve/reject users
4. Click "RSML Annotator"
5. Select batch and file
6. Annotate segments
7. Save changes

### User Workflow
1. Register account
2. Wait for approval notification
3. Login → User Dashboard
4. Check approval status
5. Click "Start Annotating"
6. Select batch and file
7. Annotate segments
8. Save changes

## Error Handling

### Authentication Errors
- Invalid credentials → Error message
- Token expired → Redirect to login
- Insufficient permissions → Access denied page

### API Errors
- Network error → Toast notification
- Server error → Error alert
- Not found → Empty state message

### Loading States
- Full-page spinner for initial load
- Button disable during actions
- Skeleton screens for segments

## Local Storage

### Stored Items
- `token` - JWT authentication token
- `user` - User object (JSON string)

### Token Persistence
- Tokens persist across page reloads
- Automatically validated on app mount
- Cleared on logout or expiration

## Performance Optimizations

- Lazy loading for segment cards
- Audio preload="metadata" for faster loading
- Debounced RSML preview rendering
- Memoized segment components
- Compressed API responses

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES6+ JavaScript
- Local Storage
- Fetch API
- Audio element support

## Development

### Environment Variables
```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
```

### Running Development Server
```bash
cd client
npm start
```

### Building for Production
```bash
cd client
npm run build
```

### Proxy Configuration
```json
"proxy": "http://localhost:3000"
```

## Troubleshooting

### "Access Pending" Message
- **Cause**: User account not approved
- **Solution**: Contact administrator for approval

### Audio Not Playing
- **Cause**: Audio file missing or incorrect path
- **Solution**: Verify audio files in `/data/audio/`

### RSML Not Saving
- **Cause**: Network error or invalid token
- **Solution**: Check console for errors, re-login if needed

### Segments Not Loading
- **Cause**: Invalid batch/file selection
- **Solution**: Verify data exists in database

### Login Redirect Loop
- **Cause**: Token expired or invalid
- **Solution**: Clear localStorage and login again

## Best Practices

### For Users
1. Save your work frequently
2. Review RSML syntax before annotating
3. Listen to audio before editing
4. Use keyboard shortcuts for efficiency
5. Check preview panel for errors

### For Admins
1. Review user requests promptly
2. Test annotation tool regularly
3. Monitor user activity
4. Backup database regularly
5. Update documentation as needed

## Security Notes

- JWT tokens expire after 30 days (configurable)
- Passwords are never stored in localStorage
- API routes are protected with middleware
- CORS is configured for security
- XSS protection with React's default sanitization

## Future Enhancements

- [ ] Bulk edit multiple segments
- [ ] Export annotations to CSV
- [ ] Annotation history/versioning
- [ ] Collaborative annotation
- [ ] Keyboard navigation between segments
- [ ] Auto-save drafts
- [ ] Annotation statistics dashboard
- [ ] Search and filter segments

---

For technical documentation, see [AUTH_README.md](AUTH_README.md)
