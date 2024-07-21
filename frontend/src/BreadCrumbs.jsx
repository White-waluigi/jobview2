import Breadcrumb from 'react-bootstrap/Breadcrumb';


const clickableStyle = {
	cursor: 'pointer',
	color: 'blue',
	textDecoration: 'underline'
}

export default function BreadCrumbs({path,setPath}){

	const shortenPath = (selectedIndex) => {
		let newPath = path.slice(0,selectedIndex+1)
		setPath(newPath)
	}


	return (
		<Breadcrumb>
			{path.map((pathItem,index) => {
				if(index === path.length-1){
					return <Breadcrumb.Item key={index} active>{pathItem}</Breadcrumb.Item>
				}
				return <Breadcrumb.Item key={index} style={clickableStyle} onClick={() => shortenPath(index)}>{pathItem}</Breadcrumb.Item>
			})}
		</Breadcrumb>
	)

}
