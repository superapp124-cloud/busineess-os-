/**
 * Notification Service
 * Platform Service responsible for dispatching alerts to actors across the enterprise.
 */
export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public dispatch(message: string, recipients: string[]) {
    console.log(`[NotificationService] Dispatching alert to [${recipients.join(', ')}]: "${message}"`);
  }
}
