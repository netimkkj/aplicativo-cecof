let processoParaExcluir;

alert("Controlador de processos desenvolvido por Eliseu Santana.")

function irParaTelaPrincipal() {
  document.getElementById("welcomeScreen").classList.add("hidden");
  document.getElementById("mainScreen").classList.remove("hidden");

  // 🟢 Garante que a aba 'cadastrar' seja exibida primeiro
  mostrarAba('cadastrar'); 
}

function voltarParaInicio() {
  document.getElementById("mainScreen").classList.add("hidden");
  document.getElementById("welcomeScreen").classList.remove("hidden");
}

function mostrarAba(aba) {
  // Esconder todas as abas
  document.querySelectorAll(".aba").forEach(elemento => {
    elemento.classList.remove("active");
    elemento.style.display = "none"; // Garante que todas sejam escondidas
  });

  // Mostrar apenas a aba selecionada
  const abaSelecionada = document.getElementById(aba);
  if (abaSelecionada) {
    abaSelecionada.classList.add("active");
    abaSelecionada.style.display = "block"; // Exibe a aba escolhida
  }

  // Ativar a aba correspondente no menu
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  const tabButton = document.querySelector(`[onclick="mostrarAba('${aba}')"]`);
  if (tabButton) tabButton.classList.add('active');

  // Atualizar estatísticas ao abrir a aba correta
  if (aba === "listar") listarProcessos();
  if (aba === "estatisticas") atualizarGrafico();
}

function mostrarCampoNumero() {
  const campoProcesso = document.getElementById("campoProcesso");
  campoProcesso.classList.toggle("active"); // Alterna a classe para ativar o efeito de deslizamento
}


function adicionarProcesso(numeroProcesso = null, anotacao = "") {
  let descricao = numeroProcesso || document.getElementById("descricao").value.trim();

  if (!descricao) {
    document.getElementById("descricaoError").textContent = "O número do processo é obrigatório.";
    return;
  }

  if (descricao.length < 10 || descricao.length > 20) {
    document.getElementById("descricaoError").textContent = "O número do processo deve ter entre 10 e 20 caracteres.";
    return;
  } else {
    document.getElementById("descricaoError").textContent = "";
  }

  const processos = JSON.parse(localStorage.getItem("processos")) || [];
  if (processos.some(p => p.numeroProcesso === descricao)) {
    document.getElementById("descricaoError").textContent = "Já existe um processo com esse número.";
    return;
  }
  
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  processos.push({ 
    numeroProcesso: descricao, 
    status: "Em andamento", 
    anotacoes: anotacao, 
    dataInclusao: dataAtual 
  });

  localStorage.setItem("processos", JSON.stringify(processos));

  if (!numeroProcesso) {
    document.getElementById("descricao").value = "";
    mostrarAba('listar');
  }
}


function calcularTempoEmAnalise(dataInclusao) {
  if (!dataInclusao) return "Não disponível"; // Evita erros caso a data esteja ausente

  const [dia, mes, ano] = dataInclusao.split("/").map(Number);
  const dataInicio = new Date(ano, mes - 1, dia); // Ajusta para o formato correto (mês começa do zero)
  const dataAtual = new Date();
  
  const diffEmMilissegundos = dataAtual - dataInicio;
  const diasEmAnalise = Math.floor(diffEmMilissegundos / (1000 * 60 * 60 * 24)); // Converte milissegundos em dias
  
  return `${diasEmAnalise} dia(s)`;
}

