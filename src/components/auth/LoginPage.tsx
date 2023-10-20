import './LoginPage.css';

import { AccessToken, AuthContextHolder } from '../../api/bsf/AuthContext';
import React, { useCallback, useEffect, useState } from 'react';

import { AuthorizeRequest } from '../../api/bsf/requests/auth/AuthorizeRequest';
import { ConfigurationRequest } from '../../api/bsf/requests/auth/ConfigurationRequest';
import { ConfirmedRequest } from '../../api/bsf/requests/auth/ConfirmedRequest';
import { PersonRequest } from '../../api/bsf/requests/PersonRequest';
import { RefreshTokenRequest } from '../../api/bsf/requests/auth/RefreshTokenRequest';
import { SelfAssertedRequest } from '../../api/bsf/requests/auth/SelfAssertedRequest';
import { TokenRequest } from '../../api/bsf/requests/auth/TokenRequest';

interface LoginPageProps {
  onLoginStateChange: (loggedIn: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginStateChange }) => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<string>('');
    const [accessToken, setAccessToken] = useState<AccessToken | null>(null);

    const [devMode, setDevMode] = useState<boolean>(false);
    const [tokenTimeLeft, setTokenTimeLeft] = useState<number>(accessToken?.expires_in || 0);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<null | string>(null);


    // Check if already logged in
    const decodeJWT = (token: string): {given_name: string, family_name: string} | null => {
        try {
            // Get the payload, which is the second part of the token
            const base64Url = token.split('.')[1];
            
            // Convert base64Url to base64
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            
            // Decode the base64 string
            const jsonPayload = atob(base64);
            
            // Parse the JSON
            return JSON.parse(jsonPayload);
        } catch (err) {
            console.error('Failed to decode JWT', err);
            return null;
        }
    };

    const handleLogin = async () => {
        setIsLoggingIn(true);
        setError(null);

        // Handle API call to get the token using email and password
        const authContext = AuthContextHolder.buildOrGetAuthContext(email, password);

        try {
            while (!authContext.accessToken) {
                const configRequest = new ConfigurationRequest(authContext);
                await configRequest.makeRequest();
                
                const authorizeRequest = new AuthorizeRequest(authContext);
                await authorizeRequest.makeRequest();

                const selfAssertedRequest = new SelfAssertedRequest(authContext);
                await selfAssertedRequest.makeRequest();

                const confirmedRequest = new ConfirmedRequest(authContext);
                await confirmedRequest.makeRequest();

                const tokenRequest = new TokenRequest(authContext);
                await tokenRequest.makeRequest();

                const personRequest = new PersonRequest(authContext);
                await personRequest.makeRequest();
            }

            const newToken = authContext.accessToken;
            
            setLoggedIn(newToken);
        }
        catch (err) {
            console.error('Failed to login:', err);
            setError('Failed to login. Please check your username and password and try again.');
        } 
        finally {
            setIsLoggingIn(false);
        }
        
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        onLoginStateChange(false);
        setIsLoggedIn(false);
        setAccessToken(null);
    };

    const toggleDevMode = () => {
        setDevMode(!devMode);
    };

    const setLoggedIn = useCallback(async (accessToken:AccessToken) => {
        localStorage.setItem('accessToken', JSON.stringify(accessToken));
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
    }, [onLoginStateChange]);

    useEffect(() => {
        const savedToken = localStorage.getItem('accessToken');
        if (savedToken) {
            const parsedToken: AccessToken = JSON.parse(savedToken);
            AuthContextHolder.buildFromToken(parsedToken);
            setLoggedIn(parsedToken);

        }
    }, [setLoggedIn]);

    const doTokenRefresh = useCallback(async () => {
        if (AuthContextHolder.hasAuthContext()) {
            const authContext = AuthContextHolder.getAuthContext();
            const refreshTokenRequest = new RefreshTokenRequest(authContext);
            try {
                await refreshTokenRequest.makeRequest();
                if (authContext.accessToken) {
                    setLoggedIn(authContext.accessToken);
                }
                else {
                    console.error('No access token after refresh, logging out');
                    handleLogout();
                }
            }
            catch(err) {
                console.error('Failed to refresh token, logging out', err);
                handleLogout();
            }
        }
    }, [setLoggedIn]);

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
                    <div>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                        <button className="toggle-dev-button" onClick={toggleDevMode}>Toggle Dev Mode</button>
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
                        <p><strong>Time Left:</strong> {tokenTimeLeft} seconds</p>
                        <button onClick={doTokenRefresh}>Force Token Refresh</button>
                    </div>
                )}

                {!isLoggedIn && (
                    <div className="login-input-container">
                        <input className="login-input" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                        <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                        <button disabled={isLoggingIn} className="login-button" onClick={handleLogin}>
                            {isLoggingIn ? 'Logging in...' : 'Login'}
                        </button>
                        <button className="disclaimer-button" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>Disclaimer</button>
                    </div>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className={`disclaimer-drawer ${isDrawerOpen ? 'open' : ''}`}>
                Warning. This site is not official and is not affiliated with the <a href="https://www.bsfinternational.org/">Bible Study Fellowship</a> organization. 
                AWS Lambda is used as a proxy to the BSF API because of CORS issues for many requests, and thus your username and password must be proxied through. 
                Because I take your privacy seriously, I do not log or store your username or password. If you have any conserns, please refain from using this site.
            </div>
        </div>

    );
};

export default LoginPage;
