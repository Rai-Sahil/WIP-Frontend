import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login';
import Quiz from './pages/Quiz';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/quiz' element={<Quiz />} />
    </Routes>
  )
}

export default App;