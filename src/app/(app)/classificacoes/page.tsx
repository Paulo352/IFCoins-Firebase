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
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useMemo } from 'react';

export default function RankingsPage() {
  const firestore = useFirestore();

  const collectorsQuery = useMemo(
    () =>
      query(
        collection(firestore, 'users'),
        where('role', '==', 'student'),
        orderBy('collectionSize', 'desc'),
        limit(10)
      ),
    [firestore]
  );
  const { data: topCollectors, isLoading: collectorsLoading } =
    useCollection<User>(collectorsQuery);

  const richestQuery = useMemo(
    () =>
      query(
        collection(firestore, 'users'),
        where('role', '==', 'student'),
        orderBy('coins', 'desc'),
        limit(10)
      ),
    [firestore]
  );
  const { data: richestStudents, isLoading: richestLoading } =
    useCollection<User>(richestQuery);

   const getCollectionSize = (user: User) => {
    if (!user.collection) return 0;
    return Object.values(user.collection).reduce((sum, quantity) => sum + quantity, 0);
  };

  const sortedCollectors = useMemo(() => {
    if (!topCollectors) return [];
    return [...topCollectors].sort((a, b) => getCollectionSize(b) - getCollectionSize(a));
  }, [topCollectors]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Classificações</h1>
        <p className="text-muted-foreground">
          Veja os melhores alunos em diferentes categorias.
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
                  <TableHead className="w-[50px]">#</TableHead>
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
                ) : sortedCollectors.length > 0 ? (
                  sortedCollectors.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${student.id}.png`}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {getCollectionSize(student)}
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
                  <TableHead className="w-[50px]">#</TableHead>
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
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${student.id}.png`}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
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
