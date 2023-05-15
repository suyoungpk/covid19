import React, { useState, useEffect, useRef} from 'react';
import Meta from './Meta';
import { useTranslation } from 'react-i18next';
import Chart from 'chart.js';
import axios from 'axios';
import './assets/css/covid19.css';
import xlsx from 'xlsx';

import svgData from './svgData.json'
function App() {
  let [today,setToday] = useState(new Date());
  let [titles,setTtitles] = useState([]);
  let [items,setItems] = useState([]);
  let [todayData,setTodayData] = useState({});
  let [todayData2,setTodayData2] = useState({});
  let [articles,setArticles] = useState([]);
  let [excelData,setExcelData] = useState([]);
  const chartRef = useRef(null);  
 
  const {t, i18n } = useTranslation();
  const changelanguage = (e)=>{
    //console.log(e.target.value);
    i18n.changeLanguage(e.target.value).then(()=>{
      changeLocalName();
    });
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
  let cnt = 1;
  const  getNews = async () => {
    cnt++;
    await axios.post('/news',{
        params:{
          page:cnt
        }
      }).then(res => {
        setArticles(articles.concat(res.data));
       // console.log(articles.length);
      });
  }
  const excelDownload = ()=>{
    console.log(excelData);
    const ws = xlsx.utils.json_to_sheet(excelData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
    xlsx.writeFile(wb, "Test.xlsx");
  }
  const createKakaoButton = () => {
    // kakao sdk script이 정상적으로 불러와졌으면 window.Kakao로 접근이 가능합니다
    if (window.Kakao) {
      const kakao = window.Kakao
      // 중복 initialization 방지
      if (!kakao.isInitialized()) {
        // 두번째 step 에서 가져온 javascript key 를 이용하여 initialize
        kakao.init(process.env.REACT_APP_KAKAO_KEY)
      }
      kakao.Link.createDefaultButton({
        // Render 부분 id=kakao-link-btn 을 찾아 그부분에 렌더링을 합니다
        container: '#kakao-link-btn',
        objectType: 'feed',
        content: {
          title: '코로나 바이러스 확진 현황',
          description: '#코로나 #확진자수',
          imageUrl: process.env.REACT_FETCH_URL+require('./assets/images/scan.jpg'), 
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        // social: {
        //   likeCount: 77,
        //   commentCount: 55,
        //   sharedCount: 333,
        // },
        buttons: [
          {
            title: '웹으로 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          }
          // {
          //   title: '앱으로 보기',
          //   link: {
          //     mobileWebUrl: window.location.href,
          //     webUrl: window.location.href,
          //   },
          // },
        ],
      })
    }
  }
  const changeLocalName = ()=>{
    let names = document.querySelectorAll('.map .area .local');
    names.forEach(e=>{
      e.innerHTML = t(e.dataset.name);
    });
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
                  onHover:false,
                  legend: {
                      display: false
                  },
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero: true
                          }
                      }]
                  },
                  animation: {
                    onComplete: function() {
                      const chartInstance = this.chart,
                        ctx = chartInstance.ctx;
     
                      ctx.font = Chart.helpers.fontString(
                        12,
                        Chart.defaults.global.defaultFontStyle,
                        Chart.defaults.global.defaultFontFamily
                      );
                      ctx.textAlign = "center";
                      ctx.textBaseline = "bottom";
     
                      this.data.datasets.forEach(function(dataset, i) {
                        const meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function(bar, index) {
                          const data = dataset.data[index];
                          ctx.fillStyle = 'rgba(255, 99, 132, 1)';
                          ctx.fillText(data, bar._model.x, bar._model.y - 2);
                        });
                      });
                    }
                  },
                  tooltips: {
                    enabled: false
                  },
                  layout: {
                    padding: {
                      top: 80,
                    },
                  },
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
                  
                 //let {item} = res.data.items;
                  
                  // let list = ;
               //   console.log(list);
                  let  dailyData = res.data[0];// 오늘날짜 데이터 
                  console.log(dailyData);
                  //yesterdayData = list[1]; // 어제날짜 데이터 
                  // console.log(list[0]);
                  let updated = dailyData.mmddhh.split('.');
                  setTodayData({
                   updateTime:updated[0]+'/'+updated[1],
                    decide : numberWithCommas(parseInt(dailyData.cnt_confirmations)), // 확진자수
                    // clear : numberWithCommas(todayData.clearCnt), // 격리해제
                    death : numberWithCommas(parseInt(dailyData.cnt_deaths)), // 사망자수
                    // exam : numberWithCommas(todayData.examCnt),// 검사수
                    decide_ :  parseInt(dailyData.cnt_deaths),// - parseInt(yesterdayData.decideCnt),
                    // clear_ :  parseInt(todayData.clearCnt) - parseInt(yesterdayData.clearCnt),
                    death_ :  parseInt(dailyData.cnt_confirmations)// - parseInt(yesterdayData.deathCnt),
                    // exam_ :  parseInt(todayData.examCnt) - parseInt(yesterdayData.examCnt)
                  });
                  titles.push(yyyy+"/"+ mm + "/"+(dd-1));
                  titles.push(yyyy+"/"+ mm + "/"+dd);
                  items.push(0);
                  items.push(parseInt(dailyData.cnt_confirmations));
                //  today.setDate(today.getDate()-5); // 5일전으로 셋팅
                //   for(let i = 0;i<5;i++){
                //       today.setDate(today.getDate() + 1);
                //       let dd = String(today.getDate()).padStart(2, '0'),
                //           mm = String(today.getMonth() + 1).padStart(2, '0'),
                //           yyyy = today.getFullYear();
                //       let day  = yyyy+'/'+ mm +'/'+ dd;
                //       titles.push(day);
                //       let str = yyyy+mm+dd;
                //       for(let j = 0;j < list.length;j++){
                //           if(list[j].stateDt == str) {
                //               let cha =  parseInt(list[j].decideCnt) -  parseInt(list[j+1].decideCnt);
                //               if(cha < 0) cha = 0;
                //               items.push(cha);
                //           };
                //       }
                //   }
                  
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
                  //let updated = item[0].stdDay._text.split('-');
                 // updated[1] = updated[1].substring(0,5); 
                  // setTodayData2({
                  //  updateTime:updated[0]+' '+updated[1]
                  // });
                  for(let i=0;i<svgData.length;i++){
                    for(let j=0;j<item.length;j++){
                      if(svgData[i].key === item[j].gubun._text){
                          let statusClass='', iconClass='', cnt = parseInt(item[j].incDec._text);
                          if(cnt > 0) iconClass = 'up';
                          else if(cnt <0) iconClass = 'down';
                          if(cnt > 100) statusClass = "step1";
                          if(cnt > 200) statusClass = "step2";
                          if(cnt > 500) statusClass = "step3";
                          if(cnt > 1000) statusClass = "step4";
                          excelData.push({
                            local:item[j].gubun._text,
                            total:numberWithCommas(item[j].defCnt._text),
                            today:item[j].incDec._text
                          })
                          
                          let temp = `<div class="area ${svgData[i].name} ${statusClass}">
                                        <a href="${svgData[i].href}" target="_blank">
                                          <p class="local" data-name='${svgData[i].name}'>${t(svgData[i].name)}</p>
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
                   setExcelData(excelData);
                });
                
                
              }catch(e){
                console.log('error:'+e);
              }

              
          };
         fetchData();
        getNews();
        // kakaoshare();
        createKakaoButton();
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
              <button className="btn btn-excel" type="button" onClick={excelDownload}>{t('excel')}</button>
              <button className="btn btn-kakao" type="button" id="kakao-link-btn">{t('kakao')}</button>
            </div>
          </div>
        </div>
        <div className="inner-wrapper">
          <article className="card info-box">
            <ul>
              <li>
                <h2>{t('totalcases')}</h2>
                <p className="total">{todayData.decide}</p>
                {/* <p className={
                  "today " +
                  (todayData.decide_ > 0? 'up' : '') +
                  (todayData.decide_ < 0? 'down' : '')
                }>{numberWithCommas(Math.abs(todayData.decide_))}</p> */}
              </li>
              {/* <li>
                <h2>{t('recovered')}</h2>
                <p className="total">{todayData.clear}</p>
                <p className={
                  "today " +
                  (todayData.clear_ > 0? 'up' : '') +
                  (todayData.clear_ < 0? 'down' : '')
                }>{numberWithCommas(Math.abs(todayData.clear_))}</p>
              </li> */}
              <li>
                <h2>{t('deaths')}</h2>
                <p className="total">{todayData.death}</p>
                {/* <p className={
                  "today " +
                  (todayData.death_ > 0? 'up' : '') +
                  (todayData.death_ < 0? 'down' : '')
                }>{numberWithCommas(Math.abs(todayData.death_))}</p> */}
              </li>
              {/* <li>
                <h2>{t('exam')}</h2>
                <p className="total">{todayData.exam}</p>
                <p className={
                  "today " +
                  (todayData.exam_ > 0? 'up' : '') +
                  (todayData.exam_ < 0? 'down' : '')
                }>{numberWithCommas(Math.abs(todayData.exam_))}</p>
              </li> */}
            </ul>
          </article>
          <article className="card chart-card">
            <h2>{t('active cases graph')}</h2>
            <div className="alert">
              😱 기존 공공 API 구조가 변경되어 확진자 추세를 파악할 수 없습니다.
            </div>
            <div className="chart">
              <canvas id="myChart" ref ={chartRef} width={400} height={400} />
            </div>
          </article>
          <article className="card">
            <h2>{t('local active cases')} <span>{todayData2.updateTime} {t('standard')}</span></h2>
            <div className="map"></div>
          </article>
          <article className="card news">
            <h2 className="hidden">{t('news')}</h2>
            <ul>
              {
                articles.map((e,i)=>{
                  return (
                    <li>
                      <a href={e.url} target="_blank" title="새창">
                        <p className="info"><span className="time">{e.date}</span><span className="press">{e.press}</span></p>
                        <p className="title">{e.title}</p>
                      </a>
                    </li>
                  );
                })
              }
            </ul>
            <div className="btn-area">
              <button className="btn btn-more" type="button" onClick={getNews}>
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
