import { useState } from 'react';
import { LogisticStatus } from '../../types';

interface TabCorreoViewModelProps {
  onUpdateLogistic?: (status: LogisticStatus, comment: string) => Promise<void>;
}

export function useTabCorreoViewModel({ onUpdateLogistic }: TabCorreoViewModelProps) {
  const [showLogisticForm, setShowLogisticForm] = useState(false);
  const [newLogistic, setNewLogistic] = useState<LogisticStatus | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogisticSubmit = async () => {
    if (!newLogistic || !onUpdateLogistic) return;
    setIsSubmitting(true);
    try {
      await onUpdateLogistic(newLogistic as LogisticStatus, comment);
      setShowLogisticForm(false);
      setNewLogistic('');
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const state = { showLogisticForm, newLogistic, comment, isSubmitting };
  const actions = { setShowLogisticForm, setNewLogistic, setComment, handleLogisticSubmit };

  return { state, actions };
}
