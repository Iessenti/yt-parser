const fs = require('fs')
const youtube = require('scrape-youtube').default;
const express = require('express')
const app = express()

app.use('/api', require('./routes/getdatabyclient'))

const config = require('config')
const MongoClient = require("mongodb").MongoClient
const dbClient = new MongoClient(config.get("mongoUri"), {useNewUrlParser:true, useUnifiedTopology: true})

const checkStartedStreams = async () => {

    dbClient.connect( (error, client) => {

        if (error) return console.log(error);

        const db = client.db('streams')
        const futureStreams = db.collection('future-streams')
        const currentStreams = db.collection('current-streams')

        const today = new Date().toISOString().slice(0, 10)
    
        const timenow = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric"})
        
        futureStreams.find({$and: [ {date: today}, { time: { $lte : timenow } } ] }).toArray( (err, result) => {
            //console.log('checking future streams ', result)
            if (result &&  (result.length > 0) ) {
                currentStreams.insertMany(result)
                futureStreams.deleteMany({$and: [ {date: today}, { time: { $lte : timenow } } ] })
            }

        })
            
    } )
}

const writeStreams = async () => {
    dbClient.connect( (error, client) => {

        if (error) return console.log(error)

        const db = client.db('streams')
        const currentStreams = db.collection('current-streams')

        currentStreams.find().toArray( (err, result) => {
            //console.log( result )
            result.forEach( elem => {

                const url = elem.url
                let id = url.slice( url.indexOf('.be/')+4 )

                // if ( url.indexOf('&') != -1 ) {
                //     id = url.slice( 
                //         url.indexOf('v=') + 1, 
                //         url.indexOf('&') 
                //     )
                    
                // } else {
                //     id = url.slice( url.indexOf('v=') + 2  )
                    
                // }
                
                const timenow = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric"})
                

                // YouTube.search(elem.title, { limit: 3 })
                // .then(x => console.log(x))
                youtube.search(elem.videoTitle, { type: 'live' }).then( (results) => {

                    let viewCount = ''
                    results.streams.every( e => {

                        if (e.id === id) {
                            viewCount = e.watching
                            
                            return true
                        }
                    })
                    
                    if (viewCount != undefined) {
                        currentStreams.updateOne({url: url}, { $push: { arrayTime: { viewers: viewCount, time: timenow } } })
                    }
                    

                });
                
            })
        })

    })
}


async function start () {
    try {
        app.listen(5000, () => console.log('App has been started!'))

        setInterval( () => {

            checkStartedStreams()
            writeStreams()

        }, 60000 )
        
    } catch(e) {
        console.log('Server error', e.message)
        process.exit(1)
    }
}

start()

