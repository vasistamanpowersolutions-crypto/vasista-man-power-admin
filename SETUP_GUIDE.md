# Add Candidate Feature - Setup Guide

## Overview
The Add Candidate feature allows users to create new candidate profiles with comprehensive information including personal details, professional background, identity documents (Aadhar & PAN), and emergency contact information.

## Features
✅ Candidate profile photo upload
✅ Personal information (name, mobile, DOB, city, state)
✅ Professional details (qualification, experience, skills)
✅ Aadhar card information with front and back photos
✅ PAN card information with document image
✅ Emergency contact details
✅ Image uploads to ImageKit
✅ Form validation

## Required Backend API Endpoints

### 1. Create Candidate
**Endpoint:** `POST /api/candidates`

**Headers:**
```
x-admin-secret: your-admin-secret-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "mobileNumber": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "city": "string",
  "state": "string",
  "qualification": "string",
  "experience": "string",
  "skills": "string",
  "aadharNumber": "string (12 digits)",
  "aadharFront": "string (image URL)",
  "aadharBack": "string (image URL)",
  "panNumber": "string",
  "panCard": "string (image URL)",
  "profilePhoto": "string (image URL)",
  "emergencyContactName": "string",
  "emergencyContactRelation": "string",
  "emergencyContactMobile": "string"
}
```

**Response:**
```json
{
  "id": "CAN-xxxxx",
  "firstName": "string",
  "lastName": "string",
  ...
  "createdAt": "ISO-8601-date",
  "message": "Candidate created successfully"
}
```

**Status Codes:**
- 201: Candidate created successfully
- 400: Bad request / validation error
- 401: Unauthorized
- 500: Server error

---

### 2. Image Upload to Server
**Endpoint:** `POST /api/upload-image`

**Headers:**
```
x-admin-secret: your-admin-secret-key
Content-Type: multipart/form-data
```

**Request Fields:**
```
- file: File (image file)
- fieldName: string (profilePhoto | aadharFront | aadharBack | panCard)
```

**Response:**
```json
{
  "url": "string (ImageKit URL or server storage URL)",
  "fileName": "string",
  "fileId": "string (optional)",
  "message": "File uploaded successfully"
}
```

**Status Codes:**
- 200: Upload successful
- 400: Bad request / invalid file
- 401: Unauthorized
- 413: File too large
- 500: Server error

---

### 3. Get All Candidates (Already Implemented)
**Endpoint:** `GET /api/candidates`

**Headers:**
```
x-admin-secret: your-admin-secret-key
```

---

## ImageKit Setup

### Option 1: Server-Side Authentication (Recommended)

1. **Create ImageKit Account**
   - Go to https://imagekit.io
   - Sign up and create a project
   - Get your credentials from the dashboard

2. **Update .env file**
   ```
   VITE_IMAGEKIT_PUBLIC_KEY=your_public_key
   VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/youraccount
   VITE_IMAGEKIT_AUTH_ENDPOINT=http://localhost:3000/api/imagekit-auth
   ```

3. **Backend Endpoint: ImageKit Auth**
   **Endpoint:** `GET /api/imagekit-auth`
   
   **Response:**
   ```json
   {
     "signature": "string",
     "expire": number (timestamp),
     "token": "string",
     "publicKey": "string"
   }
   ```
   
   **Backend Implementation (Node.js example):**
   ```javascript
   const crypto = require('crypto');
   const ImageKit = require('imagekit');

   const imagekit = new ImageKit({
     privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
     publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
     urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
   });

   app.get('/api/imagekit-auth', (req, res) => {
     const result = imagekit.getAuthenticationParameters();
     res.json(result);
   });
   ```

### Option 2: Direct Upload (Development Only)

Use the `uploadImageDirect` function from `src/services/imageUpload.js` (less secure, includes public key in request).

---

## Frontend Setup

### 1. Update .env
Create or update `.env` file with:
```
VITE_API_URL=http://localhost:3000/api
VITE_ADMIN_SECRET_KEY=your-admin-secret-key
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/youraccount
VITE_IMAGEKIT_AUTH_ENDPOINT=http://localhost:3000/api/imagekit-auth
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

---

## File Structure

```
src/
├── pages/
│   ├── AddCandidate.jsx      (Add Candidate Page)
│   ├── AddCandidate.css      (Styling)
│   └── Candidates.jsx        (Updated with navigation)
├── services/
│   ├── api.js                (API client)
│   └── imageUpload.js        (ImageKit upload functions)
└── App.jsx                   (Updated with route)
```

---

## Usage Flow

1. **Navigate to Candidates Page** → Click "Add Candidate" button
2. **Fill Personal Information** → Name, mobile, DOB, city, state
3. **Upload Profile Photo** → Click upload button to send to ImageKit
4. **Fill Professional Details** → Qualification, experience, skills
5. **Upload Aadhar Documents** → Front and back side photos
6. **Upload PAN Card** → PAN number and card image
7. **Add Emergency Contact** → Contact details
8. **Submit Form** → All data saved to database with image URLs
9. **Redirect to Candidates List** → New candidate appears in the list

---

## Form Validation

- **First Name**: Required, text only
- **Last Name**: Required, text only
- **Mobile Number**: Required, 10 digits
- **Date of Birth**: Required, date format (YYYY-MM-DD)
- **City**: Required, text
- **State**: Required, text
- **Aadhar Number**: Required, 12 digits only
- **PAN Number**: Required, format: 5 uppercase letters + 4 digits + 1 uppercase letter
- **Emergency Contact Mobile**: Required, 10 digits

---

## Error Handling

The form includes error handling for:
- Missing required fields
- Invalid phone number format
- Missing image uploads
- Failed API requests
- Network errors

Error messages are displayed in an alert box with automatic dismissal option.

---

## Image Upload Considerations

- **Supported Formats**: JPEG, PNG, WebP, GIF
- **Max File Size**: 10MB (configurable in backend)
- **Recommended Size**: 1-5MB per image
- **Recommended Dimensions**: Profile photo (400x400px), Documents (800x600px)

---

## Database Schema (Candidate Collection)

```javascript
{
  _id: ObjectId,
  id: String,                          // CAN-xxxxx format
  firstName: String,
  lastName: String,
  mobileNumber: String,
  dateOfBirth: Date,
  city: String,
  state: String,
  qualification: String,
  experience: String,
  skills: [String],
  aadharNumber: String,
  aadharFront: String,                 // ImageKit URL
  aadharBack: String,                  // ImageKit URL
  panNumber: String,
  panCard: String,                     // ImageKit URL
  profilePhoto: String,                // ImageKit URL
  emergencyContactName: String,
  emergencyContactRelation: String,
  emergencyContactMobile: String,
  candidateStatus: String,             // Available | Placed | In Process
  kycStatus: String,                   // Verified | Pending | Rejected
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Images not uploading?
1. Check ImageKit credentials in .env
2. Verify backend auth endpoint is responding
3. Check browser console for errors
4. Ensure backend server is running

### Form not submitting?
1. Check all required fields are filled
2. Verify all images are uploaded
3. Check network tab for API errors
4. Verify admin secret key is correct

### API endpoints returning 404?
1. Ensure backend server is running on port 3000
2. Check API_URL in .env matches your backend
3. Verify endpoint paths match backend implementation

---

## Next Steps

- [ ] Implement backend endpoints for candidate creation
- [ ] Setup ImageKit account and credentials
- [ ] Configure ImageKit auth endpoint in backend
- [ ] Test image uploads
- [ ] Test form submission
- [ ] Add candidate profile view/edit pages
- [ ] Add candidate deletion functionality
- [ ] Add batch candidate import

