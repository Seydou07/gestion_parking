export type UserRole = 'ROOT_ADMIN' | 'ADMIN' | 'GESTIONNAIRE' | 'USER';
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
    username: string;
    email: string;
    role: UserRole;
    actif: boolean;
    createdAt: string;
    updatedAt: string;
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
    createdAt: string;
    updatedAt: string;
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
    permisCategories?: string;
    dateEmbauche?: string;
    notes?: string;
    missions?: Mission[];
    createdAt: string;
    updatedAt: string;
}

export interface DriverFormData {
    nom: string;
    prenom: string;
    telephone: string;
    statut: DriverStatus;
    permisNumero: string;
    permisExpiration: string;
    permisCategories?: string;
    notes?: string;
}

export interface Mission {
    id: number;
    vehiculeId: number;
    chauffeurId: number;
    destination: string;
    dateDepart: string;
    dateRetour: string;
    statut: MissionStatus;
    vehicule?: Vehicle;
    chauffeur?: Driver;
    kilometrageDepart?: number; // Deprecated: use kmDepart
    kilometrageRetour?: number; // Deprecated: use kmRetour
    kmDepart?: number;
    kmRetour?: number;
    observationDepart?: string;
    observationRetour?: string;

    // Nouveaux champs pour dotation carburant et fichiers
    lettreMission?: string;
    typeCarburantDotation?: 'CARTE' | 'BON' | 'AUCUNE';
    carteCarburantId?: number;
    bonCarburantIds?: number[]; // IDs for multi-selection
    vouchers?: FuelVoucher[]; // List of vouchers attached to the mission
    montantCarburantUtilise?: number; // Montant réel utilisé au retour
    ticketCarburantUrl?: string; // Upload du ticket de caisse
}

export type FuelCardStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIREE' | 'EN_MISSION';
export type FuelVoucherStatus = 'DISPONIBLE' | 'UTILISE' | 'EXPIRE';

export interface FuelCard {
    id: number;
    numero: string;
    solde: number;
    soldeInitial: number;
    prixLitre?: number;
    prixDiesel?: number;
    prixSuper?: number;
    litresEstimes?: number;
    dateExpiration: string;
    statut: FuelCardStatus;
    fournisseur?: string;
    station?: string;
    description?: string;
    notes?: string;
    quantite?: number;
    createdAt: string;
}

export interface FuelVoucher {
    id: number;
    numero: string;
    valeur: number; // Matches Prisma 'valeur'
    dateEmission: string;
    dateExpiration?: string;
    statut: FuelVoucherStatus;
    station?: string;
    vehiculeId?: number;
    notes?: string;
    quantite?: number;
    createdAt: string;
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

export type MaintenancePaymentSource = 'VEHICLE_BUDGET' | 'FUEL_CARD' | 'FUEL_VOUCHER' | 'CASH';

export interface Maintenance {
    id: number;
    vehiculeId: number;
    type: 'PANNE' | 'REPARATION' | 'VIDANGE' | 'ASSURANCE' | 'VISITE_TECHNIQUE' | 'AUTRE';
    description: string;
    dateDebut: string;
    dateFin?: string;
    montant?: number;
    statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
    garage?: string;
    notes?: string;
    modePaiement?: 'CARTE_CARBURANT' | 'BON_ESSENCE' | 'ESPECES' | 'CARTE_BANCAIRE';
    carteCarburantId?: number;
    bonEssenceId?: number;
    mainDoeuvre?: number;
    sourceMainDoeuvre?: MaintenancePaymentSource;
    items?: {
        nom: string;
        reference?: string;
        quantite: number;
        prixUnitaire: number;
        total: number;
        sourcePaiement?: MaintenancePaymentSource;
    }[];
}

export interface MaintenanceFormData {
    vehiculeId: number;
    type: Maintenance['type'];
    description: string;
    dateDebut: string;
    dateFin?: string;
    montant?: number;
    statut?: Maintenance['statut'];
    garage?: string;
    notes?: string;
    modePaiement?: Maintenance['modePaiement'];
    carteCarburantId?: number;
    bonEssenceId?: number;
    mainDoeuvre?: number;
    sourceMainDoeuvre?: MaintenancePaymentSource;
    items?: Maintenance['items'];
}

export interface HistoryLog {
    id: number;
    action: string;
    module: string;
    details?: string;
    utilisateurId?: number;
    entiteId?: number;
    entiteType?: string;
    createdAt: string;
    utilisateur?: {
        nom: string;
        prenom: string;
    };
}
