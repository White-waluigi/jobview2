import {Table} from 'react-bootstrap';
import {useState,useEffect} from 'react'
import {Button} from 'react-bootstrap'

import axios from 'axios'

const API_URL=process.env.NODE_ENV=="production"?"https://jobs.marvinwyss.ch/api/list/":"http://localhost:3003/api/list/"

export default function TableView({dataSettings,setDataSettings}) {

	const [data,setData] = useState(null)
	const [page,setPage] = useState(0)

	useEffect(() => {
		loadData()
	},[dataSettings,page])

	const loadData = async () => {
		try{
			const response = await axios.get(API_URL+`?page=${page}&groupby=${dataSettings.groupby}&filters=${JSON.stringify(dataSettings.filters)}`)



			setData(response.data)
		}
		catch(e){
			console.log(e)
			setData("error")
		}

	}

	if(!data){
		return <div>Loading...</div>
	}
	if(data=="error"){
		return <div>Error
		</div>
	}

	return (
		<>
			<div className="d-flex w-100 flex-column justify-content-between">
				<div className="d-flex flex-row  flex-grow-1 w-100 justify-content-between">
					<Button disabled={page==0}
						onClick={()=>setPage(page-1)}>Previous</Button>
					<div>Seite {page+1}</div>
					<Button disabled={!data.hasNext}
						onClick={()=>setPage(page+1)}>Next</Button>
				</div>
				<Table >
					<thead>
						<tr>
							<th>Text</th>
							<th>Industrie</th>
							<th>Industrie-Sektor</th>
							<th>Job</th>
							<th>Spezialisierung</th>
						</tr>
					</thead>
					<tbody>
						{data.jobs.map((row) => (
							<tr key={row.id}>
								<td>{row.title}</td>

								{ ["industry","industrySector","job","specialization"].map((field) => (
									<td key={field}
										style={{cursor:"pointer"}}
										className="text-primary"
										onClick={()=>{
											const newDataSettings=structuredClone(dataSettings)
											newDataSettings.filters??={}
											newDataSettings.filters[field]=row[field]
											setDataSettings(newDataSettings)
											setPage(0)
										}
										}
									>{row[field]}</td>
								))}
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		</>
	)





}
