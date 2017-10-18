// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var https = require('https');
var bl = require('bl');
var mongo = require('mongodb').MongoClient;
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.end("Hello World!")
});

app.get('/api/latest/imagesearch', function(request, response){
  mongo.connect('mongodb://fccuser:fccadmin@ds121965.mlab.com:21965/fcc-img-search', function(err, db){
    
      if(err){
        response.end("ERROR!");
      }
      else{
        var searches = db.collection('searches');
        searches.aggregate([{$sort : {when: -1}}, {$project: {_id:0}}]).toArray(function(e, results){
          
          response.json(results);
        })
      }
      
  });
})


app.get('/api/imagesearch/:img', function(request, response){
  var img = request.params.img;
  var offset = request.query.offset || "1";
  
  var url = 'https://pixabay.com/api/?key=6740749-d4fe416b5182d6b3ea9d2922e&q='  + encodeURI(img)  + '&image_type=photo&page=' + offset
  
  

  
  https.get(url, function(req, resp){
      req.pipe(bl(function(err, data){
          
          var obj = JSON.parse(data.toString());
          var r = [];
        
          obj["hits"].forEach(function(i){
            r.push({"url" : i["webformatURL"], "thumbnail" : i["previewURL"]})
          });
          
        mongo.connect('mongodb://fccuser:fccadmin@ds121965.mlab.com:21965/fcc-img-search', function(err, db){
        
          if(err){
            response.end("ERROR");
          }
        else{
            var searches = db.collection('searches');
            searches.insert({term: img, when: new Date().toISOString()})
            
        }
      
  });
          response.json(r);
      }));
  });
  
  
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
