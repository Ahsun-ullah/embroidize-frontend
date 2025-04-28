import { useEffect, useState } from 'react';

export const ImageFileUpload = ({ label, accept, onDrop, error, itemData }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (itemData?.image?.url) {
      setPreview(itemData.image.url);
    }
  }, [itemData]);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onDrop(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onDrop(file);
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    className='flex items-center justify-center h-full w-full'>
      <div
        className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center
                 w-full max-w-4xl mx-auto
                 flex flex-col md:flex-row gap-6 md:gap-10
                 items-center justify-center
                 min-h-[15rem] md:h-60'
      >
        {/* Upload Section */}
        <div className='flex-1 min-w-0 flex flex-col items-center'>
          <p className='text-gray-600 text-sm md:text-base'>{label}</p>

          <label
            htmlFor='image-upload'
            className='mt-2 bg-gradient-to-r from-blue-500 to-purple-500
                     text-white px-4 py-2 rounded-md text-sm md:text-base
                     w-full md:w-auto text-center cursor-pointer'
          >
            Drag and Drop Image or Browse Files
          </label>

          <input
            id='image-upload'
            type='file'
            accept={accept}
            onChange={handleChange}
            className='hidden'
          />
        </div>

        {/* Preview Section */}
        <div className='flex-1 min-w-0'>
          <p className='text-gray-700 text-sm md:text-base'>Preview:</p>
          {preview && (
            <div className='mt-1 flex flex-col items-center'>
              <img
                src={preview}
                alt='Preview'
                className='mt-2 w-32 h-32 md:w-40 md:h-40
                         object-cover rounded-md shadow-md'
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className='text-red-500 font-light mt-2 text-sm md:text-base w-full text-center'>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
