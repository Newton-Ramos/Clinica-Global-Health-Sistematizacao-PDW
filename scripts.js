window.onload = function() {
    flatpickr("#dataNascimento", {
        dateFormat: "d/m/Y",  // Formato da data (dd/mm/aaaa)
        locale: "pt",         // Localização (português)
        maxDate: "today",     // Impede a seleção de datas futuras
        onChange: function(selectedDates, dateStr, instance) {
            // Lógica adicional se necessário
        }
    });
    
    flatpickr("#dataConsulta", {
        dateFormat: "d/m/Y",  // Formato da data (aaaa-mm-dd)
        locale: "pt",         // Localização (português)
        minDate: "today",     // Impede a seleção de datas passadas
        onChange: function(selectedDates, dateStr, instance) {
            gerarHorariosDisponiveis(dateStr);  // Gerar horários disponíveis com base na data selecionada
        }
    });
  };


// ======== FORMATAÇÕES ======== //

// Nome Completo: iniciais maiúsculas, apenas letras e espaços
function formatarNomeCompleto(input) {
    let nome = input.value.replace(/[^a-zA-ZáéíóúãõâêîôûàèìòùçÇ\s]/g, '');
    nome = nome.split(' ').map(palavra =>
        palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
    ).join(' ');
    input.value = nome;
}

// Cidade: iniciais maiúsculas, apenas letras e espaços
function formatarCidade(input) {
    let cidade = input.value.replace(/[^a-zA-ZáéíóúãõâêîôûàèìòùçÇ\s]/g, '');
    cidade = cidade.split(' ').map(palavra =>
        palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
    ).join(' ');
    input.value = cidade;
}

// CPF com máscara
function formatarCPF(input) {
    let cpf = input.value.replace(/\D/g, '').slice(0, 11);
    if (cpf.length > 9)
        cpf = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
    else if (cpf.length > 6)
        cpf = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    else if (cpf.length > 3)
        cpf = `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    input.value = cpf;
}

// Telefone com máscara
function formatarTelefone(input) {
    let tel = input.value.replace(/\D/g, '').slice(0, 11);
    if (tel.length > 6)
        tel = `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
    else if (tel.length > 2)
        tel = `(${tel.slice(0, 2)}) ${tel.slice(2)}`;
    else
        tel = `(${tel}`;
    input.value = tel;
}

// Data de Nascimento no formato dd/mm/aaaa
function formatarDataNascimento(input) {
    let data = input.value.replace(/\D/g, '').slice(0, 8);
    if (data.length >= 5)
        input.value = `${data.slice(0, 2)}/${data.slice(2, 4)}/${data.slice(4)}`;
    else if (data.length >= 3)
        input.value = `${data.slice(0, 2)}/${data.slice(2)}`;
    else
        input.value = data;

    validarDataNascimentoImediata(input);
}

// ======== VALIDAÇÃO DE DATA ======== //

function validarDataNascimentoImediata(input) {
    const data = input.value;
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = data.match(regex);

    if (!match) {
        input.setCustomValidity("Formato de data inválido. Use dd/mm/aaaa.");
        return;
    }

    const [_, diaStr, mesStr, anoStr] = match;
    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    if (mes < 1 || mes > 12) {
        input.setCustomValidity("Mês deve ser entre 01 e 12.");
        return;
    }

    if (dia < 1 || dia > 31) {
        input.setCustomValidity("Dia deve ser entre 01 e 31.");
        return;
    }

    if ([4, 6, 9, 11].includes(mes) && dia > 30) {
        input.setCustomValidity("Este mês tem no máximo 30 dias.");
        return;
    }

    if (mes === 2) {
        if (dia > 29) {
            input.setCustomValidity("Fevereiro tem no máximo 29 dias.");
            return;
        } else if (dia === 29 && !isAnoBissexto(ano)) {
            input.setCustomValidity("Fevereiro tem no máximo 28 dias neste ano.");
            return;
        }
    }

    input.setCustomValidity("");
}

function isAnoBissexto(ano) {
    return (ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0));
}

// ======== EVENTOS DE INPUT ======== //

document.getElementById('nomeCompleto')?.addEventListener('input', function () {
    formatarNomeCompleto(this);
});

document.getElementById('cidade')?.addEventListener('input', function () {
    formatarCidade(this);
});

document.getElementById('cpf')?.addEventListener('input', function () {
    formatarCPF(this);
});

document.getElementById('telefone')?.addEventListener('input', function () {
    formatarTelefone(this);
});

document.getElementById('dataNascimento')?.addEventListener('input', function () {
    formatarDataNascimento(this);
});

// ======== GERAÇÃO DINÂMICA DE HORÁRIOS ======== //

document.getElementById('dataConsulta')?.addEventListener('change', function () {
    gerarHorariosDisponiveis(this.value);
});

function gerarHorariosDisponiveis(data) {
    const horaConsulta = document.getElementById('horaConsulta');
    horaConsulta.innerHTML = '<option value="" disabled selected>-- Selecione --</option>';
    
    if (!data) return;

    const horarios = obterHorariosDisponiveis(data);
    
    horarios.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        horaConsulta.appendChild(option);
    });
}

function obterHorariosDisponiveis(data) {
    const horariosDisponiveis = [];
    for (let i = 8; i <= 17; i++) {  // Continua até 17:00
        horariosDisponiveis.push(`${i.toString().padStart(2, '0')}:00`);
        horariosDisponiveis.push(`${i.toString().padStart(2, '0')}:30`);
    }
    horariosDisponiveis.push("18:00");  // Adiciona o horário das 18:00
    return horariosDisponiveis;
}

// ======== FINALIZAÇÃO DE AGENDAMENTO ======== //

function finalizarAgendamento() {
    const especialidade = document.getElementById('especialidade')?.value;
    const data = document.getElementById('dataConsulta')?.value;
    const hora = document.getElementById('horaConsulta')?.value;

    if (especialidade && data && hora) {
        const dataFormatada = data;
        const horaFormatada = hora;

        const nome = localStorage.getItem("nome");

        document.getElementById('nome').textContent = nome;

        document.getElementById('resumoEspecialidade').textContent = especialidade;
        document.getElementById('resumoDataHora').textContent = `${dataFormatada} às ${horaFormatada}`;
        
        document.getElementById('agendamentoSection').style.display = 'none';
        document.getElementById('resumoSection').style.display = 'block';
    } else {
        alert('Por favor, selecione a especialidade, a data e a hora.');
    }
}

function voltarParaHome() {
    window.location.href = 'index.html'; // Redireciona para a página inicial
}

// ======== AÇÃO DO BOTÃO DE AVANÇAR (FORMULÁRIO DE CADASTRO) ======== //

document.getElementById("cadastroForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio do formulário para controlar a navegação
  
    // Obter os valores dos campos
    const nomeCompleto = document.getElementById("nomeCompleto").value;
    const cpf = document.getElementById("cpf").value;
    const dataNascimento = document.getElementById("dataNascimento").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    
    // Verificação simples (pode ser ajustada conforme a necessidade)
    if (!nomeCompleto || !cpf || !dataNascimento || !email || !telefone || !cidade || !estado) {
      alert("Por favor, preencha todos os campos.");
      return; // Evita avançar para a próxima página se não preencher todos os campos
    }
  
    localStorage.setItem("nome", nomeCompleto);
    // Se tudo estiver correto, redireciona para a página de agendamento
    window.location.href = "agendamento.html";  // Aqui você coloca o caminho correto para a página de agendamento
});
