'use client';
import type { Dispatch, SetStateAction } from 'react';
import type { UserRole } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from './ui/label';

interface RoleSwitcherProps {
  currentRole: UserRole;
  realRole: UserRole;
  setRole: Dispatch<SetStateAction<UserRole | undefined>>;
}

export function RoleSwitcher({ currentRole, realRole, setRole }: RoleSwitcherProps) {
  // Only admins can switch roles
  if (realRole !== 'admin') {
    return null;
  }
  
  return (
    <div className="p-2">
      <Label className="text-xs text-muted-foreground">Ver como:</Label>
      <Select value={currentRole} onValueChange={(value) => setRole(value as UserRole)}>
        <SelectTrigger className="h-8 w-full">
          <SelectValue placeholder="Selecionar perfil" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Aluno</SelectItem>
          <SelectItem value="teacher">Professor</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
