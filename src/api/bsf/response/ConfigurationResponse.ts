export interface ConfigurationResponse {
  b2cConfiguration: B2cConfiguration;
  apis: Record<string, string>;
}

interface B2cConfiguration {
  b2cPolicies: B2cPolicies;
  apiConfig: ApiConfig;
  apiConfigs: ApiConfig[];
}

interface B2cPolicies {
  clientId: string;
}

interface ApiConfig {
  uri: string;
  scopes: string[];
}
