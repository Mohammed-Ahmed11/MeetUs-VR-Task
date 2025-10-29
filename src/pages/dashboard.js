import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
    const router = useRouter();
    const { user, token, logout, checkAuth } = useAuthStore();

    useEffect(() => {
        if (!token) checkAuth();
    }, []);

    useEffect(() => {
        if (!token) router.push("/");
    }, [token]);

    return (
        <div
        style={{
            textAlign: "center",
            padding: "50px",
            background: "#f5f5f5",
            minHeight: "100vh",
        }}
        >
        <h1>Dashboard</h1>
        {user ? (
            <>
            <p>ID: {user.id}</p>
            <p>Name: {user.name}</p>
            </>
        ) : (
            <p>Loading user info...</p>
        )}
        <button
            onClick={() => {
            logout();
            router.push("/");
            }}
            style={{
            marginTop: 20,
            background: "#9414ff",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            }}
        >
            Logout
        </button>
        </div>
    );
}
