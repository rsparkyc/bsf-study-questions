//import crypto from 'crypto-browserify';
import CryptoJS from 'crypto-js';
import randomBytes from 'randombytes';
import * as buffer from 'buffer';
const Buffer = buffer.Buffer;


interface Credentials {
  // your credential structure
}

interface AccessToken {
  // your AccessToken structure
}

interface Person {
  // your Person structure
}

export default class AuthContext {
  positionCodeUsed: string;
  credentials: Credentials | null;
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
  person?: Person;
  apiEndpoints?: { [key: string]: string };
  encodedSessionContext?: string;

  constructor(credentials: Credentials | null, positionCodeUsed: string) {
    this.clientRequestId = uuidV4();
    const plainTextState = JSON.stringify({
      id: uuidV4(),
      meta: { interactionType: 'redirect' },
    });
    this.state = Buffer.from(plainTextState).toString('base64');
    this.nonce = uuidV4();
    this.codeVerify = this.randomString(43, 128);
    this.codeChallenge = this.buildCodeChallenge(this.codeVerify);
    this.credentials = credentials;
    this.positionCodeUsed = positionCodeUsed;
  }

  private buildCodeChallenge(codeVerify: string): string {
    const hash = this.hashData(codeVerify);
    return Buffer.from(hash).toString('base64').replace('+', '-').replace('/', '_').replace('=', '');
  }

  private hashData(input: string): string {
    // Create a SHA-256 hash using crypto
    const hash = CryptoJS.SHA256(input);

    // Convert the hash to a hex string
    const hexHash = hash.toString(CryptoJS.enc.Hex);

    return hexHash;
  }

  private randomString(lowerBound: number, higherBound: number): string {
    const valid = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const validCharCount = valid.length;
    const chars = Math.floor(Math.random() * (higherBound - lowerBound + 1)) + lowerBound;
    let randomStringBuilder = '';
    for (let i = 0; i < chars; i++) {
      randomStringBuilder += valid.charAt(Math.floor(Math.random() * validCharCount));
    }
    return randomStringBuilder;
  }

}

function uuidV4(): string {
  return ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: any) =>
      (c ^ (randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  );
}

