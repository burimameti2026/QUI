import { AdminLanguage } from './admin-i18n.service';
const T: Record<string, Record<AdminLanguage,string>> = {
  'Leads':{en:'Leads',mk:'Лидови',sq:'Leads',de:'Leads'},
  'Automatically qualified demand ranked by intent, fit and buying readiness.':{en:'Automatically qualified demand ranked by intent, fit and buying readiness.',mk:'Автоматски квалификувана побарувачка рангирана според намера, усогласеност и подготвеност за купување.',sq:'Kërkesë e kualifikuar automatikisht sipas qëllimit, përputhjes dhe gatishmërisë për blerje.',de:'Automatisch qualifizierte Nachfrage, nach Absicht, Passung und Kaufbereitschaft bewertet.'},
  'Run sales automation':{en:'Run sales automation',mk:'Изврши продажна автоматизација',sq:'Ekzekuto automatizimin e shitjeve',de:'Verkaufsautomatisierung ausführen'},
  'Create lead':{en:'Create lead',mk:'Креирај лид',sq:'Krijo lead',de:'Lead erstellen'},
  'Leads could not be loaded':{en:'Leads could not be loaded',mk:'Лидовите не можеа да се вчитаат',sq:'Leads nuk mund të ngarkoheshin',de:'Leads konnten nicht geladen werden'},
  'SALES DIRECTORY':{en:'SALES DIRECTORY',mk:'ПРОДАЖЕН ДИРЕКТОРИУМ',sq:'DIREKTORIA E SHITJEVE',de:'VERTRIEBSVERZEICHNIS'},
  'Qualified lead workspace':{en:'Qualified lead workspace',mk:'Работен простор за квалификувани лидови',sq:'Workspace për lead-e të kualifikuara',de:'Arbeitsbereich für qualifizierte Leads'},
  'Review intent, value and qualification state from one structured list.':{en:'Review intent, value and qualification state from one structured list.',mk:'Прегледај ги намерата, вредноста и состојбата на квалификација од една структурирана листа.',sq:'Rishiko qëllimin, vlerën dhe statusin e kualifikimit nga një listë e strukturuar.',de:'Absicht, Wert und Qualifizierungsstatus in einer strukturierten Liste prüfen.'},
  'Total':{en:'Total',mk:'Вкупно',sq:'Gjithsej',de:'Gesamt'},'Hot':{en:'Hot',mk:'Жешко',sq:'I nxehtë',de:'Heiß'},'Value':{en:'Value',mk:'Вредност',sq:'Vlera',de:'Wert'},
  'Search intent or source':{en:'Search intent or source',mk:'Пребарај намера или извор',sq:'Kërko qëllimin ose burimin',de:'Absicht oder Quelle suchen'},
  'All temperatures':{en:'All temperatures',mk:'Сите температури',sq:'Të gjitha temperaturat',de:'Alle Temperaturen'},'shown':{en:'shown',mk:'прикажани',sq:'të shfaqura',de:'angezeigt'},
  'Loading leads…':{en:'Loading leads…',mk:'Се вчитуваат лидовите…',sq:'Lidët po ngarkohen…',de:'Leads werden geladen…'},
  'No matching leads':{en:'No matching leads',mk:'Нема соодветни лидови',sq:'Nuk ka lidë që përputhen',de:'Keine passenden Leads'},
  'No leads yet':{en:'No leads yet',mk:'Сè уште нема лидови',sq:'Ende nuk ka leads',de:'Noch keine Leads'},
  'Create a lead from an existing contact or run the acquisition workflow.':{en:'Create a lead from an existing contact or run the acquisition workflow.',mk:'Креирај лид од постоечки контакт или изврши го аквизициониот тек.',sq:'Krijo një lead nga një kontakt ekzistues ose ekzekuto rrjedhën e akvizimit.',de:'Erstellen Sie einen Lead aus einem bestehenden Kontakt oder starten Sie den Akquisitionsprozess.'},
  'Lead':{en:'Lead',mk:'Лид',sq:'Lead',de:'Lead'},'Score':{en:'Score',mk:'Резултат',sq:'Rezultat',de:'Score'},'Temperature':{en:'Temperature',mk:'Температура',sq:'Temperatura',de:'Temperatur'},'Status':{en:'Status',mk:'Статус',sq:'Statusi',de:'Status'},'Est. value':{en:'Est. value',mk:'Проценета вредност',sq:'Vlera e përafërt',de:'Geschätzter Wert'},'Actions':{en:'Actions',mk:'Акции',sq:'Veprime',de:'Aktionen'},
  'New enquiry':{en:'New enquiry',mk:'Ново барање',sq:'Kërkesë e re',de:'Neue Anfrage'},'Qualified demand':{en:'Qualified demand',mk:'Квалификувана побарувачка',sq:'Kërkesë e kualifikuar',de:'Qualifizierte Nachfrage'},
  'Qualify':{en:'Qualify',mk:'Квалификувај',sq:'Kualifiko',de:'Qualifizieren'},'Create opportunity':{en:'Create opportunity',mk:'Креирај можност',sq:'Krijo mundësi',de:'Chance erstellen'},
  'Contact':{en:'Contact',mk:'Контакт',sq:'Kontakt',de:'Kontakt'},'Select contact':{en:'Select contact',mk:'Избери контакт',sq:'Zgjidh kontaktin',de:'Kontakt auswählen'},'Intent summary':{en:'Intent summary',mk:'Преглед на намера',sq:'Përmbledhje e qëllimit',de:'Zusammenfassung der Absicht'},'Source':{en:'Source',mk:'Извор',sq:'Burimi',de:'Quelle'},'Estimated value':{en:'Estimated value',mk:'Проценета вредност',sq:'Vlera e përafërt',de:'Geschätzter Wert'},'Cancel':{en:'Cancel',mk:'Откажи',sq:'Anulo',de:'Abbrechen'}
};
export function adminLeadsText(value:string,language:AdminLanguage):string{return T[value]?.[language]??value;}
