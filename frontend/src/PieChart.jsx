import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Chart, Colors } from 'chart.js';
import {useState,useEffect} from 'react'
import axios from 'axios'
ChartJS.register(ArcElement, Tooltip, Legend);
Chart.register(Colors);
import {useLocation,useNavigate} from 'react-router-dom'
import {Button} from 'react-bootstrap'
import {Dropdown} from 'react-bootstrap'
import React from 'react'
import {XLg} from 'react-bootstrap-icons'

import {Tab, Tabs} from 'react-bootstrap'
//import jquery
import Papa from 'papaparse';
import Table from 'react-bootstrap/Table';
import TableView from './TableView.jsx'

//const API_URL=NODE_ENV=="production"?"https://jobs.marvinwyss.ch/":"http://localhost:3003/"
const API_URL=process.env.NODE_ENV=="production"?"https://jobs.marvinwyss.ch/api/jobs/":"http://localhost:3003/api/jobs/"


const readCSV= async (file) => {
	return await new Promise((resolve, reject) => {
		// Parsing the CSV string
		Papa.parse(file, {
			header: true, // If the first row is the header
			complete: function(results) {
				resolve(results.data);
			}
		});
	})
}

const colorPalette= 
	[
		"#00ff00", // lime
		"#ff0000", // red
		"#00ffff", // aqua
		"#8b4513", // saddlebrown
		"#228b22", // forestgreen
		"#4b0082", // indigo
		"#ffd700", // gold
		"#0000ff", // blue
		"#ff1493", // deeppink
		"#ffe4b5", // moccasin
		"#888", //grey
	]


const carroussel=["industry","industrySector","job","specialization"]


const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (

	<h3
		style={{cursor:"pointer",color:"blue"}}
		href=""
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		{children}
	</h3>
));


