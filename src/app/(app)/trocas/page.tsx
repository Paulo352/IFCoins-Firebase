'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Repeat, Check, X } from 'lucide-react';
import { CoinIcon } from '@/components/icons';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, runTransaction, getDocs } from 'firebase/firestore';
import type { User as UserType, Card as CardType, Trade } from '@/lib/types';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

const TradeItemDetails = ({ trade, fromUser, toUser }: { trade: Trade, fromUser: UserType | null, toUser: UserType | null }) => {
    return (
         <DialogDescription className="space-y-4">
            <div>
                <p><strong>De:</strong> {fromUser?.name || 'Carregando...'}</p>
                <p><strong>Para:</strong> {toUser?.name || 'Carregando...'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold">Oferecendo</h4>
                    {trade.offeredCards.length > 0 && <p>{trade.offeredCards.length} carta(s)</p>}
                    {trade.offeredCoins > 0 && <p>{trade.offeredCoins} IFCoins</p>}
                </div>
                 <div>
                    <h4 className="font-semibold">Pedindo</h4>
                    {trade.requestedCards.length > 0 && <p>{trade.requestedCards.length} carta(s)</p>}
                    {trade.requestedCoins > 0 && <p>{trade.requestedCoins} IFCoins</p>}
                </div>
            </div>
        </DialogDescription>
    );
};

const TradeRow = ({ trade }: { trade: Trade }) => {
    const firestore = useFirestore();
    const [fromUser, setFromUser] = useState<UserType | null>(null);
    const [toUser, setToUser] = useState<UserType | null>(null);
    const { toast } = useToast();
    const { user } = useUser();

    useEffect(() => {
        const fetchUsers = async () => {
            if (!firestore) return;
            const fromUserDoc = await getDoc(doc(firestore, 'users', trade.fromUserId));
            if(fromUserDoc.exists()) setFromUser(fromUserDoc.data() as UserType);

            const toUserDoc = await getDoc(doc(firestore, 'users', trade.toUserId));
            if(toUserDoc.exists()) setToUser(toUserDoc.data() as UserType);
        }
        fetchUsers();
    }, [trade, firestore]);
    
    const handleTradeResponse = (trade: Trade, accepted: boolean) => {
        if (!user || !firestore) return;
        
        const tradeRef = doc(firestore, 'trades', trade.id);
        const newStatus = accepted ? 'accepted' : 'rejected';
        const tradeData = { status: newStatus };

        if (accepted) {
            // For now, just update status and show a toast.
            // A full implementation would require a complex Cloud Function transaction
            // to ensure atomicity, which is beyond the scope here.
            toast({title: 'Funcionalidade de aceitar troca em desenvolvimento.'});
             updateDoc(tradeRef, tradeData)
                .then(() => {
                    toast({ title: 'Troca aceita (simulação).' });
                })
                .catch(err => {
                    const permissionError = new FirestorePermissionError({
                        path: tradeRef.path,
                        operation: 'update',
                        requestResourceData: tradeData
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });

        } else {
             updateDoc(tradeRef, tradeData)
                .then(() => {
                    toast({title: 'Troca rejeitada.'});
                })
                .catch(err => {
                    const permissionError = new FirestorePermissionError({
                        path: tradeRef.path,
                        operation: 'update',
                        requestResourceData: tradeData
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });
        }
    }
    
    const handleCancelTrade = (tradeId: string) => {
        if (!firestore) return;
        const tradeRef = doc(firestore, 'trades', tradeId);
        deleteDoc(tradeRef)
            .then(() => {
                toast({title: 'Proposta cancelada.'});
            })
            .catch(err => {
                const permissionError = new FirestorePermissionError({
                    path: tradeRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }

    const isIncoming = user?.uid === trade.toUserId;

    return (
        <Dialog>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <DialogTrigger asChild>
                    <span className="cursor-pointer flex-1">
                        {isIncoming ? `Proposta de ` : `Proposta para `}
                        <strong>{isIncoming ? fromUser?.name || '...' : toUser?.name || '...'}</strong>
                    </span>
                </DialogTrigger>
                {isIncoming ? (
                    <div>
                        <Button variant="ghost" size="icon" onClick={() => handleTradeResponse(trade, true)}><Check className="h-4 w-4 text-green-500"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleTradeResponse(trade, false)}><X className="h-4 w-4 text-red-500"/></Button>
                    </div>
                ) : (
                    <Button variant="ghost" size="icon" onClick={() => handleCancelTrade(trade.id)}><X className="h-4 w-4"/></Button>
                )}
            </div>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalhes da Troca</DialogTitle>
                    <TradeItemDetails trade={trade} fromUser={fromUser} toUser={toUser} />
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}


export default function TradesPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [targetRa, setTargetRa] = useState('');
    const [offeredCoins, setOfferedCoins] = useState(0);
    const [requestedCoins, setRequestedCoins] = useState(0);
    const [offeredCards, setOfferedCards] = useState<CardType[]>([]);
    const [requestedCards, setRequestedCards] = useState<CardType[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Queries for trades
    const incomingTradesQuery = useMemoFirebase(() => user && firestore ? query(collection(firestore, 'trades'), where('toUserId', '==', user.uid), where('status', '==', 'pending')) : null, [user, firestore]);
    const outgoingTradesQuery = useMemoFirebase(() => user && firestore ? query(collection(firestore, 'trades'), where('fromUserId', '==', user.uid), where('status', '==', 'pending')) : null, [user, firestore]);
    
    const { data: incomingTrades, isLoading: loadingIncoming } = useCollection<Trade>(incomingTradesQuery);
    const { data: outgoingTrades, isLoading: loadingOutgoing } = useCollection<Trade>(outgoingTradesQuery);

    const handleSubmitTrade = async () => {
        setIsSubmitting(true);
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Usuário não logado.' });
            setIsSubmitting(false);
            return;
        }
        if (offeredCards.length === 0 && offeredCoins === 0) {
            toast({ variant: 'destructive', title: 'Você deve oferecer algo na troca.' });
            setIsSubmitting(false);
            return;
        }

        try {
            // Find target user by RA
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('ra', '==', targetRa), where('role', '==', 'student'));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast({ variant: 'destructive', title: 'Aluno de destino não encontrado.' });
                setIsSubmitting(false);
                return;
            }
            const targetUserDoc = querySnapshot.docs[0];
            const targetUserId = targetUserDoc.id;

             if (targetUserId === user.uid) {
                toast({ variant: 'destructive', title: 'Você não pode trocar consigo mesmo.' });
                setIsSubmitting(false);
                return;
            }

            // Create trade document
            const tradesCollection = collection(firestore, 'trades');
            const newTradeData = {
                fromUserId: user.uid,
                toUserId: targetUserId,
                offeredCards: offeredCards.map(c => c.id),
                requestedCards: requestedCards.map(c => c.id),
                offeredCoins: offeredCoins,
                requestedCoins: requestedCoins,
                status: 'pending',
                createdAt: serverTimestamp(),
            };

            addDoc(tradesCollection, newTradeData)
                .then(() => {
                    toast({ title: 'Proposta de troca enviada!' });
                    // Reset form
                    setTargetRa('');
                    setOfferedCards([]);
                    setRequestedCards([]);
                    setOfferedCoins(0);
                    setRequestedCoins(0);
                })
                .catch(err => {
                     const permissionError = new FirestorePermissionError({
                        path: tradesCollection.path,
                        operation: 'create',
                        requestResourceData: newTradeData
                    });
                    errorEmitter.emit('permission-error', permissionError);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });

        } catch (error) { // This will catch errors from getDocs, not from addDoc now
            console.error("Error finding user for trade: ", error);
            toast({ variant: 'destructive', title: 'Erro ao criar troca.', description: 'Não foi possível encontrar o usuário de destino.' });
            setIsSubmitting(false);
        }
    };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Sistema de Trocas</h1>
        <p className="text-muted-foreground">
          Proponha ou aceite trocas de cartas e IFCoins com outros alunos.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova Proposta de Troca</CardTitle>
            <CardDescription>
              Selecione as cartas e a quantidade de moedas para propor uma troca.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="student-id">RA do Aluno</Label>
              <Input id="student-id" placeholder="Ex: 2023001" value={targetRa} onChange={e => setTargetRa(e.target.value)} />
            </div>
            <div>
              <Label>Cartas Oferecidas</Label>
              <p className="text-sm text-muted-foreground">
                (Em breve: UI de seleção de cartas da sua coleção)
              </p>
            </div>
             <div>
                <Label htmlFor="coins-offered">IFCoins Oferecidos</Label>
                 <div className="relative">
                    <CoinIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="coins-offered" type="number" min="0" placeholder="0" className="pl-10" value={offeredCoins} onChange={e => setOfferedCoins(Number(e.target.value))}/>
                </div>
            </div>
            <div>
              <Label>Cartas Solicitadas</Label>
              <p className="text-sm text-muted-foreground">
                (Em breve: UI de seleção de cartas da coleção do outro aluno)
              </p>
            </div>
             <div>
                <Label htmlFor="coins-requested">IFCoins Solicitados</Label>                 <div className="relative">
                    <CoinIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="coins-requested" type="number" min="0" placeholder="0" className="pl-10" value={requestedCoins} onChange={e => setRequestedCoins(Number(e.target.value))}/>
                </div>
            </div>
            <Button className="w-full" onClick={handleSubmitTrade} disabled={isSubmitting || !targetRa}>
              <Repeat className="mr-2 h-4 w-4" />
              {isSubmitting ? "Enviando..." : "Enviar Proposta"}
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>Trocas Recebidas</CardTitle>
                <CardDescription>
                Propostas que outros alunos enviaram para você.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingIncoming ? <p>Carregando...</p> : 
                !incomingTrades || incomingTrades.length === 0 ? (
                <div className="text-center text-muted-foreground">
                Nenhuma proposta recebida.
                </div>
                ) : (
                    incomingTrades.map(trade => (
                        <TradeRow key={trade.id} trade={trade} />
                    ))
                )}
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Trocas Enviadas</CardTitle>
                <CardDescription>
                Propostas que você enviou para outros alunos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {loadingOutgoing ? <p>Carregando...</p> : 
                !outgoingTrades || outgoingTrades.length === 0 ? (
                <div className="text-center text-muted-foreground">
                    Nenhuma proposta enviada.
                </div>
                ) : (
                     outgoingTrades.map(trade => (
                         <TradeRow key={trade.id} trade={trade} />
                    ))
                )}
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
