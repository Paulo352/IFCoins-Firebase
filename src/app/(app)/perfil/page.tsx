'use client';
import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { User } from '@/lib/types';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Moon, Sun } from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [authUser, firestore]);

  const { data: user, isLoading, error } = useDoc<User>(userDocRef);
  
  useState(() => {
    if (user) {
      setName(user.name);
    }
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !userDocRef) return;

    setIsUploading(true);
    const storage = getStorage();
    // Create a storage reference with a unique path
    const storageRef = ref(storage, `profilePictures/${user.id}/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(snapshot.ref);

      await updateDoc(userDocRef, { photoURL });

      toast({
        title: 'Foto de perfil atualizada!',
        description: 'Sua nova foto já está visível.',
      });
    } catch (error) {
      console.error("Error uploading file: ", error);
      toast({
        variant: 'destructive',
        title: 'Erro no Upload',
        description: 'Não foi possível enviar sua foto. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!userDocRef) return;
    setIsSaving(true);
    try {
        await updateDoc(userDocRef, { name });
        toast({ title: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Não foi possível atualizar seu perfil.' });
    } finally {
        setIsSaving(false);
    }
  };
  
    const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  if (isLoading || !user) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-72" />
            </div>
            <Card className="max-w-2xl">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div>
                             <Skeleton className="h-9 w-40" />
                             <Skeleton className="h-5 w-48 mt-2" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações, configurações e acessibilidade.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage
                  src={user.photoURL || `https://avatar.vercel.sh/${user.id}.png`}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
              )}
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <CardTitle className="text-3xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" defaultValue={user.email} disabled />
            </div>
            <div className='pt-2'>
                <Button onClick={handleSaveChanges} disabled={isSaving || name === user.name}>
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
            <CardTitle>Acessibilidade</CardTitle>
            <CardDescription>Ajuste as configurações de visualização.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
            <p className="text-sm font-medium">Tema Escuro</p>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar Tema</span>
            </Button>
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
