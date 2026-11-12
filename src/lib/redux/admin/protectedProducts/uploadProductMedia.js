import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

// PUT /product/:id/media — the product page's 2 extra images + 1 video.
// Same XHR approach (and same resolve/reject shape) as
// uploadProductWithProgress: `onProgress` gets 0–100 while bytes leave the
// browser, then `null` once the server is optimising/encoding them.
export function uploadProductMedia({ id, formData, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${BASE_API_URL}/product/${id}/media`);

    const token = Cookies.get('token');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.min(100, Math.round((e.loaded / e.total) * 100)));
      }
    };
    xhr.upload.onload = () => onProgress?.(null);

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = { message: xhr.responseText || 'Unexpected server response' };
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject({ status: xhr.status, data });
    };
    xhr.onerror = () =>
      reject({
        status: 0,
        data: {
          message: 'Network error — the media upload did not reach the server.',
        },
      });

    xhr.send(formData);
  });
}

// Builds the multipart body from the form's media state. Returns null when
// nothing changed, so an ordinary product edit never calls the endpoint.
export function buildProductMediaForm(media, original) {
  const formData = new FormData();
  let changed = false;

  const keptIds = new Set(
    media.gallery.map((s) => s.existing?.public_id).filter(Boolean),
  );
  const removed = (original.gallery || [])
    .map((g) => g.public_id)
    .filter((id) => !keptIds.has(id));
  if (removed.length) {
    formData.append('removeGallery', JSON.stringify(removed));
    changed = true;
  }

  media.gallery.forEach((slot) => {
    if (slot.file instanceof File) {
      formData.append('gallery', slot.file);
      changed = true;
    }
  });

  if (media.video.file instanceof File) {
    formData.append('video', media.video.file);
    changed = true;
  } else if (original.video && !media.video.existing) {
    formData.append('removeVideo', 'true');
    changed = true;
  }

  return changed ? formData : null;
}
