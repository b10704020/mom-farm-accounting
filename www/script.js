let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let salaries = JSON.parse(localStorage.getItem("salaries")) || [];

let workers = JSON.parse(localStorage.getItem("workers")) || [
  "青蛙", "蘋果", "秀美", "媽媽", "小姨", "桂美"
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

window.onload = function () {
  document.getElementById("todayText").innerText = "今天：" + today();
  document.getElementById("monthPicker").value = currentMonth();
  document.getElementById("searchMonth").value = currentMonth();
  document.getElementById("incomeDate").value = today();
  document.getElementById("expenseDate").value = today();
  document.getElementById("salaryDate").value = today();
  renderWorkerSelect();
  showData();
};

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  showData();
}

function saveData() {
  localStorage.setItem("incomes", JSON.stringify(incomes));
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("salaries", JSON.stringify(salaries));
  localStorage.setItem("workers", JSON.stringify(workers));
}

function renderWorkerSelect() {
  const select = document.getElementById("workerName");
  select.innerHTML = "";
  workers.forEach(w => {
    select.innerHTML += `<option>${w}</option>`;
  });
  renderWorkerTable();
}

function renderWorkerTable() {
  const table = document.getElementById("workerTable");
  table.innerHTML = "";
  workers.forEach((w, i) => {
    table.innerHTML += `
      <tr>
        <td>${w}</td>
        <td>
          <button class="small-btn" onclick="renameWorker(${i})">修改</button>
          <button class="small-btn delete-btn" onclick="deleteWorker(${i})">刪除</button>
        </td>
      </tr>`;
  });
}

function addWorker() {
  const input = document.getElementById("newWorkerName");
  const name = input.value.trim();
  if (!name) return alert("請輸入工人姓名");
  if (workers.includes(name)) return alert("這個工人已存在");
  workers.push(name);
  input.value = "";
  saveData();
  renderWorkerSelect();
}

function renameWorker(i) {
  const oldName = workers[i];
  const newName = prompt("請輸入新姓名", oldName);
  if (!newName) return;
  workers[i] = newName.trim();
  salaries.forEach(s => {
    if (s.worker === oldName) s.worker = newName.trim();
  });
  saveData();
  renderWorkerSelect();
  showData();
}

function deleteWorker(i) {
  const name = workers[i];
  if (salaries.some(s => s.worker === name)) return alert("已有紀錄，不能刪除。");
  if (confirm("確定刪除「" + name + "」嗎？")) {
    workers.splice(i, 1);
    saveData();
    renderWorkerSelect();
  }
}

function toggleOtherExpense() {
  const v = document.getElementById("expenseCategory").value;
  document.getElementById("otherExpenseName").style.display = v === "其他" ? "block" : "none";
}

function toggleOtherWork() {
  const v = document.getElementById("workContent").value;
  document.getElementById("otherWorkContent").style.display = v === "其他" ? "block" : "none";
}

function addIncome() {
  const date = incomeDate.value;
  const amount = Number(incomeAmount.value);
  const note = incomeNote.value;
  if (!date || amount <= 0) return alert("請輸入日期和金額");
  incomes.push({ id: Date.now(), date, amount, note });
  incomeAmount.value = "";
  incomeNote.value = "";
  saveData();
  showData();
}

function addExpense() {
  const date = expenseDate.value;
  let category = expenseCategory.value;
  const other = otherExpenseName.value.trim();
  const amount = Number(expenseAmount.value);
  const note = expenseNote.value;

  if (category === "其他") {
    if (!other) return alert("請輸入其他支出名稱");
    category = other;
  }

  if (!date || amount <= 0) return alert("請輸入日期和金額");

  expenses.push({ id: Date.now(), date, category, amount, note });
  expenseAmount.value = "";
  expenseNote.value = "";
  otherExpenseName.value = "";
  otherExpenseName.style.display = "none";
  expenseCategory.value = "工資";
  saveData();
  showData();
}

