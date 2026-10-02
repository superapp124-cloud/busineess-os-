/**
 * WellnessCoachService — CHATR Lifestyle Notification Engine
 *
 * Schedules smart, varied, non-intrusive local notifications for:
 *  - 🍽️  Meal reminders (4x/day)
 *  - 💧  Hydration nudges (every 2 hrs, 7 AM–8 PM)
 *  - 🚶  Walk encouragement (morning, afternoon, evening)
 *  - 😴  Sleep wind-down (gradual, 9:30–10:30 PM)
 *
 * Background & Process-Killed Reliability:
 *  - Explicit NotificationChannel with Importance 5 (MAX) & Visibility 1 (Public lockscreen)
 *  - Uses AlarmManager.RTC_WAKEUP via `allowWhileIdle: true`
 *  - Android USE_EXACT_ALARM & SCHEDULE_EXACT_ALARM support
 *  - Survives app killed / swiped away / device reboot (LocalNotificationRestoreReceiver)
 *  - Includes 10-second live test helper to verify background alert on device
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// ─── Preferences ──────────────────────────────────────────────────────────────

export interface WellnessCoachPrefs {
  enabled: boolean;
  meals: boolean;
  hydration: boolean;
  walk: boolean;
  sleep: boolean;
}

const PREFS_KEY = 'chatr_wellness_coach_prefs';

export const DEFAULT_PREFS: WellnessCoachPrefs = {
  enabled: true,
  meals: true,
  hydration: true,
  walk: true,
  sleep: true,
};

// ─── Notification Definitions ─────────────────────────────────────────────────

interface NotifSlot {
  id: number;
  hour: number;
  minute: number;
  title: string;
  body: string;
  smallIcon?: string;
}

/** Picks a deterministic variant based on the current weekday */
function pick<T>(arr: T[]): T {
  return arr[new Date().getDay() % arr.length];
}

function getMealSlots(): NotifSlot[] {
  return [
    {
      id: 2001, hour: 8, minute: 0,
      title: pick(['🌅 Good morning, Arshid!', '☀️ Rise & Fuel Up!', '🌤️ Morning fuel time!']),
      body: pick([
        "Breakfast is the spark for your metabolism. Don't skip it — even 10 min of prep pays off all day.",
        "Your body ran on reserves all night. Breakfast now = steady energy till lunch.",
        "Greek yogurt, poha, or eggs — any choice beats skipping. Eat now! 💪",
      ]),
    },
    {
      id: 2002, hour: 13, minute: 0,
      title: pick(['🥗 Lunch time!', '🍲 Midday fuel check!', '☀️ 1 PM — eat well!']),
      body: pick([
        "Skipping lunch leads to a 4 PM sugar crash. A proper meal now keeps your brain sharp.",
        "Dal + roti + sabzi — the Indian powerplate that fuels you without the post-lunch slump.",
        "Eat lunch, then take a short walk. Best combo for your afternoon productivity. 🏃",
      ]),
    },
    {
      id: 2003, hour: 16, minute: 30,
      title: pick(['🍿 Smart snack time!', '🥜 4:30 PM — refuel!', '⚡ Evening snack alert!']),
      body: pick([
        "Roasted makhana, sprout chaat, or 10 almonds. Beat the 4 PM craving the smart way.",
        "Hungry now? A palm-size protein snack prevents overeating at dinner.",
        "A handful of nuts + a glass of water kills 90% of late-afternoon hunger. Try it now!",
      ]),
    },
    {
      id: 2004, hour: 19, minute: 30,
      title: pick(['🌙 Dinner time!', '🍽️ Keep dinner light!', '🌿 Evening meal!']),
      body: pick([
        "Light dinner = better sleep. Paneer, sabzi, and 1-2 rotis is perfect for tonight.",
        "Eat 2 hrs before bed for deeper sleep. Tonight's goal: protein + veggies + light carbs.",
        "Your dinner today determines tomorrow's energy. Keep it balanced and colourful 🥦",
      ]),
    },
  ];
}

function getHydrationSlots(): NotifSlot[] {
  const messages = [
    "Thirst often disguises itself as hunger. Drink up first!",
    "60% of people confuse dehydration for fatigue. Your next glass 👇",
    "Water powers every cell. A full glass right now — go!",
    "You're likely 10% dehydrated already. Time to fix that!",
    "Lemon water, plain water, coconut water — any works. Just drink!",
    "Your skin, brain, and kidneys all need that glass. Pour it! 💧",
    "A tall glass of water before your next task boosts focus by 14%. Go!",
  ];
  const emojis = ['💧', '🚰', '💦', '🫗', '🌊', '⚗️', '🧊'];

  return [
    { id: 2011, hour: 7, minute: 30, title: `${emojis[0]} Morning hydration check`, body: 'Start the day with 2 glasses of water before anything else. Your body is waiting.' },
    { id: 2012, hour: 9, minute: 30, title: `${emojis[1]} Time for a glass of water!`, body: messages[1] },
    { id: 2013, hour: 11, minute: 30, title: `${emojis[2]} Mid-morning water break`, body: messages[2] },
    { id: 2014, hour: 14, minute: 0, title: `${emojis[3]} Post-lunch hydration`, body: 'A glass of water aids digestion. Drink it now before your afternoon picks up speed.' },
    { id: 2015, hour: 16, minute: 0, title: `${emojis[4]} Hydration reminder`, body: messages[4] },
    { id: 2016, hour: 18, minute: 0, title: `${emojis[5]} Evening water check`, body: messages[5] },
    { id: 2017, hour: 20, minute: 0, title: `${emojis[6]} Last hydration call!`, body: 'Hit your 2-litre goal before 10 PM. Last chance to top up for today!' },
  ];
}

