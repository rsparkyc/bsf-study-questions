// QR login proof of concept. The screen makes a P-256 key pair and shows its
// public key in a QR code. The phone logs in, encrypts the token to that key,
// and drops it in a one-time relay that can't read it.

import { AccessToken } from "./AuthContext";

export const RELAY_URL = "https://wqnidzxguooynstqigzssbjfpe0qalks.lambda-url.us-east-1.on.aws/";

const EC = { name: "ECDH", namedCurve: "P-256" };

const b64 = (b: ArrayBuffer | Uint8Array) =>
    btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(b as ArrayBuffer))))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const unb64 = (s: string) =>
    Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

const deriveKey = (priv: CryptoKey, pub: CryptoKey) =>
    crypto.subtle.deriveKey(
        { name: "ECDH", public: pub }, priv,
        { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
    );

const importPub = (raw: Uint8Array) => crypto.subtle.importKey("raw", raw, EC, false, []);

export interface QrSession {
    id: string;
    privateKey: CryptoKey;
    url: string;
}

export async function createSession(): Promise<QrSession> {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, "0")).join("");
    const pair = await crypto.subtle.generateKey(EC, false, ["deriveKey"]);
    const pub = await crypto.subtle.exportKey("raw", pair.publicKey);
    const url = `${window.location.origin}/?qrlogin=approve#${id}.${b64(pub)}`;
    return { id, privateKey: pair.privateKey, url };
}

export function parseFragment(hash: string): { id: string; pub: string } | null {
    const m = hash.match(/^#([0-9a-f]{32})\.([\w-]+)$/);
    return m ? { id: m[1], pub: m[2] } : null;
}

export async function sendToken(id: string, pub: string, token: AccessToken) {
    const eph = await crypto.subtle.generateKey(EC, false, ["deriveKey"]);
    const key = await deriveKey(eph.privateKey, await importPub(unb64(pub)));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(token))
    );
    const epk = await crypto.subtle.exportKey("raw", eph.publicKey);
    const res = await fetch(`${RELAY_URL}s/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ epk: b64(epk), iv: b64(iv), ct: b64(ct) }),
    });
    if (!res.ok) throw new Error(res.status === 409 ? "This QR code was already used" : `Relay error ${res.status}`);
}

// Resolves undefined until the phone has delivered the token.
export async function pollToken(session: QrSession): Promise<AccessToken | undefined> {
    const res = await fetch(`${RELAY_URL}s/${session.id}`);
    if (res.status === 204) return undefined;
    if (!res.ok) throw new Error(`Relay error ${res.status}`);
    const { epk, iv, ct } = JSON.parse((await res.json()).payload);
    const key = await deriveKey(session.privateKey, await importPub(unb64(epk)));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(ct));
    return JSON.parse(new TextDecoder().decode(plain));
}

export function whoIs(token: AccessToken): string {
    const p = token.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const c = JSON.parse(decodeURIComponent(escape(atob(p))));
    return `${c.given_name} ${c.family_name}`;
}