function addSalary() {
  const date = salaryDate.value;
  const worker = workerName.value;
  let content = workContent.value;
  const other = otherWorkContent.value.trim();
  const amount = Number(salaryAmount.value);
  const note = salaryNote.value;

  if (content === "其他") {
    if (!other) return alert("請輸入其他工作內容");
    content = other;
  }

  if (!date || !worker || amount < 0) return alert("請輸入完整資料");

  salaries.push({ id: Date.now(), date, worker, content, amount, note });
  salaryAmount.value = "";
  salaryNote.value = "";
  otherWorkContent.value = "";
  otherWorkContent.style.display = "none";
  workContent.value = "採收";
  saveData();
  showData();
}

function showData() {
  const month = document.getElementById("monthPicker").value || currentMonth();

  const mi = incomes.filter(x => x.date.slice(0, 7) === month);
  const me = expenses.filter(x => x.date.slice(0, 7) === month);
  const ms = salaries.filter(x => x.date.slice(0, 7) === month);

  const totalI = mi.reduce((s, x) => s + x.amount, 0);
  const totalE = me.reduce((s, x) => s + x.amount, 0);

  totalIncome.innerText = totalI;
  totalExpense.innerText = totalE;
  balance.innerText = totalI - totalE;

  reportIncome.innerText = totalI;
  reportExpense.innerText = totalE;
  reportBalance.innerText = totalI - totalE;

  showIncomeTable(mi);
  showExpenseTable(me);
  showWorkerSalaryCards(ms);
  drawExpensePie(me);
}

function showIncomeTable(data) {
  incomeTable.innerHTML = data.map(x => `
    <tr>
      <td>${x.date}</td><td>${x.amount}</td><td>${x.note || ""}</td>
      <td><button class="delete-btn" onclick="deleteIncome(${x.id})">刪除</button></td>
    </tr>`).join("");
}

function showExpenseTable(data) {
  expenseTable.innerHTML = data.map(x => `
    <tr>
      <td>${x.date}</td><td>${x.category}</td><td>${x.amount}</td><td>${x.note || ""}</td>
      <td><button class="delete-btn" onclick="deleteExpense(${x.id})">刪除</button></td>
    </tr>`).join("");
}

function showWorkerSalaryCards(data) {
  const box = workerSalaryCards;
  box.innerHTML = "";
  if (data.length === 0) {
    box.innerHTML = "<p>本月尚無工項紀錄</p>";
    return;
  }

  const grouped = {};
  data.forEach(x => {
    if (!grouped[x.worker]) grouped[x.worker] = { days: new Set(), total: 0, records: [] };
    grouped[x.worker].days.add(x.date);
    grouped[x.worker].total += x.amount;
    grouped[x.worker].records.push(x);
  });

  Object.keys(grouped).forEach(worker => {
    const g = grouped[worker];
    const rows = g.records.sort((a,b) => a.date.localeCompare(b.date)).map(x => `
      <tr>
        <td>${x.date}</td><td>${x.content}</td><td>${x.amount}</td><td>${x.note || ""}</td>
        <td><button class="delete-btn" onclick="deleteSalary(${x.id})">刪除</button></td>
      </tr>`).join("");

    box.innerHTML += `
      <details class="worker-card">
        <summary>${worker}｜出勤 ${g.days.size} 天｜合計 ${g.total} 元</summary>
        <table>
          <thead><tr><th>日期</th><th>工作</th><th>薪水</th><th>備註</th><th>刪除</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </details>`;
  });
}

