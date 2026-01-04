/**
 * Haptic Feedback Utility
 * Provides tactile feedback for mobile devices using the Vibration API
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Vibration patterns in milliseconds
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20, 50, 30], // Ascending pattern for success
  warning: [30, 50, 30], // Double tap for warning
  error: [50, 30, 50, 30, 50], // Triple buzz for error
  selection: 5, // Very light for selections
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 * @param pattern - The type of haptic feedback to trigger
 */
export function triggerHaptic(pattern: HapticPattern = 'medium'): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail - haptics are enhancement, not critical
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Cancel any ongoing haptic feedback
 */
export function cancelHaptic(): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(0);
  } catch (error) {
    console.debug('Could not cancel haptic:', error);
  }
}

/**
 * Custom haptic pattern
 * @param pattern - Array of vibration/pause durations in ms
 */
export function triggerCustomHaptic(pattern: number[]): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.debug('Custom haptic not available:', error);
  }
}

/**
 * Celebration haptic - special pattern for achievements
 */
export function triggerCelebration(): void {
  if (!isHapticSupported()) {
    return;
  }

  // Exciting ascending pattern
  const celebrationPattern = [
    10, 30, // light
    20, 30, // medium
    30, 30, // heavy
    15, 20, // light
    25, 20, // medium
    40, 30, // heavy
    20, 20, // medium
    50,     // final heavy
  ];

  try {
    navigator.vibrate(celebrationPattern);
  } catch (error) {
    console.debug('Celebration haptic not available:', error);
  }
}

export default {
  trigger: triggerHaptic,
  cancel: cancelHaptic,
  custom: triggerCustomHaptic,
  celebration: triggerCelebration,
  isSupported: isHapticSupported,
};
