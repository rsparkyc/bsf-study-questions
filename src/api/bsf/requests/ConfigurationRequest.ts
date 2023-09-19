import axios from 'axios';
import AuthContext from '../AuthContext';
import { ConfigurationResponse } from '../response/ConfigurationResponse';

export default class ConfigurationRequest {
  private authContext: AuthContext;

  constructor(authContext: AuthContext) {
    this.authContext = authContext;
  }

  async makeRequest(): Promise<void> {
    try {
      const response = await axios.get<ConfigurationResponse>('https://www.mybsf.org/assets/config/configuration.json');
      this.processResponse(response.data);
    } catch (error) {
      console.error('Error making request:', error);
    }
  }

  private processResponse(response: ConfigurationResponse): void {
    this.authContext.clientId = response.b2cConfiguration.b2cPolicies.clientId;
    this.authContext.scope = response.b2cConfiguration.apiConfig.scopes[0] ?? '';
    this.authContext.apiEndpoints = response.apis;
  }
}
