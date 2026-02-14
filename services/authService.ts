import { UserProfile } from '../types';

interface StoredUser extends UserProfile {
  password?: string;
}

const DB_KEY = 'fraudguard_users_db_v1';
const SESSION_KEY = 'fraudguard_active_session_v1';

// Simple encoding to prevent cleartext password storage in demo
const encode = (str: string) => btoa(str);

export const AuthService = {
  /**
   * Attempts to log in a user with email and password.
   */
  login: (email: string, password: string): UserProfile => {
    const dbJSON = localStorage.getItem(DB_KEY);
    const db: StoredUser[] = dbJSON ? JSON.parse(dbJSON) : [];
    
    // Simple case-insensitive email match
    const user = db.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === encode(password));
    
    if (!user) {
      throw new Error("Invalid email or password. Please try again or register.");
    }

    // Remove password before returning/storing session
    const { password: _, ...profile } = user;
    
    // Save to session storage (persistence)
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    
    return profile;
  },

  /**
   * Registers a new user if email doesn't exist.
   */
  register: (data: any): UserProfile => {
    const dbJSON = localStorage.getItem(DB_KEY);
    const db: StoredUser[] = dbJSON ? JSON.parse(dbJSON) : [];

    if (db.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("User already exists with this email address.");
    }

    const newUser: StoredUser = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      dob: data.dob,
      // ID fields are now optional/removed from mandatory check
      idType: data.idType || '',
      idNumber: data.idNumber || '',
      isVerified: true, // Default to true for simplified flow
      password: encode(data.password)
    };

    // Save to "Database"
    db.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(db));

    // Auto-login after register
    const { password: _, ...profile } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    
    return profile;
  },

  /**
   * Updates the current user's profile.
   */
  updateProfile: (updatedData: Partial<UserProfile>): UserProfile => {
    const sessionUser = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    if (!sessionUser.email) throw new Error("No active session");
    
    const dbJSON = localStorage.getItem(DB_KEY);
    const db: StoredUser[] = dbJSON ? JSON.parse(dbJSON) : [];
    
    const index = db.findIndex(u => u.email.toLowerCase() === sessionUser.email.toLowerCase());
    if (index === -1) throw new Error("User record not found");
    
    // Merge updates
    const updatedUser = { ...db[index], ...updatedData };
    db[index] = updatedUser;
    
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    
    // Update session
    const { password: _, ...safeProfile } = updatedUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeProfile));
    
    return safeProfile;
  },

  /**
   * Resets password for a given email (Forgot Password flow).
   */
  resetPassword: (email: string, newPassword: string): void => {
    const dbJSON = localStorage.getItem(DB_KEY);
    const db: StoredUser[] = dbJSON ? JSON.parse(dbJSON) : [];
    
    const index = db.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (index === -1) {
      throw new Error("No account found with this email address.");
    }

    // Update password
    db[index].password = encode(newPassword);
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  },

  /**
   * Changes password for a logged-in user.
   */
  changePassword: (email: string, oldPassword: string, newPassword: string): void => {
    const dbJSON = localStorage.getItem(DB_KEY);
    const db: StoredUser[] = dbJSON ? JSON.parse(dbJSON) : [];
    
    const index = db.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (index === -1) {
      throw new Error("User record not found.");
    }

    if (db[index].password !== encode(oldPassword)) {
      throw new Error("Incorrect current password.");
    }

    db[index].password = encode(newPassword);
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  },

  /**
   * Clears the active session.
   */
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Checks if there is an active session on load.
   */
  getCurrentUser: (): UserProfile | null => {
    const sessionJSON = localStorage.getItem(SESSION_KEY);
    return sessionJSON ? JSON.parse(sessionJSON) : null;
  }
};