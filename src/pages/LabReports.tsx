import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Download, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { HealthBottomNav } from '@/components/health/HealthBottomNav';
import { SEOHead } from '@/components/SEOHead';

interface LabReport {
  id: string;
  report_name: string;
  file_url: string;
  file_type: string;
  category: string;
  test_date: string;
  notes: string;
  created_at: string;
}

export default function LabReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: '',
    testDate: '',
    notes: '',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading reports',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadForm({ ...uploadForm, name: file.name });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('lab-reports')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lab-reports')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('lab_reports')
        .insert({
          user_id: user.id,
          report_name: uploadForm.name,
          file_url: publicUrl,
          file_type: selectedFile.type,
          category: uploadForm.category,
          test_date: uploadForm.testDate,
          notes: uploadForm.notes,
        });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Lab report uploaded successfully',
      });

      setSelectedFile(null);
      setUploadForm({ name: '', category: '', testDate: '', notes: '' });
      loadReports();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (report: LabReport) => {
    try {
      const { error } = await supabase
        .from('lab_reports')
        .delete()
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report deleted successfully',
      });

      loadReports();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SEOHead
        title="Lab Reports & Diagnostics | CHATR Health OS"
        description="Securely upload and view your medical test results and diagnostic reports."
      />

      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
          <div className="px-4 py-3 max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/health')}
                className="h-8 w-8 rounded-full"
                aria-label="Back to Health Hub"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">Lab Reports</h1>
                <p className="text-[11px] text-muted-foreground">Diagnostic records & test results</p>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl h-8 text-xs gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Lab Report</DialogTitle>
                  <DialogDescription>Add a new medical test result or lab report</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File (PDF or Image)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Report Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Complete Blood Count (CBC)"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={uploadForm.category}
                      onValueChange={(val) => setUploadForm({ ...uploadForm, category: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood">Blood Test</SelectItem>
                        <SelectItem value="imaging">Imaging (X-Ray, MRI, CT)</SelectItem>
                        <SelectItem value="urine">Urine Analysis</SelectItem>
                        <SelectItem value="biopsy">Biopsy / Pathology</SelectItem>
                        <SelectItem value="cardiac">Cardiac (ECG, Echo)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="testDate">Test Date</Label>
                    <Input
                      id="testDate"
                      type="date"
                      value={uploadForm.testDate}
                      onChange={(e) => setUploadForm({ ...uploadForm, testDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Doctor notes, abnormal findings, etc."
                      value={uploadForm.notes}
                      onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile || !uploadForm.name}
                    className="w-full"
                  >
                    {uploading ? 'Uploading...' : 'Save Report'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 pt-4 max-w-lg mx-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl border border-border/70">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-foreground">No lab reports yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Upload your blood tests, scans, or prescriptions to keep your health records organized.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload your first report
                  </Button>
                </DialogTrigger>
              </Dialog>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report.id} className="p-4 rounded-2xl border border-border/70 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{report.report_name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="capitalize">{report.category}</span>
                        <span>•</span>
                        <span>{format(new Date(report.test_date || report.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {report.notes && (
                        <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2 bg-muted/40 p-2 rounded-lg">
                          {report.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(report.file_url, '_blank')}
                      className="flex-1 h-8 text-xs rounded-xl gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(report.file_url, '_blank')}
                      className="flex-1 h-8 text-xs rounded-xl gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(report)}
                      className="h-8 w-8 p-0 rounded-xl text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* ── PERSISTENT HEALTH OS BOTTOM NAVIGATION ─────────────────────── */}
        <HealthBottomNav />
      </div>
    </>
  );
}
