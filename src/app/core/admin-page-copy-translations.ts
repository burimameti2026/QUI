import { AdminLanguage } from './admin-i18n.service';

/** Longer page copy and common labels shared across admin modules. */
export const ADMIN_PAGE_COPY_TRANSLATIONS: Record<string, Record<AdminLanguage, string>> = {
  'Ground automated answers in company documents, websites, FAQs and operational data.': { en: 'Ground automated answers in company documents, websites, FAQs and operational data.', mk: 'Засновајте ги автоматизираните одговори на документи, веб-страници, ЧПП и оперативни податоци на компанијата.', sq: 'Bazoni përgjigjet e automatizuara në dokumentet, faqet e internetit, FAQ-të dhe të dhënat operative të kompanisë.', de: 'Automatisierte Antworten auf Unternehmensdokumente, Websites, FAQs und operative Daten stützen.' },
  'Manage product information, markets, languages and publication from one workspace.': { en: 'Manage product information, markets, languages and publication from one workspace.', mk: 'Управувајте со информации за производи, пазари, јазици и објавување од еден workspace.', sq: 'Menaxhoni informacionin e produkteve, tregjet, gjuhët dhe publikimin nga një workspace.', de: 'Produktinformationen, Märkte, Sprachen und Veröffentlichungen in einem Workspace verwalten.' },
  'No customer profile yet': { en: 'No customer profile yet', mk: 'Сè уште нема профил на клиент', sq: 'Ende nuk ka profil klienti', de: 'Noch kein Kundenprofil' },
  'Create an ICP before importing company data.': { en: 'Create an ICP before importing company data.', mk: 'Креирајте ICP пред увоз на податоци за компании.', sq: 'Krijoni një ICP para importimit të të dhënave të kompanive.', de: 'Erstellen Sie ein ICP vor dem Import von Unternehmensdaten.' },
  'Choose the rules used to qualify your audience.': { en: 'Choose the rules used to qualify your audience.', mk: 'Изберете ги правилата за квалификација на вашата публика.', sq: 'Zgjidhni rregullat për kualifikimin e audiencës suaj.', de: 'Wählen Sie die Regeln zur Qualifizierung Ihrer Zielgruppe.' },
  'Define fit, import verified accounts and move only qualified prospects into controlled outreach.': { en: 'Define fit, import verified accounts and move only qualified prospects into controlled outreach.', mk: 'Дефинирајте усогласеност, увезете проверени сметки и префрлете ги само квалификуваните потенцијални клиенти во контролирано контактирање.', sq: 'Përcaktoni përshtatjen, importoni llogari të verifikuara dhe kaloni vetëm prospektet e kualifikuara në kontaktim të kontrolluar.', de: 'Passung definieren, verifizierte Konten importieren und nur qualifizierte Interessenten in kontrollierte Ansprache überführen.' },
  'Turn selected companies into a reusable campaign audience.': { en: 'Turn selected companies into a reusable campaign audience.', mk: 'Претворете ги избраните компании во повторно употреблива публика за кампањи.', sq: 'Kthejini kompanitë e zgjedhura në audiencë të ripërdorshme për fushata.', de: 'Ausgewählte Unternehmen in eine wiederverwendbare Kampagnenzielgruppe umwandeln.' },
  'Select accounts from the grid below': { en: 'Select accounts from the grid below', mk: 'Изберете сметки од табелата подолу', sq: 'Zgjidhni llogari nga tabela më poshtë', de: 'Konten aus der Tabelle unten auswählen' },
  'Creating a list does not send outreach.': { en: 'Creating a list does not send outreach.', mk: 'Креирањето листа не испраќа пораки.', sq: 'Krijimi i listës nuk dërgon kontakte.', de: 'Das Erstellen einer Liste sendet keine Ansprache.' },
  'Fit and intent remain separate so account size is never mistaken for buying readiness.': { en: 'Fit and intent remain separate so account size is never mistaken for buying readiness.', mk: 'Усогласеноста и намерата остануваат одделни за големината на сметката никогаш да не се меша со подготвеноста за купување.', sq: 'Përshtatja dhe synimi mbeten të ndara që madhësia e llogarisë të mos ngatërrohet me gatishmërinë për blerje.', de: 'Passung und Absicht bleiben getrennt, damit die Kontogröße nicht mit Kaufbereitschaft verwechselt wird.' },
  'Add the first Renova product to start the promotion workflow.': { en: 'Add the first Renova product to start the promotion workflow.', mk: 'Додајте го првиот Renova производ за да го започнете промотивниот тек.', sq: 'Shtoni produktin e parë Renova për të nisur rrjedhën e promovimit.', de: 'Fügen Sie das erste Renova-Produkt hinzu, um den Promotions-Workflow zu starten.' },
  'Search products': { en: 'Search products', mk: 'Пребарај производи', sq: 'Kërko produkte', de: 'Produkte suchen' },
  'Search knowledge': { en: 'Search knowledge', mk: 'Пребарај знаење', sq: 'Kërko në njohuri', de: 'Wissen durchsuchen' },
  'Loading…': { en: 'Loading…', mk: 'Се вчитува…', sq: 'Po ngarkohet…', de: 'Wird geladen…' },
  'Save': { en: 'Save', mk: 'Зачувај', sq: 'Ruaj', de: 'Speichern' },
  'Close': { en: 'Close', mk: 'Затвори', sq: 'Mbyll', de: 'Schließen' },
  'Back': { en: 'Back', mk: 'Назад', sq: 'Prapa', de: 'Zurück' },
  'Next': { en: 'Next', mk: 'Следно', sq: 'Tjetër', de: 'Weiter' },
  'Create': { en: 'Create', mk: 'Креирај', sq: 'Krijo', de: 'Erstellen' },
  'Search': { en: 'Search', mk: 'Пребарај', sq: 'Kërko', de: 'Suchen' },
  'Filter': { en: 'Filter', mk: 'Филтер', sq: 'Filtro', de: 'Filter' }
};

export function adminPageCopyText(value: string, language: AdminLanguage): string {
  return ADMIN_PAGE_COPY_TRANSLATIONS[value]?.[language] ?? value;
}
