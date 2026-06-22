import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "ads", "google_ads_editor");

const BASE_URL = process.env.ADS_BASE_URL || "https://leadbellus.com.br";

const campaign = {
  name: "BR | Search | LeadBellus | WhatsApp Estetica",
  slug: "br_search_whatsapp_estetica",
  landingPath: "/campanha/whatsapp-estetica",
  status: "Paused",
  type: "Search",
  budget: "50",
  budgetType: "Daily",
  bidStrategy: "Maximize conversions",
  networks: "Google Search",
  languages: "Portuguese",
  locations: "Brazil",
  maxCpc: "2.50",
  groups: [
    {
      name: "Respostas WhatsApp",
      content: "respostas",
      path: ["whatsapp", "estetica"],
      keywords: {
        phrase: [
          "respostas whatsapp estetica",
          "resposta para cliente estetica",
          "mensagem para cliente estetica",
          "script whatsapp estetica",
          "como responder cliente no whatsapp",
        ],
        exact: ["respostas whatsapp estetica", "script whatsapp estetica"],
      },
      ads: [
        {
          content: "rsa_respostas_a",
          headlines: [
            "LeadBellus Para Estetica",
            "Responda Melhor No Whats",
            "5 Respostas Gratis",
            "Sem Cartao Para Testar",
            "Copie E Mande No Whats",
            "Cliente Achou Caro?",
            "Cliente Sumiu?",
            "Respostas No Seu Tom",
            "WhatsApp Da Clinica",
            "Pare De Improvisar",
            "Roteiros Para Estetica",
            "IA Para Atendimento",
          ],
          descriptions: [
            "Gere respostas para WhatsApp no tom da sua clinica. 5 gratis, sem cartao.",
            "Cliente perguntou preco e sumiu? Receba opcoes curtas para revisar e enviar.",
            "Respostas para objecoes, preco e follow-up. Copie, ajuste e mande no WhatsApp.",
            "Feito para estetica: mais clareza no atendimento, sem promessa de resultado.",
          ],
        },
        {
          content: "rsa_respostas_b",
          headlines: [
            "Resposta Pronta Rapida",
            "WhatsApp Sem Improviso",
            "Teste Antes De Assinar",
            "No Tom Da Sua Clinica",
            "Preco Sem Sustos",
            "Follow Up Sem Pressao",
            "IA Para Clinicas",
            "Copie Ajuste Envie",
            "Start R$97 Por Mes",
            "LeadBellus",
          ],
          descriptions: [
            "A demo mostra como responder preco, medo e cliente que sumiu. Teste 5 vezes.",
            "Use sugestoes prontas para revisar, ajustar e mandar no WhatsApp da clinica.",
            "Criado para atendimento de estetica, sem promessa de agenda ou resultado.",
            "Depois da demo, o Start libera uso continuo por R$97/mes. Cancele quando quiser.",
          ],
        },
      ],
    },
    {
      name: "Objecoes E Preco",
      content: "objecoes",
      path: ["objecoes", "whatsapp"],
      keywords: {
        phrase: [
          "cliente achou caro estetica",
          "como responder cliente achou caro",
          "responder preco estetica",
          "cliente pediu desconto estetica",
          "objecoes estetica whatsapp",
        ],
        exact: ["cliente achou caro estetica"],
      },
      ads: [
        {
          content: "rsa_objecoes_a",
          headlines: [
            "Cliente Achou Caro?",
            "Responda Sem Textao",
            "Quebre Objecoes No Whats",
            "Mensagens Para Preco",
            "LeadBellus Para Clinicas",
            "5 Respostas Gratis",
            "Sem Cartao",
            "Atendimento Mais Claro",
            "Respostas Para Estetica",
            "Copiar E Enviar",
          ],
          descriptions: [
            "Transforme a mensagem da cliente em respostas mais claras para preco e objecoes.",
            "Sem textao. O LeadBellus sugere opcoes curtas para voce revisar e mandar.",
            "Use IA para responder melhor no WhatsApp da sua clinica. Teste com 5 respostas.",
            "Ajuda para conduzir conversas de estetica sem prometer venda ou resultado.",
          ],
        },
        {
          content: "rsa_objecoes_b",
          headlines: [
            "Preco Virou Objecao?",
            "Nao De Desconto No Susto",
            "Mostre Valor Primeiro",
            "WhatsApp Mais Claro",
            "Respostas Para Preco",
            "Cliente Pediu Desconto?",
            "Teste 5 Respostas",
            "Sem Cartao",
            "Para Clinicas Estetica",
          ],
          descriptions: [
            "Tenha opcoes de resposta para explicar valor antes de cortar preco no impulso.",
            "Cole a mensagem da cliente e receba sugestoes curtas para revisar e enviar.",
            "Ideal para conversas de preco, desconto e inseguranca no WhatsApp da clinica.",
            "Apoio de escrita para atendimento. Nao promete vendas, agenda ou resultados.",
          ],
        },
      ],
    },
    {
      name: "Automacao E IA",
      content: "ia",
      path: ["ia", "atendimento"],
      keywords: {
        phrase: [
          "ia para clinica de estetica",
          "automacao whatsapp estetica",
          "ferramenta whatsapp estetica",
          "bot whatsapp clinica estetica",
          "software atendimento clinica estetica",
        ],
        exact: ["ia para clinica de estetica"],
      },
      ads: [
        {
          content: "rsa_ia_a",
          headlines: [
            "IA Para Clinica Estetica",
            "Atendimento No WhatsApp",
            "LeadBellus",
            "Respostas No Tom Da Clinica",
            "5 Respostas Gratis",
            "Sem Cartao",
            "Roteiros De Atendimento",
            "Objecoes E Follow-up",
            "Copie Ajuste E Envie",
            "Para Clinicas De Estetica",
          ],
          descriptions: [
            "Ferramenta para gerar respostas de WhatsApp no tom da sua clinica de estetica.",
            "Configure o jeito da clinica e use respostas como base para o atendimento.",
            "Comece com 5 respostas gratis. Sem cartao, sem fidelidade e sem multa.",
            "Apoio para responder com clareza, sem prometer venda ou resultado.",
          ],
        },
        {
          content: "rsa_ia_b",
          headlines: [
            "Automacao Com Revisao",
            "IA Que Escreve Respostas",
            "Nao E Bot De Agenda",
            "Seu Tom No WhatsApp",
            "Teste Gratis Agora",
            "Respostas Para Clinicas",
            "Ajuste E Envie",
            "Start R$97",
            "LeadBellus Estetica",
          ],
          descriptions: [
            "O LeadBellus gera sugestoes para voce revisar antes de mandar no WhatsApp.",
            "Nao substitui sua equipe: acelera respostas de preco, medo e follow-up.",
            "Teste a demo com 5 respostas e veja se encaixa na rotina da clinica.",
            "Plano Start para uso continuo no atendimento real. Cancele quando quiser.",
          ],
        },
      ],
    },
    {
      name: "Roteiros E Conversao",
      content: "roteiros",
      path: ["roteiros", "whatsapp"],
      keywords: {
        phrase: [
          "roteiro de vendas estetica",
          "script de vendas estetica whatsapp",
          "como agendar cliente estetica",
          "mensagens prontas clinica estetica",
          "atendimento whatsapp clinica estetica",
          "converter clientes estetica whatsapp",
          "script contorno de objecoes estetica",
          "como responder cliente estetica",
          "modelo de mensagem para clinica de estetica",
          "mensagens para fidelizar clientes estetica",
          "melhorar conversao whatsapp estetica",
          "script de atendimento estetica",
        ],
        exact: [
          "roteiro de vendas estetica",
          "script de vendas estetica whatsapp",
          "mensagens prontas clinica estetica",
          "atendimento whatsapp clinica estetica",
          "converter clientes estetica whatsapp",
          "script de atendimento estetica",
          "como responder cliente estetica",
          "copy de vendas para estetica",
        ],
      },
      ads: [
        {
          content: "rsa_roteiros_a",
          headlines: [
            "Respostas para WhatsApp",
            "Para Clinicas Estetica",
            "5 Respostas Gratis",
            "Teste Sem Cartao",
            "Copiar E Mandar",
            "Atendimento Mais Claro",
            "Mensagens Prontas",
            "Gere Respostas No Whats",
            "Roteiros Para Whatsapp",
            "IA Para Clinica Estetica",
            "Script De Atendimento",
            "Objecoes No WhatsApp",
          ],
          descriptions: [
            "Gere respostas curtas para o WhatsApp da sua clinica de estetica. Teste 5 gratis.",
            "Atendimento no WhatsApp mais claro e profissional. Copie, ajuste e envie.",
            "Gere mensagens para responder objecoes de preco. Teste gratis e sem cartao.",
            "Respostas prontas para WhatsApp da clinica de estetica, no tom certo.",
          ],
        },
        {
          content: "rsa_roteiros_b",
          headlines: [
            "Roteiro Sem Engessar",
            "Mensagem Pronta No Tom",
            "Atenda Melhor No Whats",
            "Follow Up Educado",
            "Cliente Sumiu?",
            "Resposta Mais Humana",
            "LeadBellus Start",
            "5 Testes Gratis",
            "Sem Cartao",
          ],
          descriptions: [
            "Transforme roteiros soltos em sugestoes de resposta prontas para revisar.",
            "Use para preco, objecao, medo do procedimento e cliente que sumiu.",
            "O LeadBellus ajuda a escrever. Sua equipe decide, ajusta e envia.",
            "Teste 5 respostas gratis antes de assinar o Start mensal.",
          ],
        },
      ],
    },
  ],
};

