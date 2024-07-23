import { useState } from 'react'

import BreadCrumbs from './BreadCrumbs'
import PieChart from './PieChart'

//import bs
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import ReactGA from 'react-ga3';
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {

	const [path,setPath] = useState(['Home','Test','Test2'])

  return (

	  ReactGA.initialize('G-SMP1DRGFM9');
	  <BrowserRouter>
		  <Routes>
			  <Route path="*" element={<PieChart />} />
		  </Routes>
	  </BrowserRouter>
  )
}

export default App

