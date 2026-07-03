import { createContext, useContext, useState, useEffect }
    from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, restore session from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('ecosphere_token');
        const savedUser  = localStorage.getItem('ecosphere_user');
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('ecosphere_token');
                localStorage.removeItem('ecosphere_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (tokenValue, userData) => {
        setToken(tokenValue);
        setUser(userData);
        localStorage.setItem('ecosphere_token', tokenValue);
        localStorage.setItem('ecosphere_user',
            JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('ecosphere_token');
        localStorage.removeItem('ecosphere_user');
    };

    const isAdmin = () => user?.role === 'ADMIN';
    const isManager = () =>
        user?.role === 'SUSTAINABILITY_MANAGER';
    const isAuditor = () => user?.role === 'AUDITOR';
    const hasRole = (role) => user?.role === role;

    const getOrgId = () => {
        if (!user) return null;
        if (user.role === 'ADMIN') return null;
        return user.organizationId || null;
    };

    const requiresOrgSelection = () =>
        user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{
            user, token, login, logout, loading,
            isAdmin, isManager, isAuditor, hasRole,
            getOrgId, requiresOrgSelection
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error(
        'useAuth must be used inside AuthProvider');
    return ctx;
}

export default AuthContext;
