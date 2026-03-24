"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
        } else {
            // Verificar token contra el servidor
            adminFetch(`${API_BASE}/api/auth/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error("Token inválido");
                    }
                    setAuthorized(true);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                    router.push("/auth/login");
                });
        }
    }, [router]);

    if (!authorized) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
}