const negativeKeywords = [
  ["curso", "Broad"],
  ["emprego", "Broad"],
  ["vaga", "Broad"],
  ["salario", "Broad"],
  ["gratis download", "Phrase"],
  ["pdf", "Broad"],
  ["modelo pronto gratis", "Phrase"],
  ["concurso", "Broad"],
  ["botox antes e depois", "Phrase"],
  ["preenchimento antes e depois", "Phrase"],
  ["harmonizacao resultado", "Phrase"],
  ["emagrecimento", "Broad"],
  ["remedio", "Broad"],
  ["medicamento", "Broad"],
  ["cirurgia", "Broad"],
  ["sus", "Broad"],
  ["anvisa", "Broad"],
  ["reclame aqui", "Phrase"],
  ["whatsapp gb", "Phrase"],
  ["hack", "Broad"],
  ["pirata", "Broad"],
  ["cupom", "Broad"],
  ["gratuito", "Broad"],
  ["trabalhe conosco", "Phrase"],
  ["vagas de emprego", "Phrase"],
  ["enviar curriculo", "Phrase"],
  ["apostila", "Broad"],
  ["e-book gratis", "Phrase"],
  ["treinamento", "Broad"],
  ["especializacao", "Broad"],
  ["quanto custa preenchimento", "Phrase"],
  ["preco de botox", "Phrase"],
  ["clinica barata", "Phrase"],
  ["comprar toxina", "Phrase"],
  ["valor de carboxiterapia", "Phrase"],
  ["preco de harmonizacao", "Phrase"],
  ["comprar acido hialuronico", "Phrase"],
  ["fornecedor de botox", "Phrase"],
  ["tratamento melasma", "Phrase"],
  ["remedio espinha", "Phrase"],
  ["dermatologista consulta", "Phrase"],
  ["como tratar acne", "Phrase"],
  ["consulta medica dermatologia", "Phrase"],
];

