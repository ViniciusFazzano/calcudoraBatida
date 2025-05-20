let isDarkTheme = false;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calcForm');
    const pdfButton = document.getElementById('pdfButton');

    document.getElementById('themeButton').addEventListener('click', toggleTheme);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleTheme(); // Ativa o tema escuro se estiver salvo
    }
    form.addEventListener('submit', handleSubmit);
    pdfButton.addEventListener('click', gerarPDF);
});
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const themeButton = document.getElementById('themeButton');

    if (isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeButton.textContent = '☀️';
        themeButton.style.backgroundColor = 'var(--accent-color)';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeButton.textContent = '🌙';
        themeButton.style.backgroundColor = 'var(--secondary-color)';
    }

    // Salvar preferência no localStorage
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

function handleSubmit(e) {
    e.preventDefault();

    const inputs = {
        qntSaco: parseFloat(document.getElementById('qnt_saco').value),
        kiloBatida: parseFloat(document.getElementById('kilo_batida').value),
        kiloSaco: parseFloat(document.getElementById('kilo_saco').value),
        qntCabeca: parseFloat(document.getElementById('qnt_cabeca').value),
        consumoCabeca: parseFloat(document.getElementById('consumo_cabeca').value),
        gramaHomeopatiaCabeca: parseFloat(document.getElementById('grama_homeopatia_cabeca').value),
        gramasHomeopatiaCaixa: parseFloat(document.getElementById('gramas_homeopatia_caixa').value)
    };

    if (Object.values(inputs).some(value => isNaN(value) || value <= 0)) {
        alert('Todos os campos devem ser números positivos!');
        return;
    }

    try {
        const resultados = calcularHomeopatia(inputs);
        displayResults(resultados);
        document.querySelector('.print-btn').style.display = 'block';
        document.getElementById('resultados').style.display = 'block';
    } catch (error) {
        alert('Erro no cálculo: ' + error.message);
    }
}

function calcularHomeopatia({
    qntSaco,
    kiloBatida,
    kiloSaco,
    consumoCabeca,
    gramaHomeopatiaCabeca,
    gramasHomeopatiaCaixa
}) {
    const pesoTotal = qntSaco * kiloSaco;

    if (kiloBatida === 0) throw new Error('Kilo por batida não pode ser zero');
    const qntBatida = Math.floor(pesoTotal / kiloBatida);

    const consumoCabecaKilo = consumoCabeca / 1000;

    if (consumoCabecaKilo === 0) throw new Error('Consumo por cabeça não pode ser zero');
    const cabecaSaco = kiloSaco / consumoCabecaKilo;

    const gramasHomeopatiaSaco = cabecaSaco * gramaHomeopatiaCabeca;

    if (qntBatida === 0) throw new Error('Quantidade de batidas não pode ser zero');
    const kiloHomeopatiaBatida = ((gramasHomeopatiaSaco / 1000) * qntSaco) / qntBatida;

    if (gramasHomeopatiaCaixa === 0) throw new Error('Gramas por caixa não pode ser zero');
    const qntCaixa = ((gramasHomeopatiaSaco / 1000) * qntSaco) / (gramasHomeopatiaCaixa / 1000);

    return {
        pesoTotal: pesoTotal.toFixed(2),
        qntBatida: qntBatida,
        consumoCabecaKilo: consumoCabecaKilo.toFixed(3),
        cabecaSaco: cabecaSaco.toFixed(2),
        gramasHomeopatiaSaco: gramasHomeopatiaSaco.toFixed(2),
        kiloHomeopatiaBatida: kiloHomeopatiaBatida.toFixed(3),
        qntCaixa: qntCaixa.toFixed(2)
    };
}

