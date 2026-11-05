import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { AccessToken, AuthContextHolder } from "../../api/bsf/AuthContext";
import { AuthorizeRequest } from "../../api/bsf/requests/auth/AuthorizeRequest";
import { ConfigurationRequest } from "../../api/bsf/requests/auth/ConfigurationRequest";
import { ConfirmedRequest } from "../../api/bsf/requests/auth/ConfirmedRequest";
import { SelfAssertedRequest } from "../../api/bsf/requests/auth/SelfAssertedRequest";
import { TokenRequest } from "../../api/bsf/requests/auth/TokenRequest";
import { QrSession, createSession, parseFragment, pollToken, sendToken, whoIs } from "../../api/bsf/qrLogin";

const box: React.CSSProperties = { maxWidth: 360, margin: "40px auto", padding: 16, textAlign: "center" };
const field: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: 10, marginBottom: 10, fontSize: 16 };

const SESSION_MS = 170_000;

// Shown on the big screen: displays the code and waits for the phone.
const QrScreen: React.FC = () => {
    const [session, setSession] = useState<QrSession>();
    const [name, setName] = useState<string>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        createSession().then(setSession).catch((e) => setError(e.message));
    }, []);

    useEffect(() => {
        if (!session) return;
        const started = Date.now();
        const timer = setInterval(async () => {
            if (Date.now() - started > SESSION_MS) {
                clearInterval(timer);
                setSession(undefined);
                setError("Code expired. Reload for a new one.");
                return;
            }
            try {
                const token = await pollToken(session);
                if (token) {
                    clearInterval(timer);
                    setName(whoIs(token)); // proof of concept: token is not kept
                }
            } catch (e: any) {
                clearInterval(timer);
                setError(e.message);
            }
        }, 2000);
        return () => clearInterval(timer);
    }, [session]);

    if (name) return <div style={box}><h2>Signed in as {name}</h2><p>QR login worked. Nothing was saved on this device.</p></div>;
    return (
        <div style={box}>
            <h2>Scan to log in</h2>
            {session && <QRCodeSVG value={session.url} size={260} includeMargin />}
            {error && <p>{error}</p>}
        </div>
    );
};

// Opened on the phone from the QR code.
const QrApprove: React.FC = () => {
    const target = parseFragment(window.location.hash);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string>();

    const saved = localStorage.getItem("accessToken");
    const savedToken: AccessToken | null = saved ? JSON.parse(saved) : null;

    const send = async (getToken: () => Promise<AccessToken>) => {
        setBusy(true);
        setError(undefined);
        try {
            await sendToken(target!.id, target!.pub, await getToken());
            setDone(true);
        } catch (e: any) {
            setError(e.message || "Login failed");
        } finally {
            setBusy(false);
        }
    };

    const logIn = async () => {
        const auth = AuthContextHolder.buildOrGetAuthContext(email, password);
        await new ConfigurationRequest(auth).makeRequest();
        await new AuthorizeRequest(auth).makeRequest();
        const r = await new SelfAssertedRequest(auth).makeRequest();
        if (r.status !== "200") throw new Error(r.message || "Login failed");
        await new ConfirmedRequest(auth).makeRequest();
        await new TokenRequest(auth).makeRequest();
        if (!auth.accessToken) throw new Error("No token returned");
        return auth.accessToken;
    };

    if (!target) return <div style={box}><p>This link is invalid. Scan the code again.</p></div>;
    if (done) return <div style={box}><h2>Done</h2><p>You can go back to the other screen.</p></div>;
    return (
        <div style={box}>
            <h2>Approve login</h2>
            <p>Only continue if you scanned this from your own screen.</p>
            {savedToken ? (
                <button style={field} disabled={busy} onClick={() => send(async () => savedToken)}>
                    Approve as {whoIs(savedToken)}
                </button>
            ) : (
                <>
                    <input style={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input style={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button style={field} disabled={busy} onClick={() => send(logIn)}>
                        {busy ? "Logging in..." : "Log in and approve"}
                    </button>
                    <small>This independent site is not affiliated with BSF. Your login passes through its AWS proxy and is not stored.</small>
                </>
            )}
            {error && <p>{error}</p>}
        </div>
    );
};

const QrLoginPage: React.FC = () =>
    new URLSearchParams(window.location.search).get("qrlogin") === "approve" ? <QrApprove /> : <QrScreen />;

export default QrLoginPage;
