import "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
      isTenant?: boolean;
      isHost?: boolean;
    };
  }

  /**
   * Extends the built-in user types
   */
  interface User {
    id: string;
    roles?: string[];
    isTenant?: boolean;
    isHost?: boolean;
    dbUserId?: number;
    dbIdentityId?: number;
    dbRoles?: string[];
    dbIsTenant?: boolean;
    dbIsHost?: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT types
   */
  interface JWT {
    id: string | number;
    identityId?: number;
    roles?: string[];
    isTenant?: boolean;
    isHost?: boolean;
    accessToken?: string;
  }
}
