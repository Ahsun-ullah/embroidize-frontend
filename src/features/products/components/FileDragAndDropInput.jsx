import { useCallback, useEffect, useState } from 'react';

// Shared drag-and-drop file field. Two products use it: the required design
// pack (.zip) and the optional single-format slot (.emb).
const DragAndDropFileUpload = ({
  label,
  accept,
  onDrop,
  error,
  extension,
  inputId,
  buttonText,
  buttonClassName,
  icon,
  note,
  existingFileName,
}) => {
  const [fileName, setFileName] = useState(null);
  const [localError, setLocalError] = useState(null);

  // The `accept` attribute only filters the browse dialog — and even there the
  // user can switch it to "All Files". Dropped files skip it entirely. Without
  // this check a .rar/.7z/renamed pack looked accepted, then the server's
  // upload filter discarded it and the product was created with no design
  // files at all.
  const handleFile = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(`.${extension}`)) {
      setFileName(null);
      setLocalError(
        extension === 'zip'
          ? `"${file.name}" is not a .zip file. Pack the design files into a ZIP archive and upload that.`
          : `"${file.name}" is not a .${extension} file. This slot accepts .${extension} only.`,
      );
      onDrop(null);
      return;
    }

    if (file.size === 0) {
      setFileName(null);
      setLocalError(`"${file.name}" is empty (0 bytes).`);
      onDrop(null);
      return;
    }

    setLocalError(null);
    setFileName(file.name);
    onDrop(file);
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
    if (existingFileName) {
      setFileName(existingFileName);
    }
  }, [existingFileName]);

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
            htmlFor={inputId}
            className={`mt-2 ${buttonClassName}
               text-white px-4 py-2 rounded-md text-sm md:text-base
               w-full md:w-auto text-center cursor-pointer`}
          >
            {buttonText}
          </label>

          <input
            id={inputId}
            type='file'
            accept={accept}
            onChange={handleInputChange}
            className='hidden'
          />

          {note && (
            <p className='mt-3 text-gray-500 text-xs md:text-sm max-w-xl'>
              {note}
            </p>
          )}
        </div>

        {/* Selected File Info */}
        {fileName && (
          <div className='mt-1 flex flex-col items-center'>
            <p className='text-gray-700 text-sm md:text-base'>Uploaded File:</p>
            <i className={`${icon} mt-2 text-4xl text-gray-600`}></i>
            <p className='mt-2 text-gray-800 text-sm md:text-base break-all'>
              {fileName}
            </p>
          </div>
        )}

        {/* Error Message */}
        {(localError || error) && (
          <p className='text-red-500 font-light mt-2 text-sm md:text-base w-full text-center'>
            {localError || error}
          </p>
        )}
      </div>
    </div>
  );
};

export const ZipFileUpload = ({ label, accept, onDrop, error, product }) => (
  <DragAndDropFileUpload
    label={label}
    accept={accept}
    onDrop={onDrop}
    error={error}
    extension='zip'
    inputId='zip-upload'
    buttonText='Drag and Drop Zip File or Browse Files'
    buttonClassName='bg-gradient-to-r from-blue-500 to-purple-500'
    icon='ri-folder-zip-fill'
    existingFileName={product?.designFile?.name}
  />
);

// Optional slot: one .emb that is merged INTO the design's existing formats.
// Uploading it never touches the pes/dst/cnd/... that came out of the ZIP; an
// .emb already on the design is replaced by the new one.
export const EmbFileUpload = ({ label, accept, onDrop, error, product }) => {
  const hasEmb = Array.isArray(product?.available_file_types)
    ? product.available_file_types.some((t) => String(t).toLowerCase() === 'emb')
    : false;

  return (
    <DragAndDropFileUpload
      label={label}
      accept={accept}
      onDrop={onDrop}
      error={error}
      extension='emb'
      inputId='emb-upload'
      buttonText='Drag and Drop EMB File or Browse Files'
      buttonClassName='bg-slate-800 hover:bg-black transition'
      icon='ri-file-3-fill'
      note={
        product
          ? hasEmb
            ? 'This design already has an EMB file — uploading one replaces it. Every other format stays as it is.'
            : 'Optional. The EMB is added to this design’s existing formats; nothing already uploaded is removed.'
          : 'Optional. Added alongside the formats inside the ZIP.'
      }
    />
  );
};
