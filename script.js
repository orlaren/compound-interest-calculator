
// Utility: currency format
const fmt = new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'});

function compound({P, r, n, years, contribMonthly=0, inflation=0}){
  // r is annual rate in decimal, n compounding periods per year.
  const periods = Math.round(n*years);
  const i = r/n;
  const c = contribMonthly; // monthly contribution amount
  const m = 12; // months per year
  const timeline = [];
  let balance = P;
  let totalContrib = 0;
  for(let t=1;t<=periods;t++){
    // Add proportional contribution each compounding period (convert monthly to per-period)
    const contribPerPeriod = c * (m/n);
    if (contribPerPeriod>0){
      balance += contribPerPeriod;
      totalContrib += contribPerPeriod;
    }
    // Apply interest
    balance *= (1+i);
    if (t % n === 0) {
      const year = t/n;
      timeline.push({year, balance, totalContrib});
    }
  }
  const totalInterest = balance - P - totalContrib;
  // Inflation-adjusted using real rate approximation: real = nominal/(1+infl)^years
  const real = inflation>0 ? balance / Math.pow(1+inflation, years) : balance;
  return {balance, totalContrib, totalInterest, real, timeline};
}

function render(){
  const P = parseFloat(document.getElementById('principal').value||0);
  const r = parseFloat(document.getElementById('rate').value||0)/100;
  const years = parseInt(document.getElementById('years').value||0,10);
  const n = parseInt(document.getElementById('frequency').value,10);
  const contrib = parseFloat(document.getElementById('contrib').value||0);
  const inflation = parseFloat(document.getElementById('inflation').value||0)/100;

  if (P<0||r<0||years<=0||n<=0||contrib<0||inflation<0) return;

  const {balance,totalContrib,totalInterest,real,timeline} = compound({P,r,n,years,contribMonthly:contrib,inflation});

  document.getElementById('ending-balance').textContent = fmt.format(balance);
  document.getElementById('total-contrib').textContent = fmt.format(totalContrib);
  document.getElementById('total-interest').textContent = fmt.format(totalInterest);
  document.getElementById('real-balance').textContent = fmt.format(real);

  // Table
  const table = document.getElementById('table');
  table.innerHTML = '';
  const header = document.createElement('tr');
  header.innerHTML = '<th>Year</th><th>Balance</th><th>Total contributed</th>';
  table.appendChild(header);
  timeline.forEach(row=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="text-align:left">${row.year}</td><td>${fmt.format(row.balance)}</td><td>${fmt.format(row.totalContrib)}</td>`;
    table.appendChild(tr);
  });

  // Chart
  const labels = timeline.map(t=>`Year ${t.year}`);
  const data1 = timeline.map(t=>t.balance);
  const data2 = timeline.map(t=>t.totalContrib);
  if (window._chart) window._chart.destroy();
  const ctx = document.getElementById('chart').getContext('2d');
  window._chart = new Chart(ctx,{
    type:'line',
    data:{
      labels,
      datasets:[
        {label:'Balance',data:data1,borderColor:'#22c55e',backgroundColor:'rgba(34,197,94,.15)',tension:.2,fill:true},
        {label:'Total contributions',data:data2,borderColor:'#38bdf8',backgroundColor:'rgba(56,189,248,.12)',tension:.2}
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{labels:{color:'#e5e7eb'}}},
      scales:{
        x:{ticks:{color:'#9ca3af'},grid:{color:'#1f2937'}},
        y:{ticks:{color:'#9ca3af',callback:v=>fmt.format(v)},grid:{color:'#1f2937'}}
      }
    }
  });
}

document.getElementById('calc-form').addEventListener('submit',e=>{e.preventDefault();render();});
document.getElementById('reset').addEventListener('click',()=>{document.getElementById('calc-form').reset();render();});

// initial render
render();
