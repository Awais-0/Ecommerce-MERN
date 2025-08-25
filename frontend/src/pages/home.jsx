import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyButton } from '../components/button';

const Home = () => {
  const [user, setUser] = useState(null); // null = loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      console.log("Fetching user profile...");
      try {
        const response = await fetch('http://localhost:4000/api/users/getUserProfile', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const data = await response.json();
        console.log('User profile fetched:', data);
        setUser(data.name || 'Guest');
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
        navigate('/login'); // 🚀 redirect if not logged in
      }
    };

    fetchUser();
  }, [navigate]);

  const logout = async () => {
    console.log("Logging out...");
    try {
      const response = await fetch('http://localhost:4000/api/auth/logoutUser', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      console.log('Logout successful');
      setUser(null); // Reset user state
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
  };
  // While checking auth
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-500 text-white">
        <h2 className="text-xl">Loading...</h2>
      </div>
    );
  }

  const shopNow = () => {
    console.log('Shop Now clicked');
    navigate('/products');
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-800 items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Welcome {user}! E-commerce platform
      </h1>
      <div className='flex flex-row gap-1.5 items-center justify-center'>
        <MyButton onClick={shopNow} value='Shop Now' />
        <MyButton onClick={logout} value='Logout' />
      </div>
    </div>
  );
};

export default Home;