function listarProcessos() {
  const processos = JSON.parse(localStorage.getItem("processos")) || [];
  const processListDiv = document.getElementById("processList");
  processListDiv.innerHTML = "";

  if (processos.length === 0) {
    processListDiv.innerHTML = "<p>Nenhum processo encontrado.</p>";
    return;
  }

  [...processos].reverse().forEach((processo, index) => {
    const processItem = document.createElement("div");
    processItem.classList.add("process-item", processo.status.toLowerCase().replace(" ", "-"));
    processItem.innerHTML = `
      <div><strong>N° Processo:</strong> ${processo.numeroProcesso}</div>
      <div><strong>Status:</strong> ${processo.status}</div>
      <div><strong>Data de Inclusão:</strong> ${processo.dataInclusao || "Não informada"}</div>
      <div><strong>Tempo em Análise:</strong> ${calcularTempoEmAnalise(processo.dataInclusao)}</div>
      <button onclick="toggleAnotacoes('${processo.numeroProcesso}')">Anotações</button>
      <div class="anotacoes-container" id="anotacoes-${processo.numeroProcesso}">
        <textarea id="input-anotacoes-${processo.numeroProcesso}" placeholder="Nenhuma observação atribuída no momento">${processo.anotacoes}</textarea>
        <button onclick="salvarAnotacoes('${processo.numeroProcesso}')">Salvar Anotações</button>
      </div>
      <button onclick="confirmarExclusaoProcesso('${processo.numeroProcesso}')">Excluir</button>
      <button onclick="toggleStatusButtons('${processo.numeroProcesso}')">Selecionar Status</button>
      <div class="status-buttons" id="status-buttons-${processo.numeroProcesso}">
        <button onclick="alterarStatus('${processo.numeroProcesso}', 'Em andamento')">Em andamento</button>
        <button onclick="alterarStatus('${processo.numeroProcesso}', 'Suspenso')">Suspenso</button>
        <button onclick="alterarStatus('${processo.numeroProcesso}', 'Concluído')">Concluído</button>
      </div>
    `;
    processListDiv.appendChild(processItem);
  });

  // Garante que o botão de relatório apareça
  const listarDiv = document.getElementById("listar");
  if (!document.getElementById("relatorioButton")) {
    const relatorioContainer = document.createElement("div");
    relatorioContainer.style.display = "flex";
    relatorioContainer.style.gap = "10px";
    relatorioContainer.style.marginTop = "10px";
  
    const relatorioButton = document.createElement("button");
    relatorioButton.textContent = "Gerar Relatório Excel Completo";
    relatorioButton.id = "relatorioButton";
    relatorioButton.onclick = gerarRelatorioExcel;
  
    const relatorioDiaButton = document.createElement("button");
    relatorioDiaButton.textContent = "Gerar Relatório Diário";
    relatorioDiaButton.id = "relatorioDiaButton";
    relatorioDiaButton.onclick = gerarRelatorioDoDia;
  
    relatorioContainer.appendChild(relatorioButton);
    relatorioContainer.appendChild(relatorioDiaButton);
    listarDiv.appendChild(relatorioContainer);
  }
  
}


function toggleAnotacoes(id) {
  document.getElementById(`anotacoes-${id}`).classList.toggle("active");
}

function salvarAnotacoes(id) {
  const text = document.getElementById(`input-anotacoes-${id}`).value;
  const processos = JSON.parse(localStorage.getItem("processos"));
  const processo = processos.find(p => p.numeroProcesso === id);
  if (processo) {
    processo.anotacoes = text;
    localStorage.setItem("processos", JSON.stringify(processos));
    alert("✅ Anotação salva com sucesso!");
  }
}

function confirmarExclusaoProcesso(id) {
  processoParaExcluir = id;
  document.getElementById("confirmationPopup").style.display = "flex";
}

function confirmarExclusao() {
  let processos = JSON.parse(localStorage.getItem("processos"));
  processos = processos.filter(p => p.numeroProcesso !== processoParaExcluir);
  localStorage.setItem("processos", JSON.stringify(processos));
  listarProcessos();
  fecharPopup();
}

function fecharPopup() {
  document.getElementById("confirmationPopup").style.display = "none";
}

