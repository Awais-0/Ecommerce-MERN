import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyButton } from '../components/button';

const Signup = () => {
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/auth/registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setSuccess('Account created successfully! You can now log in.');
      setFormData({ name: '', email: '', password: '' });
      setError(null);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-end bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/registerBg.jpg')"
  }}>
      <div className="w-[500px] mr-20 p-8 bg-white/75 rounded-xl backdrop-blur-md shadow-lg  hover:bg-fuchsia-50/85 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-5 text-center">Create your account</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}

          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="p-2 border-b border-gray-600 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-2 border-b border-gray-600 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="p-2 border-b border-gray-600 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-2 border-b border-gray-600 focus:outline-none"
              required
            />
          </div>

          <MyButton
            value="Register"
            type="submit"
            customStyling="mt-4 bg-orange-500 p-2 text-white font-bold rounded-md hover:bg-orange-600 transition duration-200"

          />

          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-700 font-light text-sm">
              Already registered? Login{' '}
              <Link to="/login" className="hover:text-blue-800 underline">
                here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
