// Business operations logic relating to Users, authentication, and roles
export const validateUserRegistration = (email, password) => {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return true;
};
