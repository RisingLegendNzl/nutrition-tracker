// Storage helper functions for interacting with localStorage.
// All localStorage access should go through this module.

export function getItem(key) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting item from storage', { key, error });
    return null;
  }
}

export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting item in storage', { key, value, error });
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item from storage', { key, error });
  }
}