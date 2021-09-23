const express = require('express')
const router = express.Router()
const jsonParser = express.json()
const config = require('config')
const fs = require('fs')
const MongoClient = require("mongodb").MongoClient
const yt = require ('youtube-info-streams')
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const dbClient = new MongoClient(config.get("mongoUri"))

router.post(
    '/create-new-stream',
    jsonParser,
    async (req, res) => {
        dbClient.connect( (error, client) => {

            if (error) return console.log(error)

            const db = client.db('streams')
            const collection = db.collection('future-streams')

            const {url, fulldate} = req.body

            const time = fulldate.slice(11)
            const date = fulldate.slice(0, 10)
            let id = url.slice( url.indexOf('.be/')+4 )

            // if ( url.indexOf('&') != -1 ) {
            //     id = url.slice( 
            //         url.indexOf('v=') + 1, 
            //         url.indexOf('&') 
            //     )    
            // } else {
            //     id = url.slice( url.indexOf('v=') + 2  )          
            // }

            const video =  yt.info(id)

            

            video.then( video => {
                console.log(video.title)
                let body = { url: url, time: time, date: date, arrayTime: [], videoTitle: video.title }
                collection.insertOne(body, (err, result) => {
                    console.log('writen')
                    client.close()
                })
    
                fs.writeFile( './files/' + id +'.csv', '', (err, result) => {  } )
            })          
            
        })
    }
)

router.post(
    '/getFile',
    jsonParser,
    async (req, res) => {
        dbClient.connect( (error, client) => {

            if (error) return console.log(error)

            const db = client.db('streams')
            const collection = db.collection('current-streams')


            
            const url = req.body.url
            //console.log(req.body)
            collection.findOne({url:url}, (err, result) => {

                // if ( url.indexOf('&') != -1 ) {
                //     id = url.slice( 
                //         url.indexOf('v=') + 1, 
                //         url.indexOf('&') 
                //     )    
                // } else {
                //     id = url.slice( url.indexOf('v=') + 2  )          
                // }
                let id = url.slice( url.indexOf('.be/')+4 )
                const csvWriter = createCsvWriter({
                    path: './files/'+id+'.csv',
                    header: [
                        {id: 'viewers', title: 'Viewers'},
                        {id: "time", title: 'Time'}
                    ]
                })

                //console.log(result.arrayTime)
                csvWriter.writeRecords(result.arrayTime)       // returns a promise
                    .then(() => {
                        console.log('...Done');
                });

                collection.deleteOne({url: url})
                //u.slice( str.indexOf('.be/')+4 )
                // res.status(200).sendFile('./files/' + id + '.csv');
                const filePath = path.resolve('./files')
                console.log('./files/'+ id +'.csv')
                res.download('./files/'+ id +'.csv')

                client.close()
            })
        })
    }
)

module.exports = router