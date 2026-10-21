# Validação técnica da V22

## Testes efetuados

- 20 páginas verificadas em 1440 × 980 e 390 × 844: 40 combinações.
- Nenhuma referência local de imagem, vídeo, CSS, JavaScript ou destino de link ausente nos testes estáticos.
- Nenhuma âncora local ausente, ID duplicado ou página sem um título principal H1 único.
- Nenhuma imagem local com falha de decodificação, erro JavaScript ou largura de conteúdo superior à tela nas duas larguras verificadas.
- Um botão de WhatsApp por página.
- Os três vídeos decodificaram nos dois tamanhos, com mute, object-fit cover e dimensões iguais à área de abertura. FFprobe confirmou que os arquivos não têm faixa de áudio.
- Testada a validação local de receita com dados fictícios e uma imagem do projeto, sem transmissão externa. A interface informa explicitamente que nada foi enviado.
- Menu móvel abre e fecha; Escape fecha o menu.

## Método e limites

Os caminhos e âncoras foram conferidos diretamente nos arquivos do projeto. Para testes visuais, o Chromium recebeu o HTML real com cópias dos recursos locais incorporadas somente na página de teste, pois o ambiente de prévia não permitiu navegar por file:// ou HTTP local. Essa incorporação não altera os arquivos entregues.

As fontes remotas não foram carregadas no teste isolado: a renderização usou as fontes alternativas declaradas. Não foram testadas transações de loja, autenticação, entrega de e-mails, recebimento de receitas ou currículos, disponibilidade contínua do WhatsApp, mapas e vídeos externos, nem desempenho de hospedagem real.

Os resultados detalhados estão em validacao-tecnica.json. Esses testes não constituem auditoria de segurança, conformidade regulatória ou garantia para todos os navegadores e aparelhos. Homologar a publicação na infraestrutura definitiva.
