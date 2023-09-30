import AuthContext from "../../AuthContext";
import { BsfRequest } from "../BsfRequest";

export abstract class BsfProxiedRequest<T> extends BsfRequest<T> {
  constructor(authContext: AuthContext) {
    super(authContext);
    this.useProxy = true; 
  }
}