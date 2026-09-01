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



// Salva a senha do professor
function salvarSenha() {
    const senha =
        document.getElementById("senha");
    if (!senha) return;
    localStorage.setItem(
        "senhaProfessor",
        senha.value
    );
    alert("Senha salva com sucesso!");
}


// Recupera a senha salva
function carregarSenha() {
    const senha =
        document.getElementById("senha");
    if (!senha) return;
    const senhaSalva =
        localStorage.getItem("senhaProfessor");
    if (senhaSalva) {
        senha.value = senhaSalva;
    }
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


// CONEXÃO COM MQTT
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
            // Tenta novamente depois de 5 segundos
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


    // TEMPERATURA
    if (
        message.destinationName ===
        TOPIC_TEMPERATURA
    ) {
        if (temperatura) {
            temperatura.textContent =
                valor.toFixed(1) + " °C";
        }
        console.log(
            "Temperatura:",
            valor
        );
    }


    // UMIDADE
    else if (
        message.destinationName ===
        TOPIC_UMIDADE
    ) {
        if (umidade) {
            umidade.textContent =
                valor.toFixed(1) + " %";
        }
        console.log(
            "Umidade:",
            valor
        );
    }


    // QUALIDADE DO AR
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
};


// CONEXÃO MQTT PERDIDA
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

// NAVEGAÇÃO ENTRE AS ABAS

function mostrarPagina(pagina) {
    const sobre =
        document.getElementById("sobre");
    const dashboard =
        document.getElementById("dashboard");
    const botoes =
        document.querySelectorAll(".menu-btn");


    // Esconde as páginas
    if (sobre) {
        sobre.style.display = "none";
    }
    if (dashboard) {
        dashboard.style.display = "none";
    }
    // Remove o botão ativo
    botoes.forEach(function (botao) {
        botao.classList.remove("ativo");
    });


    // SOBRE O PROJETO
    if (pagina === "sobre") {

        if (sobre) {
            sobre.style.display = "block";
        }
        const botao =
            document.getElementById("btn-sobre");
        if (botao) {
            botao.classList.add("ativo");
        }
    }


    // DASHBOARD
    else if (pagina === "dashboard") {
        if (dashboard) {
            dashboard.style.display = "block";
        }
        const botao =
            document.getElementById(
                "btn-dashboard"
            );
        if (botao) {
            botao.classList.add("ativo");
        }
    }
}


// INICIALIZAÇÃO
document.addEventListener(
    "DOMContentLoaded",
    function () {
        console.log(
            "Dashboard IoT Grupo 06 iniciado."
        );
        // Carrega senha
        carregarSenha();
        // Abre a página Sobre
        mostrarPagina("sobre");
        // Conecta ao MQTT
        conectarMQTT();
    }
);