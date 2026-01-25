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
import { Badge } from './ui/badge';

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  cliente: string;
}

export function CommentDialog({ isOpen, onClose, saleId, cliente }: CommentDialogProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      text: 'Cliente solicitó cambio en la dirección de entrega',
      author: 'Ana Silva',
      date: '2024-01-15 10:30',
      type: 'info'
    },
    {
      id: 2,
      text: 'Pago confirmado - procesando envío',
      author: 'Sistema',
      date: '2024-01-15 09:15',
      type: 'success'
    }
  ]);

  const handleSubmit = () => {
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        text: comment.trim(),
        author: 'Usuario Actual',
        date: new Date().toLocaleString('es-ES'),
        type: 'user'
      };
      setComments([newComment, ...comments]);
      setComment('');
    }
  };

  const getCommentBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'info':
        return 'bg-blue-100 text-blue-700';
      case 'user':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[75vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-slate-900">
                  Comentarios - Venta #{saleId}
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Ver y agregar comentarios para el cliente: {cliente}
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

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary"
                    className={getCommentBadgeColor(comment.type)}
                  >
                    {comment.author}
                  </Badge>
                  <span className="text-slate-500">{comment.date}</span>
                </div>
              </div>
              <p className="text-slate-700">{comment.text}</p>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hay comentarios aún</p>
            </div>
          )}
        </div>

        {/* Add Comment */}
        <div className="pt-4 border-t border-slate-200">
          <div className="space-y-3">
            <label className="block text-slate-700">Agregar comentario</label>
            <Textarea
              placeholder="Escribe tu comentario aquí..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}