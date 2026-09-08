// Endereço do broker MQTT
const BROKER = "localhost";

// Porta utilizada pelo MQTT via WebSocket
const PORT = 9001;

// Tópicos MQTT que receberão os dados dos sensores
const TOPIC_TEMPERATURA = "aulas/grupo06/temperatura";
const TOPIC_UMIDADE = "aulas/grupo06/umidade";
const TOPIC_QUALIDADE_AR = "aulas/grupo06/qualidade_ar";

// Cria um ID único para o cliente MQTT
const CLIENT_ID =
    "WebDashboard_Grupo06_" + Math.random().toString(16).substring(2, 10);

// Seleciona os elementos do HTML que serão atualizados
const statusConexao = document.getElementById("status-conexao");
const temperatura = document.getElementById("temperatura");
const umidade = document.getElementById("umidade");
const qualidadeAr = document.getElementById("qualidade-ar");

// Elementos relacionados à senha do professor
const senha = document.getElementById("senha-grupo");
const botaoSalvarSenha = document.getElementById("salvar-senha");
const mensagemSenha = document.getElementById("mensagem-senha");

// Verifica se o elemento de status existe na página
if (statusConexao) {

    // Cria o cliente MQTT usando o broker, a porta e o ID
    const client = new Paho.MQTT.Client(BROKER, PORT, CLIENT_ID);

    // Atualiza visualmente o status da conexão
    function atualizarStatus(conectado) {

        // Se o elemento não existir, não faz nada
        if (!statusConexao) return;

        if (conectado) {

            // Mostra que o dashboard está conectado
            statusConexao.textContent = "● Conectado";

            // Remove a classe de desconectado
            statusConexao.classList.remove("desconectado");

            // Adiciona a classe de conectado
            statusConexao.classList.add("conectado");

        } else {

            // Mostra que o dashboard está desconectado
            statusConexao.textContent = "● Desconectado";

            // Remove a classe de conectado
            statusConexao.classList.remove("conectado");

            // Adiciona a classe de desconectado
            statusConexao.classList.add("desconectado");
        }
    }

    // Função responsável por conectar o dashboard ao MQTT
    function conectarMQTT() {

        // Inicialmente, mostra o status como desconectado
        atualizarStatus(false);

        // Tenta realizar a conexão com o broker MQTT
        client.connect({

            // Não utiliza conexão SSL
            useSSL: false,

            // Tempo máximo para tentar conectar
            timeout: 5,

            // Intervalo para manter a conexão ativa
            keepAliveInterval: 30,

            // Executado quando a conexão é realizada com sucesso
            onSuccess: function () {

                console.log("MQTT conectado com sucesso!");

                // Atualiza o status para conectado
                atualizarStatus(true);

                // Inscreve o cliente nos tópicos dos sensores
                client.subscribe(TOPIC_TEMPERATURA);
                client.subscribe(TOPIC_UMIDADE);
                client.subscribe(TOPIC_QUALIDADE_AR);

                console.log("Inscrito nos tópicos MQTT.");
            },

            // Executado quando ocorre algum erro na conexão
            onFailure: function (erro) {

                console.error("Erro ao conectar no MQTT:", erro);

                // Atualiza o status para desconectado
                atualizarStatus(false);

                // Tenta conectar novamente depois de 5 segundos
                setTimeout(conectarMQTT, 5000);
            }
        });
    }

    // Função executada sempre que uma nova mensagem MQTT é recebida
    client.onMessageArrived = function (message) {

        console.log(
            "Mensagem recebida:",
            message.destinationName,
            message.payloadString
        );

        // Converte o valor recebido para número
        const valor = parseFloat(message.payloadString);

        // Se o valor não for um número, ignora a mensagem
        if (isNaN(valor)) return;

        // Verifica se a mensagem pertence ao tópico de temperatura
        if (message.destinationName === TOPIC_TEMPERATURA) {

            // Atualiza a temperatura no HTML
            if (temperatura) {
                temperatura.textContent = valor.toFixed(1);
            }

            console.log("Temperatura:", valor);

        // Verifica se a mensagem pertence ao tópico de umidade
        } else if (message.destinationName === TOPIC_UMIDADE) {

            // Atualiza a umidade no HTML
            if (umidade) {
                umidade.textContent = valor.toFixed(1);
            }

            console.log("Umidade:", valor);

        // Verifica se a mensagem pertence ao tópico de qualidade do ar
        } else if (message.destinationName === TOPIC_QUALIDADE_AR) {

            // Atualiza a qualidade do ar no HTML
            if (qualidadeAr) {
                qualidadeAr.textContent = valor;
            }

            console.log("Qualidade do ar:", valor);
        }

        // Atualiza o horário da última mensagem recebida
        atualizarHorario();
    };

    // Atualiza o horário da última atualização dos sensores
    function atualizarHorario() {

        // Procura o elemento responsável pelo horário
        const elemento = document.getElementById("ultima-atualizacao");

        // Se o elemento não existir, encerra a função
        if (!elemento) return;

        // Pega a data e hora atuais
        const agora = new Date();

        // Exibe somente o horário no formato brasileiro
        elemento.textContent = agora.toLocaleTimeString("pt-BR");
    }

    // Função executada quando a conexão MQTT é perdida
    client.onConnectionLost = function (responseObject) {

        // Atualiza o status para desconectado
        atualizarStatus(false);

        console.log("Conexão MQTT perdida.");

        // Mostra no console o motivo da perda da conexão
        if (responseObject.errorCode !== 0) {
            console.error("Motivo:", responseObject.errorMessage);
        }

        // Tenta se conectar novamente depois de 5 segundos
        setTimeout(conectarMQTT, 5000);
    };

    // Salva a senha digitada pelo professor
    // Salva a senha digitada pelo professor
function salvarSenha() {

    // Verifica se o campo de senha existe
    if (!senha) return;

    // Verifica se o campo está vazio
    if (senha.value.trim() === "") {

        if (mensagemSenha) {
            mensagemSenha.textContent =
                "Digite uma senha antes de salvar.";
        }

        return;
    }

    // Salva a senha no armazenamento local do navegador
    localStorage.setItem("senhaProfessor", senha.value);

    // Mostra uma mensagem de sucesso
    if (mensagemSenha) {
        mensagemSenha.textContent = "Senha salva com sucesso!";
    }
} // ← FECHA salvarSenha()


// Array com os integrantes do grupo
const integrantesGrupo = [
    "Ana Clara",
    "Anna Beatriz",
    "Giovanna Costa",
    "Giovanna Contieri",
    "Lara",
    "Paola"
];

// Salva os integrantes no armazenamento local
localStorage.setItem(
    "IntegrantesGrupo",
    JSON.stringify(integrantesGrupo)
);


// Carrega a senha que foi salva anteriormente
function carregarSenha() {

    // Verifica se o campo de senha existe
    if (!senha) return;

    // Busca a senha armazenada no navegador
    const senhaSalva = localStorage.getItem("senhaProfessor");

    // Se existir uma senha salva, coloca no campo
    if (senhaSalva) {
        senha.value = senhaSalva;
    }
}


// Adiciona o evento de clique ao botão de salvar senha
if (botaoSalvarSenha) {
    botaoSalvarSenha.addEventListener("click", salvarSenha);
}


// Executa quando todo o HTML da página estiver carregado
document.addEventListener("DOMContentLoaded", function () {

    console.log("Dashboard IoT Grupo 06 iniciado.");

    // Carrega a senha salva
    carregarSenha();

    // Inicia a conexão com o MQTT
    conectarMQTT();
});

}