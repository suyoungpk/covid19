import React, { useState, useEffect, useRef} from 'react';
import Meta from './Meta';
import { useTranslation } from 'react-i18next';
import Chart from 'chart.js';
import axios from 'axios';
import './assets/css/covid19.css';

import svgData from './svgData.json'
function App() {
  let [today,setToday] = useState(new Date());
  let [titles,setTtitles] = useState([]);
  let [items,setItems] = useState([]);
  let [todayData,setTodayData] = useState({});
  let [todayData2,setTodayData2] = useState({});
  const chartRef = useRef(null);  
 
  const {t, i18n } = useTranslation();
  const changelanguage = (e)=>{
    //console.log(e.target.value);
    i18n.changeLanguage(e.target.value);
  };
  const metaData = {
      title:t('meta-title'),
      description:t('meta-desc')
  }
  const selectbox = (e)=>{
    let target = e.target || e;
    target.parentNode.querySelector('label').innerText = target.parentNode.querySelector('select option:checked').innerText;
  };
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  useEffect(() => {
        let selectBoxs = document.querySelectorAll('.select-box');
        selectBoxs.forEach(e => {
          selectbox(e.querySelector('select'));
        });
        const drawChart = ()=>{
          const ctx = chartRef.current.getContext('2d');
          new Chart(ctx, {
              type: 'line',
              data: {
                  labels: titles,
                  datasets: [{
                      fill:false,
                      label: '확진자 수 ',
                      data: items,
                      borderWidth:1,
                      borderColor:'rgba(255, 99, 132, 1)',
                      backgroundColor:'rgba(255, 99, 132, 1)'
                  }]
              },
              options: {
                legend: {
                      display: false
                  },
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero: true
                          }
                      }]
                  }
              }
          });
        }
        const fetchData = async ()=>{
              let dd = String(today.getDate()).padStart(2, '0'),
                  mm = String(today.getMonth() + 1).padStart(2, '0'),
                  yyyy = today.getFullYear();  
              try{
                let res = await axios.post('/api',{
                  params:{
                    date:yyyy+"/"+ mm + "/"+dd
                  }
                }).then(res => {
                  let {item} = res.data.response.body.items;
                  let list = item;
                  let  todayData = list[0],// 오늘날짜 데이터 
                  yesterdayData = list[1]; // 어제날짜 데이터 
                  // console.log(list[0]);
                  let updated = todayData.createDt._text.split(' ');
                  updated[1] = updated[1].substring(0,5); 
                  setTodayData({
                   updateTime:updated[0]+' '+updated[1],
                    decide : numberWithCommas(todayData.decideCnt._text),
                    clear : numberWithCommas(todayData.clearCnt._text),
                    death : numberWithCommas(todayData.deathCnt._text),
                    exam : numberWithCommas(todayData.examCnt._text),
                    decide_ :  parseInt(todayData.decideCnt._text) - parseInt(yesterdayData.decideCnt._text),
                    clear_ :  parseInt(todayData.clearCnt._text) - parseInt(yesterdayData.clearCnt._text),
                    death_ :  parseInt(todayData.deathCnt._text) - parseInt(yesterdayData.deathCnt._text),
                    exam_ :  parseInt(todayData.examCnt._text) - parseInt(yesterdayData.examCnt._text)
                  });
                 today.setDate(today.getDate()-5); // 5일전으로 셋팅
                  for(let i = 0;i<5;i++){
                      today.setDate(today.getDate() + 1);
                      let dd = String(today.getDate()).padStart(2, '0'),
                          mm = String(today.getMonth() + 1).padStart(2, '0'),
                          yyyy = today.getFullYear();
                      let day  = yyyy+'/'+ mm +'/'+ dd;
                      titles.push(day);
                      let str = yyyy+mm+dd;
                      for(let j = 0;j < list.length;j++){
                          if(list[j].stateDt._text == str) {
                              let cha =  parseInt(list[j].decideCnt._text) -  parseInt(list[j+1].decideCnt._text);
                              if(cha < 0) cha = 0;
                              items.push(cha);
                          };
                      }
                  }
                  
                   drawChart();
                });
                let res2 = await axios.post('/api2',{
                  params:{
                    date:yyyy+"/"+ mm + "/"+dd
                  }
                }).then(res => {
                  let {item} = res.data.response.body.items;
                   console.log(item);
                  // document.querySelector("#incheon").innerHTML = svgData[0].svg;
                  let updated = item[0].createDt._text.split(' ');
                  updated[1] = updated[1].substring(0,5); 
                  setTodayData2({
                   updateTime:updated[0]+' '+updated[1]
                  });
                  for(let i=0;i<svgData.length;i++){
                    for(let j=0;j<item.length;j++){
                      if(svgData[i].key === item[j].gubun._text){
                          let statusClass='', iconClass='', cnt = parseInt(item[j].incDec._text);
                          if(cnt > 0) iconClass = 'up';
                          else if(cnt <0) iconClass = 'down';
                          if(cnt > 10) statusClass = "step1";
                          if(cnt > 20) statusClass = "step2";
                          if(cnt > 50) statusClass = "step3";
                          if(cnt > 100) statusClass = "step4";
                          
                          let temp = `<div class="area ${svgData[i].name} ${statusClass}">
                                        <a href="${svgData[i].href}" target="_blank">
                                          <p class="local">${t(svgData[i].name)}</p>
                                          <p class="total">${ numberWithCommas(item[j].defCnt._text)}</p>
                                          <p class="today ${iconClass}">${item[j].incDec._text}</p>
                                        </a>
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0, 0, 400, 653">
                                          ${svgData[i].svg}
                                        </svg>
                                      </div>`;
                          document.querySelector('.map').innerHTML+= temp;
                          break;
                        }
                      }
                   }
                  
                });
              }catch(e){
                console.log('error:'+e);
              }


          };
          fetchData();
   }, []);
  return (
   <div>
     <Meta data = {metaData}/>
     <section className="wrapper">
        <div className="title-area">
          <div className="inner-wrapper">
            <div className="select-box">
              <label htmlFor="lang">한국어</label>
              <select name id="lang" onChange={e=>{changelanguage(e);selectbox(e)}}>
                <option value='ko' selected>한국어</option>
                <option value='en'>English</option>
              </select>
            </div>
            <h1>{t('covid')}</h1>
            <p className="time">{todayData.updateTime} {t('standard')}</p>
            <div className="fixed">
              <button className="btn btn-excel" type="button">{t('excel')}</button>
              <button className="btn btn-kakao" type="button">{t('kakao')}</button>
            </div>
          </div>
        </div>
        <div className="inner-wrapper">
          <article className="card info-box">
            <ul>
              <li>
                <h2>{t('totalcases')}</h2>
                <p className="total">{todayData.decide}</p>
                <p className={
                  "today " +
                  (todayData.decide_ > 0? 'up' : '') +
                  (todayData.decide_ < 0? 'down' : '')
                }>{Math.abs(todayData.decide_)}</p>
              </li>
              <li>
                <h2>{t('recovered')}</h2>
                <p className="total">{todayData.clear}</p>
                <p className={
                  "today " +
                  (todayData.clear_ > 0? 'up' : '') +
                  (todayData.clear_ < 0? 'down' : '')
                }>{Math.abs(todayData.clear_)}</p>
              </li>
              <li>
                <h2>{t('deaths')}</h2>
                <p className="total">{todayData.death}</p>
                <p className={
                  "today " +
                  (todayData.death_ > 0? 'up' : '') +
                  (todayData.death_ < 0? 'down' : '')
                }>{Math.abs(todayData.death_)}</p>
              </li>
              <li>
                <h2>{t('exam')}</h2>
                <p className="total">{todayData.exam}</p>
                <p className={
                  "today " +
                  (todayData.exam_ > 0? 'up' : '') +
                  (todayData.exam_ < 0? 'down' : '')
                }>{Math.abs(todayData.exam_)}</p>
              </li>
            </ul>
          </article>
          <article className="card">
            <h2>{t('active cases graph')}</h2>
            <div className="chart">
              <canvas id="myChart" ref ={chartRef} width={400} height={400} />
            </div>
          </article>
          <article className="card">
            <h2>{t('local active cases')} <span>{setTodayData2.updateTime} {t('standard')}</span></h2>
            <div className="map"></div>
          </article>
          <article className="card news">
            <h2 className="hidden">{t('news')}</h2>
            <ul>
              <li>
                <a href="#" target="_blank" title="새창">
                  <p className="info"><span className="time">36분전</span><span className="press">연합뉴스</span></p>
                  <p className="title">
                    가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차
                  </p>
                </a>
              </li>
              <li>
                <a href="#" target="_blank" title="새창">
                  <p className="info"><span className="time">36분전</span><span className="press">연합뉴스</span></p>
                  <p className="title">
                    가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차
                  </p>
                </a>
              </li>
              <li>
                <a href="#" target="_blank" title="새창">
                  <p className="info"><span className="time">36분전</span><span className="press">연합뉴스</span></p>
                  <p className="title">
                    가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차
                  </p>
                </a>
              </li>
              <li>
                <a href="#" target="_blank" title="새창">
                  <p className="info"><span className="time">36분전</span><span className="press">연합뉴스</span></p>
                  <p className="title">
                    가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차
                  </p>
                </a>
              </li>
              <li>
                <a href="#" target="_blank" title="새창">
                  <p className="info"><span className="time">36분전</span><span className="press">연합뉴스</span></p>
                  <p className="title">
                    가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차
                  </p>
                </a>
              </li>
            </ul>
            <div className="btn-area">
              <button className="btn btn-more" type="button">
              {t('more')}
              </button>
            </div>
          </article>
        </div>
      </section>
   </div>
  );
}

export default App;
