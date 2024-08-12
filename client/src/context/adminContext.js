import { createContext, useEffect, useState } from "react";

export const AdminContext = createContext();

const AdminProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.isAdmin) {
            setIsAdmin(true);
        }
    }, []);

    return (
        <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminProvider;
