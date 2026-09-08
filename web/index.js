const BROKER = "localhost";
const PORT = 9001;

const TOPIC_TEMPERATURA = "aulas/grupo06/temperatura";
const TOPIC_UMIDADE = "aulas/grupo06/umidade";
const TOPIC_QUALIDADE_AR = "aulas/grupo06/qualidade_ar";

const CLIENT_ID = "WebDashboard_Grupo06_" + Math.random().toString(16).substring(2, 10);

const statusConexao = document.getElementById("status-conexao");
const temperatura = document.getElementById("temperatura");
const umidade = document.getElementById("umidade");
const qualidadeAr = document.getElementById("qualidade-ar");
const senha = document.getElementById("senha-grupo");
const botaoSalvarSenha = document.getElementById("salvar-senha");
const mensagemSenha = document.getElementById("mensagem-senha");

if (statusConexao) {
    const client = new Paho.MQTT.Client(BROKER, PORT, CLIENT_ID);

    function atualizarStatus(conectado) {
        if (!statusConexao) return;

        if (conectado) {
            statusConexao.textContent = "● Conectado";
            statusConexao.classList.remove("desconectado");
            statusConexao.classList.add("conectado");
        } else {
            statusConexao.textContent = "● Desconectado";
            statusConexao.classList.remove("conectado");
            statusConexao.classList.add("desconectado");
        }
    }

    function conectarMQTT() {
        atualizarStatus(false);

        client.connect({
            useSSL: false,
            timeout: 5,
            keepAliveInterval: 30,

            onSuccess: function () {
                console.log("MQTT conectado com sucesso!");
                atualizarStatus(true);

                client.subscribe(TOPIC_TEMPERATURA);
                client.subscribe(TOPIC_UMIDADE);
                client.subscribe(TOPIC_QUALIDADE_AR);

                console.log("Inscrito nos tópicos MQTT.");
            },

            onFailure: function (erro) {
                console.error("Erro ao conectar no MQTT:", erro);
                atualizarStatus(false);
                setTimeout(conectarMQTT, 5000);
            }
        });
    }

    client.onMessageArrived = function (message) {
        console.log("Mensagem recebida:", message.destinationName, message.payloadString);

        const valor = parseFloat(message.payloadString);

        if (isNaN(valor)) return;

        if (message.destinationName === TOPIC_TEMPERATURA) {
            if (temperatura) {
                temperatura.textContent = valor.toFixed(1);
            }
            console.log("Temperatura:", valor);
        } else if (message.destinationName === TOPIC_UMIDADE) {
            if (umidade) {
                umidade.textContent = valor.toFixed(1);
            }
            console.log("Umidade:", valor);
        } else if (message.destinationName === TOPIC_QUALIDADE_AR) {
            if (qualidadeAr) {
                qualidadeAr.textContent = valor;
            }
            console.log("Qualidade do ar:", valor);
        }

        atualizarHorario();
    };

    function atualizarHorario() {
        const elemento = document.getElementById("ultima-atualizacao");

        if (!elemento) return;

        const agora = new Date();
        elemento.textContent = agora.toLocaleTimeString("pt-BR");
    }

    client.onConnectionLost = function (responseObject) {
        atualizarStatus(false);
        console.log("Conexão MQTT perdida.");

        if (responseObject.errorCode !== 0) {
            console.error("Motivo:", responseObject.errorMessage);
        }

        setTimeout(conectarMQTT, 5000);
    };

    function salvarSenha() {
        if (!senha) return;

        if (senha.value.trim() === "") {
            if (mensagemSenha) {
                mensagemSenha.textContent = "Digite uma senha antes de salvar.";
            }
            return;
        }

        localStorage.setItem("senhaProfessor", senha.value);

        if (mensagemSenha) {
            mensagemSenha.textContent = "Senha salva com sucesso!";
        }
    }

    function carregarSenha() {
        if (!senha) return;

        const senhaSalva = localStorage.getItem("senhaProfessor");

        if (senhaSalva) {
            senha.value = senhaSalva;
        }
    }

    if (botaoSalvarSenha) {
        botaoSalvarSenha.addEventListener("click", salvarSenha);
    }

    document.addEventListener("DOMContentLoaded", function () {
        console.log("Dashboard IoT Grupo 06 iniciado.");
        carregarSenha();
        conectarMQTT();
    });
}