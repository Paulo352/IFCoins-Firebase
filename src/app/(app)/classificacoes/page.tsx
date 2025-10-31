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
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { User, User as UserType } from '@/lib/types';
import { useMemo, useEffect, useState } from 'react';

type UserWithCollectionSize = UserType & { collectionSize: number };

export default function RankingsPage() {
  const firestore = useFirestore();
  const [topCollectors, setTopCollectors] = useState<UserWithCollectionSize[]>([]);
  const [collectorsLoading, setCollectorsLoading] = useState(true);

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

  useEffect(() => {
    const fetchCollectors = async () => {
      setCollectorsLoading(true);
      const studentsQuery = query(collection(firestore, 'users'), where('role', '==', 'student'));
      const studentDocs = await getDocs(studentsQuery);
      
      const studentsWithCollectionSize: UserWithCollectionSize[] = [];

      for (const studentDoc of studentDocs.docs) {
          const student = studentDoc.data() as UserType;
          const userCardsCollection = collection(firestore, 'users', studentDoc.id, 'cards');
          const userCardsSnapshot = await getDocs(userCardsCollection);
          let totalCards = 0;
          userCardsSnapshot.forEach(doc => {
              totalCards += doc.data().quantity || 0;
          });
          studentsWithCollectionSize.push({ ...student, id: studentDoc.id, collectionSize: totalCards });
      }

      studentsWithCollectionSize.sort((a, b) => b.collectionSize - a.collectionSize);
      
      setTopCollectors(studentsWithCollectionSize.slice(0, 10));
      setCollectorsLoading(false);
    };

    fetchCollectors();
  }, [firestore]);


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
                ) : topCollectors.length > 0 ? (
                  topCollectors.map((student, index) => (
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
                        {student.collectionSize}
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
