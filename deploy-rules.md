# Firebase Rules Deployment

## Issue Fixed
The "Missing or insufficient permissions" error occurs because Firestore security rules are not properly configured.

## Files Created
- `firestore.rules` - Security rules allowing read/write access for development
- `firebase.json` - Firebase project configuration
- `firestore.indexes.json` - Firestore indexes configuration

## To Deploy Rules

1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase project (if not already done):
   ```bash
   firebase init
   ```

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Important Security Note
The current rules allow full read/write access for development purposes. Before deploying to production, update the rules to implement proper authentication and authorization:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Properties can be read by anyone, but only created/updated by authenticated users
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Add more specific rules as needed
  }
}
```