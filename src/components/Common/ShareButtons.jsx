'use client';

const ShareButtons = ({ url, title, description }) => {
  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(`${title} - ${description}`);

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      '_blank',
      'width=600,height=400',
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      '_blank',
      'width=600,height=400',
    );
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      '_blank',
      'width=600,height=400',
    );
  };

  return (
    <div className='flex items-center gap-3'>
      <div className='flex gap-2'>
        <button
          onClick={handleFacebookShare}
          className='text-blue-600 hover:text-blue-700 transition-colors'
          aria-label='Share on Facebook'
        >
          <i className='ri-facebook-circle-fill rounded-full bg-black text-white p-2 text-base'></i>
        </button>

        <button
          onClick={handleTwitterShare}
          className='text-sky-500 hover:text-sky-600 transition-colors'
          aria-label='Share on Twitter'
        >
          <i className='ri-twitter-x-fill rounded-full bg-black text-white p-2 text-base'></i>
        </button>

        <button
          onClick={handleLinkedInShare}
          className='text-blue-700 hover:text-blue-800 transition-colors'
          aria-label='Share on LinkedIn'
        >
          <i className='ri-linkedin-fill rounded-full bg-black text-white p-2 text-base'></i>
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
