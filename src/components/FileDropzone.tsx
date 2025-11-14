import { useCallback, useState, DragEvent } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
interface FileDropzoneProps {
  onFileChange: (file: File | null) => void;
  className?: string;
  file: File | null;
}
export function FileDropzone({ onFileChange, className, file }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleFile = useCallback((selectedFile: File | null) => {
    setError(null);
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError('Only .csv files are accepted.');
        onFileChange(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        setError('File size should be less than 5MB.');
        onFileChange(null);
        return;
      }
    }
    onFileChange(selectedFile);
  }, [onFileChange]);
  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };
  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        'relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out',
        isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50 hover:bg-primary/5',
        className
      )}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept=".csv"
      />
      {file ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <FileIcon className="w-12 h-12 text-primary" />
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{file.name}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isDragActive ? 'Drop the file here...' : "Drag 'n' drop a CSV file here, or click to select"}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}