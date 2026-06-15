import { useState, createContext, useContext } from "react";
import axiosInstance from "./axiosinstance";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);

  const Signup = async ({ name, email, phone, password }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/signup", { name, email, phone, password });
      const { data, token } = res.data;
      const userData = { ...data, token };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Signup Successful");
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed";
      seterror(msg);
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setloading(false);
    }
  };

  // Login: returns { requiresOTP, userId } for Chrome, or sets user directly for other browsers
  const Login = async ({ email, password }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/login", { email, password });

      // Chrome OTP flow
      if (res.data.requiresOTP) {
        return { requiresOTP: true, userId: res.data.userId, message: res.data.message };
      }

      // Direct login
      const { data, token } = res.data;
      const userData = { ...data, token };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Login Successful");
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      seterror(msg);
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setloading(false);
    }
  };

  // Call this after OTP verification to persist the authenticated user
  const setLoggedInUser = (data, token) => {
    const userData = { ...data, token };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, Signup, Login, Logout, setLoggedInUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
