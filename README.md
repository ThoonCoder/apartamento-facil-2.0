# Novo Mundo Carrão II — Landing Page 2.0

Reformulação completa da landing page do empreendimento **Novo Mundo Carrão II**
(Vila Carrão, São Paulo), originalmente em `apartamentofacil.com.br`.

Site estático, sem dependências, sem build. Abra o `index.html` e funciona.

---

## O que mudou em relação à versão 1.0

| | Versão 1.0 | Versão 2.0 |
|---|---|---|
| **Base** | WordPress + Elementor Pro + Hello Theme | HTML/CSS/JS puro, zero dependências |
| **Peso das imagens** | ~24 MB (PNG/JPEG originais) | **2,5 MB** em WebP — 90% menor |
| **Título da página** | `Thaeme Gerente de vendas` | Título com o produto, bairro e proposta |
| **Campo WhatsApp** | `type="email"` — **rejeitava telefones** | `type="tel"` com máscara e validação |
| **Conversão** | 2 formulários idênticos | Simulador MCMV interativo + 1 formulário validado |
| **Dados estruturados** | nenhum | JSON-LD `Residence` para o Google |
| **Acessibilidade** | padrão do Elementor | skip-link, foco visível, ARIA, `prefers-reduced-motion` |
| **Rastreamento** | 2 contas Google Ads + AdSense carregando junto | limpo — você pluga o que precisar |

### O bug que estava custando leads

No formulário inferior do site atual, o campo de WhatsApp está declarado assim:

```html
<input type="email" name="form_fields[email]" placeholder="WhatsApp:" required>
```

Como `type="email"`, o navegador **exige um `@`**. Quem digitava o telefone
corretamente era bloqueado pela validação e não conseguia enviar o formulário.
Vale corrigir isso no site em produção mesmo que esta versão 2.0 não entre no ar.

---

## Estrutura

```
apartamento-facil-2.0/
├── index.html              # página única, semântica
├── assets/
│   ├── css/style.css       # design system + todos os componentes
│   ├── js/main.js          # interações, simulador, validação
│   └── img/*.webp          # renders e áreas de lazer otimizados
└── README.md
```

---

## Seções

1. **Hero cinematográfico** — parallax, grão de filme, gradiente animado, título com reveal linha a linha e contadores.
2. **Marquee** de itens de lazer em rolagem infinita.
3. **Projeto** — 4 cards de destaque + showcase da fachada.
4. **Condições** — coluna sticky em desktop, lista com barra dourada no hover.
5. **Lazer** — galeria em mosaico com lightbox (setas do teclado e `Esc` funcionam).
6. **Simulador MCMV** — o diferencial: renda, valor do imóvel, FGTS e prazo em sliders; calcula faixa, subsídio, juros, valor financiado e a 1ª parcela (SAC) em tempo real, com anel de comprometimento de renda e alerta acima de 30%.
7. **Ficha técnica + mapa**.
8. **Formulário** com máscara de telefone, validação campo a campo e consentimento LGPD.

---

## Como configurar

Abra [`assets/js/main.js`](assets/js/main.js) e edite o bloco `CONFIG` no topo:

```js
const CONFIG = {
  whatsapp: '',   // ex.: '5511987654321' — abre a conversa já preenchida
  endpoint: ''    // ex.: URL do seu CRM, Formspree, n8n, Zapier…
};
```

- **`whatsapp` vazio** → o formulário mostra apenas a confirmação na tela.
- **`whatsapp` preenchido** → após enviar, abre o WhatsApp com a mensagem pronta.
- **`endpoint` preenchido** → envia um `POST` em JSON com `nome`, `whatsapp`, `email`, `renda` e `origem`.

### Rastreamento

O `<head>` está limpo de propósito. Para reativar Google Ads / GA4, cole a tag
antes do `</head>` e dispare o evento de conversão dentro do `submit`, em
`assets/js/main.js`.

---

## Rodar localmente

```bash
# qualquer servidor estático resolve
npx serve .
# ou
python -m http.server 8080
```

O mapa incorporado do Google exige `http://` ou `https://` — abrindo o arquivo
direto por `file://` ele não carrega, o resto da página funciona normalmente.

---

## Simulador — como o cálculo é feito

Aproximação **educativa** das regras do Minha Casa Minha Vida, no sistema SAC:

| Faixa | Renda familiar | Juros usados | Subsídio estimado |
|---|---|---|---|
| 1 | até R$ 2.640 | 4,25% a.a. | até R$ 55.000 |
| 2 | R$ 2.640 – R$ 4.400 | 6,25% a.a. | até R$ 20.000 |
| 3 | R$ 4.400 – R$ 8.000 | 8,25% a.a. | — |
| 4 | acima de R$ 8.000 | 10,50% a.a. | — |

O subsídio decai conforme a renda avança dentro da faixa. O financiamento é
limitado a 80% do valor do imóvel e a primeira parcela é `amortização + juros`.
**Os números são ilustrativos** — a proposta oficial depende da análise de
crédito da Caixa e das regras vigentes do programa. O aviso legal está na página.

---

## Compatibilidade

Chrome, Edge, Firefox e Safari atuais. `@property`, `backdrop-filter` e
`clip-path` degradam com elegância em navegadores antigos — o conteúdo e os
formulários continuam funcionando.

---

## Créditos e uso

Imagens e informações do empreendimento pertencem à incorporadora responsável.
Este repositório é uma **proposta de redesign** — perspectivas são ilustrativas
e as condições comerciais estão sujeitas às regras vigentes do programa.
