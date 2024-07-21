var express = require('express')
var bodyParser = require('body-parser')
let pgpromise = require('pg-promise')


//cors 

var cors = require('cors')
var app = express()
app.use(cors())



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
	password:"password"
};

let db = pgp(cn);


// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// POST /login gets urlencoded bodies
app.get('/jobs', urlencodedParser, async function (req, res) {

	try{

		//parse int
		const page=parseInt(req.query.page??0)
		const groupby=req.query.groupby??"industry"
		const filterField=req.query.filterField
		const filterValue=req.query.filterValue

		if(["industry","industrySector","job","specialization"].indexOf(groupby)==-1){
			res.status(400).json({error:"groupby not found"})
			return
		}
		if(filterField && ["industry","industrySector","job","specialization"].indexOf(filterField)==-1){
			res.status(400).json({error:"filterField not found"})
			return
		}

		const query = `WITH topIndustries AS (
			SELECT 
				$3:name, 
				COUNT(*) as count,
				0 as p
			FROM 
				jobs
			${filterField?
					`WHERE
					$4:name=$5
				`:""}
			GROUP BY
				$3:name
			ORDER BY
				count DESC,
				$3:name ASC

			LIMIT $2


		),
		remainingIndustries AS (
			SELECT
				'Weitere' as $3:name,
				COUNT(*) as count,
				1 as p
			FROM
				jobs
			WHERE
				$3:name not in (SELECT $3:name FROM topIndustries)
			${filterField?
					`
			AND
				$4:name=$5

`:""
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

		console.log(query)
		console.log({filterValue,filterField})





		const jobs = await db.any(query,[page*10,(page+1)*10,groupby,filterField,filterValue])

		console.log(jobs)



		res.json({jobs:jobs})

	}
	catch(e){
		console.log(e)
		res.status(500).json({error:"internal error"})
	}


})



app.listen(3000)
