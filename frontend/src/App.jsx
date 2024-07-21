import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import BreadCrumbs from './BreadCrumbs'
import PieChart from './PieChart'

//import bs
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {

	const [path,setPath] = useState(['Home','Test','Test2'])

  return (
    <BrowserRouter>
      <Routes>
		  <Route path="*" element={<PieChart />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

