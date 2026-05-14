'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  UserX, 
  ShieldAlert, 
  Mail, 
  Calendar, 
  Loader2,
  Trash2,
  Ban,
  Check,
  X,
  Users,
  Download,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService } from '@/services/adminService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';

export default function UserManagement() {
  const [tab, setTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New Filtering State
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const usersResponse = await adminService.getUsers({ page: 0, size: 50 });

      if (usersResponse.success) {
        setUsers(usersResponse.data.content || []);
      }
    } catch (err: any) {
      setError('Failed to load user database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || u.accountStatus === filterStatus;
    
    const uD = new Date(u.createdAt);
    const userDateStr = `${uD.getFullYear()}-${String(uD.getMonth() + 1).padStart(2, '0')}-${String(uD.getDate()).padStart(2, '0')}`;
    const matchesAfter = !dateAfter || userDateStr >= dateAfter;
    const matchesBefore = !dateBefore || userDateStr <= dateBefore; 
    
    return matchesSearch && matchesRole && matchesStatus && matchesAfter && matchesBefore;
  });

  const handleExport = () => {
    const headers = ['FullName', 'Email', 'Role', 'Status', 'JoinedAt'];
    const rows = filteredUsers.map(u => [
      `"${u.fullName || ''}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.accountStatus}"`,
      `"${new Date(u.createdAt).toLocaleDateString()}"`
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const handleUserAction = async (userId: string, action: string) => {
    try {
      await adminService.performUserAction(userId, action, 'Moderation action taken');
      const actionText = action === 'REACTIVATE' ? 'reactivated' : action === 'BAN' ? 'suspended' : 'warned';
      toast.success(`User successfully ${actionText}`);
      
      // Locally reflect update instantly for Sidebar
      if (selectedUser && selectedUser.id === userId) {
         setSelectedUser({
            ...selectedUser,
            accountStatus: action === 'REACTIVATE' ? 'ACTIVE' : action === 'BAN' ? 'BANNED' : selectedUser.accountStatus
         });
      }
      fetchUsers();
    } catch (err: any) {
      toast.error('Administrative dispatch failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-card border border-border shadow-sm p-4 rounded-xl flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
         <div className="flex flex-wrap items-center gap-3 flex-1">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="font-bold gap-2 h-11 border-border shadow-sm shrink-0"
            >
               <Download className="h-4 w-4 text-primary" /> Export Dataset
            </Button>
            
            <div className="h-8 w-px bg-border hidden md:block mx-2" />
            
            <div className="relative flex-1 max-w-xs">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                  placeholder="Search users..." 
                  className="pl-10 h-11 text-sm border-border bg-muted/20 shadow-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            <Select value={filterRole} onValueChange={setFilterRole}>
               <SelectTrigger className="w-[140px] h-11 border-border bg-muted/20">
                  <SelectValue placeholder="Role" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="DEVELOPER">Developers</SelectItem>
                  <SelectItem value="EMPLOYER">Employers</SelectItem>
               </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
               <SelectTrigger className="w-[140px] h-11 border-border bg-muted/20">
                  <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
               </SelectContent>
            </Select>
         </div>

         <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-lg px-3 h-11 flex-1 lg:flex-none">
               <Calendar className="h-4 w-4 text-muted-foreground" />
               <input 
                  type="date" 
                  value={dateAfter} 
                  onChange={(e) => setDateAfter(e.target.value)}
                  className="bg-transparent border-none text-xs font-medium outline-none w-full"
               />
               <span className="text-muted-foreground font-bold">to</span>
               <input 
                  type="date" 
                  value={dateBefore} 
                  onChange={(e) => setDateBefore(e.target.value)}
                  className="bg-transparent border-none text-xs font-medium outline-none w-full"
               />
            </div>
         </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setTab} className="w-full">


        <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
           <CardContent className="p-0">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                   <Loader2 className="h-10 w-10 text-primary animate-spin" />
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing repository...</p>
                </div>
              ) : (
                <Table>
                   <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100">
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Identity</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Class</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Account Status</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Last Login At</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8 text-right">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {filteredUsers.map((user) => (
                         <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedUser(user)}>
                            <TableCell className="py-4 px-8">
                               <div className="flex items-center gap-4">
                                  <Avatar className="h-10 w-10 rounded-xl border border-slate-100 group-hover:border-primary/20 transition-colors">
                                     <AvatarImage src={user.avatarUrl} />
                                     <AvatarFallback className="bg-slate-900 text-white font-black text-xs uppercase">
                                        {user.fullName?.charAt(0) || user.email?.charAt(0)}
                                     </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-0.5">
                                     <p className="font-black text-slate-900 text-sm">{user.fullName || 'Unnamed Account'}</p>
                                     <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5"><Mail className="h-3 w-3" /> {user.email}</p>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell className="py-4 px-8">
                               <Badge variant="outline" className={cn(
                                  "rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5",
                                  user.role === 'DEVELOPER' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                  {user.role}
                               </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-8">
                               <Badge 
                                 variant="secondary" 
                                 className={cn(
                                    "rounded-md font-black text-[10px] tracking-widest px-2 py-0.5 uppercase",
                                    user.accountStatus === 'ACTIVE' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                    user.accountStatus === 'SUSPENDED' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                 )}
                               >
                                  {user.accountStatus || 'UNKNOWN'}
                               </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-8">
                               <span className="text-xs font-bold text-slate-500">
                                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                                </span>
                            </TableCell>
                            <TableCell className="py-4 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                        <MoreVertical className="h-4 w-4" />
                                     </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl">
                                     <DropdownMenuItem className="rounded-xl font-bold gap-2">
                                        <Eye className="h-4 w-4" /> View Full Profile
                                     </DropdownMenuItem>
                                     <DropdownMenuItem className="rounded-xl font-bold gap-2" onClick={() => handleUserAction(user.id, 'WARN')}>
                                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Send Warning
                                     </DropdownMenuItem>
                                     {user.accountStatus === 'ACTIVE' ? (
                                        <DropdownMenuItem className="rounded-xl font-bold gap-2 text-red-500" onClick={() => handleUserAction(user.id, 'BAN')}>
                                           <Ban className="h-4 w-4" /> Suspend Account
                                        </DropdownMenuItem>
                                     ) : (
                                        <DropdownMenuItem className="rounded-xl font-bold gap-2 text-emerald-600" onClick={() => handleUserAction(user.id, 'REACTIVATE')}>
                                           <CheckCircle2 className="h-4 w-4" /> Reactivate Account
                                        </DropdownMenuItem>
                                     )}
                                  </DropdownMenuContent>
                               </DropdownMenu>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
              )}
           </CardContent>
        </Card>
      </Tabs>

      <Sheet open={!!selectedUser} onOpenChange={(v) => !v && setSelectedUser(null)}>
         <SheetContent className="sm:max-w-md border-none p-0 overflow-hidden flex flex-col">
             <div className="bg-card border-b border-border p-8 relative">
                <SheetHeader className="relative z-10">
                   <SheetTitle className="text-xl font-black tracking-tight">Identity Details</SheetTitle>
                   <SheetDescription className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Administrative Control</SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 flex items-center gap-4 relative z-10">
                   <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
                      <AvatarImage src={selectedUser?.avatarUrl} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                         {selectedUser?.fullName?.charAt(0)}
                      </AvatarFallback>
                   </Avatar>
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold">{selectedUser?.fullName || 'Anonymous'}</h3>
                      <Badge className="font-bold text-[10px] uppercase tracking-widest">{selectedUser?.role}</Badge>
                   </div>
                </div>
             </div>
 
             <div className="p-8 space-y-6 flex-1 overflow-y-auto no-scrollbar bg-background">
                <div className="space-y-6">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Ecosystem</p>
                      <div className="space-y-3 pt-2">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center"><Mail className="h-4 w-4" /></div>
                            <span className="text-sm font-medium">{selectedUser?.email}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center"><Calendar className="h-4 w-4" /></div>
                            <span className="text-sm font-medium">Joined {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                         </div>
                      </div>
                   </div>
 
                   <Separator className="bg-border/50" />
 
                   <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Moderation Commands</p>
                      <div className="grid grid-cols-1 gap-2">
                         <Button 
                            variant="outline" 
                            className="h-12 font-bold justify-start gap-3 border-border hover:bg-accent"
                            onClick={() => handleUserAction(selectedUser?.id, 'WARN')}
                         >
                            <AlertTriangle className="h-4 w-4 text-amber-500" /> Send Warning
                         </Button>
                         {selectedUser?.accountStatus === 'ACTIVE' ? (
                            <Button 
                               variant="outline" 
                               className="h-12 font-bold justify-start gap-3 border-border hover:bg-destructive/10 text-destructive hover:text-destructive"
                               onClick={() => handleUserAction(selectedUser?.id, 'BAN')}
                            >
                               <UserX className="h-4 w-4" /> Suspend Access
                            </Button>
                         ) : (
                            <Button 
                               variant="outline" 
                               className="h-12 font-bold justify-start gap-3 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                               onClick={() => handleUserAction(selectedUser?.id, 'REACTIVATE')}
                            >
                               <CheckCircle2 className="h-4 w-4" /> Restore Full Access
                            </Button>
                         )}
                         <Button 
                            variant="outline" 
                            className="h-12 font-bold justify-start gap-3 border-border hover:bg-accent text-primary"
                            onClick={() => adminService.grantBadge(selectedUser?.id, true).then(() => toast.success('Badge granted'))}
                         >
                            <ShieldCheck className="h-4 w-4" /> Grant Badge
                         </Button>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="p-6 bg-card border-t border-border mt-auto">
                <Button 
                  className="w-full h-12 font-bold shadow-sm" 
                  disabled={!selectedUser?.profileId}
                  asChild={!!selectedUser?.profileId}
                >
                   {selectedUser?.profileId ? (
                     <Link href={selectedUser.role === 'EMPLOYER' ? `/companies/${selectedUser.profileId}` : `/developers/${selectedUser.profileId}`}>
                        View Public Profile
                     </Link>
                   ) : (
                     <span>Profile Not Initialized</span>
                   )}
                </Button>
             </div>
         </SheetContent>
      </Sheet>
    </div>
  );
}

function Eye({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}
