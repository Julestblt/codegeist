import React from 'react';
import { Upload, FileArchive, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileDropZoneProps {
  isDragging: boolean;
  isProcessing: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileSelect: () => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  isDragging,
  isProcessing,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect
}) => {
  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
        isDragging
          ? 'border-blue-400 bg-blue-50 scale-105'
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onFileSelect}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl"></div>
      </div>

      <div className="relative space-y-8">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300 group-hover:scale-110">
          <FileArchive className="w-10 h-10 text-blue-600" />
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            Téléchargez Votre Projet
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            Glissez-déposez un fichier ZIP contenant votre projet, ou cliquez pour parcourir
          </p>
          
          <div className="pt-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={onFileSelect}
              className="hover:scale-105"
            >
              <Upload className="w-5 h-5 mr-3" />
              Sélectionner un fichier ZIP
            </Button>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileArchive className="w-4 h-4 text-green-600" />
            </div>
            <span>Archives ZIP supportées</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <span>Jusqu'à 100MB</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Github className="w-4 h-4 text-purple-600" />
            </div>
            <span>Intégration Git</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDropZone;