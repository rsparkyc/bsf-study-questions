import { ConfigurationResponse } from '../../response/ConfigurationResponse';
import AuthContext from '../../AuthContext';
import { BsfProxiedRequest } from './BsfProxiedRequest';

export class ConfigurationRequest extends BsfProxiedRequest<ConfigurationResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected processResponse(response: any): void {
    this.authContext.clientId = response.data.b2cConfiguration.b2cPolicies.clientId;
    this.authContext.scope = response.data.b2cConfiguration.apiConfig.scopes[0];
    this.authContext.apiEndpoints = response.data.apis;
  }

  protected generateUrl(): string {
    return "https://www.mybsf.org/assets/config/configuration.json";
  }
}
