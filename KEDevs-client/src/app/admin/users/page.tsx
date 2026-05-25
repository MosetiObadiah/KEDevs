'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  UserX, 
  ShieldAlert, 
  Mail, 
  Calendar, 
  Loader2,
  Ban,
  Check,
  X,
  Users,
  Download,
  Filter,
  UserCheck,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminService } from '@/services/adminService';
import { cn, formatDateString, formatTimeString } from '@/lib/utils';
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
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  const [filterAuthProvider, setFilterAuthProvider] = useState('ALL');
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Confirmation Modals State
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningText, setWarningText] = useState('');

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
    const matchesAuthProvider = filterAuthProvider === 'ALL' || u.authProvider === filterAuthProvider;
    
    let matchesAfter = true;
    let matchesBefore = true;
    if (dateAfter || dateBefore) {
      if (!u.lastLoginAt) {
        matchesAfter = false;
        matchesBefore = false;
      } else {
        const uD = new Date(u.lastLoginAt);
        const userDateStr = `${uD.getFullYear()}-${String(uD.getMonth() + 1).padStart(2, '0')}-${String(uD.getDate()).padStart(2, '0')}`;
        matchesAfter = !dateAfter || userDateStr >= dateAfter;
        matchesBefore = !dateBefore || userDateStr <= dateBefore; 
      }
    }
    
    return matchesSearch && matchesRole && matchesStatus && matchesAuthProvider && matchesAfter && matchesBefore;
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (format === 'pdf') {
      try {
        setIsExporting(true);
        const params: any = {};
        if (filterRole !== 'ALL') params.role = filterRole;
        if (filterStatus !== 'ALL') params.status = filterStatus;

        const blob = await adminService.exportUsersPdf(params);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
        toast.success('PDF Database Report generated successfully');
      } catch (e) {
        console.error(e);
        toast.error('Failed to export PDF');
      } finally {
        setIsExporting(false);
      }
      return;
    }

    const headers = ['FullName', 'Email', 'Role', 'Status', 'JoinedAt'];
    const rows = filteredUsers.map(u => [
      `"${u.fullName || ''}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.accountStatus}"`,
      `"${formatDateString(u.createdAt)}"`
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
    toast.success('CSV Exported successfully');
  };

  const handleUserAction = async (userId: string, action: string, notes?: string) => {
    try {
      await adminService.performUserAction(userId, action, notes || 'Moderation action taken');
      const actionText = action === 'REACTIVATE' ? 'reactivated' : action === 'BAN' ? 'deactivated' : action === 'SUSPEND' ? 'suspended' : 'warned';
      toast.success(`User successfully ${actionText}`);
      
      // Locally reflect update instantly for Sidebar
      if (selectedUser && selectedUser.id === userId) {
         setSelectedUser({
            ...selectedUser,
            accountStatus: action === 'REACTIVATE' ? 'ACTIVE' : action === 'BAN' ? 'BANNED' : action === 'SUSPEND' ? 'SUSPENDED' : selectedUser.accountStatus
         });
      }
      fetchUsers();
    } catch (err: any) {
      toast.error('Administrative dispatch failed');
    }
  };

  const handleDeactivateAccount = async () => {
    if (!selectedUser) return;
    await handleUserAction(selectedUser.id, 'BAN');
    setIsDeactivateConfirmOpen(false);
  };

  const handleBadgeAction = async (action: 'GRANT' | 'REVOKE') => {
    if (!selectedUser) return;
    try {
      await adminService.grantBadge(selectedUser.id, action);
      toast.success(`Verified badge successfully ${action === 'GRANT' ? 'granted' : 'revoked'}`);
      setSelectedUser({
        ...selectedUser,
        isVerified: action === 'GRANT'
      });
      fetchUsers();
    } catch (err: any) {
      toast.error('Verified badge action failed');
    }
  };

  const handleEmployerApprovalAction = async (approve: boolean) => {
    if (!selectedUser || !selectedUser.profileId) return;
    try {
      await adminService.approveEmployer(selectedUser.profileId, { approved: approve });
      toast.success(`Employer approval successfully ${approve ? 'granted' : 'revoked'}`);
      setSelectedUser({
        ...selectedUser,
        approvedByAdmin: approve
      });
      fetchUsers();
    } catch (err: any) {
      toast.error('Employer approval action failed');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Filtering Header Bar */}
      <div className="bg-card border border-border shadow-sm p-4 rounded-xl flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
         <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                  placeholder="Search by name or email..." 
                  className="pl-10 h-11 text-sm border-border bg-muted/20 shadow-none font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            {/* Role Select */}
            <Select value={filterRole} onValueChange={setFilterRole}>
               <SelectTrigger className="w-[130px] h-11 border-border bg-muted/20 font-medium">
                  <SelectValue placeholder="Role" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="DEVELOPER">Developer</SelectItem>
                  <SelectItem value="EMPLOYER">Employer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
               </SelectContent>
            </Select>

            {/* Status Select */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
               <SelectTrigger className="w-[140px] h-11 border-border bg-muted/20 font-medium">
                  <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="BANNED">Deactivated</SelectItem>
               </SelectContent>
            </Select>

            {/* Auth Provider Select */}
            <Select value={filterAuthProvider} onValueChange={setFilterAuthProvider}>
               <SelectTrigger className="w-[140px] h-11 border-border bg-muted/20 font-medium">
                  <SelectValue placeholder="Auth Provider" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="ALL">All Providers</SelectItem>
                  <SelectItem value="LOCAL">Local</SelectItem>
                  <SelectItem value="GOOGLE">Google</SelectItem>
               </SelectContent>
            </Select>

            {/* Date Picker Range (Last Login Between) */}
            <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-xl px-3 h-11">
               <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
               <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">Last Login Between</span>
               <input 
                  type="date" 
                  value={dateAfter} 
                  onChange={(e) => setDateAfter(e.target.value)}
                  className="bg-transparent border-none text-xs font-medium outline-none w-[110px]"
               />
               <span className="text-muted-foreground font-black text-xs shrink-0">—</span>
               <input 
                  type="date" 
                  value={dateBefore} 
                  onChange={(e) => setDateBefore(e.target.value)}
                  className="bg-transparent border-none text-xs font-medium outline-none w-[110px]"
               />
            </div>

            {/* Clear Filters Button */}
            {(search || filterRole !== 'ALL' || filterStatus !== 'ALL' || filterAuthProvider !== 'ALL' || dateAfter || dateBefore) && (
               <Button 
                  variant="ghost" 
                  onClick={() => {
                     setSearch('');
                     setFilterRole('ALL');
                     setFilterStatus('ALL');
                     setFilterAuthProvider('ALL');
                     setDateAfter('');
                     setDateBefore('');
                  }}
                  className="h-11 px-3 text-muted-foreground hover:text-foreground font-medium text-xs uppercase tracking-widest gap-2 hover:bg-destructive/5"
               >
                  <XCircle className="h-4 w-4 text-destructive" /> Clear Filters
               </Button>
            )}
         </div>

         {/* Export Dropdown Menu (Style matches /jobs) */}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="outline" className="font-medium gap-2 h-11 border-border shadow-sm shrink-0 w-full lg:w-auto">
                  <Download className="h-4 w-4 text-primary" /> Export
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border border-border bg-card shadow-lg">
               <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer font-medium text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground gap-2 p-3">
                  <FileSpreadsheet className="h-4 w-4 text-cyan-600" /> Download as CSV
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground gap-2 p-3">
                  <FileText className="h-4 w-4 text-primary" /> Print / Save as PDF
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </div>

      {/* Main Users Table Card */}
      <Tabs defaultValue="all" onValueChange={setTab} className="w-full">
        <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
           <CardContent className="p-0">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                   <Loader2 className="h-10 w-10 text-primary animate-spin" />
                   <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Accessing repository...</p>
                </div>
              ) : (
                <Table>
                   <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100">
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8">Identity</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8">Class</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8">Account Status</TableHead>
                         <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 px-8">Last Login At</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {filteredUsers.map((user) => (
                         <TableRow 
                            key={user.id} 
                            className="border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group" 
                            onClick={() => setSelectedUser(user)}
                         >
                            <TableCell className="py-4 px-8">
                               <div className="flex items-center gap-4">
                                  <Avatar className="h-10 w-10 rounded-xl border border-slate-100 group-hover:border-primary/20 transition-colors">
                                     <AvatarImage src={user.avatarUrl} />
                                     <AvatarFallback className="bg-slate-900 text-white font-black text-xs uppercase">
                                        {user.fullName?.charAt(0) || user.email?.charAt(0)}
                                     </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-0.5">
                                     <p className="font-black text-slate-900 text-sm capitalize">{user.fullName || 'Unnamed Account'}</p>
                                     <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Mail className="h-3 w-3" /> {user.email}</p>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell className="py-4 px-8">
                               <Badge variant="outline" className={cn(
                                  "rounded-xl font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5",
                                  user.role === 'DEVELOPER' ? "bg-azure-50 text-azure-600" : "bg-cyan-50 text-cyan-600"
                                )}>
                                  {user.role}
                               </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-8">
                               <Badge 
                                 variant="secondary" 
                                 className={cn(
                                    "rounded-2xl font-black text-[10px] tracking-widest px-2 py-0.5 uppercase",
                                    user.accountStatus === 'ACTIVE' ? "bg-cyan-50 text-cyan-800 dark:bg-cyan-600/20 dark:text-emerald-400" : "bg-slate-100 text-slate-500"
                                 )}
                               >
                                  {user.accountStatus === 'ACTIVE' ? 'ACTIVE' : 'DEACTIVATED'}
                               </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-8">
                               <span className="text-xs font-medium text-slate-500">
                                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                                </span>
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
             {selectedUser && (() => {
                const isEmailVerified = selectedUser.isEmailVerified === true || selectedUser.emailVerified === true;
                const isVerified = selectedUser.isVerified === true || selectedUser.verified === true;
                const approvedByAdmin = selectedUser.approvedByAdmin === true || selectedUser.isApproved === true || selectedUser.approved === true;

                return (
                   <>
                      <div className="bg-card border-b border-border p-8 relative">
                         <SheetHeader className="relative z-10">
                            <SheetTitle className="text-xl font-black tracking-tight">Identity Details</SheetTitle>
                            <SheetDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Administrative Control</SheetDescription>
                         </SheetHeader>
                         
                         <div className="mt-6 flex items-center gap-4 relative z-10">
                            <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
                               <AvatarImage src={selectedUser.avatarUrl} />
                               <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium uppercase">
                                  {selectedUser.fullName?.charAt(0)}
                               </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                               <h3 className="text-lg font-medium capitalize">{selectedUser.fullName || 'Anonymous'}</h3>
                               <Badge className="font-medium text-[10px] uppercase tracking-widest">{selectedUser.role}</Badge>
                            </div>
                         </div>
                      </div>
          
                      <div className="p-8 space-y-6 flex-1 overflow-y-auto no-scrollbar bg-background">
                         <div className="space-y-6">
                            {/* Account Ecosystem Section */}
                            <div className="space-y-4">
                               <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Account Ecosystem</p>
                               <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                     <span className="text-xs font-medium text-slate-500">Account Status</span>
                                     <Badge 
                                       variant="secondary" 
                                       className={cn(
                                          "rounded-2xl font-black text-[9px] tracking-widest px-2 py-0.5 uppercase",
                                          selectedUser.accountStatus === 'ACTIVE' ? "bg-cyan-50 text-cyan-800" : "bg-slate-100 text-slate-500"
                                       )}
                                     >
                                        {selectedUser.accountStatus === 'ACTIVE' ? 'ACTIVE' : 'DEACTIVATED'}
                                     </Badge>
                                  </div>
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                     <span className="text-xs font-medium text-slate-500">Sign-in Method</span>
                                     <span className="text-xs font-extrabold text-slate-700 capitalize">{selectedUser.authProvider?.toLowerCase() || 'local'}</span>
                                  </div>
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                     <span className="text-xs font-medium text-slate-500">Email Status</span>
                                     <Badge 
                                       variant="secondary" 
                                       className={cn(
                                          "rounded-2xl font-black text-[9px] tracking-widest px-2 py-0.5 uppercase",
                                          isEmailVerified ? "bg-cyan-50 text-cyan-600 border border-emerald-200" : "bg-danger-50 text-danger-500 border border-danger-200"
                                       )}
                                     >
                                        {isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                                     </Badge>
                                  </div>
                                  {selectedUser.role === 'EMPLOYER' && (
                                     <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-xs font-medium text-slate-500">Employer Approval</span>
                                        <Badge 
                                          variant="secondary" 
                                          className={cn(
                                             "rounded-2xl font-black text-[9px] tracking-widest px-2 py-0.5 uppercase",
                                             approvedByAdmin ? "bg-cyan-50 text-cyan-600 border border-emerald-200" : "bg-azure-50 text-azure-500 border border-azure-200"
                                          )}
                                        >
                                           {approvedByAdmin ? 'Admin Approved' : 'Pending Approval'}
                                        </Badge>
                                     </div>
                                  )}
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                     <span className="text-xs font-medium text-slate-500">Last Login</span>
                                     <span className="text-xs font-extrabold text-slate-700">
                                        {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}
                                     </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                     <span className="text-xs font-medium text-slate-500">Date Joined</span>
                                     <span className="text-xs font-extrabold text-slate-700">
                                        {formatDate(selectedUser.createdAt)}
                                     </span>
                                  </div>
                               </div>
                            </div>
          
                            <Separator className="bg-border/50" />
          
                            {/* Moderation Commands Section */}
                            <div className="space-y-3">
                               <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Moderation Commands</p>
                               <div className="grid grid-cols-1 gap-2">
                                  {selectedUser.accountStatus !== 'ACTIVE' ? (
                                     <>
                                        {/* Restore Access */}
                                        <Button 
                                           variant="outline" 
                                           className="h-12 font-medium justify-start gap-3 border-emerald-100 bg-cyan-50 text-cyan-800 hover:bg-cyan-50"
                                           onClick={() => handleUserAction(selectedUser.id, 'REACTIVATE')}
                                        >
                                           <UserCheck className="h-4 w-4 text-cyan-600" /> Restore Access
                                        </Button>
                                        <p className="text-[10px] font-medium text-slate-400 text-center italic mt-2">
                                           Restore account access to enable moderation controls.
                                        </p>
                                     </>
                                  ) : (
                                     <>
                                        {/* Warn User */}
                                        <Button 
                                           variant="outline" 
                                           className="h-12 font-medium justify-start gap-3 border-border hover:bg-accent"
                                           onClick={() => setIsWarningModalOpen(true)}
                                        >
                                           <AlertTriangle className="h-4 w-4 text-azure-500" /> Send Warning
                                        </Button>
 
                                        {/* Suspend Access */}
                                        <Button 
                                           variant="outline" 
                                           className="h-12 font-medium justify-start gap-3 border-border hover:bg-destructive/10 text-destructive hover:text-destructive"
                                           onClick={() => handleUserAction(selectedUser.id, 'SUSPEND')}
                                        >
                                           <UserX className="h-4 w-4" /> Suspend Access
                                        </Button>
 
                                        {/* Developer Verified Badge Gate */}
                                        {selectedUser.role === 'DEVELOPER' && (
                                           isVerified ? (
                                              <Button 
                                                 variant="outline" 
                                                 className="h-12 font-medium justify-start gap-3 border-danger-100 bg-danger-50 text-danger-700 hover:bg-danger-50"
                                                 onClick={() => handleBadgeAction('REVOKE')}
                                              >
                                                 <XCircle className="h-4 w-4 text-danger-500" /> Revoke Verified Badge
                                              </Button>
                                           ) : (
                                              <Button 
                                                 variant="outline" 
                                                 className="h-12 font-medium justify-start gap-3 border-emerald-100 bg-cyan-50 text-cyan-800 hover:bg-cyan-50"
                                                 onClick={() => handleBadgeAction('GRANT')}
                                              >
                                                 <ShieldCheck className="h-4 w-4 text-cyan-600" /> Grant Verified Badge
                                              </Button>
                                           )
                                        )}
 
                                        {/* Employer Approval Gate */}
                                        {selectedUser.role === 'EMPLOYER' && (
                                           approvedByAdmin ? (
                                              <Button 
                                                 variant="outline" 
                                                 className="h-12 font-medium justify-start gap-3 border-danger-100 bg-danger-50 text-danger-700 hover:bg-danger-50"
                                                 onClick={() => handleEmployerApprovalAction(false)}
                                              >
                                                 <X className="h-4 w-4 text-danger-500" /> Revoke Approval
                                              </Button>
                                           ) : (
                                              <Button 
                                                 variant="outline" 
                                                 className="h-12 font-medium justify-start gap-3 border-emerald-100 bg-cyan-50 text-cyan-800 hover:bg-cyan-50"
                                                 onClick={() => handleEmployerApprovalAction(true)}
                                              >
                                                 <Check className="h-4 w-4 text-cyan-600" /> Approve Employer
                                              </Button>
                                           )
                                        )}
 
                                        {/* Deactivate Account */}
                                        <Button 
                                           variant="destructive" 
                                           className="h-12 font-medium justify-start gap-3 bg-danger-800 hover:bg-danger-900 text-white shadow-sm"
                                           onClick={() => setIsDeactivateConfirmOpen(true)}
                                        >
                                           <Ban className="h-4 w-4" /> Deactivate Account
                                        </Button>
                                     </>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      {/* Bottom Action Footer */}
                      <div className="p-6 bg-card border-t border-border mt-auto">
                         <Button 
                           className="w-full h-12 font-medium shadow-sm" 
                           disabled={!selectedUser.profileId}
                           asChild={!!selectedUser.profileId}
                         >
                            {selectedUser.profileId ? (
                               <Link href={selectedUser.role === 'EMPLOYER' ? `/companies/${selectedUser.profileId}` : `/developers/${selectedUser.profileId}`}>
                                  View Public Profile
                               </Link>
                            ) : (
                               <span>Profile Not Initialized</span>
                            )}
                         </Button>
                      </div>

                      {/* Permanent Deactivation Confirmation Modal */}
                      {isDeactivateConfirmOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                          <div className="bg-card border border-border max-w-md w-full p-8 rounded-3xl shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3 text-danger-500">
                              <ShieldAlert className="h-6 w-6 animate-pulse text-danger-500" />
                              <h3 className="text-lg font-black tracking-tight text-slate-900">Deactivate Account Permanently?</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                              Are you sure you want to deactivate <span className="font-black text-slate-800 capitalize">{selectedUser.fullName}</span>? 
                              This action is permanent and will restrict their platform access indefinitely.
                            </p>
                            <div className="flex items-center gap-3 justify-end">
                              <Button variant="outline" size="sm" onClick={() => setIsDeactivateConfirmOpen(false)} className="rounded-xl font-medium text-xs">
                                Cancel Action
                              </Button>
                              <Button variant="destructive" size="sm" onClick={handleDeactivateAccount} className="bg-danger-800 hover:bg-danger-900 rounded-xl font-medium text-xs text-white">
                                Deactivate Account Indefinitely
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Custom Warning Dialog Modal */}
                      {isWarningModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                          <div className="bg-card border border-border max-w-md w-full p-8 rounded-3xl shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3 text-azure-500">
                              <AlertTriangle className="h-6 w-6 text-azure-500" />
                              <h3 className="text-lg font-black tracking-tight text-slate-900">Send Administrative Warning</h3>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Warning Message</label>
                              <textarea
                                placeholder="Explain clearly what violation occurred or specify platform guidelines they need to follow..."
                                className="w-full min-h-[120px] rounded-2xl border border-border p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none bg-slate-50/50"
                                value={warningText}
                                onChange={(e) => setWarningText(e.target.value)}
                              />
                            </div>

                            <div className="flex items-center gap-3 justify-end">
                              <Button variant="outline" size="sm" onClick={() => { setIsWarningModalOpen(false); setWarningText(''); }} className="rounded-xl font-medium text-xs">
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                disabled={!warningText.trim()}
                                onClick={async () => {
                                  await handleUserAction(selectedUser.id, 'WARN', warningText);
                                  setIsWarningModalOpen(false);
                                  setWarningText('');
                                }} 
                                className="bg-azure-500 hover:bg-azure-500 rounded-xl font-medium text-xs text-white"
                              >
                                Send Warning Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                   </>
                );
             })()}
           </SheetContent>
      </Sheet>
    </div>
  );
}
