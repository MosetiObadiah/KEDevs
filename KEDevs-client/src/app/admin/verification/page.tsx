'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Check, 
  X, 
  FileText, 
  Calendar, 
  Users, 
  Building2, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  FileSearch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

const mockVerifications = [
  { id: 'v1', name: 'Jane Doe', type: 'DEVELOPER', status: 'Under Review', date: '2024-05-01', docs: ['National ID', 'Degree Cert'] },
  { id: 'v2', name: 'John Smith', type: 'DEVELOPER', status: 'Under Review', date: '2024-05-02', docs: ['Passport'] },
  { id: 'v3', name: 'TechFlow Solutions', type: 'EMPLOYER', status: 'Under Review', date: '2024-05-03', docs: ['Cert of Inc', 'KRA Pin'] },
];

export default function VerificationQueue() {
  const [tab, setTab] = useState('DEVELOPER');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  const filtered = mockVerifications.filter(v => v.type === tab);

  const handleApprove = () => {
     toast.success('Identity verified successfully');
     setIsPreviewOpen(false);
  };

  const handleReject = () => {
     toast.error('Identity verification rejected');
     setIsPreviewOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <ShieldCheck className="h-8 w-8 text-primary" /> Verification Queue
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Review identity documents and verify users</p>
         </div>
      </div>

      <Tabs defaultValue="DEVELOPER" onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="DEVELOPER" className="rounded-xl px-8 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
             <Users className="h-4 w-4" /> Developers
          </TabsTrigger>
          <TabsTrigger value="EMPLOYER" className="rounded-xl px-8 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
             <Building2 className="h-4 w-4" /> Employers
          </TabsTrigger>
        </TabsList>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
           <CardContent className="p-0">
              <Table>
                 <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100">
                       <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Applicant</TableHead>
                       <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Submission Date</TableHead>
                       <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Documents</TableHead>
                       <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8">Status</TableHead>
                       <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 px-8 text-right">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {filtered.map((req) => (
                       <TableRow key={req.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <TableCell className="py-4 px-8 font-black text-slate-900">{req.name}</TableCell>
                          <TableCell className="py-4 px-8">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Calendar className="h-3 w-3 text-primary" /> {req.date}
                             </div>
                          </TableCell>
                          <TableCell className="py-4 px-8">
                             <div className="flex flex-wrap gap-1.5">
                                {req.docs.map(doc => (
                                   <Badge key={doc} variant="outline" className="rounded-lg bg-slate-50 border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                                      {doc}
                                   </Badge>
                                ))}
                             </div>
                          </TableCell>
                          <TableCell className="py-4 px-8">
                             <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[10px] uppercase tracking-widest px-2 py-0.5">
                                {req.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-8 text-right">
                             <div className="flex justify-end gap-2">
                                <Button 
                                   size="sm" 
                                   variant="outline" 
                                   className="rounded-xl font-black gap-2 h-9 border-slate-100"
                                   onClick={() => { setSelectedReq(req); setIsPreviewOpen(true); }}
                                >
                                   <Eye className="h-4 w-4" /> View Docs
                                </Button>
                                <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl text-emerald-600 border-slate-100 hover:bg-emerald-50" onClick={handleApprove}>
                                   <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl text-red-600 border-slate-100 hover:bg-red-50" onClick={handleReject}>
                                   <X className="h-4 w-4" />
                                </Button>
                             </div>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </CardContent>
        </Card>
      </Tabs>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
         <DialogContent className="sm:max-w-4xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-slate-900 p-8 text-white">
               <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Identity Verification Review</DialogTitle>
                  <DialogDescription className="sr-only">
                     Detailed review of the applicant's identity documents and verification status.
                  </DialogDescription>
                  <div className="flex items-center gap-4 mt-2">
                     <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Applicant: {selectedReq?.name}</p>
                     <Separator orientation="vertical" className="h-3 bg-slate-700" />
                     <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{selectedReq?.type}</p>
                  </div>
               </DialogHeader>
            </div>

            <div className="p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Submitted Documents</h4>
                     <div className="space-y-3">
                        {selectedReq?.docs.map((doc: string) => (
                           <div key={doc} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-3">
                                 <FileText className="h-5 w-5 text-primary" />
                                 <span className="font-bold text-slate-900">{doc}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase text-primary">Preview</Button>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="aspect-[4/3] rounded-[2rem] bg-slate-100 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-4">
                     <FileSearch className="h-16 w-16 opacity-20" />
                     <p className="font-black text-sm uppercase tracking-widest opacity-40">Document Preview Mock</p>
                  </div>
               </div>

               <Separator className="bg-slate-50" />

               <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex gap-4">
                  <ShieldAlert className="h-6 w-6 text-blue-500 shrink-0" />
                  <p className="text-xs font-medium text-blue-700 leading-relaxed">
                     Please ensure all document details (Full Name, ID Number, Expiry) match the platform profile before granting verification badges.
                  </p>
               </div>
            </div>

            <DialogFooter className="bg-slate-50 p-8 flex flex-row justify-end gap-4">
               <Button variant="ghost" className="rounded-2xl font-black h-14 px-8 text-red-500 hover:bg-red-50" onClick={handleReject}>
                  Reject Identity
               </Button>
               <Button className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20" onClick={handleApprove}>
                  Approve & Grant Badge
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
