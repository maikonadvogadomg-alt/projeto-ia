FLUXO DE ENVIO DE MENSAGEM
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  USUÁRIO DIGITA MENSAGEM                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  EVENT: textarea keydown (Ctrl+Enter) ou click btn-enviar   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  enviarMensagem()                                            │
│  ├─ Validar input (não vazio)                               │
│  ├─ Criar novo chat se não existir                          │
│  └─ Desabilitar botão enviar                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  adicionarMensagemUI('usuario', mensagem)                   │
│  ├─ Criar elemento .mensagem.usuario                        │
│  ├─ Adicionar toolbar (copiar, download)                    │
│  └─ Scroll para bottom                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  configManager.salvarMensagemChat(chatId, mensagem)         │
│  └─ Salvar em localStorage                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  conversaAtual.push({tipo: 'usuario', conteudo})            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Buscar Internet (se ativado)                               │
│  ├─ gerenciadorIA.buscarInternet(query)                     │
│  └─ Adicionar resultados ao contexto                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Preparar Contexto                                           │
│  ├─ configManager.obterMemoriaContexto(15)                  │
│  ├─ conversaAtual.slice(-limitContexto)                     │
│  └─ Montar histórico para IA                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  gerenciadorIA.enviarMensagem(mensagem, historico)          │
│  ├─ Switch por modelo selecionado                           │
│  ├─ Enviar para API correta                                 │
│  └─ Receber resposta                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  adicionarMensagemUI('ia', resposta)                         │
│  ├─ Processar código (```...```)                            │
│  ├─ Criar elemento .mensagem.ia                             │
│  ├─ Adicionar toolbar (copiar, download, falar)             │
│  └─ Scroll para bottom                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  falarTexto(resposta) - Se TTS ativo                         │
│  └─ speechSynthesis.speak(utterance)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  configManager.adicionarMemoria('conversa', ...)            │
│  └─ Salvar em localStorage (max 100 registros)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Habilitar botão enviar                                     │
│  └─ Limpar input                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ✓ PROCESSO COMPLETO                                        │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
TEMPO ESTIMADO: 1-5 segundos (dependendo da IA)
═══════════════════════════════════════════════════════════════
