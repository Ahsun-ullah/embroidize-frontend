import LoadingSpinner from './LoadingSpinner';

const OtpComponent = ({
  otp,
  setOtp,
  handlePaste,
  isLoading,
  handleSubmit,
}) => {
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ''); // Allow digits only
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0]; // Only take first digit

    setOtp(newOtp);

    // Auto-focus next input
    const nextInput = document.getElementById(`digit${index + 2}-input`);
    if (nextInput) nextInput.focus();
  };

  return (
    <div className='flex flex-col items-center justify-center w-full p-4'>
      <div className='flex justify-center gap-3 mb-4'>
        {otp.map((digit, index) => (
          <input
            key={index}
            autoComplete='off'
            type='text'
            value={digit}
            id={`digit${index + 1}-input`}
            maxLength={1}
            className='code-input w-12 h-12 rounded text-center text-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black'
            onChange={(e) => handleChange(e, index)}
            onPaste={(e) => handlePaste(e, index)}
          />
        ))}
      </div>

      <div className='w-full max-w-xs my-4'>
        {isLoading ? (
          <div className='flex justify-center'>
            <LoadingSpinner />
          </div>
        ) : (
          <button
            type='button'
            onClick={handleSubmit}
            disabled={isLoading}
            className='w-full button font-semibold rounded-md text-center'
          >
            Confirm OTP
          </button>
        )}
      </div>
    </div>
  );
};

export default OtpComponent;
