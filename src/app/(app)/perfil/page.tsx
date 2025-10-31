import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { users } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  // We'll use the first student as an example, this should be the logged in user
  const user = users[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e configurações.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={`https://avatar.vercel.sh/${user.id}.png`}
                alt={user.name}
              />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue={user.name} />
            </div>
             <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" defaultValue={user.email} disabled />
            </div>
            <div className='pt-2'>
                <Button>Salvar Alterações</Button>
            </div>
        </CardContent>
      </Card>
       <Card className="max-w-2xl">
        <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Para sua segurança, recomendamos o uso de uma senha forte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
            </div>
             <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
            </div>
             <div>
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
            </div>
            <div className='pt-2'>
                <Button>Alterar Senha</Button>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
