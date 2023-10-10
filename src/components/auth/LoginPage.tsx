import './LoginPage.css';

import { AccessToken, AuthContextHolder } from '../../api/bsf/AuthContext';
import React, { useEffect, useState } from 'react';

import { AuthorizeRequest } from '../../api/bsf/requests/auth/AuthorizeRequest';
import { ConfigurationRequest } from '../../api/bsf/requests/auth/ConfigurationRequest';
import { ConfirmedRequest } from '../../api/bsf/requests/auth/ConfirmedRequest';
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
    const [tokenExpiry, setTokenExpiry] = useState<number>(0);
    const [accessToken, setAccessToken] = useState<AccessToken | null>(null);

    const [devMode, setDevMode] = useState<boolean>(false);
    const [tokenTimeLeft, setTokenTimeLeft] = useState<number>(accessToken?.expires_in || 0);


    // Check if already logged in
    useEffect(() => {
        const savedToken = localStorage.getItem('accessToken');
        if (savedToken) {
            const parsedToken: AccessToken = JSON.parse(savedToken);
            setAccessToken(parsedToken);
            AuthContextHolder.buildFromToken(parsedToken);
            setIsLoggedIn(true); // Assuming you will also save user's email or name in local storage or can decode it from the token

            // Here, you would also set the user's name/email
            const decodedPayload = decodeJWT(parsedToken.access_token);
            if (decodedPayload) {
                const firstName = decodedPayload.given_name;
                const lastName = decodedPayload.family_name; 

                setUser(`${firstName} ${lastName}`);
            }
        }
    }, []);

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
        // Handle API call to get the token using email and password
        const authContext = AuthContextHolder.buildOrGetAuthContext(email, password);

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
        }
        
        const newToken = authContext.accessToken;
        
        localStorage.setItem('accessToken', JSON.stringify(newToken));
        setIsLoggedIn(true);
        setAccessToken(newToken);
        onLoginStateChange(true);
        // TODO: Handle any errors and set the user's name/email
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        onLoginStateChange(false);
        setIsLoggedIn(false);
        setAccessToken(null);
    };

    // TODO: Add more JSX for input fields, buttons, token expiry monitoring, and the dev mode
    const toggleDevMode = () => {
        setDevMode(!devMode);
    };

    const calculateTokenTimeLeft = () => {
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
    };

    // Effect to update token time left every second
    useEffect(() => {
        const interval = setInterval(calculateTokenTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [accessToken]);

    const doTokenRefresh = async () => {
        if (AuthContextHolder.hasAuthContext()) {
            const authContext = AuthContextHolder.getAuthContext();
            const refreshTokenRequest = new RefreshTokenRequest(authContext);
            await refreshTokenRequest.makeRequest();
            if (authContext.accessToken) {
                localStorage.setItem('accessToken', JSON.stringify(authContext.accessToken));
                setAccessToken(authContext.accessToken);
                onLoginStateChange(true);
            }
        }
    };

    const setLoggedIn = async (accessToken:AccessToken) => {
        localStorage.setItem('accessToken', JSON.stringify(accessToken));
        setAccessToken(accessToken);
        onLoginStateChange(true);
        setIsLoggedIn(true);
    }


    return (
        <div>
            {devMode && (
                <div className="dev-mode-panel">
                    <h3>Dev Mode</h3>
                    <p><strong>Token:</strong> {JSON.stringify(accessToken, null, 2)}</p>
                    <p><strong>Time Left:</strong> {tokenTimeLeft} seconds</p>
                    <button onClick={doTokenRefresh}>Force Token Refresh</button>
                </div>
            )}

            {isLoggedIn ? (
                <div>
                    Logged in as {user}
                    <button onClick={handleLogout}>Logout</button>
                    {/* Add your Dev Mode button here */}
                </div>
            ) : (
                <div>
                    {/* Login form JSX here */}
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                    <button onClick={handleLogin}>Login</button>
                </div>
            )}
            <button onClick={toggleDevMode}>Toggle Dev Mode</button>

        </div>
    );
};

export default LoginPage;
