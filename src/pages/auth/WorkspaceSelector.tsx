import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/core/tenant/TenantContext';
import { Building2, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const WorkspaceSelector = () => {
 const navigate = useNavigate();
 const { organizations, setActiveOrganization, loading, refreshOrganizations } = useTenant();

 const handleSelectOrg = (org: any) => {
   setActiveOrganization(org);
   navigate('/desktop/business-os'); // Route to Business OS / Intent OS kernel
 };

 const handleCreateOrg = async () => {
   // In a real app, open a modal to name the org
   navigate('/desktop/business-os?action=new-org');
 };

 if (loading) {
   return <div className="flex h-screen items-center justify-center">Loading Workspaces...</div>;
 }

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
 <div className="max-w-4xl w-full space-y-8">
 <div className="text-center">
 <h1 className="text-display tracking-tight text-gray-900 dark:text-white">Choose your Organization</h1>
 <p className="mt-4 text-section text-gray-600 dark:text-gray-400">
 Select an organization to continue to Intent OS.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
 {organizations.length === 0 ? (
   <Card className="col-span-3 border-dashed border-2 bg-transparent text-center p-12">
     <CardTitle className="mb-4">No Organizations Found</CardTitle>
     <CardDescription className="mb-6">You aren't a member of any organizations yet.</CardDescription>
     <Button onClick={handleCreateOrg}>Create Organization</Button>
   </Card>
 ) : (
   organizations.map(org => (
     <Card key={org.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleSelectOrg(org)}>
     <CardHeader className="text-center pb-4">
     <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
     <Building2 className="w-8 h-8 text-primary" />
     </div>
     <CardTitle>{org.name}</CardTitle>
     <CardDescription>{org.slug ? `@${org.slug}` : 'Organization'}</CardDescription>
     </CardHeader>
     <CardContent>
     <Button className="w-full mt-6" variant="outline">Select</Button>
     </CardContent>
     </Card>
   ))
 )}
 
 {/* Create New Option always available */}
 {organizations.length > 0 && (
   <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer border-2 bg-transparent flex flex-col items-center justify-center min-h-[300px]" onClick={handleCreateOrg}>
     <div className="mx-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
       <User className="w-8 h-8 text-slate-500" />
     </div>
     <CardTitle className="text-slate-500">Create New</CardTitle>
   </Card>
 )}
 </div>
 </div>
 </div>
 );
};
