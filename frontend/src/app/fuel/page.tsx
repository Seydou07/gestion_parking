"use client";

import { useState } from 'react';
import { Fuel, CreditCard, Ticket, Activity, TrendingUp, Filter, Search, Plus, ListFilter, ArrowUpRight, ArrowDownRight, Clock, RefreshCw, AlertCircle, Coins, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { mockFuelCards, mockFuelVouchers, mockMissions } from '@/data/mockData';
import { cn, formatDate, formatCompactNumber, formatSmartCurrency, formatSmartNumber } from '@/lib/utils';
import { FuelCardModal } from '@/components/fuel/FuelCardModal';
import { FuelVoucherModal } from '@/components/fuel/FuelVoucherModal';
import { FuelRechargeModal } from '@/components/fuel/FuelRechargeModal';
import { FuelCard, FuelVoucher } from '@/types/api';
import { api } from '@/lib/api';
import { useEffect, useCallback } from 'react';

export default function FuelPage() {
    const [activeTab, setActiveTab] = useState<'VUE_DENSEMBLE' | 'CARTES' | 'BONS' | 'TRACABILITE'>('VUE_DENSEMBLE');
    const [searchTerm, setSearchTerm] = useState('');
    const [cards, setCards] = useState<FuelCard[]>([]);
    const [vouchers, setVouchers] = useState<FuelVoucher[]>([]);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<FuelCard | null>(null);
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = useCallback(async () => {
        try {
            setLoading(true);
            const [cardsData, vouchersData, missionsData] = await Promise.all([
                api.fuel.getCards(),
                api.fuel.getVouchers(),
                api.missions.getAll()
            ]);
            setCards(cardsData as FuelCard[]);
            setVouchers(vouchersData as FuelVoucher[]);
            setMissions(missionsData as any[]);
        } catch (error) {
            console.error('Failed to fetch fuel data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // --- Calculs pour la Vue d'Ensemble ---
    const totalSoldeCartes = cards.reduce((acc, card) => acc + (card.solde || 0), 0);
    const totalBonsDispo = vouchers.filter(v => v.statut === 'DISPONIBLE').reduce((acc, v) => acc + v.valeur, 0);
    const budgetTotal = totalSoldeCartes + totalBonsDispo;

    // --- Génération de l'historique de traçabilité ---
    // Pour chaque mission terminée ayant consommé, on génère une trace.
    const fuelTraces = (missions as any[])
        .filter(m => m.statut === 'TERMINEE' && m.montantCarburantUtilise)
        .map(m => ({
            id: `trace-${m.id}`,
            date: m.dateFin,
            missionId: m.id,
            destination: m.destination,
            vehicule: m.vehicule?.immatriculation,
            chauffeur: m.chauffeur ? `${m.chauffeur.nom} ${m.chauffeur.prenom}` : 'Inconnu',
            methode: m.typeCarburantDotation,
            identifiant: m.typeCarburantDotation === 'BON' ? vouchers.find(v => v.id === m.bonCarburantId)?.numero :
                m.typeCarburantDotation === 'CARTE' ? cards.find(c => c.id === m.carteCarburantId)?.numero : 'N/A',
            montantGoutte: m.montantCarburantUtilise || 0,
            kmParcourus: (m.kilometrageRetour || 0) - (m.kilometrageDepart || 0)
        }));

    const totalConsomme = fuelTraces.reduce((acc, t) => acc + t.montantGoutte, 0);

    // --- Colonnes pour l'onglet Cartes ---
    const cardColumns = [
        {
            key: 'fournisseur', header: 'Fournisseur', render: (c: typeof cards[0]) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <Fuel className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white tracking-tight">{c.fournisseur || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'numero', header: 'Numéro & Affectation', render: (c: typeof cards[0]) => (
                <div>
                    <span className="font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                        {c.numero}
                        {c.statut === 'ACTIVE' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                        {c.statut === 'INACTIVE' && <span className="w-2 h-2 rounded-full bg-slate-400"></span>}
                        {c.statut === 'EXPIREE' && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{c.notes || 'Carte Carburant'}</span>
                </div>
            )
        },
        {
            key: 'solde',
            header: 'Solde Actuel',
            render: (c: typeof cards[0]) => (
                <div>
                    <p className="font-black text-lg text-emerald-600">
                        {formatSmartCurrency(c.solde || 0)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Solde Actuel
                    </p>
                </div>
            )
        },
        {
            key: 'fournisseur', header: 'Type', render: (c: typeof cards[0]) => (
                <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs tracking-wide">Standard</span>
            )
        },
        {
            key: 'validite', header: 'Validité', render: (c: typeof cards[0]) => {
                const isExpired = c.dateExpiration ? new Date(c.dateExpiration) <= new Date() : false;
                return (
                    <div>
                        <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">{c.dateExpiration ? formatDate(c.dateExpiration) : 'Illimitée'}</p>
                        {c.dateExpiration && (
                            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm", isExpired ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600")}>
                                {isExpired ? 'Expirée' : 'Valide'}
                            </span>
                        )}
                    </div>
                )
            }
        },
        {
            key: 'actions', header: 'Action', render: (c: FuelCard) => (
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-fleet-blue hover:bg-fleet-blue hover:text-white border-fleet-blue/30 gap-2 font-bold transition-all shadow-sm"
                    onClick={() => {
                        setSelectedCard(c);
                        setIsRechargeModalOpen(true);
                    }}
                >
                    <PlusCircle className="w-4 h-4" />
                    Recharger
                </Button>
            )
        }
    ];

    // --- Colonnes pour l'onglet Bons ---
    const filteredVouchers = vouchers.filter(v => v.numero.toLowerCase().includes(searchTerm.toLowerCase()));
    const voucherColumns = [
        { key: 'numero', header: 'Numéro du Bon', render: (v: typeof vouchers[0]) => <span className="font-bold text-slate-800 dark:text-slate-200">{v.numero}</span> },
        {
            key: 'valeur',
            header: 'Valeur Faciale',
            render: (v: typeof vouchers[0]) => <span className="font-black text-amber-600">{formatSmartCurrency(v.valeur)}</span>
        },
        { key: 'dateEmission', header: "Date d'émission", render: (v: typeof mockFuelVouchers[0]) => <span className="text-sm text-slate-500">{formatDate(v.dateEmission)}</span> },
        {
            key: 'statut',
            header: 'Statut',
            render: (v: typeof mockFuelVouchers[0]) => (
                <span className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center w-max rounded-md",
                    v.statut === 'DISPONIBLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                )}>
                    {v.statut}
                </span>
            )
        }
    ];

    // --- Colonnes pour Traçabilité ---
    const traceColumns = [
        {
            key: 'date',
            header: 'Achevé le',
            render: (t: typeof fuelTraces[0]) => (
                <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm font-bold">{formatDate(t.date)}</span>
                </div>
            )
        },
        {
            key: 'mission',
            header: 'Lié à la Mission',
            render: (t: typeof fuelTraces[0]) => (
                <div>
                    <p className="font-black text-slate-800 dark:text-slate-200">{t.destination}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Mission #{t.missionId}</p>
                </div>
            )
        },
        {
            key: 'ressource',
            header: 'Véhicule & Chauffeur',
            render: (t: typeof fuelTraces[0]) => (
                <div>
                    <p className="font-bold text-fleet-blue">{t.vehicule}</p>
                    <p className="text-xs text-slate-500 uppercase">{t.chauffeur}</p>
                </div>
            )
        },
        {
            key: 'methode',
            header: 'Moyen de paiement',
            render: (t: typeof fuelTraces[0]) => (
                <div>
                    <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                        t.methode === 'CARTE' ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
                    )}>
                        {t.methode}
                    </span>
                    <p className="text-xs font-bold text-slate-500 mt-1">{t.identifiant}</p>
                </div>
            )
        },
        {
            key: 'consommation',
            header: 'Coût / Rendement',
            render: (t: typeof fuelTraces[0]) => (
                <div className="text-right">
                    <p className="font-black text-lg text-rose-600 flex items-center justify-end gap-1">
                        <ArrowDownRight className="w-4 h-4" />
                        {formatSmartCurrency(t.montantGoutte)}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        pour {formatSmartNumber(t.kmParcourus)} km ({formatSmartNumber(t.kmParcourus > 0 ? Math.round(t.montantGoutte / t.kmParcourus) : 0)} FCFA/km)
                    </p>
                </div>
            )
        }
    ];


    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                {[
                    { id: 'VUE_DENSEMBLE', label: 'Vue d\'Ensemble', icon: Activity },
                    { id: 'TRACABILITE', label: 'Traçabilité & Historique', icon: ListFilter },
                    { id: 'CARTES', label: 'Cartes Carburant', icon: CreditCard },
                    { id: 'BONS', label: 'Bons d\'Essence', icon: Ticket }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-tight transition-all active:scale-95 shadow-sm",
                                isActive
                                    ? "bg-fleet-blue text-white shadow-xl shadow-fleet-blue/20"
                                    : "bg-white dark:bg-slate-900 text-fleet-blue border-2 border-slate-100 dark:border-slate-800 hover:border-fleet-blue/30 hover:bg-slate-50"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-fleet-blue")} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* --- CONTENU VUE D'ENSEMBLE --- */}
            {activeTab === 'VUE_DENSEMBLE' && (
                <div className="space-y-6 animate-fade-in">
                    {/* KPIs Alignés sur le style Chauffeur/Vehicule avec Tooltips */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Budget Dispo Global', count: budgetTotal, border: 'border-emerald-500', bg: 'bg-emerald-50/50 text-emerald-600', isCurrency: true },
                            { label: 'Coût Tracé (Missions)', count: totalConsomme, border: 'border-rose-500', bg: 'bg-rose-50/50 text-rose-600', isCurrency: true },
                            { label: 'Cartes Actives', count: cards.length, border: 'border-fleet-blue', bg: 'bg-fleet-blue/5 text-fleet-blue', isCurrency: false },
                            { label: 'Bons en Attente', count: vouchers.filter(v => v.statut === 'DISPONIBLE').length, border: 'border-amber-500', bg: 'bg-amber-50/50 text-amber-600', isCurrency: false },
                        ].map((stat, i) => (
                            <div key={i} className={cn("p-5 rounded-2xl border-l-4 bg-white dark:bg-slate-900 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-center min-h-[110px]", stat.border)}>
                                <div className="flex items-center gap-2">
                                    <p className={cn("text-2xl font-bold mb-1", stat.bg.split(' ')[1])}>
                                        {typeof stat.count === 'number' 
                                            ? (stat.isCurrency ? formatSmartCurrency(stat.count) : stat.count.toLocaleString('fr-FR')) 
                                            : stat.count}
                                    </p>
                                </div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Raccourcis ou Graphique */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <Activity className="w-5 h-5 text-fleet-blue" />
                                Top Consommations Récentes (Flux)
                            </h2>
                            <Button variant="ghost" onClick={() => setActiveTab('TRACABILITE')} className="text-fleet-blue font-bold">Voir tout l'historique →</Button>
                        </div>
                        <div className="space-y-4">
                            {fuelTraces.slice(0, 3).map((trace) => (
                                <div key={trace.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center shadow-inner",
                                            trace.methode === 'CARTE' ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'
                                        )}>
                                            {trace.methode === 'CARTE' ? <CreditCard className="w-6 h-6" /> : <Ticket className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase text-slate-900 dark:text-white">{trace.vehicule} — {trace.destination}</p>
                                            <p className="text-xs font-bold text-slate-500">{trace.identifiant} utilisé par {trace.chauffeur}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg text-rose-500">-{trace.montantGoutte.toLocaleString('fr-FR')} FCFA</p>
                                        <p className="text-xs font-bold text-slate-400">{formatDate(trace.date)}</p>
                                    </div>
                                </div>
                            ))}
                            {fuelTraces.length === 0 && (
                                <p className="text-center text-slate-500 py-8 italic font-medium">Aucun historique de consommation récent détecté.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONTENU TRACABILITE --- */}
            {activeTab === 'TRACABILITE' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in p-2">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-fleet-blue/10 rounded-lg text-fleet-blue"><ListFilter className="w-5 h-5" /></div>
                            <div>
                                <h2 className="font-black text-lg text-slate-900 dark:text-white">Audit & Traçabilité</h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suivez chaque goutte de carburant</p>
                            </div>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input placeholder="Rechercher véhicule, chauffeur..." className="pl-11 bg-slate-50 dark:bg-slate-800/50" />
                        </div>
                    </div>
                    <DataTable data={fuelTraces} columns={traceColumns} keyExtractor={(t) => t.id} emptyMessage="Aucune trace de consommation." />
                </div>
            )}

            {/* --- CONTENU CARTES --- */}
            {activeTab === 'CARTES' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in p-2">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent">
                        <h2 className="font-black tracking-tight text-lg">Parc des Cartes Carburant</h2>
                        <div className="flex gap-2 items-center justify-end">
                            <Button variant="outline" className="h-10 text-xs font-bold gap-2"><Filter className="w-4 h-4" /> Filtrer</Button>
                            <Button onClick={() => setIsCardModalOpen(true)} className="h-10 px-4 font-bold tracking-wide shadow-md bg-fleet-blue hover:bg-fleet-blue/90 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Nouvelle Carte
                            </Button>
                        </div>
                    </div>
                    <DataTable data={cards} columns={cardColumns} keyExtractor={(c) => c.id} emptyMessage="Aucune carte trouvée." />
                </div>
            )}

            {/* --- CONTENU BONS --- */}
            {activeTab === 'BONS' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in p-2">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent">
                        <h2 className="font-black tracking-tight text-lg">Carnet de Bons d'Essence</h2>
                        <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
                            <div className="relative w-full max-w-sm hidden sm:block">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Rechercher N° de bon..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-11 bg-slate-50 dark:bg-slate-800/50"
                                />
                            </div>
                            <Button variant="outline" onClick={() => setIsVoucherModalOpen(true)} className="h-10 px-4 font-bold text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 shrink-0">
                                <Plus className="w-4 h-4 mr-2" /> Nouveau Bon
                            </Button>
                        </div>
                    </div>
                    <DataTable data={filteredVouchers} columns={voucherColumns} keyExtractor={(v) => v.id} emptyMessage="Aucun bon d'essence trouvé." />
                </div>
            )}

            {/* Modals */}
            <FuelCardModal
                open={isCardModalOpen}
                onOpenChange={setIsCardModalOpen}
                onSubmit={async (d) => {
                    await api.fuel.createCard(d);
                    refreshData();
                }}
            />

            <FuelVoucherModal
                open={isVoucherModalOpen}
                onOpenChange={setIsVoucherModalOpen}
                onSubmit={async (d) => {
                    await api.fuel.createVoucher(d);
                    refreshData();
                }}
            />

            <FuelRechargeModal
                open={isRechargeModalOpen}
                onOpenChange={setIsRechargeModalOpen}
                card={selectedCard}
                onSuccess={refreshData}
            />

        </div>
    );
}
