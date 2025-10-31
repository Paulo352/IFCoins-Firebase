'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Boxes, Users, Medal, Award, Book } from 'lucide-react';
import { CoinIcon } from '@/components/icons';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import type { User as UserType } from '@/lib/types';
import { doc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [collectionSize, setCollectionSize] = useState(0);

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserLoading } = useDoc<UserType>(userDocRef);
  
  const userCardsCollection = useMemo(() => {
      if (!user) return null;
      return collection(firestore, 'users', user.uid, 'cards');
  }, [firestore, user]);

  const { data: userCards, isLoading: isLoadingUserCards } = useCollection(userCardsCollection);

  useEffect(() => {
    if (userCards) {
      const total = userCards.reduce((sum, card) => sum + (card.quantity || 0), 0);
      setCollectionSize(total);
    }
  }, [userCards]);

  // Admin stats
  const allUsersQuery = useMemo(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers, isLoading: isAllUsersLoading } = useCollection(allUsersQuery);
  const allCardsQuery = useMemo(() => collection(firestore, 'cards'), [firestore]);
  const { data: allCards, isLoading: isAllCardsLoading } = useCollection(allCardsQuery);

  const userRole = userData?.role;

  const CardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-28 mt-1" />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Painel Principal</h1>
        <p className="text-muted-foreground">
          Bem-vindo(a) de volta! Aqui está um resumo da sua atividade.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isUserLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : userData ? (
          <>
            {/* Student/Teacher/Admin Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meus IFCoins</CardTitle>
                <CoinIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.coins}</div>
                {/* <p className="text-xs text-muted-foreground">+20 na última semana</p> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cartas na Coleção
                </CardTitle>
                <Boxes className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoadingUserCards ? '...' : collectionSize}</div>
                <p className="text-xs text-muted-foreground">cartas no total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Posição no Ranking
                </CardTitle>
                <Medal className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">N/A</div>
                <p className="text-xs text-muted-foreground">
                  Em breve
                </p>
              </CardContent>
            </Card>

            {/* Teacher Cards */}
            {userRole === 'teacher' && (
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Recompensas
                  </CardTitle>
                  <Award className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <div className="text-2xl font-bold">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    distribuídos esta semana
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Admin Cards */}
            {userRole === 'admin' && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Alunos
                    </CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                        {isAllUsersLoading ? '...' : allUsers?.filter(u => u.role === 'student').length ?? 0}
                    </div>
                    {/* <p className="text-xs text-muted-foreground">
                      +5 novos registros
                    </p> */}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Cartas
                    </CardTitle>
                    <Book className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                        {isAllCardsLoading ? '...' : allCards?.length ?? 0}
                    </div>
                     {/* <p className="text-xs text-muted-foreground">
                      8 cartas ativas em eventos
                    </p> */}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        ) : (
             <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground">
                Não foi possível carregar os dados do painel.
             </div>
        )}
      </div>
    </div>
  );
}
