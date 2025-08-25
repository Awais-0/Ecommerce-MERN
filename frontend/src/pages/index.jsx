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
            <div className="w-[500px] p-8 bg-white/75 rounded-xl backdrop-blur-md shadow-lg">
              <h2 className='text-2xl font-bold mb-5 ml-22'>Welcome to my Website</h2>
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