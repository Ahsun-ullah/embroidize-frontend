import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export const ZipFileUpload = ({ label, accept, onDrop, error, product }) => {
  const [fileName, setFileName] = useState(null);

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      onDrop(file);
    }
  };

  useEffect(() => {
    if (product?.designFile?.name) {
      setFileName(product.designFile.name);
    }
  }, [product]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: accept || { 'application/zip': ['.zip'] },
    onDrop: handleDrop,
  });

  return (
    <div
      {...getRootProps()}
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
        <div className='flex-1 min-w-0'>
          <input {...getInputProps()} />
          <p className='text-gray-600 text-sm md:text-base'>{label}</p>
          <button
            className='mt-2 bg-gradient-to-r from-blue-500 to-purple-500
                       text-white px-4 py-2 rounded-md text-sm md:text-base
                       w-full md:w-auto'
          >
            Drag and Drop Zip File or Browse Files
          </button>
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