const manualAssets = [
  ["Sitelink", "Simulador", "/#simulador", "Veja uma resposta gerada", "Sem login e sem cartao", "", ""],
  ["Sitelink", "Planos", "/#precos", "Start por R$97/mes", "Cancele quando quiser", "", ""],
  ["Sitelink", "Como Funciona", "/#sinais", "Preco, medo e follow-up", "Respostas no WhatsApp", "", ""],
  ["Sitelink", "Reembolso", "/reembolso", "Politica de reembolso", "Cancelamento claro", "", ""],
  ["Callout", "5 respostas gratis", "", "", "", "", ""],
  ["Callout", "Sem cartao", "", "", "", "", ""],
  ["Callout", "Cancele quando quiser", "", "", "", "", ""],
  ["Callout", "Feito para estetica", "", "", "", "", ""],
  ["Callout", "Respostas no seu tom", "", "", "", "", ""],
  ["Callout", "Copiar e mandar", "", "", "", "", ""],
  ["Structured snippet", "", "", "", "", "Recursos", "Respostas; Objecoes; Retomadas; Roteiros; Tom da clinica"],
];

function finalUrl(content) {
  const params = new URLSearchParams({
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: campaign.slug,
    utm_content: content,
    utm_term: "{keyword}",
  });

  return `${BASE_URL}${campaign.landingPath}?${params.toString().replace("%7Bkeyword%7D", "{keyword}")}`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : `"${text}"`;
}

function toCsv(headers, rows) {
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n") + "\n";
}

