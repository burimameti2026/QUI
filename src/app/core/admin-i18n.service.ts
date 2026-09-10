import { Injectable, signal } from '@angular/core';

export type AdminLanguage = 'en' | 'mk' | 'sq' | 'de';

const DICTIONARY: Record<AdminLanguage, Record<string, string>> = {
  en: {},
  mk: {
    'Dashboard': 'Контролна табла', 'Connections & Senders': 'Конекции и испраќачи', 'Renova Product Catalog': 'Каталог на производи на Renova',
    'Renova Promotion Automation': 'Renova автоматизација на промоции', 'Public Renova Portal': 'Јавен Renova портал', 'Prospect Discovery': 'Откривање потенцијални клиенти',
    'Autonomous Acquisition': 'Автономна аквизиција', 'Acquisition Approval Queue': 'Ред за одобрување на аквизиции', 'Campaigns': 'Кампањи', 'Replies & Inbox': 'Одговори и сандаче',
    'Qualified Leads': 'Квалификувани лидови', 'Opportunities': 'Можности', 'Sales Pipelines': 'Продажни цевководи', 'Golden Pipeline': 'Golden Pipeline', 'Demos & Meetings': 'Демо и состаноци',
    'Companies': 'Компании', 'Contacts': 'Контакти', 'Issues & Tickets': 'Прашања и тикети', 'Business Assistants': 'Бизнис асистенти', 'Knowledge': 'Знаење',
    'Workflows': 'Работни текови', 'Automations': 'Автоматизации', 'Analytics & ROI': 'Аналитика и ROI', 'Platform Overview': 'Преглед на платформата',
    'Search pages and modules': 'Пребарај страници и модули', 'Public Renova portal': 'Јавен Renova портал', 'Licensed': 'Лиценциран простор',
    'COMMAND CENTER': 'КОМАНДЕН ЦЕНТАР', '01 — PREPARE': '01 — ПОДГОТОВКА', '02 — FIND & REACH': '02 — НАЈДИ И КОНТАКТИРАЈ', '03 — CONVERT': '03 — КОНВЕРЗИЈА',
    '04 — CUSTOMER OPERATIONS': '04 — ОПЕРАЦИИ СО КЛИЕНТИ', '05 — AUTOMATE & IMPROVE': '05 — АВТОМАТИЗИРАЈ И ПОДОБРИ', 'PLATFORM MANAGEMENT': 'УПРАВУВАЊЕ СО ПЛАТФОРМАТА'
  },
  sq: {
    'Dashboard': 'Paneli kryesor', 'Connections & Senders': 'Lidhjet dhe dërguesit', 'Renova Product Catalog': 'Katalogu i produkteve Renova',
    'Renova Promotion Automation': 'Automatizimi i promovimit Renova', 'Public Renova Portal': 'Portali publik Renova', 'Prospect Discovery': 'Zbulimi i prospekteve',
    'Autonomous Acquisition': 'Akvizimi autonom', 'Acquisition Approval Queue': 'Radha e miratimit të akvizimit', 'Campaigns': 'Fushatat', 'Replies & Inbox': 'Përgjigjet dhe inbox-i',
    'Qualified Leads': 'Leads të kualifikuara', 'Opportunities': 'Mundësitë', 'Sales Pipelines': 'Pipeline-t e shitjeve', 'Golden Pipeline': 'Golden Pipeline', 'Demos & Meetings': 'Demo dhe takime',
    'Companies': 'Kompanitë', 'Contacts': 'Kontaktet', 'Issues & Tickets': 'Çështjet dhe ticket-at', 'Business Assistants': 'Asistentët e biznesit', 'Knowledge': 'Njohuritë',
    'Workflows': 'Rrjedhat e punës', 'Automations': 'Automatizimet', 'Analytics & ROI': 'Analitika dhe ROI', 'Platform Overview': 'Përmbledhja e platformës',
    'Search pages and modules': 'Kërko faqe dhe module', 'Public Renova portal': 'Portali publik Renova', 'Licensed': 'Workspace i licencuar',
    'COMMAND CENTER': 'QENDRA E KOMANDËS', '01 — PREPARE': '01 — PËRGATIT', '02 — FIND & REACH': '02 — GJEJ DHE KONTAKTO', '03 — CONVERT': '03 — KONVERTO',
    '04 — CUSTOMER OPERATIONS': '04 — OPERACIONET E KLIENTËVE', '05 — AUTOMATE & IMPROVE': '05 — AUTOMATIZO DHE PËRMIRËSO', 'PLATFORM MANAGEMENT': 'MENAXHIMI I PLATFORMËS'
  },
  de: {
    'Dashboard': 'Dashboard', 'Connections & Senders': 'Verbindungen & Absender', 'Renova Product Catalog': 'Renova Produktkatalog',
    'Renova Promotion Automation': 'Renova Promotionsautomatisierung', 'Public Renova Portal': 'Öffentliches Renova-Portal', 'Prospect Discovery': 'Interessenten finden',
    'Autonomous Acquisition': 'Autonome Akquise', 'Acquisition Approval Queue': 'Akquise-Freigabe', 'Campaigns': 'Kampagnen', 'Replies & Inbox': 'Antworten & Posteingang',
    'Qualified Leads': 'Qualifizierte Leads', 'Opportunities': 'Chancen', 'Sales Pipelines': 'Vertriebspipelines', 'Golden Pipeline': 'Golden Pipeline', 'Demos & Meetings': 'Demos & Meetings',
    'Companies': 'Unternehmen', 'Contacts': 'Kontakte', 'Issues & Tickets': 'Anfragen & Tickets', 'Business Assistants': 'Business-Assistenten', 'Knowledge': 'Wissen',
    'Workflows': 'Workflows', 'Automations': 'Automatisierungen', 'Analytics & ROI': 'Analysen & ROI', 'Platform Overview': 'Plattformübersicht',
    'Search pages and modules': 'Seiten und Module suchen', 'Public Renova portal': 'Öffentliches Renova-Portal', 'Licensed': 'Lizenzierter Workspace',
    'COMMAND CENTER': 'KOMMANDOZENTRALE', '01 — PREPARE': '01 — VORBEREITEN', '02 — FIND & REACH': '02 — FINDEN & ERREICHEN', '03 — CONVERT': '03 — KONVERTIEREN',
    '04 — CUSTOMER OPERATIONS': '04 — KUNDENBETRIEB', '05 — AUTOMATE & IMPROVE': '05 — AUTOMATISIEREN & VERBESSERN', 'PLATFORM MANAGEMENT': 'PLATTFORMVERWALTUNG'
  }
};

@Injectable({ providedIn: 'root' })
export class AdminI18nService {
  readonly language = signal<AdminLanguage>((localStorage.getItem('qai.admin.language') as AdminLanguage) || 'en');
  readonly languages: Array<{code: AdminLanguage; label: string}> = [
    {code: 'en', label: 'EN'}, {code: 'mk', label: 'MK'}, {code: 'sq', label: 'SQ'}, {code: 'de', label: 'DE'}
  ];

  setLanguage(language: AdminLanguage): void {
    this.language.set(language);
    localStorage.setItem('qai.admin.language', language);
    document.documentElement.lang = language;
  }

  t(value: string): string { return DICTIONARY[this.language()][value] || value; }
}
