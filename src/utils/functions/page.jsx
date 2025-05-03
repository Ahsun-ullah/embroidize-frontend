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
