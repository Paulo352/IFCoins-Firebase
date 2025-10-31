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
import { UserPlus } from 'lucide-react';

export default function AdminStudentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Alunos</h1>
        <p className="text-muted-foreground">
          Cadastre novos alunos no sistema.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastrar Novo Aluno</CardTitle>
          <CardDescription>
            O aluno receberá um e-mail para configurar sua senha.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="student-ra">RA do Aluno</Label>
            <Input id="student-ra" placeholder="Ex: 2023001" />
          </div>
          <div>
            <Label htmlFor="student-email">E-mail Institucional</Label>
            <Input id="student-email" type="email" placeholder="aluno@ifpr.edu.br" />
          </div>
          <Button className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar Aluno
          </Button>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Alunos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                (Uma tabela com a lista de alunos registrados seria exibida aqui)
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
