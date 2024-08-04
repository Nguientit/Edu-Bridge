import { Routes, Route } from 'react-router-dom';
import Nav from './pages/Navbar';
import Footer from './pages/Footer';
import Body from './pages/Body';
import ChangePassword from './pages/Login/ChangePassword';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/Login/Forgotpw';
import ResetPassword from './pages/Login/ResetPassword';
import Register from './pages/Login/Register';
import CourseEnroll from './pages/CourseContent/CourseEnroll';
import Search from './pages/CourseContent/Search';
import CourseDetail from './pages/CourseContent/CourseDetail';
import Profile from './pages/Instructor/Profile';
import MyCourse from './pages/CourseContent/MyCourse';
import CoursePage from './pages/CourseContent/CoursePage';
import TakeQuiz from './pages/Quiz/TakeQuiz';
import ResultQuiz from './pages/Quiz/ResultQuiz';
import ManegerCourse from './pages/Instructor/ManagerCourse';
import { AuthProvider } from './pages/Login/AuthContext';
import ShoppingCart from './pages/PaymentOrder/ShoppingCart';
import Checkout from './pages/PaymentOrder/CheckOut';
import Success from './pages/PaymentOrder/Success';
import ProfileUser from './pages/Login/ProfileUser';
import UnauthorizedPage from './pages/Login/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';
import AddCourse from './pages/Instructor/AddCourse';
import CompleteCertificates from './pages/Certificates/CompleteCertificates';


function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Nav />
        <Routes>
          <Route path='/unauthorizated' element={<UnauthorizedPage/>}/>
          <Route path="/" element={<Body />} />
          <Route path="/news/:id" element={<CourseDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path='/login' element={<Login />} />
          <Route path='/fogotPassword' element={<ForgotPassword />} />
          <Route path='/changePassword' element={<ProtectedRoute component={ChangePassword} roles={['user','instructor','admin']}/>} />
          <Route path='/resetPassword' element={< ProtectedRoute component={ResetPassword} roles={['user','instructor']}/>}/>
          <Route path='/register' element={<Register />} />
          <Route path="/courseEnroll" element={<ProtectedRoute component={CourseEnroll} roles={['user']} />} />
          <Route path='/detailProfile/:emailAddress' element={<Profile/>}/>
          <Route path='/myCourse' element={<ProtectedRoute component={MyCourse} roles={['user']}/>}/>
          <Route path='/coursePage/:id' element={<ProtectedRoute component={CoursePage} roles={['user']}/>}/>
          <Route path="/takeQuiz/:quizId/:dateTime" element={<ProtectedRoute component={TakeQuiz} roles={['user']}/>} />
          <Route path='/result/:quizSessionId' element={<ProtectedRoute component={ResultQuiz} roles={['user']} />}/>
          <Route path='/managercourse'  element={<ProtectedRoute component={ManegerCourse} roles={['admin']} />} />
          <Route path='/wishlist' element={<ProtectedRoute component={ShoppingCart} roles={['user']}/>}/>
          <Route path='/checkout' element={<ProtectedRoute component={Checkout} roles={['user']} />}/>
          <Route path='/success' element={<Success/>} />
          <Route path='/profileUser' element={<ProtectedRoute component={ProfileUser} roles={['user']} />}/>
          <Route path='/addCourse' element={<ProtectedRoute component={AddCourse} roles={['instructor']} />}/>
          <Route path='/completeCertificate' element={<CompleteCertificates/>}/>

          </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