function displayResults(results) {
    const resultContainer = document.getElementById('resultItems');
    resultContainer.innerHTML = '';

    const template = [
        { label: 'Peso Total (kg)', value: results.pesoTotal },
        { label: 'Quantidade de Batidas', value: results.qntBatida },
        { label: 'Consumo por Cabeça (kg)', value: results.consumoCabecaKilo },
        { label: 'Cabeças por Saco', value: results.cabecaSaco },
        { label: 'Gramas de Homeopatia por Saco (g)', value: results.gramasHomeopatiaSaco },
        { label: 'Quilos de Homeopatia por Batida (kg)', value: results.kiloHomeopatiaBatida },
        { label: 'Quantidade de Caixas Necessárias', value: results.qntCaixa }
    ];

    template.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <span>${item.label}</span>
            <span class="result-value">${item.value}</span>
        `;
        resultContainer.appendChild(div);
    });
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cores do tema militar
    const darkGreen = '#2F4F4F';    // Verde militar escuro
    const mediumGreen = '#556B2F';  // Verde oliva
    const lightGreen = '#8FBC8F';   // Verde claro
    const accentColor = '#006400';  // Verde floresta

    // Configuração da página
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPosition = 30;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(darkGreen);
    doc.text("CONTAGEM HOMEOPEC", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text("RELATÓRIO ESTRATÉGICO", pageWidth / 2, yPosition, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(mediumGreen);
    yPosition += 10;
    doc.text("Dados Táticos de Aplicação Homeopática", pageWidth / 2, yPosition, { align: 'center' });

    // Linha decorativa
    yPosition += 8;
    doc.setDrawColor(mediumGreen);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    // Tabela de Dados de Entrada
    yPosition += 15;
    doc.setFontSize(14);
    doc.setTextColor(darkGreen);
    doc.text("      DADOS DE MISSÃO", margin, yPosition);

    const inputs = [
        ['QTD SACOS', document.getElementById('qnt_saco').value],
        ['KG/BATIDA', document.getElementById('kilo_batida').value + ' kg'],
        ['KG/SACO', document.getElementById('kilo_saco').value + ' kg'],
        ['QTD CABEÇAS', document.getElementById('qnt_cabeca').value],
        ['CONSUMO/CAB.', document.getElementById('consumo_cabeca').value + ' g'],
        ['HOMEOPATIA/CAB.', document.getElementById('grama_homeopatia_cabeca').value + ' g'],
        ['HOMEOPATIA/CAIXA', document.getElementById('gramas_homeopatia_caixa').value + ' g']
    ];

    // Desenhar tabela estilo militar
    doc.setFontSize(10);
    doc.setFillColor(lightGreen);
    doc.rect(margin, yPosition + 5, pageWidth - 2 * margin, 8, 'F');

    inputs.forEach(([label, value], index) => {
        const rowY = yPosition + 15 + (index * 8);

        // Linhas zebradas
        if (index % 2 === 0) {
            doc.setFillColor(240, 255, 240);
            doc.rect(margin, rowY - 2, pageWidth - 2 * margin, 8, 'F');
        }

        doc.setTextColor(darkGreen);
        doc.setFont(undefined, 'bold');
        doc.text(label + ':', margin + 2, rowY + 5);

        doc.setTextColor(accentColor);
        doc.setFont(undefined, 'normal');
        doc.text(value.toString(), pageWidth - margin - 40, rowY + 5);
    });

    // Tabela de Resultados
    yPosition += 15 + (inputs.length * 8) + 15;
    doc.setFontSize(14);
    doc.setTextColor(darkGreen);
    doc.text("      RESULTADOS OPERACIONAIS", margin, yPosition);

    const results = Array.from(document.querySelectorAll('.result-item')).map(item => {
        const parts = item.textContent.split(':');
        return [
            (parts[0] || '').trim(),
            (parts[1] || '').trim()
        ];
    });

    // Cabeçalho da tabela
    doc.setFillColor(lightGreen);
    doc.rect(margin, yPosition + 5, pageWidth - 2 * margin, 8, 'F');

    // Conteúdo da tabela
    results.forEach(([label, value], index) => {
        const rowY = yPosition + 15 + (index * 15);

        // Linhas zebradas
        if (index % 2 === 0) {
            doc.setFillColor(240, 255, 240);
            doc.rect(margin, rowY - 2, pageWidth - 2 * margin, 15, 'F');
        }

        doc.setTextColor(darkGreen);
        doc.setFont(undefined, 'bold');
        doc.text(label + ' ', margin + 2, rowY + 5);

        doc.setTextColor(accentColor);
        doc.setFont(undefined, 'normal');
        doc.text(value, pageWidth - margin - 40, rowY + 5);
    });

    // Rodapé tático
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(mediumGreen);
    doc.text(`DOCUMENTO CLASSIFICADO - Gerado em: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        margin, pageHeight - 10);

    // Bordas da página
    doc.setDrawColor(mediumGreen);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Salvar PDF
    doc.save('Relatorio-Homeopec.pdf');
}