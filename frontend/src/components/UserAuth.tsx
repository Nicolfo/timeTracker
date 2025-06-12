import {useState, useEffect} from 'react';
import {Button, Alert, Spinner, NavbarBrand, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {userApi} from '../api';
import {IoMdNotificationsOff} from "react-icons/io";
import {requestFirebaseNotificationPermission} from "../utils/firebaseMessaging.ts";

export function UserAuth() {
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState(typeof Notification !== "undefined" && "permission" in Notification?Notification.permission:"unsupported");

    if (permission === "granted" && username && username !== 'anonymous')
        requestFirebaseNotificationPermission().then(r => "Permission granted: " + r).catch(e => "Permission denied: " + e);
    // Fetch the currently logged in user
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const user = await userApi.getLoggedInUser();
                setUsername(user.username);
            } catch (err) {
                setError('Failed to fetch user');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

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

    if (loading) {
        return <Spinner animation="border" size="sm"/>;
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
