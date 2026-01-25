import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface AddCommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  cliente: string;
  onSubmit: (comment: string) => void;
}

export function AddCommentDialog({ isOpen, onClose, saleId, cliente, onSubmit }: AddCommentDialogProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-slate-900">
                  Agregar Comentario
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Agregar un nuevo comentario para la venta #{saleId} del cliente {cliente}
                </DialogDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Add Comment Form */}
        <div className="space-y-4 py-4">
          <label className="block text-slate-700">Tu comentario</label>
          <Textarea
            placeholder="Escribe tu comentario aquí..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-200 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!comment.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}