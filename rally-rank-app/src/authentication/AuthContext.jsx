import { createContext, useState, useEffect, useContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook for easy access to AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // For player/user
    const [admin, setAdmin] = useState(null); // For admin

    useEffect(() => {
        // Check for stored user in localStorage
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        if (storedUser) {
            setUser(storedUser);
        }

        // Check for stored admin in localStorage
        const storedAdmin = JSON.parse(localStorage.getItem('adminData'));
        if (storedAdmin) {
            setAdmin(storedAdmin);
        }
    }, []);

    // Login as user
    const loginUser = (userData) => {
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
    };
    
    // Login as admin
    const loginAdmin = (adminData) => {
        setAdmin(adminData);
        localStorage.setItem('adminData', JSON.stringify(adminData));
    };

    // Logout user
    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('userData');
    };

    // Logout admin
    const logoutAdmin = () => {
        setAdmin(null);
        localStorage.removeItem('adminData');
    };

    // TESTING CODE REMOVE LATER
    const manualLoginUser = () => {
        const testUser = { name: "Test User", role: "user" };
        loginUser(testUser);
    };
    
    const manualLoginAdmin = () => {
        const testAdmin = { name: "Test Admin", role: "admin" };
        loginAdmin(testAdmin);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                admin,
                loginUser,
                loginAdmin,
                logoutUser,
                logoutAdmin,
                isUserLoggedIn: !!user,
                isAdminLoggedIn: !!admin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};