function alterarStatus(id, status) {
  const processos = JSON.parse(localStorage.getItem("processos"));
  const processo = processos.find(p => p.numeroProcesso === id);
  if (processo) {
    processo.status = status;
    localStorage.setItem("processos", JSON.stringify(processos));
    listarProcessos();
  }
}

function toggleStatusButtons(id) {
  document.getElementById(`status-buttons-${id}`).classList.toggle("active");
}

function pesquisarProcesso() {
  const searchValue = document.getElementById("search").value.toLowerCase();
  const processos = JSON.parse(localStorage.getItem("processos")) || [];
  
  // Filtra os processos com base no número digitado
  const filtrados = processos.filter(p => p.numeroProcesso.toLowerCase().includes(searchValue));

  const processListDiv = document.getElementById("processList");
  processListDiv.innerHTML = ""; // Limpa a lista antes de exibir os filtrados

  if (filtrados.length === 0) {
    processListDiv.innerHTML = "<p>Nenhum processo encontrado.</p>";
    return;
  }

  // Renderiza os processos filtrados
  filtrados.forEach(processo => {
    if (!processo.dataInclusao) {
      processo.dataInclusao = "Não informada"; // Para não deixar a data em branco
    }

    const processItem = document.createElement("div");
    processItem.classList.add("process-item", processo.status.toLowerCase().replace(" ", "-"));
    processItem.innerHTML = `
      <div><strong>N° Processo:</strong> ${processo.numeroProcesso}</div>
      <div><strong>Status:</strong> ${processo.status}</div>
      <div><strong>Data de Inclusão:</strong> ${processo.dataInclusao}</div>
      <div><strong>Tempo em Análise:</strong> ${calcularTempoEmAnalise(processo.dataInclusao)}</div>
      <button onclick="toggleAnotacoes('${processo.numeroProcesso}')">Anotações</button>
      <div class="anotacoes-container" id="anotacoes-${processo.numeroProcesso}">
          <textarea id="input-anotacoes-${processo.numeroProcesso}">${processo.anotacoes || ""}</textarea>
          <button onclick="salvarAnotacoes('${processo.numeroProcesso}')">Salvar Anotações</button>
      </div>
      <button onclick="confirmarExclusaoProcesso('${processo.numeroProcesso}')">Excluir</button>
      <button onclick="toggleStatusButtons('${processo.numeroProcesso}')">Selecionar Status</button>
      <div class="status-buttons" id="status-buttons-${processo.numeroProcesso}">
          <button onclick="alterarStatus('${processo.numeroProcesso}', 'Em andamento')">Em andamento</button>
          <button onclick="alterarStatus('${processo.numeroProcesso}', 'Suspenso')">Suspenso</button>
          <button onclick="alterarStatus('${processo.numeroProcesso}', 'Concluído')">Concluído</button>
      </div>
    `;
    processListDiv.appendChild(processItem);
  });
}


