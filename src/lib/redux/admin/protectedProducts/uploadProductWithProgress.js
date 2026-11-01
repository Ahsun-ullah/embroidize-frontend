import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

// Sends the product form with XMLHttpRequest instead of the RTK mutation,
// because fetch() cannot report upload progress and a design pack can take a
// while to leave the browser. `onProgress` receives 0–100 while bytes are
// being sent, then `null` once they are all out and the server is processing.
//
// Resolves with the JSON body on a 2xx. Rejects with `{ status, data }` —
// the same shape RTK's unwrap() throws — so callers keep reading
// `error.data.message`.
export function uploadProductWithProgress({ id, formData, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      id ? 'PUT' : 'POST',
      `${BASE_API_URL}/product${id ? `/${id}` : ''}`,
    );

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
          message: 'Network error — the upload did not reach the server.',
        },
      });
    xhr.ontimeout = () =>
      reject({ status: 0, data: { message: 'The upload timed out.' } });

    xhr.send(formData);
  });
}
