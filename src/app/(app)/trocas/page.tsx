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
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { User as UserType, Card as CardType, Trade } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { rarityStyles } from '@/lib/data';

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
    const incomingTradesQuery = useMemo(() => user ? query(collection(firestore, 'trades'), where('toUserId', '==', user.uid), where('status', '==', 'pending')) : null, [user, firestore]);
    const outgoingTradesQuery = useMemo(() => user ? query(collection(firestore, 'trades'), where('fromUserId', '==', user.uid), where('status', '==', 'pending')) : null, [user, firestore]);
    
    const { data: incomingTrades, isLoading: loadingIncoming } = useCollection<Trade>(incomingTradesQuery);
    const { data: outgoingTrades, isLoading: loadingOutgoing } = useCollection<Trade>(outgoingTradesQuery);

    const handleSubmitTrade = async () => {
        setIsSubmitting(true);
        if (!user) {
            toast({ variant: 'destructive', title: 'Usuário não logado.' });
            setIsSubmitting(false);
            return;
        }

        try {
            // Find target user by RA
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('ra', '==', targetRa));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast({ variant: 'destructive', title: 'Aluno de destino não encontrado.' });
                setIsSubmitting(false);
                return;
            }
            const targetUserDoc = querySnapshot.docs[0];
            const targetUserId = targetUserDoc.id;

            // Create trade document
            await addDoc(collection(firestore, 'trades'), {
                fromUserId: user.uid,
                toUserId: targetUserId,
                offeredCards: offeredCards.map(c => c.id),
                requestedCards: requestedCards.map(c => c.id),
                offeredCoins: offeredCoins,
                requestedCoins: requestedCoins,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            toast({ title: 'Proposta de troca enviada!' });
            // Reset form
            setTargetRa('');
            setOfferedCards([]);
            setRequestedCards([]);
            setOfferedCoins(0);
            setRequestedCoins(0);

        } catch (error) {
            console.error("Error creating trade: ", error);
            toast({ variant: 'destructive', title: 'Erro ao criar troca.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTradeResponse = async (tradeId: string, accepted: boolean) => {
        if (!user) return;
        
        const tradeRef = doc(firestore, 'trades', tradeId);
        if (accepted) {
            // Complex transaction logic to swap cards and coins
            // For simplicity, we'll just update the status here
            await updateDoc(tradeRef, { status: 'accepted' });
            toast({title: 'Troca aceita!'});
        } else {
            await updateDoc(tradeRef, { status: 'rejected' });
            toast({title: 'Troca rejeitada.'});
        }
    }
    
    const handleCancelTrade = async (tradeId: string) => {
        await deleteDoc(doc(firestore, 'trades', tradeId));
        toast({title: 'Proposta cancelada.'});
    }

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
                    <Input id="coins-requested" type="number" min="0" placeholder="0" className="pl-10" value={requestedCoins} onChange={e => setRequestedCoins(Number(e-t.target.value))}/>
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
                        <div key={trade.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <span>Proposta de <strong>{trade.fromUserName || 'um aluno'}</strong></span>
                            <div>
                                <Button variant="ghost" size="icon" onClick={() => handleTradeResponse(trade.id, true)}><Check className="h-4 w-4 text-green-500"/></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleTradeResponse(trade.id, false)}><X className="h-4 w-4 text-red-500"/></Button>
                            </div>
                        </div>
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
                        <div key={trade.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <span>Proposta para <strong>{trade.toUserName || 'um aluno'}</strong></span>
                             <Button variant="ghost" size="icon" onClick={() => handleCancelTrade(trade.id)}><X className="h-4 w-4"/></Button>
                        </div>
                    ))
                )}
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

// Helper to get docs from Firestore
async function getDocs(query: any) {
    const { getDocs: gd } = await import('firebase/firestore');
    return gd(query);
}
