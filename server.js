
const express = require('express');
// const serveStatic = require('serve-static')
const app = express();
const cors = require('cors');
const request = require('request');
const convert = require('xml-js');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require('iconv-lite');
require('dotenv').config();
// CORS 설정
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// app.use(serveStatic(__dirname + '/build'))
app.use(express.static(path.join(__dirname, '/build')));
app.get('/', (req,res) =>{
    // console.log(res);
    res.sendFile(path.join(__dirname+'/build/index.html'));
});
app.post("/api", function (req, res, next) {
    let { body } = req;    
    // let data = body.params.date.split('/');
    // // let endDate = data.join('');
    // let date = new Date(data[0]+"-"+data[1]+"-"+(data[2]));
    // date.setDate(date.getDate()-5);
    // let startDate = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
    // console.log(`startDate:${startDate}, endDate:${endDate}`);

    let url = 'http://apis.data.go.kr/1790387/covid19CurrentStatusKorea/covid19CurrentStatusKoreaJason'; /*URL*/
    let queryParams = '?' + encodeURIComponent('serviceKey') + '='+'QgWB5dhDSB2S7K9yaH4g8JISFXuJ2mFdj0W5koh2gpQCpcrxJ%2BGY39hLhRKVLNcFio6%2F7Ql1%2FMDk6kZmklngog%3D%3D'; /*Service Key*/
    // queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
    // queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /**/
    // queryParams += '&' + encodeURIComponent('apiType') + '=' + encodeURIComponent('xml'); /* */
    // queryParams += '&' + encodeURIComponent('std_day') + '=' + encodeURIComponent(startDate); /* */
    // queryParams += '&' + encodeURIComponent('startCreateDt') + '=' + encodeURIComponent(startDate); /**/
    // queryParams += '&' + encodeURIComponent('endCreateDt') + '=' + encodeURIComponent(endDate); /**/
    
    console.log(queryParams);
   try {
        axios.get(url + queryParams).then(response=>{
        let {result} = response.data.response;
            console.log(result);
            res.send(result);
        })
    } catch (e) {
        console.error(e);
    } 
});

app.post("/api2", function (req, res, next) {
    let { body } = req;    
    let data = body.params.date.split('/');
    let endDate = data.join('');
    let date = new Date(data[0]+"-"+data[1]+"-"+(data[2]));
    date.setDate(date.getDate()-1);
    let startDate = date.getFullYear() +"-"+ String(date.getMonth() + 1).padStart(2, '0') +"-"+  String(date.getDate()).padStart(2, '0');
    // console.log(`startDate:${startDate}, endDate:${endDate}`);

    let url = 'http://apis.data.go.kr/1352000/ODMS_COVID_04/callCovid04Api';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=QgWB5dhDSB2S7K9yaH4g8JISFXuJ2mFdj0W5koh2gpQCpcrxJ%2BGY39hLhRKVLNcFio6%2F7Ql1%2FMDk6kZmklngog%3D%3D'; /* Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('17'); /* */
    queryParams += '&' + encodeURIComponent('apiType') + '=' + encodeURIComponent('xml'); /* */
    queryParams += '&' + encodeURIComponent('std_day') + '=' + encodeURIComponent(startDate); /* */

    request({
        url: url + queryParams,
        method: 'GET'
    }, function (error, response, body) {
        //console.log('Status', response.statusCode);
        //console.log('Headers', JSON.stringify(response.headers));
    //    console.log('Reponse received', body);
       const xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
    //    console.log(xmlToJson.response); 
       //console.log(xmlToJson.response.body.items.item);
       // result.push(xmlToJson.body.items.item);       
       res.set('Content-Type', 'text/json');
       res.send(xmlToJson);    
    });  
    
});

app.post("/news", function (req, res, next) {
    let { body } = req;    
    let page = parseInt(body.params.page) || 1;
    let rank = page*12;
    page = (page*10)-9;
    //console.log(`rank:${rank} page:${page}`);
    try {
        axios.request(
        {
            method: 'GET',
            url: `https://search.naver.com/search.naver?&where=news&query=%EC%BD%94%EB%A1%9C%EB%82%98&sm=tab_pge&sort=0&photo=0&field=0&reporter_article=&pd=0&ds=&de=&docid=&nso=so:r,p:all,a:all&mynews=0&cluster_rank=${rank}&start=${page}&refresh_start=0`,
             responseType: 'arraybuffer',
            responseEncoding: 'binary'
        }).then(html=>{
            let ulList = [];
           // console.log(html.data); iconv.decode(html.data,'EUC-KR').toString()
            const $ = cheerio.load(html.data);
            const $bodyList = $('#main_pack .list_news').children();
            $bodyList.each(function(i, elem) {
                let target = $(this).find('.news_area .news_tit'),
                    target2 = $(this).find('.info_group');
                ulList[i] = {
                    title: target.text().replace(/[\"\']|^\s+|\t|\n/gi, ""),
                    url: target.attr('href'),
                    date: target2.find('span.info').text(),
                    press: target2.find('a.press').text().replace(/(언론사 선정)$/gi, "")
                }
            });
           // console.log(ulList);
            res.send(ulList);
        });
    } catch (e) {
        console.error(e);
    } 
  
});
var server_port = process.env.SERVICE_PORT || 9080;
app.listen(server_port);
console.log('Listening on port ' + server_port)
// app.listen(8080, function () {
//   console.log('CORS-enabled web server listening on port 8080')
// });