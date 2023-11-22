import "./LoginPage.css";

import { AccessToken, AuthContextHolder } from "../../api/bsf/AuthContext";
import React, { useCallback, useEffect, useState } from "react";

import { AuthorizeRequest } from "../../api/bsf/requests/auth/AuthorizeRequest";
import { ConfigurationRequest } from "../../api/bsf/requests/auth/ConfigurationRequest";
import { ConfirmedRequest } from "../../api/bsf/requests/auth/ConfirmedRequest";
import { PersonRequest } from "../../api/bsf/requests/PersonRequest";
import { RefreshTokenRequest } from "../../api/bsf/requests/auth/RefreshTokenRequest";
import { SelfAssertedRequest } from "../../api/bsf/requests/auth/SelfAssertedRequest";
import SettingsComponent from "../SettingsComponent";
import { TokenRequest } from "../../api/bsf/requests/auth/TokenRequest";

interface LoginPageProps {
    onLoginStateChange: (loggedIn: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginStateChange }) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<string>("");
    const [accessToken, setAccessToken] = useState<AccessToken | null>(null);

    const [devMode, setDevMode] = useState<boolean>(false);
    const [tokenTimeLeft, setTokenTimeLeft] = useState<number>(
        accessToken?.expires_in || 0
    );

    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState<
        boolean | undefined
    >();

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<null | string>(null);

    // Check if already logged in
    const decodeJWT = (
        token: string
    ): { given_name: string; family_name: string } | null => {
        try {
            // Get the payload, which is the second part of the token
            const base64Url = token.split(".")[1];

            // Convert base64Url to base64
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

            // Decode the base64 string
            const jsonPayload = atob(base64);

            // Parse the JSON
            return JSON.parse(jsonPayload);
        } catch (err) {
            console.error("Failed to decode JWT", err);
            return null;
        }
    };

    const handleLogin = async () => {
        if (!disclaimerAccepted) {
            setError(
                "Please read and accept the disclaimer before logging in."
            );
            return;
        }

        setIsLoggingIn(true);
        setError(null);

        // Handle API call to get the token using email and password
        const authContext = AuthContextHolder.buildOrGetAuthContext(
            email,
            password
        );

        try {
            while (!authContext.accessToken) {
                const configRequest = new ConfigurationRequest(authContext);
                await configRequest.makeRequest();

                const authorizeRequest = new AuthorizeRequest(authContext);
                await authorizeRequest.makeRequest();

                const selfAssertedRequest = new SelfAssertedRequest(
                    authContext
                );
                const selfAssertedResponse =
                    await selfAssertedRequest.makeRequest();
                if (selfAssertedResponse.status !== "200") {
                    throw new Error(
                        selfAssertedResponse.message
                            ? selfAssertedResponse.message
                            : "There was an error logging you in"
                    );
                }

                const confirmedRequest = new ConfirmedRequest(authContext);
                await confirmedRequest.makeRequest();

                const tokenRequest = new TokenRequest(authContext);
                await tokenRequest.makeRequest();

                const personRequest = new PersonRequest(authContext);
                await personRequest.makeRequest();
            }

            const newToken = authContext.accessToken;

            setLoggedIn(newToken);
            setIsDisclaimerOpen(false);
        } catch (err: any) {
            console.error("Failed to login:", err);
            setError(
                "Failed to login. Please check your username and password and try again." +
                    (err.message ? " (" + err.message + ")" : "")
            );
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem("accessToken");
        onLoginStateChange(false);
        setIsLoggedIn(false);
        setAccessToken(null);
    }, [onLoginStateChange, setIsLoggedIn, setAccessToken]);

    const toggleDevMode = () => {
        setDevMode(!devMode);
    };

    const setLoggedIn = useCallback(
        async (accessToken: AccessToken) => {
            localStorage.setItem("accessToken", JSON.stringify(accessToken));
            setAccessToken(accessToken);
            onLoginStateChange(true);
            setIsLoggedIn(true);

            // Here, you would also set the user's name/email
            const decodedPayload = decodeJWT(accessToken.access_token);
            if (decodedPayload) {
                const firstName = decodedPayload.given_name;
                const lastName = decodedPayload.family_name;

                setUser(`${firstName} ${lastName}`);
            }
        },
        [onLoginStateChange]
    );

    useEffect(() => {
        const savedToken = localStorage.getItem("accessToken");
        if (savedToken) {
            const parsedToken: AccessToken = JSON.parse(savedToken);
            AuthContextHolder.buildFromToken(parsedToken);
            setLoggedIn(parsedToken);
        }
    }, [setLoggedIn]);

    useEffect(() => {
        // Check local storage for the disclaimer state when the component mounts
        const savedDisclaimerState = localStorage.getItem("disclaimerAccepted");

        if (savedDisclaimerState) {
            setDisclaimerAccepted(JSON.parse(savedDisclaimerState));
        }
    }, []);

    useEffect(() => {
        // Save the disclaimer state to local storage whenever it changes
        if (disclaimerAccepted !== undefined) {
            localStorage.setItem(
                "disclaimerAccepted",
                JSON.stringify(disclaimerAccepted)
            );
        }
    }, [disclaimerAccepted]);

    const doTokenRefresh = useCallback(async () => {
        if (AuthContextHolder.hasAuthContext()) {
            const authContext = AuthContextHolder.getAuthContext();
            const refreshTokenRequest = new RefreshTokenRequest(authContext);
            try {
                await refreshTokenRequest.makeRequest();
                if (authContext.accessToken) {
                    setLoggedIn(authContext.accessToken);
                } else {
                    console.error("No access token after refresh, logging out");
                    handleLogout();
                }
            } catch (err: any) {
                if (err.code !== "ERR_NETWORK") {
                    console.error("Failed to refresh token, logging out", err);
                    handleLogout();
                } else {
                    // we'll just keep trying until we actually do connect to the network,
                    // but we could try to set an "offline" mode here
                }
            }
        }
    }, [setLoggedIn, handleLogout]);

    const calculateTokenTimeLeft = useCallback(() => {
        if (accessToken) {
            const expirationTime = accessToken.expires_on * 1000; // JWT times are in seconds
            const now = new Date().getTime();
            const timeLeft = Math.floor((expirationTime - now) / 1000); // Convert to seconds
            setTokenTimeLeft(timeLeft);

            // do a refresh if there is less than 5 minutes left
            if (timeLeft < 300) {
                doTokenRefresh();
            }
        }
    }, [accessToken, doTokenRefresh]);

    // Effect to update token time left every second
    useEffect(() => {
        const interval = setInterval(calculateTokenTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [accessToken, calculateTokenTimeLeft]);

    return (
        <div className="login-container">
            {isLoggedIn && (
                <div className="login-header">
                    <div>Logged in as {user}</div>
                    <div className="buttons-and-settings-container">
                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                        <button
                            className="toggle-dev-button"
                            onClick={toggleDevMode}
                        >
                            Toggle Dev Mode
                        </button>
                        <SettingsComponent />
                    </div>
                </div>
            )}

            <div className="content-area">
                {devMode && (
                    <div className="dev-mode-panel">
                        <h3>Dev Mode</h3>
                        <p>
                            <strong>Token:</strong>
                        </p>
                        <textarea readOnly>
                            {JSON.stringify(accessToken, null, 2)}
                        </textarea>
                        <p>
                            <strong>Time Left:</strong> {tokenTimeLeft} seconds
                        </p>
                        <button onClick={doTokenRefresh}>
                            Force Token Refresh
                        </button>
                    </div>
                )}

                {!isLoggedIn && (
                    <div className="login-input-container">
                        <input
                            className="login-input"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                        <input
                            className="login-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                        <button
                            disabled={isLoggingIn || !disclaimerAccepted}
                            className="login-button"
                            onClick={handleLogin}
                        >
                            {isLoggingIn
                                ? "Logging in..."
                                : disclaimerAccepted
                                ? "Login"
                                : "Please Read Disclaimer"}
                        </button>
                        <button
                            className="disclaimer-button"
                            onClick={() =>
                                setIsDisclaimerOpen(!isDisclaimerOpen)
                            }
                        >
                            Disclaimer
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div
                className={`disclaimer-drawer ${
                    isDisclaimerOpen ? "open" : ""
                }`}
            >
                <strong>Disclaimer:</strong> This site is an independent
                platform and has no official connection with the{" "}
                <a href="https://www.bsfinternational.org/">
                    Bible Study Fellowship (BSF) organization
                </a>
                . Due to technical constraints, this site employs AWS Lambda as
                a proxy to interact with the BSF API, which necessitates passing
                your login credentials through it. Rest assured, your privacy is
                a top priority—we do not record or retain your username and
                password. Use this site at your own discretion. Should you have
                privacy concerns, you are advised to opt out of using this
                service.
                <br />
                <br />
                <label>
                    <input
                        type="checkbox"
                        checked={disclaimerAccepted}
                        onChange={(e) =>
                            setDisclaimerAccepted(e.target.checked)
                        }
                    />
                    I have read and understand this disclaimer and accept the
                    implications of using this site.
                </label>
            </div>
        </div>
    );
};

export default LoginPage;
