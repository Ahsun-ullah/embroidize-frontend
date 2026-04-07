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
