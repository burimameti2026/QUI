import { AdminLanguage } from './admin-i18n.service';

export const ADMIN_PAGE_INTERIOR_DYNAMIC_TRANSLATIONS: Record<string, Record<AdminLanguage, string>> = {
  'Campaigns': { en:'Campaigns', mk:'Кампањи', sq:'Fushatat', de:'Kampagnen' },
  'Active': { en:'Active', mk:'Активно', sq:'Aktive', de:'Aktiv' },
  'Total': { en:'Total', mk:'Вкупно', sq:'Gjithsej', de:'Gesamt' },
  'Pending': { en:'Pending', mk:'Во очекување', sq:'Në pritje', de:'Ausstehend' },
  'Showing': { en:'Showing', mk:'Прикажани', sq:'Shfaqen', de:'Anzeige' },
  'Page': { en:'Page', mk:'Страница', sq:'Faqe', de:'Seite' },
  'of': { en:'of', mk:'од', sq:'nga', de:'von' },
  'Indexed': { en:'Indexed', mk:'Индексирани', sq:'Të indeksuara', de:'Indiziert' },
  'chunks': { en:'chunks', mk:'делови', sq:'pjesë', de:'Abschnitte' },
  'Delete': { en:'Delete', mk:'Избриши', sq:'Fshi', de:'Löschen' }
};

export function adminPageInteriorDynamicText(value: string, language: AdminLanguage): string {
  return ADMIN_PAGE_INTERIOR_DYNAMIC_TRANSLATIONS[value]?.[language] ?? value;
}
