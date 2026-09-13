class ConfigManager {
  constructor() {
    this.config = this.carregarConfig();
    this.memoria = this.carregarMemoria();
    this.chats = this.carregarChats();
  }

  carregarConfig() {
    const config = localStorage.getItem('iaConfig');
    return config ? JSON.parse(config) : {
      modelo: 'monica',
      temperatura: 0.7,
      maxTokens: 2000,
      contexto: 'medio',
      buscaInternet: 'desativada',
      tamanhoResposta: 'media',
      chaves: {
        openai: '',
        gemini: '',
        monica: '',
        busca: ''
      },
      prompts: {
        sistema: 'Você é um assistente IA profissional e honesto.',
        adicionais: ''
      },
      perfil: {
        nome: '',
        profissao: '',
        interesses: '',
        personalidade: ''
      },
      iaLocal: {
        endereco: '',
        modelo: ''
      },
      tts: {
        ativado: false,
        velocidade: 1.15,
        voz: 'Francisca'
      }
    };
  }

  salvarConfig() {
    localStorage.setItem('iaConfig', JSON.stringify(this.config));
  }

  carregarMemoria() {
    const memoria = localStorage.getItem('iaMemoria');
    return memoria ? JSON.parse(memoria) : [];
  }

  salvarMemoria() {
    localStorage.setItem('iaMemoria', JSON.stringify(this.memoria));
  }

  adicionarMemoria(tipo, conteudo, contexto = '') {
    const registro = {
      id: Date.now(),
      tipo,
      conteudo,
      contexto,
      data: new Date().toISOString(),
      chatAtual: chatAtualId
    };

    this.memoria.push(registro);

    // Manter apenas os últimos 100 registros
    if (this.memoria.length > 100) {
      this.memoria = this.memoria.slice(-100);
    }

    this.salvarMemoria();
    return registro;
  }

  obterMemoriaContexto(limit = 15) {
    return this.memoria.slice(-limit);
  }

  carregarChats() {
    const chats = localStorage.getItem('iaChats');
    return chats ? JSON.parse(chats) : [];
  }

  salvarChats() {
    localStorage.setItem('iaChats', JSON.stringify(this.chats));
  }

  novoChat() {
    const chat = {
      id: Date.now(),
      titulo: `Chat ${new Date().toLocaleTimeString('pt-BR')}`,
      mensagens: [],
      dataCriacao: new Date().toISOString(),
      dataUltimaAtualizacao: new Date().toISOString()
    };

    this.chats.push(chat);
    this.salvarChats();
    return chat;
  }

  obterChat(id) {
    return this.chats.find(chat => chat.id === id);
  }

  salvarMensagemChat(chatId, mensagem) {
    const chat = this.obterChat(chatId);
    if (chat) {
      chat.mensagens.push(mensagem);
      chat.dataUltimaAtualizacao = new Date().toISOString();
      this.salvarChats();
    }
  }

  fazerBackup() {
    const backup = {
      versao: '1.0',
      data: new Date().toISOString(),
      config: this.config,
      memoria: this.memoria,
      chats: this.chats
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-ia-${Date.now()}.json`;
    link.click();
  }

  importarBackup(arquivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          this.config = backup.config;
          this.memoria = backup.memoria;
          this.chats = backup.chats;
          this.salvarConfig();
          this.salvarMemoria();
          this.salvarChats();
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(arquivo);
    });
  }
}

// Instância global
const configManager = new ConfigManager();
let chatAtualId = null;

class GerenciadorIA {
    constructor() {
        this.config = configManager.config;
    }

    async enviarMensagem(mensagem, historico = []) {
        const modelo = this.config.modelo;

        try {
            switch (modelo) {
                case 'monica':
                    return await this.enviarMonica(mensagem, historico);
                case 'openai':
                    return await this.enviarOpenAI(mensagem, historico);
                case 'gemini':
                    return await this.enviarGemini(mensagem, historico);
                case 'local':
                    return await this.enviarLocal(mensagem, historico);
                default:
                    return 'Modelo não configurado';
            }
        } catch (erro) {
            console.error('Erro ao enviar mensagem:', erro);
            throw erro;
        }
    }

    async enviarMonica(mensagem, historico) {
        const chave = this.config.chaves.monica;
        if (!chave) throw new Error('Chave Monica não configurada');

        const payload = {
            mensagem,
            historico,
            temperatura: this.config.temperatura,
            maxTokens: this.config.maxTokens,
            promptSistema: this.config.prompts.sistema,
            buscaInternet: this.config.buscaInternet === 'ativada'
        };

        const response = await fetch('https://api.monica.im/v1/chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${chave}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Erro Monica: ${response.status}`);

        const data = await response.json();
        return data.resposta || data.message;
    }

    async enviarOpenAI(mensagem, historico) {
        const chave = this.config.chaves.openai;
        if (!chave) throw new Error('Chave OpenAI não configurada');

        const messages = [
            { role: 'system', content: this.config.prompts.sistema },
            ...historico.map(msg => ({
                role: msg.tipo === 'usuario' ? 'user' : 'assistant',
                content: msg.conteudo
            })),
            { role: 'user', content: mensagem }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${chave}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages,
                temperature: this.config.temperatura,
                max_tokens: this.config.maxTokens
            })
        });

        if (!response.ok) throw new Error(`Erro OpenAI: ${response.status}`);

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async enviarGemini(mensagem, historico) {
        const chave = this.config.chaves.gemini;
        if (!chave) throw new Error('Chave Gemini não configurada');

        const contents = historico.map(msg => ({
            role: msg.tipo === 'usuario' ? 'user' : 'model',
            parts: [{ text: msg.conteudo }]
        }));

        contents.push({
            role: 'user',
            parts: [{ text: mensagem }]
        });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${chave}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: this.config.temperatura,
                        maxOutputTokens: this.config.maxTokens
                    }
                })
            }
        );

        if (!response.ok) throw new Error(`Erro Gemini: ${response.status}`);

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async enviarLocal(mensagem, historico) {
        const endereco = this.config.iaLocal.endereco;
        const modelo = this.config.iaLocal.modelo;

        if (!endereco || !modelo) throw new Error('IA Local não configurada');

        const response = await fetch(`${endereco}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelo,
                prompt: mensagem,
                temperature: this.config.temperatura,
                num_predict: this.config.maxTokens
            })
        });

        if (!response.ok) throw new Error(`Erro IA Local: ${response.status}`);

        const data = await response.json();
        return data.response;
    }

    async buscarInternet(query) {
        if (this.config.buscaInternet !== 'ativada') return null;

        const chave = this.config.chaves.busca;
        if (!chave) throw new Error('Chave de busca não configurada');

        try {
            const response = await fetch(
                `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${chave}`
            );
            const data = await response.json();
            return data.items?.slice(0, 3) || [];
        } catch (erro) {
            console.error('Erro ao buscar internet:', erro);
            return [];
        }
    }

    async testarConexaoLocal() {
        const endereco = this.config.iaLocal.endereco;
        if (!endereco) throw new Error('Endereço local não configurado');

        try {
            const response = await fetch(`${endereco}/api/tags`, { timeout: 5000 });
            return response.ok;
        } catch {
            return false;
        }
    }
}

const gerenciadorIA = new GerenciadorIA();


let chatAtualId = null;
let conversaAtual = [];
let reconhecimentoVozAtivo = false;
let ttsAtivo = false;

// Inicializar reconhecimento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const reconhecimento = SpeechRecognition ? new SpeechRecognition() : null;

if (reconhecimento) {
  reconhecimento.lang = 'pt-BR';
  reconhecimento.continuous = false;
  reconhecimento.interimResults = false;

  reconhecimento.onstart = () => {
    document.getElementById('btnVoz').classList.add('ativo');
    reconhecimentoVozAtivo = true;
  };

  reconhecimento.onend = () => {
    document.getElementById('btnVoz').classList.remove('ativo');
    reconhecimentoVozAtivo = false;
  };

  reconhecimento.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    document.getElementById('inputChat').value = transcript;
  };

  reconhecimento.onerror = (event) => {
    console.error('Erro no reconhecimento:', event.error);
    mostrarNotificacao('Erro no reconhecimento de voz', 'erro');
  };
}

function iniciarVoz() {
  if (!reconhecimento) {
    mostrarNotificacao('Reconhecimento de voz não suportado', 'erro');
    return;
  }

  if (reconhecimentoVozAtivo) {
    reconhecimento.abort();
  } else {
    reconhecimento.start();
  }
}

function toggleTTS() {
  ttsAtivo = !ttsAtivo;
  document.getElementById('btnTTS').classList.toggle('ativo', ttsAtivo);
  mostrarNotificacao(`TTS ${ttsAtivo ? 'ativado' : 'desativado'}`, 'sucesso');
}

function falarTexto(texto) {
  if (!ttsAtivo) return;

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'pt-BR';
  utterance.rate = configManager.config.tts.velocidade;

  // Tentar usar voz Francisca do Google
  const vozes = speechSynthesis.getVoices();
  const vozFrancisca = vozes.find(v => v.name.includes('Francisca') || v.name.includes('Google'));
  if (vozFrancisca) utterance.voice = vozFrancisca;

  speechSynthesis.speak(utterance);
}

async function enviarMensagem() {
  const input = document.getElementById('inputChat');
  const mensagem = input.value.trim();

  if (!mensagem) return;

  if (!chatAtualId) {
    const novoChat = configManager.novoChat();
    chatAtualId = novoChat.id;
    atualizarHistorico();
  }

  // Adicionar mensagem do usuário
  adicionarMensagemUI('usuario', mensagem);
  configManager.salvarMensagemChat(chatAtualId, {
    tipo: 'usuario',
    conteudo: mensagem,
    timestamp: Date.now()
  });

  conversaAtual.push({ tipo: 'usuario', conteudo: mensagem });

  // Limpar input
  input.value = '';
  input.style.height = 'auto';

  // Desabilitar botão
  document.getElementById('btnEnviar').disabled = true;

  try {
    // Buscar internet se necessário
    let contextoInternet = '';
    if (configManager.config.buscaInternet === 'ativada') {
      const resultados = await gerenciadorIA.buscarInternet(mensagem);
      if (resultados.length > 0) {
        contextoInternet = '\n\nResultados de busca:\n' +
          resultados.map(r => `- ${r.title}: ${r.snippet}`).join('\n');
      }
    }

    // Preparar histórico com contexto de memória
    const memoriaContexto = configManager.obterMemoriaContexto(15);
    const historicoLimitado = conversaAtual.slice(-this.obterLimitContexto());

    // Enviar para IA
    const resposta = await gerenciadorIA.enviarMensagem(
      mensagem + contextoInternet,
      historicoLimitado
    );

    // Adicionar resposta da IA
    adicionarMensagemUI('ia', resposta);
    configManager.salvarMensagemChat(chatAtualId, {
      tipo: 'ia',
      conteudo: resposta,
      timestamp: Date.now()
    });

    conversaAtual.push({ tipo: 'ia', conteudo: resposta });

    // Falar resposta se TTS ativo
    falarTexto(resposta);

    // Adicionar à memória
    configManager.adicionarMemoria('conversa', `Usuário: ${mensagem}\nIA: ${resposta}`, 'chat');

  } catch (erro) {
    console.error('Erro:', erro);
    adicionarMensagemUI('erro', `Erro: ${erro.message}`);
    mostrarNotificacao('Erro ao processar mensagem', 'erro');
  } finally {
    document.getElementById('btnEnviar').disabled = false;
  }
}

function adicionarMensagemUI(tipo, conteudo) {
  const container = document.getElementById('mensagens');
  const div = document.createElement('div');
  div.className = `mensagem ${tipo}`;

  let conteudoHTML = conteudo;

  // Processar código
  if (conteudo.includes('```')) {
    conteudoHTML = processarCodigos(conteudo);
  } else {
    conteudoHTML = conteudo.replace(/\n/g, '<br>');
  }

  div.innerHTML = `
        <div class="mensagem-conteudo">
            ${conteudoHTML}
        </div>
        <div class="mensagem-toolbar">
            <button class="btn-msg" onclick="copiarMensagem(this)">📋 Copiar</button>
            ${tipo === 'ia' ? '<button class="btn-msg" onclick="fazerDownloadMensagem(this)">⬇️ Download</button>' : ''}
            ${tipo === 'ia' ? '<button class="btn-msg" onclick="falarTexto(\'' + conteudo.replace(/'/g, "\\'") + '\')">🔊 Falar</button>' : ''}
        </div>
    `;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function processarCodigos(texto) {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  return texto.replace(regex, (match, linguagem, codigo) => {
    const lang = linguagem || 'text';
    return `
            <div class="codigo-bloco">
                <div class="codigo-toolbar">
                    <span style="font-size: 11px; color: var(--text-secondary);">${lang}</span>
                    <button class="btn-codigo" onclick="copiarCodigo(this)">📋 Copiar</button>
                    <button class="btn-codigo" onclick="executarCodigo(this)">▶️ Executar</button>
                </div>
                <pre>${escapeHtml(codigo.trim())}</pre>
            </div>
        `;
  });
}

function escapeHtml(texto) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return texto.replace(/[&<>"']/g, m => map[m]);
}

function copiarMensagem(btn) {
  const conteudo = btn.parentElement.parentElement.querySelector('.mensagem-conteudo').innerText;
  navigator.clipboard.writeText(conteudo).then(() => {
    mostrarNotificacao('Copiado!', 'sucesso');
  });
}

function copiarCodigo(btn) {
  const codigo = btn.parentElement.parentElement.querySelector('pre').innerText;
  navigator.clipboard.writeText(codigo).then(() => {
    mostrarNotificacao('Código copiado!', 'sucesso');
  });
}

function fazerDownloadMensagem(btn) {
  const conteudo = btn.parentElement.parentElement.querySelector('.mensagem-conteudo').innerText;
  const blob = new Blob([conteudo], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mensagem-${Date.now()}.md`;
  a.click();
}

function executarCodigo(btn) {
  const codigo = btn.parentElement.parentElement.querySelector('pre').innerText;
  document.getElementById('playgroundCodigo').value = codigo;
  abrirPlayground();
  executarPlayground();
}

function obterLimitContexto() {
  const contexto = configManager.config.contexto;
  const limites = { 'curto': 5, 'medio': 10, 'longo': 20 };
  return limites[contexto] || 10;
}

function novoChat() {
  const novoChat = configManager.novoChat();
  chatAtualId = novoChat.id;
  conversaAtual = [];
  document.getElementById('mensagens').innerHTML = '';
  atualizarHistorico();
  mostrarNotificacao('Novo chat criado', 'sucesso');
}

function atualizarHistorico() {
  const container = document.getElementById('historico');
  container.innerHTML = '';

  configManager.chats.forEach(chat => {
    const div = document.createElement('div');
    div.className = `chat-item ${chat.id === chatAtualId ? 'ativo' : ''}`;
    div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${chat.titulo}</span>
                <button onclick="excluirChat(${chat.id})" style="background: none; border: none; color: var(--text-primary); cursor: pointer;">✕</button>
            </div>
        `;
    div.onclick = () => carregarChat(chat.id);
    container.appendChild(div);
  });
}

function carregarChat(id) {
  const chat = configManager.obterChat(id);
  if (chat) {
    chatAtualId = id;
    conversaAtual = chat.mensagens;
    document.getElementById('mensagens').innerHTML = '';
    chat.mensagens.forEach(msg => {
      adicionarMensagemUI(msg.tipo, msg.conteudo);
    });
    atualizarHistorico();
  }
}

function excluirChat(id) {
  if (confirm('Tem certeza que deseja excluir este chat?')) {
    configManager.chats = configManager.chats.filter(c => c.id !== id);
    configManager.salvarChats();
    if (chatAtualId === id) {
      chatAtualId = null;
      conversaAtual = [];
      document.getElementById('mensagens').innerHTML = '';
    }
    atualizarHistorico();
    mostrarNotificacao('Chat excluído', 'sucesso');
  }
}

function atualizarModelo() {
  const modelo = document.getElementById('selectModelo').value;
  configManager.config.modelo = modelo;
  configManager.salvarConfig();
  mostrarNotificacao(`Modelo alterado para ${modelo}`, 'sucesso');
}

function atualizarConfig() {
  configManager.config.temperatura = parseFloat(document.getElementById('temperatura').value);
  configManager.config.maxTokens = parseInt(document.getElementById('maxTokens').value);
  configManager.config.contexto = document.getElementById('contexto').value;
  configManager.config.buscaInternet = document.getElementById('buscaInternet').value;
  configManager.config.tamanhoResposta = document.getElementById('tamanhoResposta').value;

  document.getElementById('tempValor').innerText = configManager.config.temperatura;
  document.getElementById('tokenValor').innerText = configManager.config.maxTokens;

  configManager.salvarConfig();
}

function mostrarNotificacao(mensagem, tipo = 'info') {
  const notif = document.createElement('div');
  notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'sucesso' ? '#10b981' : tipo === 'erro' ? '#ef4444' : '#2563eb'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
  notif.innerText = mensagem;
  document.body.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}
