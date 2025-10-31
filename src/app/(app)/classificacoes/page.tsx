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
import { users } from '@/lib/data';

export default function RankingsPage() {
  const students = users.filter((u) => u.role === 'student');

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
              Alunos com a maior quantidade de cartas únicas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="text-right">Cartas Únicas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .sort((a, b) => Object.keys(b.collection).length - Object.keys(a.collection).length)
                  .map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${student.id}.png`} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {Object.keys(student.collection).length}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mais Ricos</CardTitle>
            <CardDescription>Alunos com a maior quantidade de IFCoins.</CardDescription>
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
                {students
                  .sort((a, b) => b.coins - a.coins)
                  .map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${student.id}.png`} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{student.coins}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
