import { Vehicle, Driver, Mission, Alert, FuelCard, FuelVoucher } from '@/types/api';

export const mockVehicles: Vehicle[] = [
    {
        id: 1,
        immatriculation: "33 LL 1234",
        marque: "Toyota",
        modele: "Hilux",
        annee: 2022,
        kilometrage: 45000,
        statut: "DISPONIBLE",
        typeCarburant: "DIESEL",
        prochainControle: "2024-12-15",
        assuranceExpiration: "2024-06-20",
        budgetAlloue: 2500000,
        budgetConsomme: 1200000,
        couleur: "Blanc",
        capaciteReservoir: 80,
        assuranceCompagnie: "SONAR",
        assuranceNumero: "POL-789-BC",
        transmission: "MANUELLE",
        derniereVidangeKilometrage: 42000,
        frequenceVidange: 5000
    },
    {
        id: 2,
        immatriculation: "11 HJ 4567",
        marque: "Nissan",
        modele: "Navara",
        annee: 2021,
        kilometrage: 88000,
        statut: "EN_MISSION",
        typeCarburant: "DIESEL",
        prochainControle: "2024-03-10",
        assuranceExpiration: "2024-04-15",
        budgetAlloue: 3000000,
        budgetConsomme: 2850000,
        couleur: "Gris",
        capaciteReservoir: 75,
        assuranceCompagnie: "AXA",
        transmission: "MANUELLE",
        derniereVidangeKilometrage: 80000,
        frequenceVidange: 5000
    },
    {
        id: 3,
        immatriculation: "22 KK 7890",
        marque: "Mitsubishi",
        modele: "L200",
        annee: 2023,
        kilometrage: 12500,
        statut: "EN_MAINTENANCE",
        typeCarburant: "DIESEL",
        prochainControle: "2025-01-20",
        assuranceExpiration: "2024-11-30",
        budgetAlloue: 2000000,
        budgetConsomme: 350000,
        couleur: "Noir",
        transmission: "AUTOMATIQUE",
        derniereVidangeKilometrage: 10000,
        frequenceVidange: 5000
    }
];

export const mockFuelCards: FuelCard[] = [
    { id: 1, numero: 'X892-1243-9821', fournisseur: 'TOTAL', description: 'Direction Générale', solde: 1450000, soldeInitial: 1500000, dateExpiration: '2025-12-31', statut: 'ACTIVE' },
    { id: 2, numero: 'B451-8761-0023', fournisseur: 'SHELL', description: 'Pool Véhicules Utilitaires', solde: 50000, soldeInitial: 100000, dateExpiration: '2024-06-30', statut: 'ACTIVE' },
    { id: 3, numero: 'L909-6612-4412', fournisseur: 'ORYX', description: 'Mission Régionale Bobo', solde: 0, soldeInitial: 300000, dateExpiration: '2023-12-31', statut: 'INACTIVE' }
];
export const mockFuelVouchers: FuelVoucher[] = [
    { id: 1, numero: "BON-SONA-8812", valeur: 50000, dateEmission: "2026-03-01", statut: 'UTILISE' },
    { id: 2, numero: "BON-SONA-8813", valeur: 25000, dateEmission: "2026-03-01", statut: 'DISPONIBLE' },
    { id: 3, numero: "BON-SONA-8814", valeur: 100000, dateEmission: "2026-03-05", statut: 'DISPONIBLE' }
];

export const mockMissions: Mission[] = [
    {
        id: 1,
        vehiculeId: 2,
        chauffeurId: 1,
        destination: "Bobo-Dioulasso",
        dateDepart: "2026-03-10",
        dateRetour: "2026-03-25",
        statut: "EN_COURS",
        kmDepart: 88000,
        observationDepart: "Véhicule propre, pleins faits. RAS.",
        typeCarburantDotation: "BON",
        bonCarburantId: 1,
        lettreMission: "lettre-001.pdf",
        vehicule: mockVehicles[1],
        chauffeur: {
            id: 1, nom: "Ouedraogo", prenom: "Lamine", telephone: "+226 70 12 34 56", email: "l@fleet.com", statut: "EN_MISSION", permisNumero: "B-2015", permisExpiration: "2028-05-12"
        }
    },
    {
        id: 2,
        vehiculeId: 1,
        chauffeurId: 2,
        destination: "Koudougou",
        dateDepart: "2026-02-05",
        dateRetour: "2026-02-08",
        statut: "TERMINEE",
        kmDepart: 44500,
        kmRetour: 45000,
        observationDepart: "RAS",
        observationRetour: "Pare-brise légèrement fissuré par un caillou.",
        vehicule: mockVehicles[0],
        chauffeur: {
            id: 2, nom: "Traore", prenom: "Seydou", telephone: "+226 78 90 12 34", email: "s@fleet.com", statut: "DISPONIBLE", permisNumero: "B-2019", permisExpiration: "2024-03-25"
        }
    },
    {
        id: 3,
        vehiculeId: 3,
        chauffeurId: 3,
        destination: "Banfora",
        dateDepart: "2026-04-01",
        dateRetour: "2026-04-10",
        statut: "PLANIFIEE",
        vehicule: mockVehicles[2],
        chauffeur: {
            id: 3, nom: "Kare", prenom: "Salif", telephone: "+226 76 54 32 10", email: "k@fleet.com", statut: "INACTIF", permisNumero: "B-2010", permisExpiration: "2023-12-01"
        }
    }
];

export const mockChauffeurs: Driver[] = [
    {
        id: 1,
        nom: "Ouedraogo",
        prenom: "Lamine",
        telephone: "+226 70 12 34 56",
        email: "l.ouedraogo@fleet.com",
        statut: "EN_MISSION",
        permisNumero: "B-2015-45678",
        permisExpiration: "2028-05-12",
        dateEmbauche: "2018-02-01",
        missions: [mockMissions[0]]
    },
    {
        id: 2,
        nom: "Traore",
        prenom: "Seydou",
        telephone: "+226 78 90 12 34",
        email: "s.traore@fleet.com",
        statut: "DISPONIBLE",
        permisNumero: "B-2019-98765",
        permisExpiration: "2024-03-25", // Proche expiration pour test
        dateEmbauche: "2020-06-15",
        missions: [mockMissions[1]]
    },
    {
        id: 3,
        nom: "Kare",
        prenom: "Salif",
        telephone: "+226 76 54 32 10",
        email: "s.kare@fleet.com",
        statut: "INACTIF",
        permisNumero: "B-2010-11223",
        permisExpiration: "2023-12-01", // Expiré pour test
        dateEmbauche: "2015-09-01",
    }
];