function drawExpensePie(data) {
  const canvas = expenseChart;
  const ctx = canvas.getContext("2d");
  chartLegend.innerHTML = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (data.length === 0) {
    ctx.font = "24px Arial";
    ctx.fillText("本月尚無支出資料", 55, 150);
    return;
  }

  const totals = {};
  data.forEach(x => totals[x.category] = (totals[x.category] || 0) + x.amount);
  const total = Object.values(totals).reduce((a,b) => a + b, 0);
  const colors = ["#2b5d42","#8fb996","#f2c94c","#f2994a","#eb5757","#56ccf2","#9b51e0","#6fcf97"];

  let start = 0;
  Object.keys(totals).forEach((cat, i) => {
    const val = totals[cat];
    const angle = val / total * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(150,150);
    ctx.arc(150,150,120,start,start+angle);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += angle;
    chartLegend.innerHTML += `<div class="legend-item">${cat}：${val} 元（${(val/total*100).toFixed(1)}%）</div>`;
  });
}

function searchDetails() {
  const month = searchMonth.value;
  const type = searchType.value;
  let html = "";

  if (type === "all" || type === "income") {
    html += "<h3>每週收入</h3><table><tr><th>日期</th><th>金額</th><th>備註</th></tr>";
    incomes.filter(x => x.date.slice(0,7) === month).forEach(x => html += `<tr><td>${x.date}</td><td>${x.amount}</td><td>${x.note || ""}</td></tr>`);
    html += "</table>";
  }

  if (type === "all" || type === "expense") {
    html += "<h3>每週支出</h3><table><tr><th>日期</th><th>分類</th><th>金額</th><th>備註</th></tr>";
    expenses.filter(x => x.date.slice(0,7) === month).forEach(x => html += `<tr><td>${x.date}</td><td>${x.category}</td><td>${x.amount}</td><td>${x.note || ""}</td></tr>`);
    html += "</table>";
  }

  if (type === "all" || type === "salary") {
    html += "<h3>工項紀錄</h3><table><tr><th>日期</th><th>工人</th><th>工作</th><th>薪水</th><th>備註</th></tr>";
    salaries.filter(x => x.date.slice(0,7) === month).forEach(x => html += `<tr><td>${x.date}</td><td>${x.worker}</td><td>${x.content}</td><td>${x.amount}</td><td>${x.note || ""}</td></tr>`);
    html += "</table>";
  }

  searchResult.innerHTML = html || "查無資料";
}

function deleteIncome(id) {
  incomes = incomes.filter(x => x.id !== id);
  saveData();
  showData();
}

function deleteExpense(id) {
  expenses = expenses.filter(x => x.id !== id);
  saveData();
  showData();
}

function deleteSalary(id) {
  salaries = salaries.filter(x => x.id !== id);
  saveData();
  showData();
}

function exportExcel() {
  const month = monthPicker.value || currentMonth();

  const wb = XLSX.utils.book_new();

  const incomeData = incomes.filter(x => x.date.slice(0,7) === month).map(x => ({
    日期: x.date, 金額: x.amount, 備註: x.note || ""
  }));

  const expenseData = expenses.filter(x => x.date.slice(0,7) === month).map(x => ({
    日期: x.date, 分類: x.category, 金額: x.amount, 備註: x.note || ""
  }));

  const salaryData = salaries.filter(x => x.date.slice(0,7) === month).map(x => ({
    日期: x.date, 工人: x.worker, 工作內容: x.content, 薪水: x.amount, 備註: x.note || ""
  }));

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeData), "每週收入");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseData), "每週支出");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salaryData), "工項紀錄");

  const summary = {};
  salaryData.forEach(x => {
    if (!summary[x.工人]) summary[x.工人] = { 工人: x.工人, 出勤天數: new Set(), 薪水合計: 0 };
    summary[x.工人].出勤天數.add(x.日期);
    summary[x.工人].薪水合計 += x.薪水;
  });

  const summaryData = Object.values(summary).map(x => ({
    工人: x.工人,
    出勤天數: x.出勤天數.size,
    薪水合計: x.薪水合計
  }));

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "本月工人工資");

  workers.forEach(worker => {
    const rows = salaryData.filter(x => x.工人 === worker);
    if (rows.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), worker.substring(0, 31));
    }
  });

  XLSX.writeFile(wb, month + "_媽媽農業記帳.xlsx");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}