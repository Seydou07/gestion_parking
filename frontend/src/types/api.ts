export type UserRole = 'ADMIN' | 'GESTIONNAIRE' | 'CHAUFFEUR';
export type VehicleStatus = 'DISPONIBLE' | 'EN_MISSION' | 'EN_MAINTENANCE' | 'HORS_SERVICE';
export type DriverStatus = 'DISPONIBLE' | 'EN_MISSION' | 'INACTIF';
export type MissionStatus = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
export type FuelType = 'ESSENCE' | 'DIESEL' | 'ELECTRIQUE' | 'HYBRIDE';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertModule = 'VEHICULE' | 'CHAUFFEUR' | 'MISSION' | 'CARBURANT' | 'MAINTENANCE' | 'BUDGET';
export type AllocationType = 'ANNUEL' | 'SUPPLEMENTAIRE';

export interface User {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: UserRole;
    actif: boolean;
}

export interface Vehicle {
    id: number;
    immatriculation: string;
    marque: string;
    modele: string;
    annee: number;
    kilometrage: number;
    statut: VehicleStatus;
    typeCarburant: FuelType;
    assuranceExpiration: string;
    prochainControle: string;
    budgetAlloue: number;
    budgetConsomme: number;
    // Nouveaux champs demandés
    numeroChassis?: string;
    couleur?: string;
    dateAcquisition?: string;
    prixAcquisition?: number;
    notes?: string;
    assuranceNumero?: string;
    assuranceCompagnie?: string;
    capaciteReservoir?: number;
    transmission: 'MANUELLE' | 'AUTOMATIQUE';
    derniereVidangeKilometrage: number;
    frequenceVidange: number;
}

export interface VehicleFormData {
    immatriculation: string;
    marque: string;
    modele: string;
    annee: number;
    kilometrage: number;
    statut: VehicleStatus;
    prochainControle: string;
    assuranceExpiration: string;
    assuranceNumero?: string;
    assuranceCompagnie?: string;
    typeCarburant: FuelType;
    capaciteReservoir?: number;
    numeroChassis?: string;
    couleur?: string;
    dateAcquisition?: string;
    prixAcquisition?: number;
    notes?: string;
    transmission: 'MANUELLE' | 'AUTOMATIQUE';
    derniereVidangeKilometrage: number;
    frequenceVidange: number;
    budgetInitial?: number;
}

export interface Driver {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    statut: DriverStatus;
    permisNumero: string;
    permisExpiration: string;
    dateEmbauche?: string;
    notes?: string;
    missions?: Mission[];
}

export interface DriverFormData {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    statut: DriverStatus;
    permisNumero: string;
    permisExpiration: string;
    dateEmbauche?: string;
    notes?: string;
}

export interface Mission {
    id: number;
    vehiculeId: number;
    chauffeurId: number;
    destination: string;
    dateDebut: string;
    dateFin: string;
    statut: MissionStatus;
    vehicule?: Vehicle;
    chauffeur?: Driver;
    kilometrageDepart?: number;
    kilometrageRetour?: number;
    observationDepart?: string;
    observationRetour?: string;

    // Nouveaux champs pour dotation carburant et fichiers
    lettreMissionUrl?: string;
    typeCarburantDotation?: 'CARTE' | 'BON' | 'AUCUNE';
    carteCarburantId?: number;
    bonCarburantId?: number; // Reférence au bon d'essence physiquement attribué
    montantCarburantUtilise?: number; // Montant réel utilisé au retour
    ticketCarburantUrl?: string; // Upload du ticket de caisse
}

export type FuelCardStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIREE';
export type FuelVoucherStatus = 'DISPONIBLE' | 'UTILISE' | 'EXPIRE';

export interface FuelCard {
    id: number;
    numero: string;
    solde: number;
    soldeInitial: number;
    plafond?: number;
    dateExpiration: string;
    statut: FuelCardStatus;
    fournisseur?: string;
    notes?: string;
}

export interface FuelVoucher {
    id: number;
    numero: string;
    valeur: number; // Matches Prisma 'valeur'
    dateEmission: string;
    dateExpiration?: string;
    statut: FuelVoucherStatus;
    vehiculeId?: number;
    notes?: string;
}

export interface Alert {
    id: number;
    type: string;
    message: string;
    module: AlertModule;
    severity: AlertSeverity;
    lue: boolean;
    dateCreation: string;
    vehicule?: Vehicle;
}

export interface DashboardStats {
    vehicles: { total: number; available: number; inMission: number; inMaintenance: number };
    drivers: { total: number; available: number; inMission: number; inactive: number };
    missions: { active: number };
    expenses: { total30d: number; fuel30d: number; maintenance30d: number };
}

// --- Budget Types ---

export interface BudgetAllocation {
    id: number;
    vehiculeId: number;
    montant: number;
    annee: number;
    dateAllocation: string;
    commentaire?: string;
    type: AllocationType;
}

export interface VehicleBudget {
    totalAllocated: number;
    totalSpent: number;
    allocations: BudgetAllocation[];
}

export interface GlobalBudgetActivity {
    id: number;
    field: 'MAINTENANCE' | 'FUEL_CARD' | 'FUEL_BON';
    amount: number;
    type: string;
    date: string;
    description?: string;
}

export interface SupplyGlobalBudgetDto {
    field: 'MAINTENANCE' | 'FUEL_CARD' | 'FUEL_BON';
    amount: number;
    description?: string;
}

// --- Maintenance Types ---

export interface PieceChangee {
    nom: string;
    reference?: string;
    prix: number;
    quantite: number;
}

export interface Maintenance {
    id: number;
    vehiculeId: number;
    type: 'vidange' | 'revision' | 'reparation' | 'controle_technique' | 'pneumatiques' | 'freins' | 'autre';
    date: string;
    kilometrage: number;
    cout: number;
    description: string;
    prochaineMaintenance?: number;
    garage?: string;
    garageTelephone?: string;
    garageAdresse?: string;
    notes?: string;
    vehiculeAuGarage?: boolean;
    dateSortieGarage?: string;
    huileType?: string;
    huileQuantite?: number;
    huilePrix?: number;
    filtreHuileChange?: boolean;
    filtreHuilePrix?: number;
    filtreAirChange?: boolean;
    filtreAirPrix?: number;
    filtreHabitacleChange?: boolean;
    filtreHabitaclePrix?: number;
    piecesChangees?: PieceChangee[];
    mainOeuvre?: number;
    heuresTravail?: number;
    statut?: string;
}

export interface MaintenanceFormData {
    vehiculeId: number;
    type: Maintenance['type'];
    date: string;
    kilometrage: number;
    cout: number;
    description: string;
    prochaineMaintenance?: number;
    garage?: string;
    garageTelephone?: string;
    garageAdresse?: string;
    notes?: string;
    vehiculeAuGarage?: boolean;
    huileType?: string;
    huileQuantite?: number;
    huilePrix?: number;
    filtreHuileChange?: boolean;
    filtreHuilePrix?: number;
    filtreAirChange?: boolean;
    filtreAirPrix?: number;
    filtreHabitacleChange?: boolean;
    filtreHabitaclePrix?: number;
    piecesChangees?: PieceChangee[];
    mainOeuvre?: number;
    heuresTravail?: number;
}
