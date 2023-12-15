// let url = 'http://189.126.105.132:5000/rankingequipes';  // gunicorn
let url = './data/rankingequipes.json';

let apiData;

let timestamp;
const intervaloMinimoReq = 1000 * 30; // segundos

const body = document.body;
const tabela = document.getElementById('tabela-ranking');
const tabelaCorpo = document.getElementById('tabela-corpo');

const headers = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
  Referer: url,
  Origin: url,
});

const requestOptions = {
  method: 'GET',
  headers: headers,
  credentials: 'same-origin',
  // mode: "no-cors"
};

let timestampAtual = () => {
  return new Date().getTime();
};

let intervaloMinimoAtingido = () => {
  // checar intervalo da última requisição
  if (timestamp) {
    let intervalo = timestampAtual() - timestamp;

    if (apiData && intervalo < intervaloMinimoReq) {
      let restante = Math.floor((intervaloMinimoReq - intervalo) / 1000);
      msg = `Aguarde mais ${restante} segundos para uma nova requisição`;
      console.log(msg);
      return false;
    }
  }
  return true;
};

function limparRanking() {
  tabelaCorpo.innerHTML = '';
  tabela.style.visibility = 'hidden';
}

function ordenarEquipesPorPontosDecrs() {
  apiData.sort((a, b) => b.pontos - a.pontos);
}

function popularTabela() {
  let quantidadeEquipes = apiData.length;
  const multiplo = Math.floor(quantidadeEquipes / 3);

  const ouro = multiplo * 1;
  const prata = multiplo * 2;
  const bronze = multiplo * 3;

  // mostrar tabela
  tabela.style.visibility = 'visible';

  // popular rows
  apiData.forEach(function (equipe, i) {
    let row = tabelaCorpo.insertRow();
    let pos = row.insertCell(0);
    let nome = row.insertCell(1);
    let pontos = row.insertCell(2);

    // Adicionar classe à célula da coluna "Posição" com base nas posições
    if (i < ouro) {
      pos.style.color = 'var(--ouro)';
      nome.style.backgroundColor = 'var(--ouro)';
    } else if (i < prata) {
      pos.style.color = 'var(--prata)';
      nome.style.backgroundColor = 'var(--prata)';
    } else {
      pos.style.color = 'var(--bronze)';
      nome.style.backgroundColor = 'var(--bronze)';
    }

    // Adicionar classe à célula da coluna "Nome da Equipe"
    nome.classList.add('nome-equipe-branco');

    // Adicionar classe à célula da coluna "Pontos"
    pontos.classList.add('pontos-azul-marinho');

    // Inserir Dados
    pos.innerHTML = i + 1;
    nome.innerHTML = equipe.nomeEquipe;
    pontos.innerHTML = equipe.pontos;
  });
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
    console.error('Dados estão vazios.');
    return;
  }

  // atribuir dados à variável global
  apiData = obj;
  quantidadeEquipes = apiData.length;
  console.log(quantidadeEquipes);
}

async function carregarRanking() {
  await obterDados();

  if (!apiData || apiData.length == 0) {
    msg =
      'Dados inválidos.\nTente novamente mais tarde ou confira sua conexão com o servidor.';
    console.log(msg);
    alert(msg);
    return;
  }

  limparRanking();

  ordenarEquipesPorPontosDecrs();

  popularTabela();
}

carregarRanking();
