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
import { Textarea } from '@/components/ui/textarea';
import { Award } from 'lucide-react';

export default function RewardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Recompensar Aluno</h1>
        <p className="text-muted-foreground">
          Distribua IFCoins para alunos por bom comportamento ou desempenho.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nova Recompensa</CardTitle>
          <CardDescription>
            Lembre-se: máximo de 10 moedas por hora por aluno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="student-ra">RA do Aluno ou Turma</Label>
            <Input id="student-ra" placeholder="Ex: 2023001 ou 2A" />
          </div>
          <div>
            <Label htmlFor="coins">Quantidade de IFCoins</Label>
            <Input id="coins" type="number" min="1" max="10" placeholder="1-10" />
          </div>
          <div>
            <Label htmlFor="reason">Justificativa</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Ajudou a limpar o laboratório."
            />
          </div>
          <Button className="w-full">
            <Award className="mr-2 h-4 w-4" />
            Enviar Recompensa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
