// src/utils/blur.js
export function shimmer(w, h) {
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#f0f0f0" offset="20%" />
        <stop stop-color="#e6e6e6" offset="50%" />
        <stop stop-color="#f0f0f0" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#f0f0f0" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
  </svg>`;
}

export function toBase64(str) {
  // Server component: Buffer exists. If ever used in client, falls back to btoa.
  if (typeof window === 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  return window.btoa(str);
}

export function blurDataURL(width = 600, height = 400) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;
}
