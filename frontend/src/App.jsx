import { useState } from 'react'

import BreadCrumbs from './BreadCrumbs'
import PieChart from './PieChart'

//import bs
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import ReactGA from 'react-ga4';
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {

	const [path,setPath] = useState(['Home','Test','Test2'])

	ReactGA.initialize('G-SMP1DRGFM9');
	return (

		<BrowserRouter>
			<Routes>
				<Route path="*" element={<PieChart />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App

