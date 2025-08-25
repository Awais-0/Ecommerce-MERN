import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Index from './pages/index.jsx'
import Signup from './pages/signup.jsx'
import Login from './pages/login.jsx'
import Home from './pages/home.jsx'
import ProductsPage from './pages/products.jsx'
import CartPage from './pages/userCart.jsx'
import CategoriesPage from './pages/categories.jsx'
import Checkout from './pages/checkout.jsx'
import AdminDashboard from './pages/admin/adminDashboard.jsx'

const App = () => {

  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/userCart" element={<CartPage />} />
          <Route path='/categories' element={<CategoriesPage />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/admindashboard' element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App