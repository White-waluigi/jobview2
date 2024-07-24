var express = require('express')
var bodyParser = require('body-parser')
let pgpromise = require('pg-promise')


//cors 

var cors = require('cors')
var app = express()
app.use(cors())


let jsdom = require("jsdom");


//connect to localhost
//
const promise = require('bluebird'); // or any other Promise/A+ compatible library;

const initOptions = {
	promiseLib: promise // overriding the default (ES6 Promise);
};
let pgp = pgpromise(initOptions);
pgp.pg.types.setTypeParser(20, parseInt); 


const cn = {
	host: 'localhost', // server name or IP address;
	port: 5432,
	database:"jobview",
	user:"postgres",
	password:"postgres"
};

let db = pgp(cn);


// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


const getParams = (query) => {
	//parse int
	const page=parseInt(query.page??0)
	const groupby=query.groupby??"industry"

	const filters=[]

	const filterObj=(query.filters&&query.filters!=="undefined")?JSON.parse(query.filters):null

	if(filterObj){
		for(const key in filterObj){

			if(["industry","industrySector","job","specialization"].indexOf(key)==-1){
				res.status(400).json({error:"filter not found"})
				return
			}
			if(filters.find((filter)=>filter.field==key)){
				res.status(400).json({error:"filter already set"})
				return
			}

			filters.push({field:key,value:filterObj[key]})
		}
	}
	if(["industry","industrySector","job","specialization"].indexOf(groupby)==-1){
		throw new Error("groupby not found:"+groupby)
	}

	return {page,groupby,filters}


}
// POST /login gets urlencoded bodies
app.get('/api/jobs', urlencodedParser, async function (req, res) {

	try{


		const {page,groupby,filters} = getParams(req.query)






		const filterQuery=filters.map((filter,index)=>`$${index*2+4}:name=$${index*2+5}`).join(" AND ")

		const query = `WITH topIndustries AS (
			SELECT 
				$3:name::text, 
				COUNT(*) as count,
				0 as p
			FROM 
				jobs

			${filters.length>0?
					`
			WHERE
				${filterQuery}
			`
					:""
			}


			GROUP BY
				$3:name
			ORDER BY
				count DESC,
				$3:name ASC

			LIMIT $2


		),
		remainingIndustries AS (
			SELECT
				'Weitere'::text as $3:name,
				COUNT(*) as count,
				1 as p
			FROM
				jobs
			WHERE
				$3:name not in (SELECT $3:name FROM topIndustries)
			${filters.length>0?
					`
				AND
				${filterQuery}
				`
					:""
			}
		),

		unioned AS(
		(
			SELECT
				* 
			FROM topIndustries
			OFFSET $1
			)
		UNION
		(

			SELECT
				*
			FROM
				remainingIndustries

			WHERE
				count>0
			)


		)
		SELECT
			$3:name as text,
			count,
			p
		FROM
			unioned
		ORDER BY
			p ASC,
			count DESC

		;	


	`	






		const jobs = await db.any(query,[page*10,(page+1)*10,groupby,...filters.flatMap((filter)=>[filter.field,filter.value])])



		res.json({jobs:jobs})

	}
	catch(e){
		console.log(e)
		res.status(500).json({error:"internal error"})
	}


})


app.get('/api/list', urlencodedParser, async function (req, res) {

	try{
		const {page,groupby,filters} = getParams(req.query)

		const filterQuery=filters.map((filter,index)=>`$${index*2+4}:name=$${index*2+5}`).join(" AND ") 

		const query = `SELECT 
			industry,
			"industrySector",
			job,
			specialization,
			id,
			title,
			"rawHtml" 
		FROM
			jobs
			${filters.length>0?

					`
			WHERE
				${filterQuery}
			`
					:""

			}
		ORDER BY
			industry,
			"industrySector",
			job,
			specialization
		OFFSET $1 LIMIT 11
				`

		let jobs = await db.any(query,[page*10,(page+1)*10,groupby,...filters.flatMap((filter)=>[filter.field,filter.value])])

		const hasNext = jobs.length==11




		jobs=jobs.slice(0,10)

		

		//convert raw html to text
		const { JSDOM } = jsdom;
		jobs=jobs.map((job)=>{
			const dom = new JSDOM(job.rawHtml);
			//remove script and style tags

			const body = dom.window.document.body;
			const script = body.querySelector("script")
			if(script){
				script.remove()
			}
			const style = body.querySelector("style")
			if(style){
				style.remove()
			}

			//get text
			let text = body.textContent


			//add newlines after each tag
			let recurse=(node,sofar)=>{
				if(node.nodeType==3){
					return sofar+node.textContent+"\n"
				}
				if(node.nodeType==8){
					return sofar
				}
				if(node.nodeType==1){
					let text=""
					for(let i=0;i<node.childNodes.length;i++){
						text=recurse(node.childNodes[i],text)
					}
					return sofar+text
				}
				return sofar

			}
			text=recurse(body,"")
			
			//remove all newlines without text
			text=text.split("\n").filter((line)=>line.trim()!="").join("\n")

			job.description=text

			return job
		})


		res.json({jobs,hasNext:hasNext})
	}
	catch(e){
		console.log(e)
		res.status(500).json({error:"internal error"})
	}



})

app.listen(3003)
