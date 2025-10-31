'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Book,
  Boxes,
  Home,
  Medal,
  PlusCircle,
  Repeat,
  ShoppingBag,
  Users,
  Calendar,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { IFCoinIcon } from '@/components/icons';
import type { User, UserRole } from '@/lib/types';
import { RoleSwitcher } from '@/components/role-switcher';
import { UserNav } from '@/components/user-nav';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const studentNav = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/loja', label: 'Loja', icon: ShoppingBag },
  { href: '/colecao', label: 'Coleção', icon: Boxes },
  { href: '/trocas', label: 'Trocas', icon: Repeat },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/classificacoes', label: 'Classificações', icon: Medal },
];

const teacherNav = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/recompensar', label: 'Recompensar', icon: PlusCircle },
  { href: '/admin/alunos', label: 'Gerenciar Pessoas', icon: Users },
  { href: '/admin/cartas', label: 'Gerenciar Cartas', icon: Book },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/classificacoes', label: 'Classificações', icon: Medal },
];

const adminNav = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/recompensar', label: 'Recompensar', icon: PlusCircle },
  { href: '/admin/alunos', label: 'Pessoas', icon: Users },
  { href: '/admin/cartas', label: 'Cartas', icon: Book },
  { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { href: '/classificacoes', label: 'Classificações', icon: Medal },
];

const navItems: Record<UserRole, typeof studentNav> = {
  student: studentNav,
  teacher: teacherNav,
  admin: adminNav,
};

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<User>(userDocRef);
  
  // Simulated role state for UI switching. This should derive from appUser
  const [displayRole, setDisplayRole] = useState<UserRole>('student');

  useEffect(() => {
    // If auth state is still loading, do nothing.
    if (isUserLoading) {
      return;
    }

    // If auth has loaded and there's no user, redirect to login.
    if (!user) {
      router.push('/');
      return;
    }
    
    // If the authenticated user exists, but we are waiting for their firestore document
    if(user && !appUser && !isAppUserLoading) {
        const manageUser = async () => {
            const userRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                 // User document doesn't exist, this is a first-time login.
                // Create a new user profile based on email.
                const newUser: Omit<User, 'id'> = {
                    email: user.email!,
                    name: user.displayName || 'Novo Usuário',
                    role: 'student', // Default role
                    coins: 0,
                };
                
                if (user.email === 'paulocauan39@gmail.com') {
                    newUser.role = 'admin';
                    newUser.name = 'Paulo Cauan (Admin)';
                    newUser.coins = 9999;
                } else if (user.email === 'professor@ifpr.edu.br') {
                    newUser.role = 'teacher';
                    newUser.name = 'Professor Teste';
                } else if (user.email?.endsWith('@estudantes.ifpr.edu.br')) {
                    newUser.name = user.displayName || 'Aluno Teste';
                }

                await setDoc(userRef, newUser);
                // Force a token refresh to try and pick up any custom claims if the environment supports it
                await user.getIdToken(true);
            }
        }
        manageUser();
    }


    if (appUser) {
      setDisplayRole(appUser.role);
    }
  }, [user, isUserLoading, firestore, router, appUser, isAppUserLoading]);


  const isLoading = isUserLoading || isAppUserLoading;

  if (isLoading || !appUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <IFCoinIcon className="h-12 w-12 animate-spin" />
           <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const currentNav = navItems[displayRole];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <IFCoinIcon className="h-8 w-8" />
            <span className="text-lg font-semibold">IFCoins Digital</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {currentNav.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <RoleSwitcher currentRole={displayRole} setRole={setDisplayRole} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add breadcrumbs here */}
          </div>
          {appUser && <UserNav user={appUser} />}
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
