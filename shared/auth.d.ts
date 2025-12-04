// auth.d.ts
declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    name: string;
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {};
