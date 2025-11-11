import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface ImportEquipmentDialogProps {
  children: React.ReactNode;
}

export default function ImportEquipmentDialog({ children }: ImportEquipmentDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          variant: "destructive",
          title: t('equipements.invalidFormat'),
          description: t('equipements.invalidFormatDescription')
        });
        return;
      }
      setFile(selectedFile);
      setUploadStatus('idle');
      setImportResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/equipements/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t('equipements.importError'));
      }

      setUploadStatus('success');
      setImportResult(result);
      
      toast({
        title: t('equipements.importationSuccess'),
        description: `${result.imported} ${t('equipements.equipmentsImported')}`
      });

      // Refresh equipment list
      queryClient.invalidateQueries({ queryKey: ['/api/equipements'] });

      // Reset form after 2 seconds
      setTimeout(() => {
        setFile(null);
        setUploadStatus('idle');
        setImportResult(null);
        setOpen(false);
      }, 2000);

    } catch (error) {
      setUploadStatus('error');
      toast({
        variant: "destructive",
        title: t('equipements.importationError'),
        description: error instanceof Error ? error.message : t('equipements.importError')
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('equipements.importTitle')}</DialogTitle>
          <DialogDescription>
            {t('equipements.importDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="excel-file">{t('equipements.excelFile')}</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
              data-testid="input-excel-file"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                {t('equipements.fileSelected')}: {file.name}
              </p>
            )}
          </div>

          {importResult && uploadStatus === 'success' && (
            <div className="rounded-lg border border-green-600/20 bg-green-600/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-green-600">
                    {importResult.imported} {t('equipements.equipmentsImported')}
                  </p>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">{t('equipements.errors')} :</p>
                      <ul className="list-disc list-inside">
                        {importResult.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="rounded-lg border border-red-600/20 bg-red-600/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">
                  {t('equipements.importError')}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1"
              data-testid="button-upload-excel"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('equipements.importing')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('equipements.import')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
