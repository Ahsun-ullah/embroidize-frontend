import { useCallback, useEffect, useState } from 'react';

export const ZipFileUpload = ({ label, accept, onDrop, error, product }) => {
  const [fileName, setFileName] = useState(null);

  const handleFile = (file) => {
    if (file) {
      setFileName(file.name);
      onDrop(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files?.[0];
      handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (product?.designFile?.name) {
      setFileName(product.designFile.name);
    }
  }, [product]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className='flex items-center justify-center h-full w-full'
    >
      <div
        className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center
                   w-full max-w-4xl mx-auto
                   flex flex-col gap-6
                   items-center justify-center
                   min-h-[15rem] md:h-60'
      >
        {/* Upload Section */}
        <div className='flex-1 min-w-0 flex flex-col items-center'>
          <p className='text-gray-600 text-sm md:text-base mb-2'>{label}</p>

          <label
            htmlFor='zip-upload'
            className='mt-2 bg-gradient-to-r from-blue-500 to-purple-500
               text-white px-4 py-2 rounded-md text-sm md:text-base
               w-full md:w-auto text-center cursor-pointer'
          >
            Drag and Drop Zip File or Browse Files
          </label>

          <input
            id='zip-upload'
            type='file'
            accept={accept}
            onChange={handleInputChange}
            className='hidden'
          />
        </div>

        {/* Zip File Info */}
        {fileName && (
          <div className='mt-1 flex flex-col items-center'>
            <p className='text-gray-700 text-sm md:text-base'>Uploaded File:</p>
            <i className='ri-folder-zip-fill mt-2 text-4xl text-gray-600'></i>
            <p className='mt-2 text-gray-800 text-sm md:text-base break-all'>
              {fileName}
            </p>
          </div>
        )}

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
