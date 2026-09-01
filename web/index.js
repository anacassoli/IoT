const BROKER = "localhost";
const PORT = 9001;

const TOPIC_TEMPERATURA = "aulas/grupo06/temperatura";
const TOPIC_UMIDADE = "aulas/grupo06/umidade";
const TOPIC_QUALIDADE_AR = "aulas/grupo06/qualidade_ar";

const CLIENT_ID =
    "WebDashboard_Grupo06_" +
    Math.random().toString(16).substring(2, 10);

const client = new Paho.MQTT.Client(
    BROKER,
    PORT,
    CLIENT_ID
);

const temperatura =
    document.getElementById("temperatura");
const umidade =
    document.getElementById("umidade");
const qualidadeAr =
    document.getElementById("qualidade-ar");
const statusConexao =
    document.getElementById("status-conexao");


const senha =
    document.getElementById("senha-grupo");
const botaoSalvarSenha =
    document.getElementById("salvar-senha");
const mensagemSenha =
    document.getElementById("mensagem-senha");

function salvarSenha() {
    if (!senha) return;
    if (senha.value.trim() === "") {
        if (mensagemSenha) {
            mensagemSenha.textContent =
                "Digite uma senha antes de salvar.";
        }
        return;
    }
    localStorage.setItem(
        "senhaProfessor",
        senha.value
    );
    if (mensagemSenha) {
        mensagemSenha.textContent =
            "Senha salva com sucesso!";
    }
}


// Recuperar senha salva
function carregarSenha() {
    if (!senha) return;
    const senhaSalva =
        localStorage.getItem("senhaProfessor");
    if (senhaSalva) {
        senha.value = senhaSalva;
    }
}


// Quando clicar em "Salvar Senha"
if (botaoSalvarSenha) {
    botaoSalvarSenha.addEventListener(
        "click",
        salvarSenha
    );
}


function atualizarStatus(conectado) {
    if (!statusConexao) return;
    if (conectado) {
        statusConexao.textContent =
            "● Conectado";
        statusConexao.classList.remove(
            "desconectado"
        );
        statusConexao.classList.add(
            "conectado"
        );
    } else {
        statusConexao.textContent =
            "● Desconectado";
        statusConexao.classList.remove(
            "conectado"
        );
        statusConexao.classList.add(
            "desconectado"
        );
    }
}


function conectarMQTT() {
    atualizarStatus(false);
    client.connect({
        useSSL: false,
        timeout: 5,
        keepAliveInterval: 30,
        onSuccess: function () {
            console.log(
                "MQTT conectado com sucesso!"
            );
            atualizarStatus(true);


            client.subscribe(
                TOPIC_TEMPERATURA
            );
            client.subscribe(
                TOPIC_UMIDADE
            );
            client.subscribe(
                TOPIC_QUALIDADE_AR
            );
            console.log(
                "Inscrito nos tópicos MQTT."
            );
        },


        onFailure: function (erro) {
            console.error(
                "Erro ao conectar no MQTT:",
                erro
            );
            atualizarStatus(false);
            // Tenta novamente após 5 segundos
            setTimeout(
                conectarMQTT,
                5000
            );
        }
    });
}


client.onMessageArrived = function (message) {
    console.log(
        "Mensagem recebida:",
        message.destinationName,
        message.payloadString
    );


    const valor =
        parseFloat(message.payloadString);
    if (isNaN(valor)) {
        return;
    }


    // Temperatura
    if (
        message.destinationName ===
        TOPIC_TEMPERATURA
    ) {
        if (temperatura) {
            temperatura.textContent =
                valor.toFixed(1);
        }
        console.log(
            "Temperatura:",
            valor
        );
    }


    // Umidade
    else if (
        message.destinationName ===
        TOPIC_UMIDADE
    ) {
        if (umidade) {
            umidade.textContent =
                valor.toFixed(1);
        }
        console.log(
            "Umidade:",
            valor
        );
    }


    // Qualidade do ar
    else if (
        message.destinationName ===
        TOPIC_QUALIDADE_AR
    ) {
        if (qualidadeAr) {
            qualidadeAr.textContent =
                valor;
        }
        console.log(
            "Qualidade do ar:",
            valor
        );
    }


    // Atualiza o horário
    atualizarHorario();
};

function atualizarHorario() {
    const elemento =
        document.getElementById(
            "ultima-atualizacao"
        );
    if (!elemento) return;
    const agora = new Date();
    elemento.textContent =
        agora.toLocaleTimeString("pt-BR");
}


client.onConnectionLost =
    function (responseObject) {
        atualizarStatus(false);
        console.log(
            "Conexão MQTT perdida."
        );
        if (
            responseObject.errorCode !== 0
        ) {
            console.error(
                "Motivo:",
                responseObject.errorMessage
            );
        }
        // Tenta reconectar
        setTimeout(
            conectarMQTT,
            5000
        );
    };

function mostrarPagina(pagina) {
    const sobre =
        document.getElementById("sobre");
    const dashboard =
        document.getElementById("dashboard");
    const botoes =
        document.querySelectorAll(".nav-button");
    if (sobre) {
        sobre.style.display = "none";
    }
    if (dashboard) {
        dashboard.style.display = "none";
    }
    botoes.forEach(function (botao) {
       botao.classList.remove("active");
    });

    if (pagina === "sobre") {
        if (sobre) {
            sobre.style.display = "block";
        }
        const botao =
            document.getElementById(
                "btn-sobre"
            );
        if (botao) {
            botao.classList.add("active");
        }
    }

    else if (pagina === "dashboard") {
        if (dashboard) {
            dashboard.style.display = "block";
        }
        const botao =
            document.getElementById(
                "btn-dashboard"
            );
        if (botao) {
            botao.classList.add("active");
        }
    }
}

// Botão Sobre
const btnSobre =
    document.getElementById("btn-sobre");
if (btnSobre) {
    btnSobre.addEventListener(
        "click",
        function () {
            mostrarPagina("sobre");

        }
    );
}

// Botão Dashboard
const btnDashboard =
    document.getElementById(
        "btn-dashboard"
    );
if (btnDashboard) {
    btnDashboard.addEventListener(
        "click",
        function () {
            mostrarPagina("dashboard");
        }
    );
}


document.addEventListener(
    "DOMContentLoaded",
        function () {
        console.log(
            "Dashboard IoT Grupo 06 iniciado."
        );
        // Recupera senha
        carregarSenha();
        // Página inicial
        mostrarPagina("sobre");
        // Conecta ao MQTT
        conectarMQTT();
    }
);