# Integração dos formulários

## Estado entregue

`assets/js/config.js` contém três endpoints vazios: `receita`, `contato` e `curriculo`. Os formulários exibem um aviso de prévia e o botão confere os dados localmente. Nenhuma solicitação real foi enviada para testar a migração.

A validação visual de receita permite até 15 arquivos PDF/JPG/PNG, até 10 MB por arquivo. Currículo: PDF/DOC/DOCX, até 5 MB. Esses limites devem ser confirmados com a infraestrutura. A presença de validação no navegador não substitui a validação do servidor.

## Para o desenvolvedor responsável

1. Criar endpoints HTTPS na infraestrutura aprovada pela Day Pharma. Não colocar senhas, chaves de serviço ou credenciais administrativas no HTML/JavaScript.
2. Configurar os endereços em `assets/js/config.js`. Priorizar mesma origem ou CORS restrito.
3. Receber `multipart/form-data`, validar todos os campos e arquivos no servidor e impor limites de tamanho/número. Conferir tipo real do arquivo, não apenas extensão. Implementar tratamento seguro dos anexos, detecção de arquivos maliciosos e acesso restrito.
4. Garantir autenticação/autorizacão da equipe, armazenamento protegido, controle de acesso, logs apropriados, retenção e exclusão. Não disponibilizar receitas em diretório público, URL de marketing, analytics ou arquivo de log.
5. Aplicar proteção contra abuso, limites de requisição, validação de origem e CSRF conforme o backend adotado.
6. Somente após aceitação real, retornar JSON `{"ok":true,"protocol":"identificador-confirmado"}`. O código só exibe confirmação de recebimento se ambos os campos estiverem presentes e válidos. O protocolo deve corresponder a um recebimento efetivo, não a uma resposta simulada.
7. Tratar erros, reconexões e risco de duplicidade; manter o aviso de que falha/timeout não confirma recebimento. Definir resposta idempotente no servidor quando necessário.
8. Homologar com dados fictícios não sensíveis, revisar a política e só então retirar os avisos de demonstração e ajustar o texto do botão para envio real.

O atributo `mode` em config.js documenta o estágio da versão; ele não ativa um backend. Os campos de endpoint efetivos controlam a tentativa de envio. Execução por `file://` não realiza envio, mesmo com endpoint definido; publicar/homologar em HTTPS.

A integração da loja e do portal profissional é independente. Os dados desses sistemas não fazem parte deste pacote. Os links para formulários do site atual foram mantidos como alternativa, sem automação de preenchimento ou transferência de anexos.
