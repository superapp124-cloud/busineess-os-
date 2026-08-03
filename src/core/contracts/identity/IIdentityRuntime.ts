import { IRuntime } from '../common/Lifecycle';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  roles: string[];
}

/**
 * Interface that specific identity providers (e.g., Better Auth, Keycloak, Auth0) must implement.
 */
export interface IIdentityProvider {
  providerId: string;
  login(): Promise<UserProfile>;
  logout(): Promise<void>;
  verify(): Promise<UserProfile | null>;
  refresh(): Promise<void>;
}

/**
 * The Identity Runtime manages the user's primary identity and session within CHATR.
 */
export interface IIdentityRuntime extends IRuntime {
  /**
   * The currently authenticated user, or null if logged out.
   */
  readonly currentUser: UserProfile | null;

  /**
   * Logs the user in using the default or specified provider.
   */
  login(providerId?: string): Promise<UserProfile>;

  /**
   * Logs the user out.
   */
  logout(): Promise<void>;

  /**
   * Verifies the current session, restoring the user if a valid session exists.
   */
  verify(): Promise<UserProfile | null>;

  /**
   * Registers a new Identity Provider with the runtime.
   */
  registerProvider(provider: IIdentityProvider): void;
}
