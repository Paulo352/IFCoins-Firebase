'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  BookUser,
  Boxes,
  Home,
  LayoutPanelLeft,
  Medal,
  PlusCircle,
  Repeat,
  ShoppingBag,
  Swords,
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
import { Button } from '@/components/ui/button';

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
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/classificacoes', label: 'Classificações', icon: Medal },
];

const adminNav = [
  { href: '/dashboard', label: 'Painel', icon: Home },
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>('student');
  const currentUser = users.find((u) => u.role === role) || users[0];

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
          <UserNav user={currentUser} />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
