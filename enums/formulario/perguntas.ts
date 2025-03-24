import tiposPGT = require("../../models/tipoFormulario");

/*
tabela tipo
id int
nome string

tabela fase
id int
nome string

tabela criterio
id
idtipo
idfase
nome
descricao..

*/
let Perguntas = {
  // Manter sincronizado com enum/fase.ts
  //PGT 1
  1: {
    perguntas: {
      // Manter sincronizado com enums/tipo.ts
      // Pesquisa
      1: [
        {
          titulo: "Introdução",
          criterios: `<p>- Estrutura do sumário, sequência e conteúdo proposto</p>
          <p>- Apresentação do projeto</p>
          <p>- Contextualização</p>`,
          peso: 0.15,
        },
        {
          titulo: "Fundamentação teórica",
          criterios: `<p>- Revisão bibliográfica</p>
          <p>- Percurso metodológico </p>
          <p>- Referências bibliográficas</p>
          <p>- Tipos e Técnicas de pesquisa adotados</p>`,
          peso: 0.3,
        },
        {
          titulo: "Planejamento do projeto de pesquisa",
          criterios: `<p>- Cronograma de trabalho</p>
          <p>- Planejamento do projeto de pesquisa</p>
          <p>- Projeto Arquitetônico</p>
          <p>- Desenvolvimento do objeto de pesquisa</p>`,
          peso: 0.25,
        },
        {
          titulo: "Apresentação oral e escrita",
          criterios: `<p>- Organização e apresentação</p>
          <p>- Clareza, formatação e correção da redação</p>
          <p>- Coerência dos resultados apresentados</p>
          <p>- Organização da apresentação</p>
          <p>- Oratória</p>`,
          peso: 0.15,
        },
      ],
      // Estudo de caso
      2: [
        {
          titulo: "Introdução",
          criterios: `<p>- Estrutura do sumário, sequência e conteúdo proposto</p>
          <p>- Apresentação do estudo de caso</p>
          <p>- Contextualização</p>`,
          peso: 0.15,
        },
        {
          titulo: "Metodologia",
          criterios: `<p>- Percurso metodológico </p>
          <p>- Abordagem e métodos de pesquisa escolhidos</p>
          <p>- Tipos e Técnicas de pesquisa adotados</p>`,
          peso: 0.2,
        },
        {
          titulo: "Diagnóstico",
          criterios: `<p>- Análise do ambiente, Competitiva e/ou comparativa</p>
          <p>- Análise do objeto de Avaliação (Empresa, Produto, Jogo, etc) e de seus recursos</p>
          <p>- Diagnóstico do ambiente de negócios</p>`,
          peso: 0.25,
        },
        {
          titulo: "Planejamento do projeto de pesquisa",
          criterios: `<p>- Cronograma do trabalho</p>
          <p>- Planejamento do projeto de pesquisa</p>`,
          peso: 0.25,
        },
        {
          titulo: "Apresentação oral e escrita",
          criterios: `<p>- Organização e apresentação</p>
          <p>- Clareza, formatação e correção da redação</p>
          <p>- Organização da Apresentação oral</p>
          <p>- Oratória</p>`,
          peso: 0.15,
        },
      ],
      // Empreendimento
      3: [
        {
          titulo: "Introdução",
          criterios: `<p>- Estrutura do sumário, sequência e conteúdo proposto</p>
            <p>- Apresentação do Projeto Empreendedor</p> <p>- Conceito do negócio</p>`,
          peso: 0.15,
        },
        {
          titulo: "Modelo de negócio",
          criterios: `<p>- Canvas do produto ou Serviço </p>
          <p>- Proposta inicial </p>`,
          peso: 0.2,
        },
        {
          titulo: "Diagnóstico",
          criterios: `
            <p>- Ambiente de negócio (macro e microambiente)</p>
            <p>- Viabilidade mercadológica do produto ou serviço</p>`,
          peso: 0.2,
        },
        {
          titulo: "Desenvolvimento",
          criterios: `
          <p>- Descrição de requisitos (a partir das pesquisas com usuários - Use Cases) Versão inicial</p>
          <p>- Definição do Modelo Conceitual (diagramas UML)</p>
          <p>- Simulação, protótipo ou MVP - versão inicial</p>
          <p>- Testes para aceitação e validação do MVP</p>`,
          peso: 0.3,
        },
        {
          titulo: "Elementos textuais",
          criterios: `
            <p>- Organização e apresentação de acordo com a ABNT</p>
            <p>- Clareza, formatação e correção da redação</p>
            `,
          peso: 0.15,
        },
      ],
    },
  },
  //PGT 2
  2: {
    perguntas: {
      // Pesquisa
      1: [
        {
          titulo: "Introdução",
          criterios: `<p>- Estrutura do sumário, sequência e conteúdo proposto</p>
          <p>- Apresentação do projeto</p>
          <p>- Contextualização</p>`,
          peso: 0.1,
        },
        {
          titulo: "Fundamentação teórica",
          criterios: `<p>- Revisão bibliográfica</p>
          <p>- Percurso metodológico </p>
          <p>- Referências bibliográficas</p>
          <p>- Tipos e Técnicas de pesquisa adotados</p>`,
          peso: 0.35,
        },
        {
          titulo: "Estruturação do projeto",
          criterios: `<p>- Descrição da Pesquisa</p>
          <p>- Definição do modelo conceitual</p>
          <p>- Projeto Arquitetônico</p>
          <p>- Desenvolvimento do objeto de pesquisa</p>`,
          peso: 0.35,
        },
        {
          titulo: "Elementos textuais",
          criterios: `<p>- Organização e apresentação</p>
          <p>- Clareza, formatação e correção da redação</p>
          <p>- Coerência dos resultados apresentados</p>`,
          peso: 0.1,
        },
        {
          titulo: "Apresentação",
          criterios: `<p>- Organização da apresentação</p>
          <p>- Oratória</p>`,
          peso: 0.1,
        },
      ],
      // Estudo de caso
      2: [
        {
          titulo: "Introdução",
          criterios: `<p>- Estrutura do sumário, sequência e conteúdo proposto</p>
          <p>- Apresentação do estudo de caso</p>
          <p>- Contextualização</p>`,
          peso: 0.1,
        },
        {
          titulo: "Metodologia",
          criterios: `<p>- Percurso metodológico </p>
          <p>- Abordagem e métodos de pesquisa escolhidos</p>
          <p>- Tipos e Técnicas de pesquisa adotados</p>`,
          peso: 0.1,
        },
        {
          titulo: "Diagnóstico",
          criterios: `<p>- Análise do ambiente, Competitiva e/ou Comparativa</p>
          <p>- Análise do objeto de Avaliação (Empresa, Produto, Jogo, etc) e de seus recursos</p>
          <p>- Diagnóstico do ambiente de negócios</p>`,
          peso: 0.3,
        },
        {
          titulo: "Desenvolvimento",
          criterios: `<p>- Descrição de Requisitos</p>
          <p>- Definição do modelo</p>
          <p>- Projeto da solução</p>
          <p>- Simulação, protótipo ou MVP</p>`,
          peso: 0.3,
        },
        {
          titulo: "Elementos textuais",
          criterios: `<p>- Organização e apresentação</p>
          <p>- Clareza, formatação e correção da redação</p>`,
          peso: 0.1,
        },
        {
          titulo: "Apresentação",
          criterios: `<p>- Organização da apresentação</p>
          <p>- Oratória</p>`,
          peso: 0.1,
        },
      ],
      // Empreendimento
      3: [
        {
          titulo: "Introdução",
          criterios: `
          <p>- Estrutura do sumário, sequência e conteúdo proposto</p>
          <p>- Apresentação do projeto empreendedor - conceito de negócio</p>`,
          peso: 0.1,
        },
        {
          titulo: "Modelo de negócio",
          criterios: `<p>- Canvas do Produto ou Serviço - revisado</p>
          <p>- Plano de marketing</p>
          <p>- Plano financeiro</p>`,
          peso: 0.1,
        },
        {
          titulo: "Diagnóstico",
          criterios: `<p>- Ambiente de negócio (macro e microambiente)</p>
          <p>- Viabilidade mercadológica do produto ou serviço (revisado)</p>`,
          peso: 0.3,
        },
        {
          titulo: "Desenvolvimento",
          criterios: `<p>- Descrição de Requisitos (a partir das pesquisas com usuários - User Cases)</p>
          <p>- Definição do modelo conceitual (Diagramas UML)</p>
          <p>- Projeto Arquitetônico (High and low-level Design)</p>
          <p>- Simulação, protótipo ou MVP - Versão final</p>`,
          peso: 0.3,
        },
        {
          titulo: "Elementos textuais",
          criterios: `<p>- Organização e apresentação de acordo com a ABNT</p>
          <p>- Clareza, formatação e correção da redação</p>`,
          peso: 0.1,
        },
        {
          titulo: "Apresentação",
          criterios: `<p>- Organização da apresentação</p>
          <p>- Oratória</p>`,
          peso: 0.1,
        },
      ],
    },
  },
};

export = Perguntas;
