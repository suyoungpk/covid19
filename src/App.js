import React, { useState, useEffect, useRef} from 'react';
import Chart from 'chart.js';
import axios from 'axios';
function App() {
  let [today,setToday] = useState(new Date());
  let [titles,setTtitles] = useState([]);
  let [items,setItems] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
        const drawChart = ()=>{
          const ctx = chartRef.current.getContext('2d');
          new Chart(ctx, {
              type: 'bar',
              data: {
                  labels: titles,
                  datasets: [{
                      label: '확진자 수 ',
                      data: items,
                      backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                          'rgba(54, 162, 235, 0.2)',
                          'rgba(255, 206, 86, 0.2)',
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(153, 102, 255, 0.2)',
                          'rgba(255, 159, 64, 0.2)'
                      ],
                      borderColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)'
                      ],
                      borderWidth: 1
                  }]
              },
              options: {
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
                  //console.log(`titles : ${titles}, items:${items}`);
                   drawChart();
                });
              }catch(e){
                console.log('error:'+e);
              }
          };
          fetchData();
   }, []);
  return (
   <div>
     <canvas id="myChart" ref ={chartRef} width={400} height={400} />
   </div>
  );
}

export default App;
