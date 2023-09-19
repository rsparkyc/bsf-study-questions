export default class AuthContext {
  clientId?: string;
  scope?: string;
  apiEndpoints: any;  // Define a more specific type if you can
  cookies?: string[];
  accessToken?: string;
  encodedSessionContext?: string;
}
