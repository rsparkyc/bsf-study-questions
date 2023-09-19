export interface ConfigurationResponse {
  b2cConfiguration: {
    b2cPolicies: {
      clientId: string;
    };
  };
  apis: any;  // Again, use a more specific type if possible
  apiConfig: {
    scopes: string[];
  };
}
