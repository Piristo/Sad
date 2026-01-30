export const haptic = {
  /**
   * A collision between UI elements occurred.
   * - light: collision of small UI elements
   * - medium: collision of medium-sized UI elements
   * - heavy: collision of large UI elements
   * - rigid: rigid collision
   * - soft: soft collision
   */
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    console.log('Haptic impact called:', style);
    console.log('Telegram available:', !!window.Telegram);
    console.log('WebApp available:', !!window.Telegram?.WebApp);
    console.log('HapticFeedback available:', !!window.Telegram?.WebApp?.HapticFeedback);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      console.log('Triggering haptic impact:', style);
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    } else {
      console.log('HapticFeedback not available');
      // Fallback: try to use native vibration if available
      if ('vibrate' in navigator) {
        console.log('Using native vibration as fallback');
        const pattern = style === 'light' ? 50 : style === 'medium' ? 100 : 200;
        navigator.vibrate(pattern);
      }
    }
  },

  /**
   * A notification feedback.
   * - error: indicates that a task or action has failed
   * - success: indicates that a task or action has completed successfully
   * - warning: indicates that a task or action produced a warning
   */
  notification: (type: 'error' | 'success' | 'warning') => {
    console.log('Haptic notification called:', type);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      console.log('Triggering haptic notification:', type);
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    } else {
      console.log('HapticFeedback not available');
      // Fallback: try to use native vibration if available
      if ('vibrate' in navigator) {
        console.log('Using native vibration as fallback');
        const pattern = type === 'error' ? [100, 50, 100] : type === 'success' ? 150 : 100;
        navigator.vibrate(pattern);
      }
    }
  },

  /**
   * A selection change feedback.
   */
  selection: () => {
    console.log('Haptic selection called');
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      console.log('Triggering haptic selection');
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    } else {
      console.log('HapticFeedback not available');
      // Fallback: try to use native vibration if available
      if ('vibrate' in navigator) {
        console.log('Using native vibration as fallback');
        navigator.vibrate(25);
      }
    }
  }
};