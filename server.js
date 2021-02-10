
const express = require('express');
// const serveStatic = require('serve-static')
const app = express();
const cors = require('cors');
const request = require('request');
const convert = require('xml-js');
const bodyParser = require('body-parser');
const path = require('path');

// CORS 설정
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// app.use(serveStatic(__dirname + '/build'))
app.use(express.static(path.join(__dirname, '/build')));
app.get('/', (req,res) =>{
    console.log(res);
    res.sendFile(path.join(__dirname+'/build/index.html'));
});
app.post("/api", function (req, res, next) {
    let { body } = req;    
    let data = body.params.date.split('/');
    let endDate = data.join('');
    let date = new Date(data[0]+"-"+data[1]+"-"+(data[2]));
    date.setDate(date.getDate()-5);
    let startDate = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
    console.log(`startDate:${startDate}, endDate:${endDate}`);

    let url = 'http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson'; /*URL*/
    let queryParams = '?' + encodeURIComponent('serviceKey') + '='+'l%2B2bNQBNeAMYxEqyLrPJy4mACTaHayxprlGaYJgya6S5QgOB7%2Fs%2BJ8qiKbJXtdrdybGJetiyKiPnnTV5LyOp1Q%3D%3D'; /*Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /**/
    queryParams += '&' + encodeURIComponent('startCreateDt') + '=' + encodeURIComponent(startDate); /**/
    queryParams += '&' + encodeURIComponent('endCreateDt') + '=' + encodeURIComponent(endDate); /**/
    
    let result;
    request({
        url: url + queryParams,
        method: 'GET'
    }, function (error, response, body) {
        //console.log('Status', response.statusCode);
        //console.log('Headers', JSON.stringify(response.headers));
        //console.log('Reponse received', body);
        result = body;
        var xmlToJson = convert.xml2json(result, {compact: true, spaces: 4});
        //console.log(xmlToJson);
        res.set('Content-Type', 'text/json');
      //  console.log(xmlToJson);
        res.send(xmlToJson);
    });    
});

app.post("/api2", function (req, res, next) {
    let { body } = req;    
    let data = body.params.date.split('/');
    let endDate = data.join('');
    let date = new Date(data[0]+"-"+data[1]+"-"+(data[2]));
    date.setDate(date.getDate()-1);
    let startDate = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
    console.log(`startDate:${startDate}, endDate:${endDate}`);

    var url = 'http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19SidoInfStateJson';
    var queryParams = '?' + encodeURIComponent('ServiceKey') + '=l%2B2bNQBNeAMYxEqyLrPJy4mACTaHayxprlGaYJgya6S5QgOB7%2Fs%2BJ8qiKbJXtdrdybGJetiyKiPnnTV5LyOp1Q%3D%3D'; /* Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /* */
    queryParams += '&' + encodeURIComponent('startCreateDt') + '=' + encodeURIComponent(startDate); /* */
    queryParams += '&' + encodeURIComponent('endCreateDt') + '=' + encodeURIComponent(endDate); /* */
    
    let result;
    request({
        url: url + queryParams,
        method: 'GET'
    }, function (error, response, body) {
        //console.log('Status', response.statusCode);
        //console.log('Headers', JSON.stringify(response.headers));
        //console.log('Reponse received', body);
        result = body;
        var xmlToJson = convert.xml2json(result, {compact: true, spaces: 4});
        //console.log(xmlToJson);
        res.set('Content-Type', 'text/json');
      //  console.log(xmlToJson);
        res.send(xmlToJson);
    });    
});
var server_port = process.env.APP_SERVICE_PORT || 9080;
app.listen(server_port);
console.log('Listening on port ' + server_port)
// app.listen(8080, function () {
//   console.log('CORS-enabled web server listening on port 8080')
// });