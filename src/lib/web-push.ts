import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "mailto:admin@apnaproject.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

export async function sendPushNotification(
  subscriptionJson: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    const subscription = JSON.parse(subscriptionJson) as webpush.PushSubscription;
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export { webpush };
