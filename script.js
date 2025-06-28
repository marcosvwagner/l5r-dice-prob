const translations = {
  pt: {
    savedRolls: "Rolagens Salvas",
    saveRoll: "Salvar rolagem",
    hide: "Esconder",
    show: "Mostrar",
    title: "Probabilidade de Rolagens",
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
  if (toggleBtn) {
    toggleBtn.textContent = toggleBtn.classList.contains("hidden") ? t.show : t.hide;
  }

  document.getElementById("label-x").childNodes[0].nodeValue = t.x + " ";
  document.getElementById("label-y").childNodes[0].nodeValue = t.y + " ";
  document.getElementById("label-bonus").childNodes[0].nodeValue = t.bonus + " ";
  document.getElementById("label-tn").childNodes[0].nodeValue = t.tn + " ";

  document.getElementById("simulate-btn").textContent = t.simulate;
  document.getElementById("title").textContent = t.title;

  renderSavedRolls();
}

const toggleBtn = document.getElementById('toggleSidebarBtn');
const sidebar = document.getElementById('sidebar');

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');

    const lang = document.getElementById("language").value;
    const t = translations[lang];

    toggleBtn.textContent = sidebar.classList.contains('hidden') ? t.show : t.hide;
  });
}

function rollDieWithExplosions(explode = 10) {
  let total = 0;
  while (true) {
    const roll = Math.floor(Math.random() * 10) + 1;
    total += roll;
    if (roll < explode) break;
  }
  return total;
}

function simulateL5RRoll(x, y, bonus = 0, tn = 0, explode = 10, simulations = 100000) {
  let successCount = 0;
  let sumOfTotals = 0;

  for (let i = 0; i < simulations; i++) {
    let rolled = [];
    for (let j = 0; j < x; j++) {
      rolled.push(rollDieWithExplosions(explode));
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
  const x = parseInt(document.getElementById("x").value) || 0;
  const y = parseInt(document.getElementById("y").value) || 0;
  const bonus = parseInt(document.getElementById("bonus").value) || 0;
  const tn = parseInt(document.getElementById("tn").value) || 0;

  const explodeInput = document.getElementById("explode");
  let explode = parseInt(explodeInput.value);

  if (isNaN(explode) || explode < 2) explode = 2;
  if (explode > 10) explode = 10;
  explodeInput.value = explode; // ← atualiza visualmente o valor no campo

  const { successRate, average } = simulateL5RRoll(x, y, bonus, tn, explode);

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

window.addEventListener("load", () => {
  changeLanguage(); // se tiver <select id="language">
  renderSavedRolls();
});

const modal = document.getElementById("configModal");
const openBtn = document.getElementById("openConfigBtn");
const closeBtn = modal.querySelector(".close-btn");


// Quando clicar no botão, abre o modal
openBtn.onclick = () => {
  if (modal.style.display === "block") {
    modal.style.display = "none";
  } else {
    modal.style.display = "block";
  }
};

// Quando clicar fora do conteúdo do modal, fecha também
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
