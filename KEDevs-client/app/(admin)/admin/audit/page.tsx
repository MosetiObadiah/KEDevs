'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Calendar, User, Search, FileText } from 'lucide-react';

export default function AdminAuditPage() {
  const [page, setPage] = useState(0);

  const { data: auditPage, isLoading } = useQuery({
    queryKey: ['admin', 'audit', page],
    queryFn: () => adminApi.getAuditLog({ page }),
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground mt-1 font-medium">History of all administrative actions taken on the platform</p>
        </div>
      </div>

      <Card className="rounded-3xl border-secondary shadow-sm">
        <CardHeader>
          <CardTitle>Administrative Actions</CardTitle>
          <CardDescription>A chronological record of flags reviewed, users banned, employer approvals, and spotlight overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          {(!auditPage || auditPage.content.length === 0) ? (
            <div className="py-12 text-center border-2 border-dashed border-secondary/50 rounded-2xl bg-secondary/5">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-bold">No audit logs found</p>
              <p className="text-sm text-muted-foreground mt-1">Actions performed by admins will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-secondary/50 text-muted-foreground text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold">Timestamp</th>
                      <th className="p-4 font-semibold">Admin</th>
                      <th className="p-4 font-semibold">Action</th>
                      <th className="p-4 font-semibold">Target User</th>
                      <th className="p-4 font-semibold">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/50">
                    {auditPage.content.map((log) => (
                      <tr key={log.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="p-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <User className="w-4 h-4 text-primary" />
                            {log.adminName}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-foreground">
                          {log.action}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {log.targetUserName || log.targetUserId || '-'}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground max-w-xs truncate" title={log.reason}>
                          {log.reason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-secondary/50">
                <p className="text-sm text-muted-foreground">
                  Showing page {auditPage.number + 1} of {auditPage.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    disabled={auditPage.first}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    disabled={auditPage.last}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
