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
import { users } from '@/lib/data';
import { RoleSwitcher } from '@/components/role-switcher';
import { UserNav } from '@/components/user-nav';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
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
  { href: '/admin/alunos', label: 'Gerenciar Alunos', icon: Users },
  { href: '/admin/cartas', label: 'Gerenciar Cartas', icon: Book },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/classificacoes', label: 'Classificações', icon: Medal },
];

const adminNav = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/recompensar', label: 'Recompensar', icon: PlusCircle },
  { href: '/admin/alunos', label: 'Alunos', icon: Users },
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
  const [appUser, setAppUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  
  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<User>(userDocRef);
  
  useEffect(() => {
    if (userData) {
      setAppUser(userData);
      setRole(userData.role);
    } else if (user && !isUserLoading) {
        const defaultUser = users.find(u => u.role === 'student')!;
        setAppUser({ ...defaultUser, id: user.uid, email: user.email!, name: user.displayName || 'Novo Aluno' });
    }
  }, [user, userData, isUserLoading]);

  const router = useRouter();
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !appUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <IFCoinIcon className="h-12 w-12 animate-spin" />
           <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const currentNav = navItems[role];

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
          <RoleSwitcher currentRole={role} setRole={setRole} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add breadcrumbs here */}
          </div>
          <UserNav user={appUser} />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
