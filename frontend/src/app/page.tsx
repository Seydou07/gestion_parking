import { redirect } from 'next/navigation';

export default function RootPage() {
    // Redirige automatiquement l'utilisateur vers le dashboard ou la page de connexion
    redirect('/dashboard');
}
