import {useState, useEffect} from 'react';
import {Button, Alert, Spinner, NavbarBrand, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {userApi} from '../api';
import {IoMdNotificationsOff} from "react-icons/io";
import {requestFirebaseNotificationPermission} from "../utils/firebaseMessaging.ts";
import {useUser} from "../contexts/UserContext";

export function UserAuth() {
    const { username, setUsername, isLoading, setIsLoading } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState(typeof Notification !== "undefined" && "permission" in Notification?Notification.permission:"unsupported");
    //iframe trigger
    const [checkingSession, setCheckingSession] = useState(false);

    console.log("Checking session: ", checkingSession);
    console.log("Loading: ", isLoading);


    if (permission === "granted" && username && username !== 'anonymous')
        requestFirebaseNotificationPermission().then(r => "Permission granted: " + r).catch(e => "Permission denied: " + e);


    const handleNotificationRequest = () => {
        Notification.requestPermission().then((permission) => {
            setPermission(permission);
            console.log('Notification permission status:', permission);
        });
    };

    // Handle login
    const handleLogin = () => {
        window.location.href = '/oauth2/authorization/keycloak-client';
    };

    // Handle logout
    const handleLogout = () => {
        window.location.href = '/logout';
    };

    // Fetch the currently logged in user
    useEffect(() => {
        const fetchUser = async () => {
            setError(null);
            try {
                const user = await userApi.getLoggedInUser();
                setUsername(user.username);
                if(user.username === 'anonymous')
                    setCheckingSession(true);
                else
                    setIsLoading(false);
            } catch (err) {
                setError('Failed to fetch user');
                setIsLoading(false);
                console.error(err);
            }
        };

        fetchUser();
    }, [setIsLoading, setUsername]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log("Message received from parent:", event.data);
            const trustedOrigin = window.location.origin;
            console.log("TrustedOrigin ",trustedOrigin, " event.origin ", event.origin, " condition result: ", trustedOrigin === event.origin);
            if (event.origin !== trustedOrigin) return;
            console.log("Message received from iframe:", event.data);
            if (event.data?.status === "session-found") {
                console.log("Session found");
                userApi.getLoggedInUser().then(
                    user => {
                        setUsername(user.username);
                        setCheckingSession(false);
                        setIsLoading(false);
                    },
                    err => {
                        console.error("Failed to fetch user", err);
                        setCheckingSession(false);
                        setIsLoading(false);
                    }
                );
            } else if (event.data?.status === "session-not-found") {
                //not logged in
                setCheckingSession(false);
                setIsLoading(false);
            }
        };

        if(!checkingSession)
            return;

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [checkingSession, setIsLoading, setUsername]);


    if (isLoading && !checkingSession) {
        return <Spinner animation="border" size="sm"/>;
    }

    if (checkingSession) {
        return <>
            <iframe
                src="/oauth2/authorization/keycloak-client?prompt=none"
                style={{display: 'none'}}
                title="Silent Session Checker"
            />
            <Spinner animation="border" size="sm"/>;
        </>;
    }

    return (
        <div className="d-flex align-items-center">
            {error && <Alert variant="danger" className="mb-0 me-2">{error}</Alert>}

            {username && username !== 'anonymous' ? (
                <div className="d-flex align-items-center">
                    {permission !== 'granted' && permission !== 'unsupported' && (
                        <OverlayTrigger
                            placement="bottom"
                            overlay={
                                <Tooltip>
                                    Enable notifications to receive updates.
                                </Tooltip>
                            }
                        >
                            <Button
                                variant="primary"
                                size="sm"
                                className="me-2 d-flex align-items-center"
                                onClick={handleNotificationRequest}
                            >
                                <IoMdNotificationsOff className="me-1" />
                            </Button>
                        </OverlayTrigger>
                    )}

                    <NavbarBrand className="me-2">{username}</NavbarBrand>
                    <Button variant="danger" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
            ) : (
                <div className="d-flex align-items-center">
                    <span className="me-2"></span>
                    <Button variant="primary" size="sm" onClick={handleLogin}>Login</Button>
                </div>
            )}
        </div>
    );
}
