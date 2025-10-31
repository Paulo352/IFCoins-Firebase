import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Eventos Escolares</h1>
        <p className="text-muted-foreground">
          Veja os eventos especiais e as cartas exclusivas associadas.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Eventos Atuais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">Semana do Meio Ambiente</h3>
              <p className="text-sm text-muted-foreground">01/06/2025 - 07/06/2025</p>
            </div>
            <Badge variant="default">Bônus de 2x IFCoins!</Badge>
          </div>
           <div className="text-center text-muted-foreground">
              Nenhum outro evento ativo no momento.
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Eventos Passados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            (Uma lista de eventos passados seria exibida aqui)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
