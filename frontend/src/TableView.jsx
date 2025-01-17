import {Table} from 'react-bootstrap';
import {useState,useEffect} from 'react'
import {Button} from 'react-bootstrap'

import * as BS from 'react-bootstrap'

import axios from 'axios'

const API_URL=process.env.NODE_ENV=="production"?"https://jobs.marvinwyss.ch/api/list/":"http://localhost:3003/api/list/"

export default function TableView({dataSettings,setDataSettings}) {

	const [data,setData] = useState(null)
	const [page,setPage] = useState(0)


	const [modalText,setModalText] = useState(null)

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
								<td
									style={{color:"blue",cursor:"pointer"}}
									onClick={()=>setModalText(row.description)}
								>
								{row.title}</td>

								{ ["industry","industrySector","job","specialization"].map((field) => (
									<td key={field}

										style={dataSettings.filters&&dataSettings.filters[field]==row[field]?{}:{color:"blue",cursor:"pointer"}}
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


			<BS.Modal show={modalText!=null} onHide={()=>setModalText(null)}>
				<BS.Modal.Header closeButton>
					<BS.Modal.Title>Modal heading</BS.Modal.Title>
				</BS.Modal.Header>
				<BS.Modal.Body
					style={{whiteSpace:"pre-wrap"}}
				>{modalText}</BS.Modal.Body>
				<BS.Modal.Footer>
					<BS.Button variant="secondary" onClick={()=>setModalText(null)}>
						Close
					</BS.Button>
					<BS.Button variant="primary" onClick={()=>setModalText(null)}>
						Save Changes
					</BS.Button>
				</BS.Modal.Footer>
			</BS.Modal>
		</>
	)





}
