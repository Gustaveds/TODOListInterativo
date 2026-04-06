const URL_NODE = 'http://localhost:3001';
const URL_PYTHON = 'http://localhost:8001';

// Função para gerenciar as telas
function alternarTelas() {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        carregarTarefas();
        carregarEstatisticas();
    } else {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('appScreen').classList.add('hidden');
    }
}

// --- INTEGRAÇÃO COM SERVIÇO 1 (NODE.JS) ---

async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const res = await fetch(`${URL_NODE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    if (res.ok) {
        const dados = await res.json();
        localStorage.setItem('token', dados.token);
        localStorage.setItem('userId', dados.id);
        alternarTelas();
    } else {
        alert('Email ou senha incorretos!');
    }
}

async function criarConta() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    await fetch(`${URL_NODE}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Usuário Teste', email, senha })
    });
    alert('Conta criada! Agora clique em Entrar.');
}

async function carregarTarefas() {
    const res = await fetch(`${URL_NODE}/tarefas`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const tarefas = await res.json();
    
    const lista = document.getElementById('listaTarefas');
    lista.innerHTML = '';
    
    tarefas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span style="${t.concluida ? 'text-decoration: line-through; color: gray;' : ''}">${t.titulo}</span>
            ${!t.concluida ? `<button onclick="concluirTarefa(${t.id})">✔ Concluir</button>` : ''}
        `;
        lista.appendChild(li);
    });
}

async function adicionarTarefa() {
    const titulo = document.getElementById('novaTarefa').value;
    if (!titulo) return;

    await fetch(`${URL_NODE}/tarefas`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ titulo })
    });

    document.getElementById('novaTarefa').value = '';
    carregarTarefas();
    carregarEstatisticas(); // Atualiza os gráficos!
}

async function concluirTarefa(id) {
    await fetch(`${URL_NODE}/tarefas/${id}/concluir`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    carregarTarefas();
    carregarEstatisticas(); // Atualiza os gráficos!
}

// --- INTEGRAÇÃO COM SERVIÇO 3 (PYTHON) ---

async function carregarEstatisticas() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const res = await fetch(`${URL_PYTHON}/estatisticas/${userId}`);
    if (res.ok) {
        const stats = await res.json();
        document.getElementById('statTotal').innerText = stats.total;
        document.getElementById('statConcluidas').innerText = stats.concluidas;
        document.getElementById('statPendentes').innerText = stats.pendentes;
    }
}

function sair() {
    localStorage.clear();
    alternarTelas();
}

// Inicializa a tela correta ao abrir a página
alternarTelas();