function getWalkSlots(): NotifSlot[] {
  return [
    {
      id: 2021, hour: 6, minute: 30,
      title: pick(['🌅 Morning walk time!', '🚶 Good morning walker!', '🌞 Step outside!']),
      body: pick([
        "Just 20 minutes of morning sunlight sets your circadian rhythm, boosts serotonin, and burns calories. Walk now!",
        "A brisk morning walk cuts cortisol, sharpens focus, and starts your fat-burning engine. Let's go!",
        "Morning walk = free energy, free mood boost, free calorie burn. Best return on 20 mins you'll ever get. 🌿",
      ]),
    },
    {
      id: 2022, hour: 12, minute: 45,
      title: pick(['🏃 Post-lunch walk!', '🌿 Digestive walk time!', '☀️ Midday step break!']),
      body: pick([
        "A 10-min walk after lunch lowers blood sugar by up to 30%. Worth it!",
        "Step away from your screen. A short walk now repays with 2 more hours of sharp focus.",
        "Post-lunch stroll = better digestion + lower glucose + instant mood lift. Just 10 mins! 🏃",
      ]),
    },
    {
      id: 2023, hour: 18, minute: 30,
      title: pick(['🌆 Evening walk time!', '🚶 6:30 PM — step out!', '🌇 De-stress walk!']),
      body: pick([
        "Evening walks reduce cortisol, regulate blood sugar, and improve sleep quality. 30 minutes now pays tonight.",
        "Hit your 8,000 step target! An evening walk with music or a podcast makes it feel like a reward.",
        "Stress from the day? Walk it off. 20 mins of outdoor walking is clinically proven to cut anxiety. 🌳",
      ]),
    },
  ];
}

function getSleepSlots(): NotifSlot[] {
  return [
    {
      id: 2031, hour: 21, minute: 30,
      title: '🌙 Wind-down time',
      body: 'Start dimming screens. Your brain needs 60 mins to shift from active to sleep mode. Dim the lights now.',
    },
    {
      id: 2032, hour: 22, minute: 0,
      title: '😴 Sleep prep — 30 mins',
      body: pick([
        "Put the phone face-down. Read a book, stretch, or breathe slowly. Sleep is where your body builds muscle and clears toxins.",
        "Avoid scrolling now. Blue light blocks melatonin and steals 1-2 hours of your deep sleep. You earned the rest!",
        "A glass of warm milk or chamomile tea now primes your body for deep recovery sleep. 💤",
      ]),
    },
    {
      id: 2033, hour: 22, minute: 30,
      title: '💤 Bedtime — lights out!',
      body: pick([
        "7-8 hours of sleep burns fat, repairs muscle, boosts immunity, and resets your mood. The best free health habit you have.",
        "Sleep now. Every hour before midnight is worth double. Your best version tomorrow is built tonight. 🌙",
        "Goodnight! Your tomorrow starts with tonight's rest. Let go of the day — your body will thank you. 💫",
      ]),
    },
  ];
}

// ─── Service ──────────────────────────────────────────────────────────────────

class WellnessCoachServiceImpl {

  // ── Prefs ──

  loadPrefs(): WellnessCoachPrefs {
    try {
      const s = localStorage.getItem(PREFS_KEY);
      if (s) return { ...DEFAULT_PREFS, ...JSON.parse(s) };
    } catch { /* noop */ }
    return { ...DEFAULT_PREFS };
  }

  savePrefs(prefs: WellnessCoachPrefs): void {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  // ── Native Setup: High-Priority Channel & Exact Alarms ──

  async ensureChannelCreated(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await LocalNotifications.createChannel({
        id: 'wellness',
        name: 'Wellness & Lifestyle Coach',
        description: 'Daily meal, hydration, walking and sleep reminders (wakes device when closed)',
        importance: 5, // 5 = High/Max: sounds, vibrates, displays heads-up
        visibility: 1, // 1 = Public: displays on secure lockscreen
        sound: undefined, // system default alert sound
        vibration: true,
        lights: true,
        lightColor: '#10B981',
      });
      console.log('[WellnessCoach] NotificationChannel "wellness" configured (Importance 5, Lockscreen Public)');
    } catch (err) {
      console.warn('[WellnessCoach] Error creating notification channel:', err);
    }
  }

