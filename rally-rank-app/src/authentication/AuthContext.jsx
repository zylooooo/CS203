import { createContext, useState, useEffect, useContext } from 'react';
import { useFormState } from 'react-hook-form';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook for easy access to AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [currentPath, setCurrentPath] = useState("");

    useEffect(() => {
        // Check for stored user in localStorage
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        const storedAdmin = JSON.parse(localStorage.getItem('adminData'));

        if (storedUser) {
            setIsUserLoggedIn(true);
            setUser(storedUser);
        }

        if (storedAdmin) {
            setIsAdminLoggedIn(true);
            setAdmin(storedAdmin);
        }
    }, []);

    // Login as user
    const loginUser = (userData) => {
        setUser(userData);
        setIsUserLoggedIn(true);
        localStorage.setItem('userData', JSON.stringify(userData));
    };
    
    // Login as admin
    const loginAdmin = (adminData) => {
        setAdmin(adminData);
        setIsAdminLoggedIn(true);
        localStorage.setItem('adminData', JSON.stringify(adminData));
    };

    // Logout user
    const logoutUser = () => {
        setUser(null);
        setIsUserLoggedIn(false);
        localStorage.removeItem('userData');
    };

    // Logout admin
    const logoutAdmin = () => {
        setAdmin(null);
        setIsAdminLoggedIn(false);
        localStorage.removeItem('adminData');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loginUser,
                logoutUser,
                isUserLoggedIn,
                admin,
                loginAdmin,
                logoutAdmin,
                isAdminLoggedIn,
                currentPath,
                setCurrentPath,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};