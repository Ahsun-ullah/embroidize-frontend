export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

export const convertImageUrlToFile = async (input) => {
  if (typeof input === 'string' && input.startsWith('http')) {
    try {
      const response = await fetch(input);
      const blob = await response.blob();
      const fileName = input.split('/').pop();
      const fileType = input.split('.').pop();

      const file = new File([blob], fileName, {
        type: `application/${fileType}`,
      });

      return file;
    } catch (error) {
      console.error('Error fetching file from URL:', error);

      return null;
    }
  } else if (input instanceof File || input instanceof Blob) {
    return input;
  } else {
    return null;
  }
};

export function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const slugify = (str) =>
  str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');

export const queryString = (str) =>
  str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '+');

// Extracts the filename the server set in a Content-Disposition header,
// supporting both `filename="..."` and the RFC 5987 `filename*=UTF-8''...` form.
// Returns `fallback` when the header is missing or unreadable (e.g. an older
// API response, or the header isn't CORS-exposed), so a download is never left
// unnamed. The server is the single source of truth for the name.
export const filenameFromContentDisposition = (header, fallback = 'download.zip') => {
  if (!header) return fallback;

  // RFC 5987 extended form takes precedence (handles non-ASCII names).
  const extended = header.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
  if (extended?.[1]) {
    try {
      return decodeURIComponent(extended[1].replace(/["']/g, '').trim());
    } catch {
      /* fall through to the plain form */
    }
  }

  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain?.[1]?.trim() || fallback;
};

export function formatNumber(num) {
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export const formatWindow = (window) => {
  if (!window) return '';

  const match = window.match(/^(\d+)([dhm])$/i);
  if (!match) return window; // fallback

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const unitMap = {
    d: value === 1 ? 'day' : 'days',
    h: value === 1 ? 'hour' : 'hours',
    m: value === 1 ? 'minute' : 'minutes',
  };

  return `${value} ${unitMap[unit]}`;
};

export const formatCountdown = (ms) => {
  if (!ms || ms <= 0) return 'Available now';

  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${h}h ${m}m ${s}s`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'No expiry';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Compact reset countdown for UI that only needs hour/minute granularity
// (e.g. "13h 42m", "42m", or "Available now"). Takes the same ms input as
// formatCountdown so the two stay consistent against one source of truth.
export const formatResetCountdown = (ms) => {
  if (!ms || ms <= 0) return 'Available now';
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Human-friendly absolute reset time: "Today at 12:00 AM", "Tomorrow at 3:30 PM",
// or "Mar 5 at 9:00 AM". Renders in the browser's own locale + timezone, so the
// time shown always matches the user's wall clock regardless of where it was
// computed on the server.
export const formatResetTime = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const dayDiff = Math.round(
    (startOfDay(d) - startOfDay(new Date())) / 86400000,
  );

  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Tomorrow at ${time}`;
  const dateLabel = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${dateLabel} at ${time}`;
};

export function preserveParagraphLineBreaks(rawMarkup) {
  if (!rawMarkup || typeof rawMarkup !== 'string') {
    return '';
  }

  return rawMarkup.replace(/<p>([\s\S]*?)<\/p>/g, (_match, content) => {
    const cleaned = content.trim();

    if (!cleaned.includes('\n')) {
      return `<p>${cleaned}</p>`;
    }

    return `<p>${cleaned.replace(/\n+/g, '<br />')}</p>`;
  });
}
