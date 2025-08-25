import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const Login = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = credentials;
    if (!email || !password) {
      setError('Username and password are required');
      return;
    }
    // Simulate a login request
    fetch('http://localhost:4000/api/auth/loginUser', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      }
      )
      .then((data) => {
        console.log('Login successful:', data.message);
        navigate('/products');
      })
      .catch((err) => {
        console.error('Login error:', err.message);
        setError('Invalid username or password');
      });
  };

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-start bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/AuthBg4.jpg')"
  }}
    >
      <div className="w-[500px] ml-20 p-8 bg-white/75 rounded-xl backdrop-blur-md shadow-lg hover:bg-fuchsia-50/85 transition-all duration-300">
        <h2 className='text-2xl font-bold mb-5 ml-24'>Login to your account</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-center">{error}</p>}

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="p-2 border-b border-gray-600 focus:outline-none text-sm"
              required
            />
          </div>

          <div className="flex flex-col mb-3 g-0 mt-3">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="p-2 border-b border-gray-600 focus:outline-none text-sm"
              required
            />
          </div>

          <a href='#' className='text-gray-700 hover:text-blue-800 font-light text-sm'>Forgot password?</a>

          <button
            type="submit"
            className="mt-4 p-2 bg-orange-400 text-white font-bold rounded-md hover:bg-orange-500 transition duration-200"
          >
            Login
          </button>

          <div className='flex flex-col items-center justify-center'>
            <p className='text-gray-700 font-light text-sm'>
              Don't have an account? Register <a href='/signup' className='hover:text-blue-800 hover:cursor-pointer underline'>here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
