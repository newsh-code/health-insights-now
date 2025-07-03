
import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  if (uploadedFile && !isProcessing) {
    return (
      <Card className="p-8 border-2 border-green-200 bg-green-50">
        <div className="flex items-center justify-center space-x-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">File Uploaded Successfully</h3>
            <p className="text-sm text-green-600">{uploadedFile.name}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-blue-400 ${
        isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2 text-gray-700">
          Upload Your Blood Test Results
        </h3>
        <p className="text-gray-500 mb-6">
          Drag & drop your PDF or photo here, or click to browse
        </p>
        
        <div className="flex justify-center space-x-4 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Image className="w-4 h-4" />
            <span>JPG, PNG</span>
          </div>
        </div>

        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Choose File
        </label>
        
        <p className="text-xs text-gray-400 mt-4">
          <span className="font-medium">Privacy:</span> We automatically redact personal info like names & barcodes
        </p>
      </div>
    </Card>
  );
};
