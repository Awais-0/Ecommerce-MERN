import { useNavigate } from "react-router-dom";
import { MyButton } from "../components/button.jsx";

const Index = () => {
  const navigate = useNavigate()
  const register = () => {
    console.log('register clicked')
    navigate('/signup')
  }
  const login = () => {
    console.log('login clicked')
    navigate('/login')
  }
  return (
    <div>
      <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-bl from-blue-400 to-blue-900">
        <img
        src="/categoriesBg.jpg" // Prefer optimized webp/avif
        alt="Shop Banner"
        className="absolute top-0 left-0 w-full h-full object-cover"
        loading="eager"
      />
            <div className="w-[500px] p-8 bg-gray-400/75 rounded-xl backdrop-blur-md shadow-lg text-center">
              <h2 className='text-2xl font-bold mb-7'>Welcome to my E-commerce platform</h2>
              <div className='flex flex-row gap-1.5 items-center justify-center'>
                <MyButton onClick={register} value='Register' />
                <MyButton onClick={login} value='Login' />
              </div>
            </div>
          </div>
    </div>
  )
}

export default Index