export default function PieChart() {

	const location = useLocation()
	const navigate = useNavigate()

	//download data from server

	//const [dataSetting,setDataSet] = useState({page:0,groupby:"industry"})
	const [data,setData] = useState(null)

	const [dataSettingStack,setDataSettingStack] = useState([])

	const urlGetParams = new URLSearchParams(location.search)


	const [dataSetting,_setDataSetting] = useState(null)
	const [isForwardNavigation,setIsForwardNavigation] = useState(true)


	const [currentTab,setCurrentTab] = useState("chart")



	useEffect(() => {
		const newDataSetting = JSON.parse(urlGetParams.get("data"))??{page:0,groupby:"industry"}



		if(isForwardNavigation && dataSetting){
			setDataSettingStack([...dataSettingStack,dataSetting])
		}
		_setDataSetting(newDataSetting)

	},[location.search])


	const setDataSetting = (data,isForward=true) => {
		setIsForwardNavigation(isForward)
		navigate(`?data=${JSON.stringify(data)}`)
	}
	const popDataSettingStack = () => {

		let newStack=[...dataSettingStack]
		let newSetting=newStack.pop()
		setDataSettingStack(newStack)
		setDataSetting(newSetting,false)

	}
	const canNavigateBack=dataSettingStack.length>=1

	useEffect(() => {

		if(dataSetting)
			loadData(dataSetting.page,dataSetting.groupby)


	},[dataSetting])



	const loadData = async (id,field) => {
		//let resp=await axios.get(`http://localhost:3000/jobs`)
		//add get parameter

		let otherId=-1
		let resp
		if(dataSetting.filters){
			resp=await axios.get(API_URL,{params:{page:id,groupby:field,filters:JSON.stringify(dataSetting.filters)}})
		}else{
			resp=await axios.get(API_URL,{params:{page:id,groupby:field}})
		}



		let data=resp.data


		let ddata=data.jobs.reduce((acc,curr,index) => {
			acc.labels.push(curr['text'])
			acc.data.push(curr['count'])
			acc.backgroundColor.push(colorPalette[index%colorPalette.length])

			if(curr['p']==1){
				otherId=index
			}
			return acc
		}
			,{
				labels:[],
				data:[],
				backgroundColor: []
			})



		let piedata = {
			labels: ddata.labels,
			datasets: [
				{
					data:ddata.data,
					backgroundColor: ddata.backgroundColor,
					borderWidth: 1,
				},
			],
			_meta:	{
				data:data,
				otherId:otherId,
				numJobs:data.jobs.reduce((acc,curr) => acc+curr.count,0)
			}
		};
		setData(piedata)
	}






	const selectSegment=(idx) => {
		if(idx==data._meta.otherId){
			setDataSetting({page:dataSetting.page+1,groupby:dataSetting.groupby,filters:dataSetting.filters})
		}else{

			let current=carroussel.indexOf(dataSetting.groupby)
			let next=(current+1)%carroussel.length
			setDataSetting({page:0,groupby:carroussel[next], filters:{

				...dataSetting.filters??{},
				[carroussel[current]]:data._meta.data.jobs[idx].text
			}})

		}
	}

	const options = {
		onClick: (e,el,c) => {
			if(el[0]){
				let idx=el[0].index
				selectSegment(idx)
			}
		},
		onHover: (e,el,c) => {

			c.canvas.style.cursor = el[0] ? 'pointer' : 'default';
		},
		plugins: {
			colors: {
				enabled: true
			},
			tooltip: {
				callbacks: {
					label: (ttItem) => (`${ttItem.formattedValue} Jobs`)
				}
			},
			legend: {
				onClick: (e, legendItem) => {
					let idx=legendItem.index
					selectSegment(idx)
				},
				onHover: (e, legendItem,c) => {
					c.ctx.canvas.style.cursor = legendItem? 'pointer' : 'default';
				},
				onLeave: (e, legendItem,c) => {
					c.ctx.canvas.style.cursor = 'default';
				}
			}
		},
		animation: {
			duration: 400
		}
	}

	function fieldToText(field,isSingular){
		switch(field){
			case "industry":
				return isSingular?"der Industrie":"Industrien"
			case "industrySector":
				return isSingular?"des Industrie-Sektors":"Industrie-Sektoren"
			case "job":
				return isSingular?"des Berufes":"Stellenausschreibungen"
			case "specialization":
				return isSingular?"der Spezialisierung":"Spezialisierungen"
		}
		return "error"
	}



	return (
		<div className="chart ">
			{(data&&dataSetting)&&


			<>


				<Tabs defaultActiveKey="chart" id="uncontrolled-tab-example" className="mb-3"
					onSelect={(key) => {
						setCurrentTab(key)
					}}
				>
					<Tab eventKey="chart" title="Chart" />
					<Tab eventKey="table" title="Tabelle" />
					<Tab eventKey="hints" title="Hinweise" />
				</Tabs>

				{currentTab=="chart"&&

				<>

					{
						(data._meta.data.jobs.length==0)?
							<h3>Keine Jobs vorhanden</h3>
							:
							<Pie key={JSON.stringify(data._meta)} data={data} options={options} />
					}
				</>
				}
				{currentTab=="table"&&
					<TableView dataSettings={dataSetting} setDataSettings={setDataSetting} />
					}

				{["table","chart"].indexOf(currentTab)!=-1&&
				<>
					<h3 className="mt-3">
						
						{
							"table"==currentTab?"":
								(dataSetting.page==0?"":"Seite "+(dataSetting.page+1)+" der ")
						}

						Übersicht über alle Schweizer
					</h3>

					{"table"==currentTab?<h3>Stellenausschreibungen</h3>:
					<Dropdown>
						<Dropdown.Toggle id="dropdown-basic" as={CustomToggle}>
							{fieldToText(dataSetting.groupby,false)}
						</Dropdown.Toggle>

						<Dropdown.Menu>
							{
								carroussel.map((item) => (
									<Dropdown.Item key={item} onClick={() => setDataSetting({...dataSetting,groupby:item})}>{fieldToText(item,false)}</Dropdown.Item>
								))

							}
						</Dropdown.Menu>
					</Dropdown>
					}


					{dataSetting.filters&&Object.keys(dataSetting.filters).length>0&&
					<>
						<h3>welche Teil </h3>
						{
							Object.entries(dataSetting.filters).map(([field,filter]) => (

								<div key={field} className="py-1 my-1" style={{backgroundColor:"#CCCBFF",cursor:"pointer",color:"#0000AA"}}

									onClick={() => setDataSetting({
										...dataSetting,
											filters: Object.fromEntries(Object.entries(dataSetting.filters).filter(([key]) => key!=field))
									})}
								><span 


								>

									<XLg className="me-3 pb-1 "/>
									{fieldToText(field,true)} {filter} sind </span></div>
							))
						}
					</>
					}




					<div className="my-3 d-flex flex-column overflow-auto">
						<div className="mx-auto my-2">
							<b>Total: {data._meta.numJobs.toLocaleString()} Stellenausschreibungen</b>
						</div>
						<div className="d-flex justify-content-center">

							<Button className="mx-1" onClick={() => setDataSetting({page:0,groupby:"industry",filters:null})}>Zurück zur Industrieübersicht</Button>
							<Button
								disabled={!canNavigateBack}
								onClick={popDataSettingStack}

							>
								Zurück
							</Button>
						</div>
					</div>
				</>
				}


				{currentTab=="hints"&&
					<>
						<h5>Hinweise</h5>
						<ul>
							<li>Ein Klick auf ein Segment zeigt eine Übersicht über das Segment an, ein Klick auf "Weitere" zeigt die nächste Seite an</li>
							<li>Ähnliche Jobs können in verschiedenen Industrien vorkommen. Z.b. Wirtschaftsdozent</li>
							<li>Verschiedene Industrien können dieselben Industrie Sektoren haben, ein Sektor kann also über alle Industrien gesehen mehr Jobs haben.</li>
							<li>Verwenden Sie den Zurück-Button um zur vorherigen Ansicht zu gelangen</li>
							<li>Mehr interessante Projekte finden Sie auf <a href="https://www.marvinwyss.ch">MarvinWyss.ch</a></li>
						</ul>
					</>
				}





			</>
			}

		</div>
	)

} 
/*
			<p>Todo:

				Add indexes to database
				add table view
				multiple filters
				filters as list
				title below chart
				primary sector and secondary sector
				strip leading and trailing spaces

			</p>
			*/