  async checkExactAlarms(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;
    try {
      const res = await LocalNotifications.checkExactNotificationSetting();
      if (res.exact_alarm !== 'granted') {
        console.warn('[WellnessCoach] Exact alarms not granted. Prompting user to allow in settings...');
        await LocalNotifications.changeExactNotificationSetting();
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const check = await LocalNotifications.checkPermissions();
      if (check.display === 'granted') return true;
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch {
      return false;
    }
  }

  // ── Core Scheduling ──

  async scheduleAll(prefs: WellnessCoachPrefs): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('[WellnessCoach] Not native platform — skipping scheduling');
      return;
    }

    // 1. Ensure high-importance notification channel exists on Android
    await this.ensureChannelCreated();

    // 2. Cancel all previous wellness notifications atomically
    await this.cancelAll();

    if (!prefs.enabled) return;

    const slots: NotifSlot[] = [
      ...(prefs.meals ? getMealSlots() : []),
      ...(prefs.hydration ? getHydrationSlots() : []),
      ...(prefs.walk ? getWalkSlots() : []),
      ...(prefs.sleep ? getSleepSlots() : []),
    ];

    if (slots.length === 0) return;

    const granted = await this.requestPermission();
    if (!granted) {
      console.warn('[WellnessCoach] Notification permission not granted');
      return;
    }

    // 3. Build notifications with RTC_WAKEUP (allowWhileIdle: true)
    // Runs via AlarmManager.setExactAndAllowWhileIdle even if app is swiped away/killed
    const notifications = slots.map(slot => ({
      id: slot.id,
      title: slot.title,
      body: slot.body,
      largeIcon: 'ic_launcher_round',
      smallIcon: 'ic_notification',
      channelId: 'wellness',
      ongoing: false,
      autoCancel: true,
      schedule: {
        on: {
          hour: slot.hour,
          minute: slot.minute,
          second: 0,
        },
        repeats: true,
        allowWhileIdle: true, // Wakes CPU from deep sleep / killed state
      },
      actionTypeId: 'WELLNESS_TAP',
      extra: { route: '/health/food', category: this.slotCategory(slot.id) },
    }));

    try {
      await LocalNotifications.schedule({ notifications });
      console.log(`[WellnessCoach] Scheduled ${notifications.length} persistent wellness notifications (survives app kill)`);
    } catch (err) {
      console.error('[WellnessCoach] Scheduling error:', err);
    }
  }

  // ── Live Test Notification Helper (for verifying killed-app delivery) ──

  async sendTestNotification(delaySeconds: number = 10): Promise<{ id: number; targetTime: Date }> {
    await this.ensureChannelCreated();
    await this.requestPermission();

    const targetTime = new Date(Date.now() + delaySeconds * 1000);
    const testId = 9999;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: testId,
          title: '⚡ Wellness Coach Live Test',
          body: 'Verified: Notifications work perfectly even when CHATR is completely closed or killed!',
          largeIcon: 'ic_launcher_round',
          smallIcon: 'ic_notification',
          channelId: 'wellness',
          ongoing: false,
          autoCancel: true,
          schedule: {
            at: targetTime,
            allowWhileIdle: true, // AlarmManager.setExactAndAllowWhileIdle
          },
          actionTypeId: 'WELLNESS_TAP',
          extra: { route: '/health/food', category: 'test' },
        },
      ],
    });

    console.log(`[WellnessCoach] Test notification armed for ${targetTime.toLocaleTimeString()}`);
    return { id: testId, targetTime };
  }

  async cancelAll(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const allIds = [
        9999,                                // test
        2001, 2002, 2003, 2004,             // meals
        2011, 2012, 2013, 2014, 2015, 2016, 2017, // hydration
        2021, 2022, 2023,                    // walk
        2031, 2032, 2033,                    // sleep
      ].map(id => ({ id }));
      await LocalNotifications.cancel({ notifications: allIds });
    } catch { /* noop */ }
  }

  private slotCategory(id: number): string {
    if (id >= 2001 && id <= 2009) return 'meal';
    if (id >= 2010 && id <= 2019) return 'hydration';
    if (id >= 2020 && id <= 2029) return 'walk';
    if (id === 9999) return 'test';
    return 'sleep';
  }

  // ── Pretty summary for UI ──

  getSummary(prefs: WellnessCoachPrefs): string {
    if (!prefs.enabled) return 'All wellness reminders paused';
    const active: string[] = [];
    if (prefs.meals) active.push('4 meal reminders');
    if (prefs.hydration) active.push('7 hydration nudges');
    if (prefs.walk) active.push('3 walk prompts');
    if (prefs.sleep) active.push('3 sleep cues');
    if (active.length === 0) return 'No reminders active';
    return active.join(' · ') + ' per day';
  }

  getCategoryCount(prefs: WellnessCoachPrefs): number {
    return [prefs.meals, prefs.hydration, prefs.walk, prefs.sleep].filter(Boolean).length;
  }
}

export const WellnessCoachService = new WellnessCoachServiceImpl();