function gerarRelatorioExcel() {
  const processos = JSON.parse(localStorage.getItem("processos")) || [];

  if (processos.length === 0) {
    alert("Nenhum processo encontrado para gerar relatório.");
    return;
  }

  const dadosExcel = processos.map(p => {
    const dataInclusao = p.dataInclusao ? new Date(p.dataInclusao.split('/').reverse().join('-')) : null;
    const diasAnalise = dataInclusao ? Math.floor((new Date() - dataInclusao) / (1000 * 60 * 60 * 24)) : "N/A";

    return {
      "PROCESSOS": p.numeroProcesso,
      "STATUS": p.status,
      "ANOTAÇÕES": p.anotacoes || "",
      "DATA DE INCLUSÃO": p.dataInclusao || "Não informada",
      "TEMPO DE ANÁLISE": diasAnalise + " dias"
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dadosExcel);

  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 20 }, // PROCESSOS
    { wch: 15 }, // STATUS
    { wch: 30 }, // ANOTAÇÕES
    { wch: 15 }, // DATA DE INCLUSÃO
    { wch: 20 }  // TEMPO DE ANÁLISE
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Processos");
  XLSX.writeFile(wb, "Relatorio_Processos.xlsx");
}

function atualizarGrafico() {
  const processos = JSON.parse(localStorage.getItem("processos")) || [];

  const totalProcessos = processos.length;
  const semAnotacoes = processos.filter(p => !p.anotacoes || p.anotacoes.trim() === "").length;

  // Contagem de processos por status
  const emAndamento = processos.filter(p => p.status === "Em andamento").length;
  const suspensos = processos.filter(p => p.status === "Suspenso").length;
  const concluidos = processos.filter(p => p.status === "Concluído").length;

  const ctx = document.getElementById("graficoProcessos").getContext("2d");

  // Remove o gráfico anterior (se houver)
  if (window.meuGrafico) {
    window.meuGrafico.destroy();
  }

  // Criando o gráfico atualizado
  window.meuGrafico = new Chart(ctx, {
    type: "bar", // Alterado de "bar" para "pie" para ficar em formato de pizza
    data: {
      labels: [
        "Total de Processos",
        "Sem Anotações",
        "Em andamento",
        "Suspensos",
        "Concluídos"
      ],
      datasets: [{
        label: "Distribuição dos Processos",
        data: [totalProcessos, semAnotacoes, emAndamento, suspensos, concluidos],
        backgroundColor: ["#4CAF50", "#FF5733", "#FFC107", "#007BFF", "#8E44AD"]
      }]
    }
  });
}

document.getElementById("fileInput").addEventListener("change", importarPlanilha);

// MALDITA FUNCTION PARA IMPORTAR AS PLANILHAS

function importarPlanilha() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Selecione um arquivo para importar.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Pegando a primeira aba da planilha
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertendo para JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length < 2) {
            alert("A planilha está vazia ou sem dados suficientes.");
            return;
        }

        // Identificando as colunas
        const headers = jsonData[0].map(header => header.toLowerCase());
        const processosIndex = headers.findIndex(header => header.includes("processo"));
        const anotacoesIndex = headers.findIndex(header => header.includes("anota"));

        if (processosIndex === -1) {
            alert("A planilha precisa ter uma coluna 'PROCESSOS' e 'ANOTAÇÕES'.");
            return;
        }

        let processosImportados = 0;

        // Adicionando os processos
        for (let i = 1; i < jsonData.length; i++) {
            const numeroProcesso = jsonData[i][processosIndex];
            const anotacao = anotacoesIndex !== -1 ? jsonData[i][anotacoesIndex] : "";

            if (numeroProcesso) {
                adicionarProcesso(numeroProcesso, anotacao);
                processosImportados++;
            }
        }

        alert(`${processosImportados} processos importados com sucesso!`);
    };

    reader.readAsArrayBuffer(file);
}

// RELATÓRIO DIÁRIO (APENAS DO DIA)

function gerarRelatorioDoDia() {
  const processos = JSON.parse(localStorage.getItem("processos")) || [];

  const hoje = new Date().toLocaleDateString("pt-BR");

  const processosHoje = processos.filter(p => p.dataInclusao === hoje);

  if (processosHoje.length === 0) {
    alert("Nenhum processo foi adicionado hoje.");
    return;
  }

  const dadosExcel = processosHoje.map(p => ({
    "PROCESSOS": p.numeroProcesso,
    "STATUS": p.status,
    "ANOTAÇÕES": p.anotacoes || "",
    "DATA DE INCLUSÃO": p.dataInclusao || "Não informada"
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dadosExcel);

  ws['!cols'] = [
    { wch: 20 }, // PROCESSOS
    { wch: 15 }, // STATUS
    { wch: 30 }, // ANOTAÇÕES
    { wch: 20 }  // DATA DE INCLUSÃO
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Relatório_Diário");
  XLSX.writeFile(wb, `Relatorio_Processos_Dia_${hoje.replace(/\//g, "-")}.xlsx`);
}
