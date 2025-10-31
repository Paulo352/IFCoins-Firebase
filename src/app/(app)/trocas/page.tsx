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
import { Repeat } from 'lucide-react';
import { CoinIcon } from '@/components/icons';

export default function TradesPage() {
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
              <Input id="student-id" placeholder="Ex: 2023001" />
            </div>
            <div>
              <Label>Cartas Oferecidas</Label>
              <p className="text-sm text-muted-foreground">
                (UI de seleção de cartas viria aqui)
              </p>
            </div>
             <div>
                <Label htmlFor="coins-offered">IFCoins Oferecidos</Label>
                 <div className="relative">
                    <CoinIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="coins-offered" type="number" min="0" placeholder="0" className="pl-10" />
                </div>
            </div>
            <div>
              <Label>Cartas Solicitadas</Label>
              <p className="text-sm text-muted-foreground">
                (UI de seleção de cartas viria aqui)
              </p>
            </div>
             <div>
                <Label htmlFor="coins-requested">IFCoins Solicitados</Label>
                 <div className="relative">
                    <CoinIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="coins-requested" type="number" min="0" placeholder="0" className="pl-10" />
                </div>
            </div>
            <Button className="w-full">
              <Repeat className="mr-2 h-4 w-4" />
              Enviar Proposta
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trocas Pendentes</CardTitle>
            <CardDescription>
              Visualize as propostas recebidas e enviadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              Nenhuma troca pendente.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
