export const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
  if (typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast({ type, title, message });
  } else {
    console.warn('Toast system not available');
  }
};

export const showSuccessToast = (title: string, message?: string) => {
  showToast('success', title, message);
};

export const showErrorToast = (title: string, message?: string) => {
  showToast('error', title, message);
};

export const showWarningToast = (title: string, message?: string) => {
  showToast('warning', title, message);
};

export const showInfoToast = (title: string, message?: string) => {
  showToast('info', title, message);
};

// Safe version that won't throw errors if toast system is not available
export const safeShowToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
  try {
    showToast(type, title, message);
  } catch (error) {
    console.warn('Toast system error:', error);
    // Fallback to console for debugging
    console.log(`[${type.toUpperCase()}] ${title}: ${message || ''}`);
  }
}; 