import React from 'react';
import { Upload, FileArchive, FolderOpen, Github, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ProjectConfigFormProps {
  selectedFile: File;
  projectName: string;
  gitUrl: string;
  isProcessing: boolean;
  error: string | null;
  onProjectNameChange: (value: string) => void;
  onGitUrlChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProjectConfigForm: React.FC<ProjectConfigFormProps> = ({
  selectedFile,
  projectName,
  gitUrl,
  isProcessing,
  error,
  onProjectNameChange,
  onGitUrlChange,
  onSubmit,
  onCancel
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="shadow-xl border-gray-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-0">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Configuration du Projet</h3>
                  <p className="text-blue-100">Configurez les détails de votre projet</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileArchive className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{selectedFile.name}</h4>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)} • Archive ZIP
                </p>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Prêt à traiter
              </div>
            </div>
          </div>

          <div className="px-8 py-8 space-y-6">
            <div className="space-y-3">
              <label htmlFor="projectName" className="block text-sm font-semibold text-gray-900">
                Nom du Projet *
              </label>
              <div className="relative">
                <Input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => onProjectNameChange(e.target.value)}
                  placeholder="Entrez le nom de votre projet"
                  className="pr-12 h-12 rounded-xl"
                  disabled={isProcessing}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <FolderOpen className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Choisissez un nom descriptif pour votre projet
              </p>
            </div>

            <div className="space-y-3">
              <label htmlFor="gitUrl" className="block text-sm font-semibold text-gray-900">
                URL du Repository Git
                <span className="text-gray-500 font-normal ml-1">(Optionnel)</span>
              </label>
              <div className="relative">
                <Input
                  id="gitUrl"
                  type="url"
                  value={gitUrl}
                  onChange={(e) => onGitUrlChange(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="pl-12 h-12 rounded-xl"
                  disabled={isProcessing}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Github className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Lien vers votre repository pour un meilleur suivi et collaboration
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Erreur</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isProcessing || !projectName.trim()}
                variant="default"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Démarrer l'Analyse
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectConfigForm;