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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookUp } from 'lucide-react';
import { rarityStyles } from '@/lib/data';

export default function AdminCardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Cartas</h1>
        <p className="text-muted-foreground">
          Adicione e edite as cartas colecionáveis do sistema.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastrar Nova Carta</CardTitle>
          <CardDescription>
            Preencha os detalhes da nova carta colecionável.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="card-name">Nome da Carta</Label>
            <Input id="card-name" placeholder="Ex: Energia Solar" />
          </div>
          <div>
            <Label htmlFor="card-rarity">Raridade</Label>
            <Select>
              <SelectTrigger id="card-rarity">
                <SelectValue placeholder="Selecione a raridade" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(rarityStyles).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="card-description">Descrição</Label>
            <Textarea
              id="card-description"
              placeholder="Uma breve descrição da carta"
            />
          </div>
           <div>
            <Label htmlFor="card-quantity">Cópias Disponíveis</Label>
            <Input id="card-quantity" type="number" min="0" placeholder="Deixe em branco para infinito" />
          </div>
          <div>
            <Label htmlFor="card-image">Imagem da Carta</Label>
            <Input id="card-image" type="file" />
          </div>
          <Button className="w-full">
            <BookUp className="mr-2 h-4 w-4" />
            Cadastrar Carta
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cartas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                (Uma tabela com a lista de cartas e opções de edição seria exibida aqui)
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
