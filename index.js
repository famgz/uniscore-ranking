let url = 'http://189.126.105.132:5000/rankingequipes';  // gunicorn
let url_local = './data/rankingequipes.json';

let apiData;

let timestamp;
const intervaloMinimoReq = 30 * 1000;  // milisegundos

const tabela = document.getElementById("tabela-ranking");
const tabelaCorpo = document.getElementById("tabela-corpo");

const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Referer': 'http://189.126.105.132:5000',
    'Origin': 'http://189.126.105.132:5000',
});

const requestOptions = {
    method: 'GET',
    headers: headers,
    credentials: "same-origin",
    // mode: "no-cors"
};

function timestampAtual() {
    return new Date().getTime();
}

function intervaloMinimoAtingido() {
    // checar intervalo da última requisição
    if (timestamp) {
        let intervalo = timestampAtual() - timestamp;

        if (apiData && intervalo < intervaloMinimoReq) {
            let restante = Math.floor((intervaloMinimoReq - intervalo) / 1000);
            msg = `Aguarde mais ${restante} segundos para uma nova requisição`
            console.log(msg);
            return false;
        }
    }
    return true;
}

function limparRanking() {
    tabelaCorpo.innerHTML = "";
    tabela.style.display = "none";
}

function ordenarEquipesPorPontosDecrs() {
    apiData.sort((a, b) => b.pontos - a.pontos);
}

function popularTabela() {
      // mostrar tabela
      tabela.style.display = "block";

      // popular rows
      apiData.forEach(function (equipe, i) {
          let row = tabelaCorpo.insertRow();
          let pos = row.insertCell(0);
          let nome = row.insertCell(1);
          let pontos = row.insertCell(2);
  
          // Adicionar classe à célula da coluna "Posição" com base nas posições
          if (i < 3) {
              pos.className = "verde";
          } else if (i < 7) {
              pos.className = "branca";
          } else if (i < 10) {
              pos.className = "vermelha";
          }
  
          // Adicionar classe à célula da coluna "Nome da Equipe"
          nome.className = "nome-equipe-branco";
  
          // Adicionar classe à célula da coluna "Pontos"
          pontos.className = "pontos-azul-marinho";
  
          pos.innerHTML = i + 1;
          nome.innerHTML = equipe.nomeEquipe;
          pontos.innerHTML = equipe.pontos;
      });
}

function aplicarCores() {
    const linhas = tabelaCorpo.getElementsByTagName('tr');

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];

        // Aplicar classe à célula da coluna "Posição" com base nas posições
        if (i < 3) {
            linha.querySelector('.verde').style.backgroundColor = '#143d59';
        } else if (i < 7) {
            linha.querySelector('.branca').style.backgroundColor = '#143d59';
        } else if (i < 10) {
            linha.querySelector('.vermelha').style.backgroundColor = '#143d59';
        }
    }
}

async function obterDados() {
    // checar intervalo da última requisição
    if (!intervaloMinimoAtingido()) {
        return;
    }

    // atualizar tempo da última requisição
    timestamp = timestampAtual();

    let obj;

    // requisitar dados
    try {
        const res = await fetch(url, requestOptions);
        if (!res.ok) {
            throw new Error(`Response status: ${res.status} ${res.statusText}`);
        }
        obj = await res.json();
        console.log(obj);
    } catch (err) {
        msg = `Erro no download dos dados: ${err.message}\nTente novamente mais tarde.`;
        console.error(msg);
        return;
    }

    // checar integridade dos dados
    if (!obj || obj.length == 0) {
        console.error("Dados estão vazios.");
        return;
    }

    // atribuir dados à variável global
    apiData = obj;
}

async function carregarRanking() {
    await obterDados();

    if (!apiData || apiData.length == 0) {
        msg = "Dados inválidos.\nTente novamente mais tarde ou confira sua conexão com o servidor."
        console.log(msg);
        alert(msg);
        return;
    }

    limparRanking();

    ordenarEquipesPorPontosDecrs();

    popularTabela();

    aplicarCores(); 
}
