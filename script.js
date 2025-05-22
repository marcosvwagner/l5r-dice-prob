const translations = {
  pt: {
    savedRolls: "Rolagens Salvas",
    saveRoll: "Salvar rolagem",
    hide: "Esconder",
    show: "Mostrar",
    title: "Probabilidade de rolagens",
    x: "X (dados rolados):",
    y: "Y (dados mantidos):",
    bonus: "Bônus:",
    tn: "NA (número alvo):",
    simulate: "Simular",
    result: "Resultado:",
    load: "Carregar",
    delete: "Excluir",
  },
  en: {
    savedRolls: "Saved Rolls",
    saveRoll: "Save Roll",
    hide: "Hide",
    show: "Show",
    title: "Roll Probability",
    x: "X (dice rolled):",
    y: "Y (dice kept):",
    bonus: "Bonus:",
    tn: "TN (target number):",
    simulate: "Simulate",
    result: "Result:",
    load: "Load",
    delete: "Delete",
  },
};


function changeLanguage() {
  const lang = document.getElementById("language").value;
  const t = translations[lang];

  document.getElementById("saved-rolls-title").textContent = t.savedRolls;
  document.getElementById("save-roll-btn").textContent = t.saveRoll;

  const toggleBtn = document.getElementById("toggleSidebarBtn");
  toggleBtn.textContent = toggleBtn.classList.contains("hidden") ? t.show : t.hide;

  document.getElementById("label-x").childNodes[0].nodeValue = t.x + " ";
  document.getElementById("label-y").childNodes[0].nodeValue = t.y + " ";
  document.getElementById("label-bonus").childNodes[0].nodeValue = t.bonus + " ";
  document.getElementById("label-tn").childNodes[0].nodeValue = t.tn + " ";

  document.getElementById("simulate-btn").textContent = t.simulate;
  document.getElementById("title").textContent = t.title;

  renderSavedRolls(); // Atualiza também os botões da lista salva
}



const toggleBtn = document.getElementById('toggleSidebarBtn');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
  toggleBtn.textContent = sidebar.classList.contains('hidden') ? 'Mostrar' : 'Esconder';
});

function rollDieWithExplosions() {
  let total = 0;
  while (true) {
    const roll = Math.floor(Math.random() * 10) + 1;
    total += roll;
    if (roll < 10) break;
  }
  return total;
}

function simulateL5RRoll(x, y, bonus = 0, tn = 0, simulations = 100000) {
  let successCount = 0;
  let sumOfTotals = 0;

  for (let i = 0; i < simulations; i++) {
    let rolled = [];
    for (let j = 0; j < x; j++) {
      rolled.push(rollDieWithExplosions());
    }
    rolled.sort((a, b) => b - a);
    let kept = rolled.slice(0, y);
    let total = kept.reduce((acc, val) => acc + val, 0) + bonus;
    sumOfTotals += total;
    if (total >= tn) successCount++;
  }

  const successRate = (successCount / simulations) * 100;
  const average = sumOfTotals / simulations;

  return { successRate, average };
}

function simular() {
  const x = parseInt(document.getElementById("x").value);
  const y = parseInt(document.getElementById("y").value);
  const bonus = parseInt(document.getElementById("bonus").value);
  const tn = parseInt(document.getElementById("tn").value);

  const { successRate, average } = simulateL5RRoll(x, y, bonus, tn);

  document.getElementById("resultado").innerHTML = `
    <strong>Chance de sucesso:</strong> ${successRate.toFixed(2)}%<br>
    <strong>Média da rolagem:</strong> ${average.toFixed(2)}
  `;
}

function addSavedRoll() {
  const x = parseInt(document.getElementById("x").value);
  const y = parseInt(document.getElementById("y").value);
  const bonus = parseInt(document.getElementById("bonus").value);

  const name = prompt("Digite um nome para essa rolagem:");
  if (!name) return;

  // Formato padrão: +N ou -N, sem ' e'
  const expression = `${x}k${y}${bonus !== 0 ? (bonus > 0 ? `+${bonus}` : `${bonus}`) : ''}`;

  const rolls = JSON.parse(localStorage.getItem("savedRolls") || "[]");

  if (rolls.some(r => r.name === name)) {
    alert("Já existe uma rolagem com esse nome.");
    return;
  }

  rolls.push({ name, expression });
  localStorage.setItem("savedRolls", JSON.stringify(rolls));

  renderSavedRolls();
}

function renderSavedRolls() {
  const rolls = JSON.parse(localStorage.getItem("savedRolls") || "[]");
  const list = document.getElementById("savedRolls");
  list.innerHTML = "";

  const lang = document.getElementById("language").value;
  const t = translations[lang];

  rolls.forEach((roll, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${roll.name}</strong><br>
      <span>${roll.expression}</span><br>
      <button onclick="loadRoll(${index})">${t.load}</button>
      <button onclick="deleteRoll(${index})">${t.delete}</button>
    `;

    list.appendChild(li);
  });
}

function loadRoll(index) {
  const rolls = JSON.parse(localStorage.getItem("savedRolls") || "[]");
  const roll = rolls[index];

  // Regex ajustada para o formato: "3k6", "3k6+2" ou "3k6-1"
  const regex = /^(\d+)k(\d+)([+-]\d+)?$/;
  const match = roll.expression.match(regex);

  if (match) {
    document.getElementById("x").value = parseInt(match[1]);
    document.getElementById("y").value = parseInt(match[2]);
    document.getElementById("bonus").value = match[3] ? parseInt(match[3]) : 0;
  }
}

function deleteRoll(index) {
  const rolls = JSON.parse(localStorage.getItem("savedRolls") || "[]");
  rolls.splice(index, 1);
  localStorage.setItem("savedRolls", JSON.stringify(rolls));
  renderSavedRolls();
}

window.addEventListener("load", renderSavedRolls);
