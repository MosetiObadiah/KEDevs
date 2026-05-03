'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Search, AlertCircle, CheckCircle2, XCircle, Shield, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionConfig, setActionConfig] = useState<{ userId: string, action: string, title: string } | null>(null);
  const [reason, setReason] = useState('');

  const { data: usersPage, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', searchTerm],
    queryFn: () => adminApi.getUsers({ search: searchTerm, size: 20 }),
  });

  const { data: pendingEmployers, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin', 'pendingEmployers'],
    queryFn: adminApi.getPendingEmployers,
  });

  const performActionMutation = useMutation({
    mutationFn: ({ userId, action, reason }: any) => adminApi.performUserAction(userId, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setActionModalOpen(false);
      setReason('');
      toast.success('User action successful');
    },
    onError: () => toast.error('Failed to perform user action')
  });

  const approveEmployerMutation = useMutation({
    mutationFn: ({ profileId, approved }: any) => adminApi.approveEmployer(profileId, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingEmployers'] });
      toast.success('Employer approval status updated');
    },
    onError: () => toast.error('Failed to update employer approval status')
  });

  const handleActionClick = (userId: string, action: string, title: string) => {
    setActionConfig({ userId, action, title });
    setActionModalOpen(true);
  };

  const submitAction = () => {
    if (actionConfig) {
      performActionMutation.mutate({ userId: actionConfig.userId, action: actionConfig.action, reason });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage users, roles, and pending approvals</p>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="bg-white border border-secondary rounded-2xl h-14 p-1.5 shadow-sm">
          <TabsTrigger value="all" className="rounded-xl font-bold px-8 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary">
            <Users className="w-4 h-4 mr-2" />
            All Users
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl font-bold px-8 data-[state=active]:bg-secondary/10 data-[state=active]:text-primary">
            <AlertCircle className="w-4 h-4 mr-2" />
            Pending Employers
            {pendingEmployers && pendingEmployers.length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white border-transparent px-1.5 py-0.5 text-[10px]">{pendingEmployers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="all" className="outline-none space-y-4">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, email..." 
                    className="pl-10 border-secondary focus:border-primary rounded-xl h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (!usersPage || usersPage.content.length === 0) ? (
                <div className="text-center py-12 text-muted-foreground">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-secondary/50 text-muted-foreground text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Joined</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/50">
                      {usersPage.content.map((user) => (
                        <tr key={user.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-foreground">{user.fullName || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="font-bold text-[10px]">{user.role}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={`
                              ${user.accountStatus === 'ACTIVE' ? 'bg-primary/20 text-primary border-primary/30' : 
                                user.accountStatus === 'BANNED' ? 'bg-red-100 text-red-700 border-red-200' : 
                                'bg-amber-100 text-amber-700 border-amber-200'}
                              px-2 py-0.5 rounded-md font-bold text-[10px] tracking-widest border uppercase
                            `}>
                              {user.accountStatus}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 rounded-xl hover:bg-secondary/10 flex items-center justify-center transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                {user.accountStatus === 'ACTIVE' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleActionClick(user.id, 'WARN', 'Warn User')}>Warn</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleActionClick(user.id, 'SUSPEND', 'Suspend User')}>Suspend</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleActionClick(user.id, 'BAN', 'Ban User')} className="text-red-600 focus:text-red-600">Ban</DropdownMenuItem>
                                  </>
                                )}
                                {(user.accountStatus === 'SUSPENDED' || user.accountStatus === 'BANNED') && (
                                  <DropdownMenuItem onClick={() => handleActionClick(user.id, 'REACTIVATE', 'Reactivate User')} className="text-primary focus:text-primary">Reactivate</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Employers Tab */}
        <TabsContent value="pending" className="outline-none space-y-4">
          <Card className="rounded-3xl border-secondary shadow-sm">
            <CardContent className="p-6">
              {pendingLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (!pendingEmployers || pendingEmployers.length === 0) ? (
                <div className="text-center py-12 text-muted-foreground">No pending employers</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingEmployers.map((emp) => (
                    <div key={emp.id} className="p-4 border border-secondary rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{emp.fullName}</h4>
                          <span className="text-xs text-muted-foreground">{new Date(emp.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{emp.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => approveEmployerMutation.mutate({ profileId: emp.id, approved: true })} // Ideally this needs profileId, but backend might accept userId or we fetch profile
                          disabled={approveEmployerMutation.isPending}
                          className="flex-1 bg-primary hover:bg-[#2a6f4d] text-white font-bold h-10"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => approveEmployerMutation.mutate({ profileId: emp.id, approved: false })}
                          disabled={approveEmployerMutation.isPending}
                          className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold h-10 border-secondary"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{actionConfig?.title}</DialogTitle>
            <DialogDescription>
              Please provide a reason for this action. This will be recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={submitAction} 
              disabled={!reason.trim() || performActionMutation.isPending}
              className={actionConfig?.action === 'BAN' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            >
              {performActionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
