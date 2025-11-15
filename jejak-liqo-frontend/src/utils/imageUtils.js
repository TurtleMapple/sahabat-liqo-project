// Utility functions for handling profile images

const BASE_URL = 'http://localhost:8000';

export const getProfileImageUrl = (profilePicture) => {
  if (!profilePicture) return null;
  return `${BASE_URL}/storage/${profilePicture}`;
};

export const getInitials = (fullName, email) => {
  if (fullName) {
    return fullName.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return 'A';
};