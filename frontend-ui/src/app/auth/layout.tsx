
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - Admin Panel',
    description: 'Inicia sesión en el panel administrativo',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full">
            {children}
        </div>
    );
}
