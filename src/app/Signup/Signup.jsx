import { useState, useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    photo: null,
    recaptchaToken: '',
  });
  const [isShifted, setIsShifted] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState('password');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (step === 3) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error('Camera error:', err));
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Verify reCAPTCHA with backend
    const res = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recaptchaToken: formData.recaptchaToken }),
    });

    const result = await res.json();

    if (!result.success) {
      alert('reCAPTCHA verification failed. Please try again.');
      return;
    }

    // Step 2: Continue with signup logic (send data to backend)
    console.log('Final signup data:', formData);
    // TODO: Implement actual backend signup submission here
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 200, 200);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setFormData({ ...formData, photo: dataUrl });
  };

  const handleRecaptchaChange = (token) => {
    setFormData({ ...formData, recaptchaToken: token });
  };

  const handleVirtualKeyPress = (key) => {
    setFormData((prev) => ({
      ...prev,
      [activeField]: prev[activeField] + key,
    }));
  };

  const handleBackspace = () => {
    setFormData((prev) => ({
      ...prev,
      [activeField]: prev[activeField].slice(0, -1),
    }));
  };

  const handleClear = () => {
    setFormData((prev) => ({
      ...prev,
      [activeField]: '',
    }));
  };

  const handleShift = () => {
    setIsShifted((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md z-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up - Step {step}</h2>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2" required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2" required />
              <input
                type="password"
                name="password"
                placeholder="Password (click to open keyboard)"
                value={formData.password}
                readOnly
                onClick={() => {
                  setActiveField('password');
                  setShowKeyboard(true);
                }}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-gray-100 cursor-pointer"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password (click to open keyboard)"
                value={formData.confirmPassword}
                readOnly
                onClick={() => {
                  setActiveField('confirmPassword');
                  setShowKeyboard(true);
                }}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-gray-100 cursor-pointer"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">We sent an OTP to your email. Please enter it below.</p>
              <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2" required />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Take a real-time photo</p>
              <video ref={videoRef} width="200" height="200" autoPlay className="rounded-lg border mx-auto" />
              <canvas ref={canvasRef} width="200" height="200" className="hidden" />
              <button type="button" onClick={capturePhoto} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Capture Photo</button>
              {formData.photo && <img src={formData.photo} alt="Captured" className="mt-4 rounded-lg border mx-auto" width="200" height="200" />}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Complete the reCAPTCHA below</p>
              <ReCAPTCHA sitekey="6LcGPSwrAAAAANj0moLCpsH-MY_y4gMFh_-BVBtx" onChange={handleRecaptchaChange} />
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Back</button>
            )}

            {step < 4 ? (
              <button type="button" onClick={handleNext} className="ml-auto px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">Next</button>
            ) : (
              <button type="submit" disabled={!formData.recaptchaToken} className="ml-auto px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">Submit</button>
            )}
          </div>
        </form>
      </div>

      {showKeyboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowKeyboard(false)}
            >
              ✕
            </button>
            <VirtualKeyboard
              onKeyPress={handleVirtualKeyPress}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onShift={handleShift}
              isShifted={isShifted}
              onClose={() => setShowKeyboard(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}