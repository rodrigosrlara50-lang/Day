# V24 - ampolas na lateral

A alteracao afeta somente a pagina de Injetaveis. O bloco de demonstracao
e os textos sobre a animacao da V23 foram removidos. As ampolas agora
acompanham o scroll desde o fim do video ate o fim do rodape.

## Verificacoes realizadas

- Oito dimensoes de viewport: 1440x900, 1920x1080, 1280x720, 1024x768,
  768x1024, 390x844, 320x720 e 844x390.
- Cinco pontos de rolagem por viewport, incluindo o fim da pagina.
- Movimento vertical progressivo em todas as amostras; sem reiniciar por secao.
- Nenhuma sobreposicao medida com textos ou com o botao de WhatsApp.
- Sem rolagem horizontal, imagens locais quebradas ou erros JavaScript.
- Ampolas ocultas na abertura em video e ao abrir o menu no celular.
- Modo de movimento reduzido sem deslocamento animado.
- Todos os videos e as outras 19 paginas preservados byte a byte.
- Referencias locais dos HTMLs e CSS verificadas por caminho de arquivo.

## Metodo e limites

Testes de layout e comportamento com Chromium. O ambiente restringiu
navegacao para URLs locais, entao os mesmos HTMLs, estilos, scripts e
midias locais foram incorporados em uma previa isolada para renderizacao.
Fontes externas foram desativadas nesse teste, verificando os fallbacks.
Nao houve teste em aparelhos fisicos ou publicacao no dominio.
Detalhes e coordenadas: validacao-v24.json.

As pendencias de conteudo, formularios e publicacao da V22 continuam validas.
