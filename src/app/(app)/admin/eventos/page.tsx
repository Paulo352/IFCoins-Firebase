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
import { CalendarPlus } from 'lucide-react';

export default function AdminEventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Eventos</h1>
        <p className="text-muted-foreground">
          Crie e gerencie eventos escolares com bônus e cartas especiais.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Criar Novo Evento</CardTitle>
          <CardDescription>
            Defina o período, multiplicador de moedas e cartas do evento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="event-name">Nome do Evento</Label>
            <Input id="event-name" placeholder="Ex: Semana do Meio Ambiente" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Data de Início</Label>
              <Input id="start-date" type="date" />
            </div>
            <div>
              <Label htmlFor="end-date">Data de Fim</Label>
              <Input id="end-date" type="date" />
            </div>
          </div>
          <div>
            <Label htmlFor="multiplier">Multiplicador de Moedas</Label>
            <Input id="multiplier" type="number" min="1" placeholder="Ex: 2 para 2x" />
          </div>
           <div>
            <Label>Cartas Especiais</Label>
            <p className="text-sm text-muted-foreground">(UI de seleção de cartas viria aqui)</p>
          </div>
          <Button className="w-full">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Criar Evento
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Eventos Criados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            (Uma tabela com a lista de eventos e opções de edição seria exibida aqui)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
