import { JobFrequency } from '../types';

/**
 * Calculates human readable description for common frequencies
 */
export function getScheduleDescription(frequency: JobFrequency, time: string = '09:00', days: number[] = [1, 2, 3, 4, 5]): { human: string; cron: string } {
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr || '9', 10);
  const min = parseInt(minStr || '0', 10);

  const formatAmPm = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 === 0 ? 12 : h % 12;
    const formattedM = m.toString().padStart(2, '0');
    return `${formattedH}:${formattedM} ${ampm}`;
  };

  const formattedTime = formatAmPm(hour, min);

  switch (frequency) {
    case 'hourly':
      return {
        human: 'Every hour at the top of the hour',
        cron: `${min} * * * *`,
      };
    case 'daily':
      return {
        human: `Every day at ${formattedTime}`,
        cron: `${min} ${hour} * * *`,
      };
    case 'weekly': {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const isWeekday = days.length === 5 && days.every(d => [1, 2, 3, 4, 5].includes(d));
      const isWeekend = days.length === 2 && days.every(d => [0, 6].includes(d));
      let dayDesc = days.map(d => dayNames[d]).join(', ');
      if (isWeekday) dayDesc = 'weekday';
      else if (isWeekend) dayDesc = 'weekend';

      return {
        human: `Every ${dayDesc} at ${formattedTime}`,
        cron: `${min} ${hour} * * ${days.join(',')}`,
      };
    }
    case 'custom':
    default:
      return {
        human: 'Custom expression',
        cron: '0 9 * * 1-5',
      };
  }
}

/**
 * Generates the next N run times starting from a given date
 */
export function getNextRunTimes(cronExpression: string, count: number = 3, fromDate: Date = new Date()): Date[] {
  const runs: Date[] = [];
  const current = new Date(fromDate.getTime());

  // Parse simple cron: min hour dom month dow
  const parts = cronExpression.trim().split(/\s+/);
  const minPart = parts[0] ?? '0';
  const hourPart = parts[1] ?? '9';
  const dowPart = parts[4] ?? '*';

  const targetMin = minPart === '*' ? 0 : parseInt(minPart, 10);
  const targetHour = hourPart === '*' ? null : parseInt(hourPart, 10);

  // Search forward in 1-hour or 1-minute steps
  const searchLimit = 60 * 24 * 30; // 30 days ahead limit
  let minutesChecked = 0;

  // Align to next whole minute
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  while (runs.length < count && minutesChecked < searchLimit) {
    const curMin = current.getMinutes();
    const curHour = current.getHours();
    const curDow = current.getDay(); // 0 is Sunday, 1 is Monday

    let match = true;

    // Minute match
    if (minPart !== '*' && curMin !== targetMin) {
      match = false;
    }

    // Hour match
    if (match && targetHour !== null && curHour !== targetHour) {
      match = false;
    }

    // Day of week match
    if (match && dowPart !== '*') {
      const allowedDows = dowPart.split(',').flatMap(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          const range: number[] = [];
          for (let i = start; i <= end; i++) range.push(i);
          return range;
        }
        return [parseInt(part, 10)];
      });

      if (!allowedDows.includes(curDow)) {
        match = false;
      }
    }

    if (match) {
      runs.push(new Date(current.getTime()));
    }

    // Step forward: if hourPart is fixed and not matching, skip ahead to target hour or next day
    if (targetHour !== null && curHour !== targetHour) {
      current.setMinutes(targetMin);
      if (curHour < targetHour) {
        current.setHours(targetHour);
      } else {
        current.setDate(current.getDate() + 1);
        current.setHours(targetHour);
      }
    } else {
      current.setMinutes(current.getMinutes() + (minPart === '*' ? 1 : 60));
    }

    minutesChecked += 60;
  }

  // Fallback if cron was complex or unparseable
  if (runs.length === 0) {
    const fallback1 = new Date(Date.now() + 3600 * 1000);
    const fallback2 = new Date(Date.now() + 3600 * 1000 * 2);
    const fallback3 = new Date(Date.now() + 3600 * 1000 * 24);
    return [fallback1, fallback2, fallback3];
  }

  return runs;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatNextRunDate(date: Date): string {
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();
  const tomorrow = new Date(now.getTime() + 86400 * 1000);
  const isTomorrow = tomorrow.toDateString() === date.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (isToday) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;

  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${timeStr}`;
}
