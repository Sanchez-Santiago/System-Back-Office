import { useState } from 'react';
import { SaleStatus, LogisticStatus } from '../../types';

interface TabEstadosViewModelProps {
  onUpdateStatus?: (status: SaleStatus, comment: string) => Promise<void>;
  onUpdateLogistic?: (status: LogisticStatus, comment: string) => Promise<void>;
}

export function useTabEstadosViewModel({ onUpdateStatus, onUpdateLogistic }: TabEstadosViewModelProps) {
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showLogisticForm, setShowLogisticForm] = useState(false);
  const [newStatus, setNewStatus] = useState<SaleStatus | ''>('');
  const [newLogistic, setNewLogistic] = useState<LogisticStatus | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusSubmit = async () => {
    if (!newStatus || !onUpdateStatus) return;
    setIsSubmitting(true);
    try {
      await onUpdateStatus(newStatus as SaleStatus, comment);
      setShowStatusForm(false);
      setNewStatus('');
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const openStatusForm = () => {
    setShowStatusForm(true);
    setShowLogisticForm(false);
  };

  const openLogisticForm = () => {
    setShowLogisticForm(true);
    setShowStatusForm(false);
  };

  const state = {
    showStatusForm, showLogisticForm, newStatus, newLogistic,
    comment, isSubmitting,
  };

  const actions = {
    setNewStatus, setNewLogistic, setComment,
    setShowStatusForm, setShowLogisticForm,
    handleStatusSubmit, handleLogisticSubmit,
    openStatusForm, openLogisticForm,
  };

  return { state, actions };
}
