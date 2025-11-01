'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Gem } from 'lucide-react';

const RankingBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <Badge
        variant="default"
        className="bg-amber-400 text-amber-900 hover:bg-amber-400"
      >
        <Crown className="mr-1 h-3 w-3" />
        {rank}º
      </Badge>
    );
  }
  if (rank === 2) {
    return (
      <Badge
        variant="default"
        className="bg-slate-400 text-slate-900 hover:bg-slate-400"
      >
        <Star className="mr-1 h-3 w-3" />
        {rank}º
      </Badge>
    );
  }
  if (rank === 3) {
    return (
      <Badge
        variant="default"
        className="bg-orange-400 text-orange-900 hover:bg-orange-400"
      >
        <Gem className="mr-1 h-3 w-3" />
        {rank}º
      </Badge>
    );
  }
  return <span className="text-muted-foreground font-medium">{rank}º</span>;
};


export default function RankingsPage() {
  const firestore = useFirestore();

  const richestQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'users'),
            where('role', '==', 'student'),
            orderBy('coins', 'desc'),
            limit(10)
          )
        : null,
    [firestore]
  );
  const { data: richestStudents, isLoading: richestLoading } =
    useCollection<UserType>(richestQuery);

  const collectorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'users'),
            where('role', '==', 'student'),
            orderBy('collectionSize', 'desc'),
            limit(10)
          )
        : null,
    [firestore]
  );
    const { data: topCollectors, isLoading: collectorsLoading } =
    useCollection<UserType>(collectorsQuery);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Classificações</h1>
        <p className="text-muted-foreground">
          Veja os melhores alunos em diferentes categorias. Apenas estudantes aparecem aqui.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Colecionadores</CardTitle>
            <CardDescription>
              Alunos com a maior quantidade total de cartas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="text-right">Cartas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectorsLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : topCollectors && topCollectors.length > 0 ? (
                  topCollectors.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-center">
                         <RankingBadge rank={index + 1} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={student.photoURL || `https://avatar.vercel.sh/${student.id}.png`}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {student.collectionSize || 0}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Nenhum aluno no ranking ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mais Ricos</CardTitle>
            <CardDescription>
              Alunos com a maior quantidade de IFCoins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="text-right">IFCoins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {richestLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : richestStudents && richestStudents.length > 0 ? (
                  richestStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-center">
                        <RankingBadge rank={index + 1} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                             <AvatarImage
                              src={student.photoURL || `https://avatar.vercel.sh/${student.id}.png`}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {student.coins}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                       Nenhum aluno no ranking ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
