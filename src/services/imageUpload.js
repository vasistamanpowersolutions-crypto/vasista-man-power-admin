// ImageKit configuration
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'your_imagekit_public_key';
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/youraccount';
const IMAGEKIT_AUTH_ENDPOINT = import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT || 'http://localhost:3000/api/imagekit-auth';

// Upload image to ImageKit using server-side authentication
export const uploadImageToImageKit = async (file, fileName) => {
  try {
    // Get authentication parameters from your backend
    const authResponse = await fetch(IMAGEKIT_AUTH_ENDPOINT);
    const authData = await authResponse.json();

    // Create FormData for the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('signature', authData.signature);
    formData.append('expire', authData.expire);
    formData.append('token', authData.token);
    formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);

    // Upload to ImageKit
    const uploadResponse = await fetch(
      'https://upload.imagekit.io/api/v1/files/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to ImageKit');
    }

    const uploadedFile = await uploadResponse.json();
    return {
      url: uploadedFile.url,
      fileId: uploadedFile.fileId,
      name: uploadedFile.name,
    };
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    throw error;
  }
};

// Alternative: Direct upload using API key (less secure, use only for development)
export const uploadImageDirect = async (file, fileName) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);

    const response = await fetch(
      'https://upload.imagekit.io/api/v1/files/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return {
      url: data.url,
      fileId: data.fileId,
      name: data.name,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
