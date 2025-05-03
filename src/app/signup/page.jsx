"use client";

import { useState, useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import API from '@/utils/api-client';

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
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
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

  const clearMessages = () => {
    setErrors({});
    setSuccessMsg('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setSuccessMsg('');
  };

  const handleNext = async () => {
    clearMessages();
    try {
      if (step === 1) {
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
          setErrors({
            username: !formData.username ? 'Username required' : '',
            email: !formData.email ? 'Email required' : '',
            password: !formData.password ? 'Password required' : '',
            confirmPassword: !formData.confirmPassword ? 'Please confirm password' : '',
          });
          return;
        }
        const res = await API.post('auth/signup/', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        console.log('Register response:', res.data);
        localStorage.setItem('token', res.data.access);
        setSuccessMsg('✅ Registration successful! Proceeding to OTP.');
        setStep(2);
      } else if (step === 2) {
        if (!formData.otp) {
          setErrors({ otp: 'OTP is required' });
          return;
        }
        const res = await API.post('auth/verify-email/', {
          code: formData.otp,
        });
        console.log('OTP verification response:', res.data);
        setSuccessMsg('✅ OTP verified! Proceeding to photo capture.');
        setStep(3);
      } else if (step === 3) {
        if (!formData.photo) {
          setErrors({ photo: 'Please capture a photo' });
          return;
        }
        const blob = await (await fetch(formData.photo)).blob();
        const formDataObj = new FormData();
        formDataObj.append('face_image', blob, 'face.png');
        const res = await API.post('auth/enroll-face/', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Face enrollment response:', res.data);
        setSuccessMsg('✅ Photo uploaded! Proceeding to reCAPTCHA.');
        setStep(4);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      setErrors({ general: error.response?.data?.detail || 'An error occurred.' });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    clearMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recaptchaToken: formData.recaptchaToken }),
      });
      const result = await res.json();
      if (!result.success) {
        setErrors({ recaptcha: 'reCAPTCHA verification failed. Please try again.' });
        return;
      }
      setSuccessMsg('✅ Signup completed successfully!');
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      setErrors({ recaptcha: 'An error occurred during reCAPTCHA verification.' });
    }
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 200, 200);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setFormData({ ...formData, photo: dataUrl });
    setErrors({ ...errors, photo: '' });
    setSuccessMsg('');
  };

  const handleRecaptchaChange = (token) => {
    setFormData({ ...formData, recaptchaToken: token });
    setErrors({ ...errors, recaptcha: '' });
    setSuccessMsg('');
  };

  const handleVirtualKeyPress = (key) => {
    setFormData((prev) => ({
      ...prev,
      [activeField]: prev[activeField] + key,
    }));
    setErrors({ ...errors, [activeField]: '' });
    setSuccessMsg('');
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
        {errors.general && <p className="text-red-500 text-center mb-2">{errors.general}</p>}
        {successMsg && <p className="text-green-600 text-center mb-2">{successMsg}</p>}
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2" required />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2" required />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              <input type="password" name="password" placeholder="Password (click to open keyboard)" value={formData.password} readOnly onClick={() => { setActiveField('password'); setShowKeyboard(true); }} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-gray-100 cursor-pointer" required />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              <input type="password" name="confirmPassword" placeholder="Confirm Password (click to open keyboard)" value={formData.confirmPassword} readOnly onClick={() => { setActiveField('confirmPassword'); setShowKeyboard(true); }} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-gray-100 cursor-pointer" required />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">We sent an OTP to your email. Please enter it below.</p>
              <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2" required />
              {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Take a real-time photo</p>
              <video ref={videoRef} width="200" height="200" autoPlay className="rounded-lg border mx-auto" />
              <canvas ref={canvasRef} width="200" height="200" className="hidden" />
              <button type="button" onClick={capturePhoto} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Capture Photo</button>
              {errors.photo && <p className="text-red-500 text-sm mt-2">{errors.photo}</p>}
              {formData.photo && <img src={formData.photo} alt="Captured" className="mt-4 rounded-lg border mx-auto" width="200" height="200" />}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Complete the reCAPTCHA below</p>
              <ReCAPTCHA sitekey="6LcGPSwrAAAAANj0moLCpsH-MY_y4gMFh_-BVBtx" onChange={handleRecaptchaChange} />
              {errors.recaptcha && <p className="text-red-500 text-sm mt-2">{errors.recaptcha}</p>}
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
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowKeyboard(false)}>
              ✕
            </button>
            <VirtualKeyboard onKeyPress={handleVirtualKeyPress} onBackspace={handleBackspace} onClear={handleClear} onShift={handleShift} isShifted={isShifted} onClose={() => setShowKeyboard(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
