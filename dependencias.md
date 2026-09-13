DEPENDÊNCIAS E RELAÇÕES ENTRE MÓDULOS
═══════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────┐
│                    CAMADA DE UI                            │
├────────────────────────────────────────────────────────────┤
│  HTML (index.html)                                         │
│  └─ Define estrutura de elementos                          │
│     └─ Referenciados por JavaScript                        │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                  CAMADA DE APRESENTAÇÃO                    │
├────────────────────────────────────────────────────────────┤
│  CSS (em <style>)                                          │
│  ├─ Responsividade (media queries)                         │
│  ├─ Temas (CSS variables)                                  │
│  └─ Animações                                              │
│                                                            │
│  GerenciadorTemas                                          │
│  └─ Aplica temas dinamicamente                             │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                  CAMADA DE LÓGICA                          │
├────────────────────────────────────────────────────────────┤
│  Interface de Chat                                         │
│  ├─ enviarMensagem()                                       │
│  ├─ adicionarMensagemUI()                                  │
│  ├─ iniciarVoz()                                           │
│  └─ falarTexto()                                           │
│                                                            │
│  Modais e Configurações                                    │
│  ├─ abrirConfiguracoes()                                   │
│  ├─ salvarChaves()                                         │
│  └─ abrirPlayground()                                      │
│                                                            │
│  Exportação                                                │
│  ├─ exportarMarkdown()                                     │
│  └─ exportarJSON()                                         │
│                                                            │
│  Atalhos e Notificações                                    │
│  ├─ GerenciadorAtalhos                                     │
│  └─ SistemaNotificacoes                                    │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                  CAMADA DE INTEGRAÇÃO                      │
├────────────────────────────────────────────────────────────┤
│  GerenciadorIA                                             │
│  ├─ enviarMensagem() → switch modelo                       │
│  ├─ enviarMonica()                                         │
│  ├─ enviarOpenAI()                                         │
│  ├─ enviarGemini()                                         │
│  ├─ enviarLocal()                                          │
│  └─ buscarInternet()                                       │
│                                                            │
│  GerenciadorIALocal                                        │
│  ├─ listarModelos()                                        │
│  ├─ enviarMensagem()                                       │
│  └─ baixarModelo()                                         │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                  CAMADA DE DADOS                           │
├────────────────────────────────────────────────────────────┤
│  ConfigManager                                             │
│  ├─ carregarConfig()                                       │
│  ├─ salvarConfig()                                         │
│  ├─ adicionarMemoria()                                     │
│  ├─ novoChat()                                             │
│  ├─ fazerBackup()                                          │
│  └─ importarBackup()                                       │
│                                                            │
│  localStorage                                              │
│  ├─ iaConfig                                               │
│  ├─ iaMemoria                                              │
│  ├─ iaChats                                                │
│  └─ temaSelecionado                                        │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                  CAMADA DE DOCUMENTAÇÃO                    │
├────────────────────────────────────────────────────────────┤
│  DOCUMENTACAO_PROJETO                                      │
│  ├─ Estrutura completa                                     │
│  ├─ Módulos e responsabilidades                            │
│  ├─ Fluxo de dados                                         │
│  ├─ Pontos de extensão                                     │
│  └─ Guia de manutenção                                     │
│                                                            │
│  GUIA_RAPIDO_RECUPERACAO                                   │
│  └─ Soluções para problemas comuns                         │
└────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
FLUXO: UI → Apresentação → Lógica → Integração → Dados
RETORNO: Dados → Integração → Lógica → Apresentação → UI
═══════════════════════════════════════════════════════════════
