# Day Pharma V25 - validacao da composicao central

## Alteracoes
- Pagina de injetaveis com cinco camadas independentes animadas pela rolagem.
- Cena limitada a uma secao central, com imagem original no ultimo quadro.
- Removidos a faixa lateral, seus estilos e seu script. Largura normal do conteudo restaurada.
- Videos, WhatsApp e as outras dezenove paginas preservados.
- Imagem final WebP lossless comparada pixel a pixel com o anexo: identica.

## Testes realizados
- HTML, arquivos CSS/JS, imagens, videos e destinos de ancoras nas 20 paginas: sem referencias locais ausentes.
- Codigo JavaScript validado pelo Node.
- Cenas renderizadas em Chromium a 1440 x 900 e 390 x 844, com leituras em seis pontos da rolagem.
- Verificados movimento de retorno, chegada ao quadro final, link Continuar e ausencia da antiga faixa no rodape.
- Sem excecoes JavaScript nem overflow horizontal nos testes.
- Imagem completa estatica com movimento reduzido, JavaScript desativado e celular horizontal de pouca altura.
- Os tres videos sao os mesmos arquivos da V24. Nenhuma nova faixa de audio foi adicionada.

## Escopo do ambiente de teste
O navegador deste ambiente bloqueou a navegacao direta para URLs locais HTTP
e file://. Por isso a renderizacao foi feita em memoria, com copias dos proprios
HTML, CSS, JavaScript, imagens e video embutidas APENAS no teste. O pacote
entregue continua com arquivos locais relativos, sem depender de servidor,
CDN de animacao ou carregamento JSON. A abertura direta do ZIP extraido nao
foi testada por navegacao nesse navegador gerenciado.
Os testes de celular representam tamanhos de tela e preferencias simulados,
nao uma certificacao em aparelhos fisicos ou em todos os navegadores.

## Antes da publicacao
As ressalvas sobre conteudo, privacidade e integracao dos formularios continuam
na documentacao original. O dominio em producao nao foi alterado.
