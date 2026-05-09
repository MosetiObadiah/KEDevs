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
  Users
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [pendingEmployers, setPendingEmployers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersResponse, pendingResponse] = await Promise.all([
        adminService.getUsers({ page: 0, size: 50 }),
        adminService.getPendingEmployers(0, 50),
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data.content || []);
      }
      if (pendingResponse.success) {
        setPendingEmployers(pendingResponse.data.content || []);
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

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApproveEmployer = async (profileId: string) => {
    try {
      await adminService.approveEmployer(profileId, { approved: true });
      toast.success('Employer profile approved');
      fetchUsers();
    } catch (err: any) {
      toast.error('Approval failed');
    }
  };

  const handleRejectEmployer = async (profileId: string) => {
    try {
      await adminService.approveEmployer(profileId, { approved: false, reason: 'Does not meet criteria' });
      toast.error('Employer profile rejected');
      fetchUsers();
    } catch (err: any) {
      toast.error('Rejection failed');
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      await adminService.performUserAction(userId, action, 'Moderation action taken');
      toast.success(`User ${action.toLowerCase()}ed`);
      fetchUsers();
    } catch (err: any) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Users className="h-8 w-8 text-primary" /> User Repository
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manage accounts and verify identities</p>
         </div>
         
         <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
               placeholder="Filter by name or email..." 
               className="pl-11 h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus-visible:ring-primary/20"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="all" className="rounded-xl px-8 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm">
             All Platform Users
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl px-8 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
             Verification Requests
             {pendingEmployers.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                   {pendingEmployers.length}
                </span>
             )}
          </TabsTrigger>
        </TabsList>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
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
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Security</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8 text-right">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {(tab === 'all' ? filteredUsers : pendingEmployers).map((user) => (
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
                               <div className="flex items-center gap-2">
                                  <div className={cn(
                                     "h-2 w-2 rounded-full",
                                     user.role === 'EMPLOYER' ? (user.isApproved ? "bg-emerald-500" : "bg-amber-500") : "bg-emerald-500"
                                  )} />
                                  <span className="text-xs font-bold text-slate-600">
                                     {user.role === 'EMPLOYER' ? (user.isApproved ? 'Approved' : 'Pending Review') : 'Active'}
                                  </span>
                               </div>
                            </TableCell>
                            <TableCell className="py-4 px-8">
                               {user.isVerified ? (
                                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                               ) : (
                                  <ShieldAlert className="h-5 w-5 text-slate-200" />
                               )}
                            </TableCell>
                            <TableCell className="py-4 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                               {tab === 'pending' ? (
                                  <div className="flex justify-end gap-2">
                                     <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => handleApproveEmployer(user.id)}>
                                        <Check className="h-4 w-4" />
                                     </Button>
                                     <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleRejectEmployer(user.id)}>
                                        <X className="h-4 w-4" />
                                     </Button>
                                  </div>
                               ) : (
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
                                        <DropdownMenuItem className="rounded-xl font-bold gap-2 text-red-500" onClick={() => handleUserAction(user.id, 'BAN')}>
                                           <Ban className="h-4 w-4" /> Suspend Account
                                        </DropdownMenuItem>
                                     </DropdownMenuContent>
                                  </DropdownMenu>
                               )}
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
            <div className="bg-slate-900 p-8 text-white relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
               <SheetHeader className="relative z-10">
                  <SheetTitle className="text-white text-2xl font-black uppercase tracking-tight">Identity Details</SheetTitle>
                  <SheetDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Administrative Control</SheetDescription>
               </SheetHeader>
               
               <div className="mt-8 flex items-center gap-4 relative z-10">
                  <Avatar className="h-20 w-20 rounded-[1.5rem] border-4 border-white/10">
                     <AvatarImage src={selectedUser?.avatarUrl} />
                     <AvatarFallback className="bg-primary text-white text-2xl font-black">
                        {selectedUser?.fullName?.charAt(0)}
                     </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                     <h3 className="text-xl font-black">{selectedUser?.fullName || 'Anonymous'}</h3>
                     <Badge className="bg-white/10 text-white border-white/20 font-black text-[10px] uppercase tracking-widest">{selectedUser?.role}</Badge>
                  </div>
               </div>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
               <div className="space-y-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Ecosystem</p>
                     <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center"><Mail className="h-4 w-4" /></div>
                           <span className="text-sm font-bold text-slate-700">{selectedUser?.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center"><Calendar className="h-4 w-4" /></div>
                           <span className="text-sm font-bold text-slate-700 italic">Joined {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                     </div>
                  </div>

                  <Separator className="bg-slate-50" />

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moderation Commands</p>
                     <div className="grid grid-cols-1 gap-3">
                        <Button 
                           variant="outline" 
                           className="rounded-2xl h-14 font-black justify-start gap-3 border-amber-100 bg-amber-50/30 text-amber-600 hover:bg-amber-50"
                           onClick={() => handleUserAction(selectedUser?.id, 'WARN')}
                        >
                           <AlertTriangle className="h-5 w-5" /> Send Policy Warning
                        </Button>
                        <Button 
                           variant="outline" 
                           className="rounded-2xl h-14 font-black justify-start gap-3 border-red-100 bg-red-50/30 text-red-600 hover:bg-red-50"
                           onClick={() => handleUserAction(selectedUser?.id, 'BAN')}
                        >
                           <UserX className="h-5 w-5" /> Suspend Ecosystem Access
                        </Button>
                        <Button 
                           variant="outline" 
                           className="rounded-2xl h-14 font-black justify-start gap-3 border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-50"
                           onClick={() => adminService.grantBadge(selectedUser?.id, true).then(() => toast.success('Badge granted'))}
                        >
                           <ShieldCheck className="h-5 w-5" /> Grant Verification Badge
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100">
               <Button className="w-full h-14 rounded-2xl font-black bg-slate-900" asChild>
                  <Link href={`/developers/${selectedUser?.id}`}>View Public Profile</Link>
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
