// ─── Shared utility helpers ────────────────────────────────────

export const formatCurrency = (amount: number | string | null | undefined): string => {
  const num = parseFloat(String(amount || 0));
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending:    '#F59E0B',
    confirmed:  '#3B82F6',
    assigned:   '#8B5CF6',
    in_progress:'#F97316',
    completed:  '#10B981',
    delivered:  '#D4AF37',
    cancelled:  '#EF4444',
    failed:     '#EF4444',
    refunded:   '#8B5CF6',
  };
  return colors[status] || '#6B7280';
};

export const getStatusBg = (status: string): string => {
  const colors: Record<string, string> = {
    pending:    '#FEF3C7',
    confirmed:  '#DBEAFE',
    assigned:   '#EDE9FE',
    in_progress:'#FFEDD5',
    completed:  '#D1FAE5',
    delivered:  '#FEF9C3',
    cancelled:  '#FEE2E2',
    failed:     '#FEE2E2',
    refunded:   '#EDE9FE',
  };
  return colors[status] || '#F3F4F6';
};

export const capitalize = (str: string): string =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ') : '';