function adRows() {
  const headers = [
    "Campaign",
    "Ad group",
    "Ad type",
    "Status",
    "Final URL",
    "Path 1",
    "Path 2",
    ...Array.from({ length: 15 }, (_, index) => `Headline ${index + 1}`),
    ...Array.from({ length: 4 }, (_, index) => `Description ${index + 1}`),
  ];

  const rows = campaign.groups.flatMap((group) =>
    group.ads.map((ad) => {
      const row = {
        Campaign: campaign.name,
        "Ad group": group.name,
        "Ad type": "Responsive search ad",
        Status: "Paused",
        "Final URL": finalUrl(ad.content),
        "Path 1": group.path[0],
        "Path 2": group.path[1],
      };

      for (let index = 0; index < 15; index += 1) {
        row[`Headline ${index + 1}`] = ad.headlines[index] || "";
      }
      for (let index = 0; index < 4; index += 1) {
        row[`Description ${index + 1}`] = ad.descriptions[index] || "";
      }
      return row;
    })
  );

  return [headers, rows];
}

function keywordRows() {
  const headers = [
    "Campaign",
    "Campaign status",
    "Campaign type",
    "Budget",
    "Budget type",
    "Bid strategy type",
    "Networks",
    "Languages",
    "Locations",
    "Ad group",
    "Ad group status",
    "Max CPC",
    "Keyword",
    "Match type",
    "Status",
    "Final URL",
  ];

  const rows = campaign.groups.flatMap((group) =>
    Object.entries(group.keywords).flatMap(([matchType, keywords]) =>
      keywords.map((keyword) => ({
        Campaign: campaign.name,
        "Campaign status": campaign.status,
        "Campaign type": campaign.type,
        Budget: campaign.budget,
        "Budget type": campaign.budgetType,
        "Bid strategy type": campaign.bidStrategy,
        Networks: campaign.networks,
        Languages: campaign.languages,
        Locations: campaign.locations,
        "Ad group": group.name,
        "Ad group status": campaign.status,
        "Max CPC": campaign.maxCpc,
        Keyword: keyword,
        "Match type": matchType === "exact" ? "Exact" : "Phrase",
        Status: "Enabled",
        "Final URL": finalUrl(`kw_${group.content}`),
      }))
    )
  );

  return [headers, rows];
}

function negativeRows() {
  const headers = ["Campaign", "Keyword", "Match type", "Status"];
  const rows = negativeKeywords.map(([keyword, matchType]) => ({
    Campaign: campaign.name,
    Keyword: keyword,
    "Match type": matchType,
    Status: "Enabled",
  }));
  return [headers, rows];
}

function assetRows() {
  const headers = [
    "Asset type",
    "Campaign",
    "Text",
    "Final URL",
    "Description line 1",
    "Description line 2",
    "Header",
    "Values",
  ];
  const rows = manualAssets.map(([type, text, assetPath, line1, line2, header, values]) => ({
    "Asset type": type,
    Campaign: campaign.name,
    Text: text,
    "Final URL": assetPath ? `${BASE_URL}${assetPath}` : "",
    "Description line 1": line1,
    "Description line 2": line2,
    Header: header,
    Values: values,
  }));
  return [headers, rows];
}

function checklistMarkdown() {
  return `# Google Ads Launch Checklist

Generated by \`npm run ads:generate\`.

## Before Import

- Get recent changes in Google Ads Editor.
- Confirm conversion tracking exists for signup and checkout start.
- Keep imported campaign paused.
- Confirm account billing and advertiser verification status.
- Confirm the landing page opens: ${BASE_URL}${campaign.landingPath}

## After Import

- Confirm campaign type is Search.
- Confirm Display Network is off.
- Confirm location is Brazil or the chosen initial states.
- Confirm language is Portuguese.
- Confirm campaign budget is R$30-R$50/day before enabling.
- Confirm every ad group has keywords and 2 responsive search ads.
- Confirm negatives are campaign-level.
- Confirm final URLs load with UTM parameters.
- Confirm no policy warning is ignored without reading it.

## Policy Review

- No fake testimonials.
- No before/after procedural claims.
- No guaranteed revenue, scheduling, or medical/aesthetic outcome.
- No "7 dias gratis".
- No remarketing or custom audience launch until policy risk is reviewed.

## First 48 Hours

Check every 12 hours:

- search terms
- disapproved ads/assets
- CTR by ad group
- CPC average
- signup starts
- checkout starts
- simulator use

Pause or negate terms that indicate:

- procedure shopping instead of software
- jobs, salary, courses
- medical treatment or medication
- before/after result hunting
- generic free PDF/template downloads with no software intent
- generic automatic scheduling intent that does not match response/copy assistance
`;
}

