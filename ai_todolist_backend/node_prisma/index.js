const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// --- FUNÇÃO DE INTEGRAÇÃO (Node.js avisando o PHP) ---
async function registrarLog(acao, detalhe, usuarioId = null) {
    try {
        await fetch('http://localhost:8002', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao, detalhe, usuarioId })
        });
    } catch (error) {
        console.log('Aviso: Não foi possível conectar ao serviço de Logs (PHP).');
    }
}

// --- ROTAS ABERTAS ---

app.post('/usuarios', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const novoUsuario = await prisma.usuario.create({
            data: { nome, email, senha: senhaHash }
        });
        res.status(201).json({ id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email });
    } catch (error) {
        res.status(400).json({ erro: 'Erro ao criar usuário' });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            registrarLog('ERRO_LOGIN', `Tentativa de acesso com email nao encontrado: ${email}`);
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            registrarLog('ERRO_LOGIN', `Senha incorreta para o email: ${email}`, usuario.id);
            return res.status(401).json({ erro: 'Senha incorreta' });
        }

        const token = jwt.sign({ userId: usuario.id }, 'segredo_super_seguro', { expiresIn: '1h' });
        res.status(200).json({ token, id: usuario.id }); // Retornando o ID para o front-end usar no Python
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao fazer login' });
    }
});

// --- O SEGURANÇA (Middleware) ---
function verificarToken(req, res, next) {
    const tokenHeader = req.headers['authorization'];
    if (!tokenHeader) return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });

    const token = tokenHeader.split(' ')[1];
    try {
        const decodificado = jwt.verify(token, 'segredo_super_seguro');
        req.usuarioId = decodificado.userId;
        next();
    } catch (error) {
        res.status(400).json({ erro: 'Token inválido.' });
    }
}

// --- ROTAS PROTEGIDAS ---

app.post('/tarefas', verificarToken, async (req, res) => {
    const { titulo } = req.body;
    try {
        const novaTarefa = await prisma.tarefa.create({
            data: { titulo, usuarioId: req.usuarioId } 
        });
        
        // Avisa o PHP!
        registrarLog('CRIAR_TAREFA', `Criou a tarefa: ${titulo}`, req.usuarioId);
        
        res.status(201).json(novaTarefa);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar tarefa' });
    }
});

app.get('/tarefas', verificarToken, async (req, res) => {
    try {
        const tarefas = await prisma.tarefa.findMany({
            where: { usuarioId: req.usuarioId }
        });
        res.status(200).json(tarefas);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar tarefas' });
    }
});

app.patch('/tarefas/:id/concluir', verificarToken, async (req, res) => {
    const tarefaId = parseInt(req.params.id);
    try {
        const tarefaAtualizada = await prisma.tarefa.update({
            where: { id: tarefaId, usuarioId: req.usuarioId },
            data: { concluida: true }
        });
        
        // Avisa o PHP!
        registrarLog('CONCLUIR_TAREFA', `Concluiu a tarefa ID: ${tarefaId}`, req.usuarioId);

        res.status(200).json(tarefaAtualizada);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao concluir tarefa' });
    }
});

app.listen(3001, () => {
    console.log('Servico 1 rodando na porta 3001');
});