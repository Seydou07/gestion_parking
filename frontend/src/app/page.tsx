import { redirect } from 'next/navigation';

export default function RootPage() {
    // La redirection est désormais gérée par le middleware (src/middleware.ts)
    // pour garantir une sécurité côté serveur/edge.
    return null;
}