function automationMarkdown() {
  return `# Campaign Automation Rules

Generated by \`npm run ads:generate\`.

These rules are meant for Google Ads automated rules after CSV import. Keep the campaign paused until conversion tracking is confirmed.

## Rule 1 - Spend Guardrail

- Scope: Campaign \`${campaign.name}\`
- Frequency: daily, 08:00
- Lookback: last 7 days
- Condition: Cost > R$120 AND Conversions < 1
- Action: send email notification
- Optional after first manual review: pause campaign

## Rule 2 - Pause Wasteful Keywords

- Scope: enabled keywords in this campaign
- Frequency: daily, 08:30
- Lookback: last 7 days
- Condition: Cost > R$45 AND Clicks >= 20 AND Conversions = 0
- Action: pause keyword and send email

## Rule 3 - Protect Ad Quality

- Scope: enabled responsive search ads
- Frequency: daily, 09:00
- Lookback: yesterday
- Condition: Approval status is disapproved OR policy limited
- Action: send email notification

## Rule 4 - Scale Carefully

- Scope: Campaign \`${campaign.name}\`
- Frequency: Monday and Thursday, 09:30
- Lookback: last 14 days
- Condition: Conversions >= 3 AND Cost / conv. <= R$35
- Action: increase daily budget by 15%
- Hard cap: R$80/day until the first paid customer is attributed

## Rule 5 - Search Term Hygiene

Automated rules cannot reliably understand search-term intent. Export search terms every 48h and add negatives for procedure shoppers, jobs/courses, medication/treatment searches, free PDF/template intent, and WhatsApp mod/hack terms.
`;
}

function validate() {
  const errors = [];

  for (const group of campaign.groups) {
    if (group.path.some((part) => part.length > 15)) {
      errors.push(`${group.name}: display path exceeds 15 chars`);
    }

    for (const ad of group.ads) {
      if (ad.headlines.length < 3 || ad.headlines.length > 15) {
        errors.push(`${group.name}/${ad.content}: needs 3-15 headlines`);
      }
      if (ad.descriptions.length < 2 || ad.descriptions.length > 4) {
        errors.push(`${group.name}/${ad.content}: needs 2-4 descriptions`);
      }

      for (const headline of ad.headlines) {
        if (headline.length > 30) {
          errors.push(`${group.name}/${ad.content}: headline too long (${headline.length}) "${headline}"`);
        }
      }
      for (const description of ad.descriptions) {
        if (description.length > 90) {
          errors.push(`${group.name}/${ad.content}: description too long (${description.length}) "${description}"`);
        }
      }
    }
  }

  if (errors.length) {
    throw new Error(`Google Ads pack validation failed:\n- ${errors.join("\n- ")}`);
  }
}

async function writeCsv(filename, buildRows) {
  const [headers, rows] = buildRows();
  await writeFile(path.join(outDir, filename), toCsv(headers, rows), "utf8");
}

async function main() {
  validate();
  await mkdir(outDir, { recursive: true });

  await writeCsv("01_search_keywords.csv", keywordRows);
  await writeCsv("02_responsive_search_ads.csv", adRows);
  await writeCsv("03_negative_keywords.csv", negativeRows);
  await writeCsv("04_assets_manual.csv", assetRows);
  await writeFile(path.join(outDir, "05_launch_checklist.md"), checklistMarkdown(), "utf8");
  await writeFile(path.join(outDir, "06_automation_rules.md"), automationMarkdown(), "utf8");

  console.log(`Generated Google Ads Editor pack in ${path.relative(root, outDir)}`);
  console.log(`Campaign: ${campaign.name}`);
  console.log(`Ad groups: ${campaign.groups.length}`);
  console.log(`Responsive search ads: ${campaign.groups.reduce((sum, group) => sum + group.ads.length, 0)}`);
  console.log(`Keywords: ${campaign.groups.reduce((sum, group) => sum + group.keywords.phrase.length + group.keywords.exact.length, 0)}`);
  console.log(`Negatives: ${negativeKeywords.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
