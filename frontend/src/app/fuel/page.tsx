"use client";

import { useState } from 'react';
import { Fuel, CreditCard, Ticket, Activity, TrendingUp, Filter, Search, Plus, ListFilter, ArrowUpRight, ArrowDownRight, Clock, RefreshCw, AlertCircle, Coins, PlusCircle, Eye, Landmark, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { cn, formatDate, formatCompactNumber, formatSmartCurrency, formatSmartNumber, formatCurrency } from '@/lib/utils';
import { FuelCardModal } from '@/components/fuel/FuelCardModal';
import { FuelCardDetailModal } from '@/components/fuel/FuelCardDetailModal';
import { FuelVoucherModal } from '@/components/fuel/FuelVoucherModal';
import { FuelRechargeModal } from '@/components/fuel/FuelRechargeModal';
import { VoucherUsageModal } from '@/components/fuel/VoucherUsageModal';
import { Archive, CheckCircle2, History as HistoryIcon, HardDrive, Wallet, Receipt, ArrowRightCircle, Gauge, Layers, UserCheck } from 'lucide-react';
import { FuelCard, FuelVoucher } from '@/types/api';
import { api } from '@/lib/api';
import { useEffect, useCallback } from 'react';
import StatCard from '@/components/dashboard/StatCard';

export default function FuelPage() {
    const [activeTab, setActiveTab] = useState<'VUE_DENSEMBLE' | 'CARTES' | 'BONS' | 'TRACABILITE'>('VUE_DENSEMBLE');
    const [searchTerm, setSearchTerm] = useState('');
    const [cards, setCards] = useState<FuelCard[]>([]);
    const [vouchers, setVouchers] = useState<FuelVoucher[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    const [selectedVoucherForUsage, setSelectedVoucherForUsage] = useState<FuelVoucher | null>(null);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<FuelCard | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [showAllVouchers, setShowAllVouchers] = useState(false);
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const PRIX_DIESEL = 675;
    const PRIX_SUPER = 750;

    const refreshData = useCallback(async () => {
        try {
            setLoading(true);
            const [cardsData, vouchersData, missionsData, summaryData] = await Promise.all([
                api.fuel.getCards(),
                api.fuel.getVouchers(),
                api.missions.getAll(),
                api.budgets.getSummary()
            ]);
            setCards(cardsData as FuelCard[]);
            setVouchers(vouchersData as FuelVoucher[]);
            setMissions(missionsData as any[]);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to fetch fuel data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const totalSoldeCartes = cards.reduce((acc, card) => acc + (card.solde || 0), 0);
    const totalBonsDispo = vouchers.filter(v => v.statut === 'DISPONIBLE').reduce((acc, v) => acc + v.valeur, 0);
    const budgetTotal = totalSoldeCartes + totalBonsDispo;

    const fuelTraces = (missions as any[])
        .filter(m => m.statut === 'TERMINEE' && m.montantCarburantUtilise)
        .map(m => ({
            id: `trace-${m.id}`,
            date: m.dateRetour || m.updatedAt || m.dateDepart,
            missionId: m.id,
            destination: m.destination,
            vehicule: m.vehicule?.immatriculation,
            chauffeur: m.chauffeur ? `${m.chauffeur.nom} ${m.chauffeur.prenom}` : 'Inconnu',
            methode: m.typeCarburantDotation,
            identifiant: m.typeCarburantDotation === 'BON' 
                ? (m.vouchers && m.vouchers.length > 0 ? m.vouchers.map((v: any) => v.numero).join(', ') : 'Aucun bon')
                : m.typeCarburantDotation === 'CARTE' 
                    ? cards.find(c => c.id === m.carteCarburantId)?.numero 
                    : 'N/A',
            montantGoutte: m.montantCarburantUtilise || 0,
            kmParcourus: (m.kmRetour || 0) - (m.kmDepart || 0)
        }));

    const totalConsomme = fuelTraces.reduce((acc, t) => acc + t.montantGoutte, 0);

    const cardColumns = [
        {
            key: 'fournisseur', header: 'Station / Fournisseur', render: (c: typeof cards[0]) => (
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 items-center justify-center border border-slate-100 dark:border-slate-700">
                        <Landmark className="w-4 h-4 text-fleet-blue" />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 dark:text-white tracking-tight uppercase">{c.fournisseur || 'N/A'}</p>
                        <p className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">{c.numero}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'notes', header: 'Détenteur', render: (c: typeof cards[0]) => (
                <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs truncate max-w-[150px]">{c.notes || 'Non assigné'}</span>
                </div>
            )
        },
        {
            key: 'litrage', header: 'Litrage Est (D/S)', render: (c: typeof cards[0]) => {
                const pd = (c as any).prixDiesel || PRIX_DIESEL;
                const ps = (c as any).prixSuper || PRIX_SUPER;
                const ld = Math.round((c.solde / pd) * 10) / 10;
                const ls = Math.round((c.solde / ps) * 10) / 10;
                return (
                    <div className="flex flex-col">
                        <span className="font-black text-[12px] text-emerald-600 leading-none">{ld} L <span className="text-[8px] opacity-70">DIESEL</span></span>
                        <span className="font-black text-[10px] text-amber-600 leading-none mt-1">{ls} L <span className="text-[8px] opacity-70 tracking-tight">SUPER 91</span></span>
                    </div>
                );
            }
        },
        {
            key: 'solde', header: 'Solde', render: (c: typeof cards[0]) => (
                <p className="font-black text-slate-900 dark:text-white text-base">{formatCurrency(c.solde || 0)}</p>
            )
        },
        {
            key: 'actions', header: '', className: "text-right", render: (c: FuelCard) => (
                <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-xl" onClick={() => { setSelectedCard(c); setIsDetailModalOpen(true); }}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" className="hidden sm:flex text-fleet-blue border-fleet-blue/30 h-9 px-4 font-black text-[10px] uppercase rounded-xl tracking-widest" onClick={() => { setSelectedCard(c); setIsRechargeModalOpen(true); }}>Recharger</Button>
                </div>
            )
        }
    ];

    const filteredVouchers = vouchers.filter(v => {
        const matchesSearch = v.numero.toLowerCase().includes(searchTerm.toLowerCase());
        const isDisponible = v.statut === 'DISPONIBLE';
        return matchesSearch && (showAllVouchers ? true : isDisponible);
    });

    const handleVoucherUsageConfirm = async (id: number, justification: string) => {
        await api.fuel.updateVoucher(id, { statut: 'UTILISE', justification });
        refreshData();
    };

    const voucherColumns = [
        { 
            key: 'numero', header: 'N° Bon', render: (v: FuelVoucher) => (
                <div className="flex flex-col">
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200 tracking-tight text-sm uppercase">{v.numero}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{v.station || 'Station Inconnue'}</span>
                </div>
            )
        },
        {
            key: 'valeur', header: 'Valeur Faciale', render: (v: FuelVoucher) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600 border border-amber-100 dark:border-amber-800">
                        <Coins className="w-4 h-4" />
                    </div>
                    <span className="font-black text-slate-700 dark:text-slate-200 text-sm">{formatSmartCurrency(v.valeur)}</span>
                </div>
            )
        },
        {
            key: 'statut', header: 'Statut', render: (v: FuelVoucher) => (
                <span className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center w-max rounded-full border shadow-sm",
                    v.statut === 'DISPONIBLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                )}>
                    {v.statut}
                </span>
            )
        },
        {
            key: 'actions', header: '', className: "text-right", render: (v: FuelVoucher) => v.statut === 'DISPONIBLE' && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedVoucherForUsage(v); setIsUsageModalOpen(true); }} className="h-9 px-4 text-[10px] font-black text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest rounded-xl border border-transparent hover:border-slate-100">
                    <AlertCircle className="w-4 h-4 mr-2" /> Consommer
                </Button>
            )
        }
    ];

    const traceColumns = [
        {
            key: 'date', header: 'Date', className: "hidden sm:table-cell",
            render: (t: any) => <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{formatDate(t.date)}</span>
        },
        {
            key: 'mission', header: 'Mission & Véhicule',
            render: (t: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100">
                        <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">{t.destination}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">{t.vehicule} — {t.chauffeur}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'methode', header: 'Méthode', className: "hidden md:table-cell font-black text-[10px] uppercase",
            render: (t: any) => (
                <div className="flex items-center gap-2">
                    {t.methode === 'CARTE' ? <CreditCard className="w-3 h-3 text-teal-500" /> : <Ticket className="w-3 h-3 text-amber-500" />}
                    <span className={cn(t.methode === 'CARTE' ? 'text-teal-600' : 'text-amber-600')}>{t.methode}</span>
                </div>
            )
        },
        {
            key: 'consommation', header: 'Débit', className: "text-right",
            render: (t: any) => <p className="font-black text-rose-600 text-base">-{formatSmartCurrency(t.montantGoutte)}</p>
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                {[
                    { id: 'VUE_DENSEMBLE', label: 'Vue d\'Ensemble', icon: Activity },
                    { id: 'TRACABILITE', label: 'Traçabilité', icon: ListFilter },
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
                                "flex items-center gap-3 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                                isActive
                                    ? "bg-fleet-blue text-white shadow-xl shadow-fleet-blue/20"
                                    : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-fleet-blue"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* --- CONTENU VUE D'ENSEMBLE --- */}
            {activeTab === 'VUE_DENSEMBLE' && (
                <div className="space-y-12 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Budget Total Disponible" 
                            value={budgetTotal} 
                            exactValue={`${formatCurrency(budgetTotal)} disponibles au total`}
                            icon={Wallet} 
                            variant="success" 
                        />
                        <StatCard 
                            title="Total Consommé" 
                            value={totalConsomme} 
                            exactValue={`${formatCurrency(totalConsomme)} consommés ce mois-ci`}
                            icon={ArrowUpRight} 
                            variant="danger" 
                        />
                        <StatCard 
                            title="Cartes Actives" 
                            value={cards.length} 
                            exactValue={`${cards.length} cartes enregistrées`}
                            icon={CreditCard} 
                            variant="info" 
                            isCurrency={false} 
                        />
                        <StatCard 
                            title="Bons en Stock" 
                            value={vouchers.filter(v => v.statut === 'DISPONIBLE').length} 
                            exactValue={`${vouchers.filter(v => v.statut === 'DISPONIBLE').length} bons disponibles immédiatement`}
                            icon={Ticket} 
                            variant="warning" 
                            isCurrency={false} 
                        />
                    </div>

                    {/* Section: MONITORING DES CARTES (MASTER CLASS) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-fleet-blue" /> Moniteur Dynamique (Bi-Carburant)
                            </h3>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Temps Réel</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {cards.map((card) => {
                                const usagePercent = card.soldeInitial > 0 ? Math.round(((card.soldeInitial - card.solde) / card.soldeInitial) * 100) : 0;
                                const remainingPercent = 100 - usagePercent;
                                const ld = Math.round((card.solde / PRIX_DIESEL) * 10) / 10;
                                const ls = Math.round((card.solde / PRIX_SUPER) * 10) / 10;
                                return (
                                    <div key={card.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[35px] p-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-fleet-blue/5 rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                                        <CreditCard className="w-6 h-6 text-fleet-blue" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight">{card.fournisseur || 'Station Service'}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">{card.numero} • {card.notes || 'Inconnu'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={cn(
                                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border",
                                                        card.statut === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                                    )}>
                                                        {card.statut}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex gap-6">
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest leading-none mb-1">Diesel</p>
                                                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{ld} L</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase text-amber-600 tracking-widest leading-none mb-1">Super 91</p>
                                                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{ls} L</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[14px] font-black text-fleet-blue leading-none mb-1">{remainingPercent}%</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Budget</p>
                                                    </div>
                                                </div>

                                                <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                    <div 
                                                        className={cn(
                                                            "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                                                            remainingPercent > 50 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" :
                                                            remainingPercent > 20 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                                                            "bg-gradient-to-r from-rose-500 to-rose-700"
                                                        )}
                                                        style={{ width: `${remainingPercent}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">
                                                    <span>Solde: {formatCurrency(card.solde)}</span>
                                                    <span className="text-slate-200 dark:text-slate-700">|</span>
                                                    <span className="text-slate-400">Titulaire: {card.notes || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section: RÉSERVES STATION (REGISTRE COMPTABLE) */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 ml-2 flex items-center gap-2">
                           <HardDrive className="w-4 h-4 text-fleet-blue" /> État des Réserves par Station (Bons)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {summary?.fuelVouchers?.breakdownByStation?.map((station: any) => (
                                <div key={station.name} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[35px] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                                    <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <Landmark className="w-5 h-5 text-fleet-blue" />
                                            </div>
                                            <span className="font-black text-sm uppercase tracking-tight">{station.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{station.count} Bons</span>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-2.5">
                                            {station.denominations?.map((denom: any) => (
                                                <div key={denom.value} className="flex items-center justify-between group/line">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            {denom.count} x <span className="text-slate-900 dark:text-white font-black">{denom.value.toLocaleString()} CFA</span>
                                                        </p>
                                                    </div>
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                                                        {(denom.count * denom.value).toLocaleString()} <span className="text-[9px] opacity-40">CFA</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Valeur Station</p>
                                            <p className="text-2xl font-black text-fleet-blue tracking-tighter leading-none">
                                                {formatCurrency(station.total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Journal (Pleine Largeur) */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-fleet-blue/10 rounded-2xl flex items-center justify-center">
                                    <HistoryIcon className="w-6 h-6 text-fleet-blue" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight leading-none mb-1">Journal Analytique des Consommations</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Traçabilité des flux de carburant en temps réel</p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={() => setActiveTab('TRACABILITE')} className="text-fleet-blue font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                Voir tout le registre <ArrowRightCircle className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {fuelTraces.slice(0, 10).map((trace) => (
                                <div key={trace.id} className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:bg-white transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform",
                                            trace.methode === 'CARTE' ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'
                                        )}>
                                            {trace.methode === 'CARTE' ? <CreditCard className="w-6 h-6" /> : <Ticket className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase text-slate-800 dark:text-white tracking-tight">{trace.vehicule} — {trace.destination}</p>
                                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{trace.identifiant} • {formatDate(trace.date)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-xl text-rose-500 tracking-tighter">-{trace.montantGoutte.toLocaleString()} <span className="text-[10px]">CFA</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONTENU DE TAILLE DE TRACABILITÉ --- */}
            {activeTab === 'TRACABILITE' && (
                <div className="bg-white dark:bg-slate-950 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-6">
                    <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                        <h2 className="font-black text-xl tracking-tight">Registre Complet de Traçabilité</h2>
                    </div>
                    <DataTable data={fuelTraces} columns={traceColumns} keyExtractor={(t) => t.id} emptyMessage="Aucun mouvement enregistré." />
                </div>
            )}

            {/* --- CONTENU CARTES --- */}
            {activeTab === 'CARTES' && (
                <div className="bg-white dark:bg-slate-950 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                        <h2 className="font-black text-xl tracking-tight">Gestion du Parc de Cartes</h2>
                        <Button onClick={() => setIsCardModalOpen(true)} className="bg-fleet-blue text-white font-black text-xs uppercase tracking-widest rounded-2xl px-8 h-10 shadow-xl shadow-fleet-blue/20">
                            <Plus className="w-4 h-4 mr-2" /> AJOUTER UNE CARTE
                        </Button>
                    </div>
                    <DataTable data={cards} columns={cardColumns} keyExtractor={(c) => c.id} emptyMessage="Aucune carte active." />
                </div>
            )}

            {/* --- CONTENU BONS --- */}
            {activeTab === 'BONS' && (
                <div className="bg-white dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-10">
                    <div className="flex flex-col sm:flex-row gap-8 justify-between items-center mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-amber-50 rounded-[25px] flex items-center justify-center text-amber-500 border border-amber-100">
                                <Receipt className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="font-black text-2xl tracking-tight leading-none mb-1.5">Inventaire des Bons d'Essence</h2>
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Registre unitaire des coupures en circulation</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 self-center sm:self-auto">
                            <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100">
                                <button onClick={() => setShowAllVouchers(false)} className={cn("px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", !showAllVouchers ? "bg-white dark:bg-slate-800 text-fleet-blue shadow-md" : "text-slate-400")}>Disponibles</button>
                                <button onClick={() => setShowAllVouchers(true)} className={cn("px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", showAllVouchers ? "bg-fleet-blue text-white shadow-lg" : "text-slate-400")}>Archives</button>
                            </div>
                            <Button onClick={() => setIsVoucherModalOpen(true)} className="h-10 px-8 bg-fleet-blue hover:bg-fleet-blue-dark text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-xl shadow-fleet-blue/30 transition-transform active:scale-95">
                                <PlusCircle className="w-4 h-4 mr-2" /> Nouveau Chargement
                            </Button>
                        </div>
                    </div>
                    <DataTable data={filteredVouchers} columns={voucherColumns} keyExtractor={(v) => v.id} emptyMessage="Aucun bon d'essence trouvé." />
                </div>
            )}

            <VoucherUsageModal open={isUsageModalOpen} onOpenChange={setIsUsageModalOpen} voucher={selectedVoucherForUsage} onConfirm={handleVoucherUsageConfirm} />
            <FuelCardModal open={isCardModalOpen} onOpenChange={setIsCardModalOpen} card={null} existingCards={cards} onSubmit={async (d) => { await api.fuel.createCard(d); refreshData(); }} />
            <FuelCardDetailModal open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} card={selectedCard} onEdit={(card) => { setSelectedCard(card); setIsEditCardModalOpen(true); }} />
            <FuelCardModal open={isEditCardModalOpen} onOpenChange={setIsEditCardModalOpen} card={selectedCard} existingCards={cards} onSubmit={async (d) => { if (selectedCard?.id) { const { id: _id, createdAt, updatedAt, quantite, litresEstimes, ...cleanData } = d as any; await api.fuel.updateCard(selectedCard.id, cleanData); } refreshData(); }} />
            <FuelVoucherModal open={isVoucherModalOpen} onOpenChange={setIsVoucherModalOpen} onSubmit={async (d) => { await api.fuel.createVoucher(d); refreshData(); }} />
            <FuelRechargeModal open={isRechargeModalOpen} onOpenChange={setIsRechargeModalOpen} card={selectedCard} onSuccess={refreshData} />
        </div>
    );
}
