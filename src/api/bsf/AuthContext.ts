//import crypto from 'crypto-browserify';
import CryptoJS from 'crypto-js';
import randomBytes from 'randombytes';
import * as buffer from 'buffer';
const Buffer = buffer.Buffer;

interface Credentials {
  email: string,
  password: string
}

export interface AccessToken {
  access_token: string,
  client_info: string
  expires_in: number,
  expires_on: number,
  not_before: number,
  refresh_token: string
  refresh_token_expires_in: number,
  resource: string,
  scope: string,
  token_type: string
}

export default class AuthContext {

  positionCodeUsed: string;
  credentials: Credentials;
  accessToken?: AccessToken;
  nonce: string;
  clientRequestId: string;
  code?: string;
  cookies?: string[];
  csrf?: string;
  state: string;
  scope?: string;
  codeVerify: string;
  codeChallenge: string;
  clientId?: string;
  apiEndpoints?: { [key: string]: string };
  encodedSessionContext?: string;

  constructor(credentials: Credentials, positionCodeUsed: string) {
    this.clientRequestId = uuidV4();
    const plainTextState = JSON.stringify({
      id: uuidV4(),
      meta: { interactionType: 'redirect' },
    });
    this.state = Buffer.from(plainTextState).toString('base64');
    this.nonce = uuidV4();
    this.codeVerify = randomString(43, 128);
    this.codeChallenge = buildCodeChallenge(this.codeVerify);
    this.credentials = credentials;
    this.positionCodeUsed = positionCodeUsed;
  }

  public rebuildCodeChallenge() {
    this.codeChallenge = buildCodeChallenge(this.codeVerify);
  }

}

function uuidV4(): string {
  return ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: any) =>
      (c ^ (randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  );
}

function buildCodeChallenge(codeVerify: string): string {
  return hashData(codeVerify).replace('+', '-').replace('/', '_').replace('=', '');
}

function hashData(input: string): string {
  // Create a SHA-256 hash using crypto
  const hash = CryptoJS.SHA256(input);
  return hash.toString(CryptoJS.enc.Base64);
}

function randomString(lowerBound: number, higherBound: number): string {
  const valid = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const validCharCount = valid.length;
  const chars = Math.floor(Math.random() * (higherBound - lowerBound + 1)) + lowerBound;
  let randomStringBuilder = '';
  for (let i = 0; i < chars; i++) {
    randomStringBuilder += valid.charAt(Math.floor(Math.random() * validCharCount));
  }
  return randomStringBuilder;
}

export class AuthContextHolder {
  static authContext: AuthContext | null = null;

  static buildAuthContext(email: string, password: string) {
    this.authContext = new AuthContext({ email: email, password: password}, "");
    return this.getAuthContext();

  }

  static getAuthContext() {
    if (this.authContext === null){
      throw new Error("Authcontext not built");
    }
    return this.authContext;
  }
}