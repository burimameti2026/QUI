import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';

const RENOVA_TENANT_ID = '2f0c6e75-4df1-4bd5-bb49-6ef8ea0e3f1a';
type Language = 'en' | 'mk' | 'sq' | 'de';

const UI: Record<Language, Record<string, string>> = {
  en: { products:'Products', solutions:'Solutions', company:'Company', contact:'Contact', distributor:'Become a distributor', search:'Search', heroKicker:'Professional building materials', heroTitle:'Building better. Together.', heroText:'High-performance dry and liquid construction solutions for professional projects across the Balkans.', explore:'Explore products', talk:'Talk to Renova', industries:'Solutions for construction', featured:'Featured products', view:'View product', catalog:'Product catalog', detail:'Product information', request:'Request information', partnerKicker:'Partner with Renova', partnerTitle:'Grow your business with a trusted construction materials partner.', partnerText:'Talk to our commercial team about distribution, products and market opportunities.', contactKicker:'Contact Renova', contactTitle:'How can we help?', contactText:'Ask about products, technical documentation, projects or distribution opportunities.', name:'Your name', companyName:'Company', email:'Email', phone:'Phone', message:'Message', send:'Send request', sending:'Sending…', sent:'Request received. The Renova team will follow up with you.', footer:'Professional construction materials since 1992.' },
  mk: { products:'Производи', solutions:'Решенија', company:'Компанија', contact:'Контакт', distributor:'Стани дистрибутер', search:'Пребарај', heroKicker:'Професионални градежни материјали', heroTitle:'Градиме подобро. Заедно.', heroText:'Висококвалитетни суви и течни градежни решенија за професионални проекти низ Балканот.', explore:'Истражи производи', talk:'Контактирајте ја Ренова', industries:'Решенија за градежништво', featured:'Избрани производи', view:'Погледни производ', catalog:'Каталог на производи', detail:'Информации за производот', request:'Побарај информации', partnerKicker:'Партнер со Ренова', partnerTitle:'Развијте го вашиот бизнис со доверлив партнер за градежни материјали.', partnerText:'Разговарајте со нашиот комерцијален тим за дистрибуција, производи и пазарни можности.', contactKicker:'Контактирајте ја Ренова', contactTitle:'Како можеме да помогнеме?', contactText:'Прашајте за производи, техничка документација, проекти или можности за дистрибуција.', name:'Име и презиме', companyName:'Компанија', email:'Е-пошта', phone:'Телефон', message:'Порака', send:'Испрати барање', sending:'Се испраќа…', sent:'Барањето е примено. Тимот на Ренова ќе ве контактира.', footer:'Професионални градежни материјали од 1992 година.' },
  sq: { products:'Produktet', solutions:'Zgjidhjet', company:'Kompania', contact:'Kontakti', distributor:'Bëhu distributor', search:'Kërko', heroKicker:'Materiale profesionale ndërtimi', heroTitle:'Ndërtojmë më mirë. Së bashku.', heroText:'Zgjidhje të avancuara të thata dhe të lëngshme për projekte profesionale në Ballkan.', explore:'Eksploro produktet', talk:'Kontakto Renova', industries:'Zgjidhje për ndërtim', featured:'Produktet e zgjedhura', view:'Shiko produktin', catalog:'Katalogu i produkteve', detail:'Informacioni i produktit', request:'Kërko informacion', partnerKicker:'Partner me Renova', partnerTitle:'Rrit biznesin me një partner të besueshëm për materiale ndërtimi.', partnerText:'Kontakto ekipin tonë për distribuim, produkte dhe mundësi tregu.', contactKicker:'Kontakto Renova', contactTitle:'Si mund t’ju ndihmojmë?', contactText:'Pyet për produkte, dokumentacion teknik, projekte ose mundësi distribuimi.', name:'Emri dhe mbiemri', companyName:'Kompania', email:'E-mail', phone:'Telefoni', message:'Mesazhi', send:'Dërgo kërkesën', sending:'Duke dërguar…', sent:'Kërkesa u pranua. Ekipi i Renova do t’ju kontaktojë.', footer:'Materiale profesionale ndërtimi që nga viti 1992.' },
  de: { products:'Produkte', solutions:'Lösungen', company:'Unternehmen', contact:'Kontakt', distributor:'Distributor werden', search:'Suchen', heroKicker:'Professionelle Baustoffe', heroTitle:'Besser bauen. Gemeinsam.', heroText:'Leistungsstarke trockene und flüssige Baustofflösungen für professionelle Projekte auf dem Balkan.', explore:'Produkte entdecken', talk:'Renova kontaktieren', industries:'Lösungen für das Bauwesen', featured:'Ausgewählte Produkte', view:'Produkt ansehen', catalog:'Produktkatalog', detail:'Produktinformationen', request:'Informationen anfordern', partnerKicker:'Partner von Renova', partnerTitle:'Wachsen Sie mit einem zuverlässigen Partner für Baustoffe.', partnerText:'Sprechen Sie mit unserem Vertriebsteam über Distribution, Produkte und Marktchancen.', contactKicker:'Renova kontaktieren', contactTitle:'Wie können wir helfen?', contactText:'Fragen Sie nach Produkten, technischen Unterlagen, Projekten oder Vertriebsmöglichkeiten.', name:'Name', companyName:'Unternehmen', email:'E-Mail', phone:'Telefon', message:'Nachricht', send:'Anfrage senden', sending:'Wird gesendet…', sent:'Anfrage erhalten. Das Renova-Team wird sich bei Ihnen melden.', footer:'Professionelle Baustoffe seit 1992.' }
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renova-portal.page.html',
  styleUrl: './renova-portal.page.css'
})
export class RenovaPortalPage implements OnInit {
  tenantId = RENOVA_TENANT_ID;
  language: Language = 'en';
  products: any[] = [];
  selected: any = null;
  loading = true;
  error = '';
  inquiry = { name: '', company: '', email: '', phone: '', countryCode: '', message: '' };
  inquirySent = false;
  inquiryBusy = false;
  readonly languages: Language[] = ['en', 'mk', 'sq', 'de'];

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  get t(): Record<string, string> { return UI[this.language]; }

  ngOnInit(): void {
    const requested = this.route.snapshot.queryParamMap.get('language') as Language | null;
    this.language = requested && this.languages.includes(requested) ? requested : 'en';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.get<any[]>(`public/portal/${this.tenantId}/products?language=${encodeURIComponent(this.language.toUpperCase())}`).subscribe({
      next: products => {
        this.products = products || [];
        const slug = this.route.snapshot.queryParamMap.get('product');
        this.selected = slug ? this.products.find(x => x.slug === slug) || this.products[0] : this.products[0];
        this.loading = false;
        if (this.selected) this.loadDetail(this.selected.slug);
      },
      error: err => { this.loading = false; this.error = err?.error?.detail || 'Unable to load the Renova catalog.'; }
    });
  }

  loadDetail(slug: string): void {
    this.api.get<any>(`public/portal/${this.tenantId}/products/${encodeURIComponent(slug)}?language=${encodeURIComponent(this.language.toUpperCase())}`).subscribe({
      next: product => this.selected = product,
      error: err => this.error = err?.error?.detail || 'Unable to load product details.'
    });
  }

  select(product: any): void {
    this.selected = product;
    this.inquirySent = false;
    this.loadDetail(product.slug);
    this.updateUrl();
    document.getElementById('product-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setLanguage(language: Language): void {
    this.language = language;
    this.inquirySent = false;
    this.updateUrl();
    this.load();
  }

  updateUrl(): void {
    const product = this.selected?.slug ? `&product=${encodeURIComponent(this.selected.slug)}` : '';
    history.replaceState(null, '', `/renova?language=${encodeURIComponent(this.language)}${product}`);
  }

  submitInquiry(): void {
    if (!this.selected || !this.inquiry.name.trim() || !this.inquiry.email.trim()) return;
    this.inquiryBusy = true;
    this.api.post(`public/portal/${this.tenantId}/inquiries`, { catalogProductId: this.selected.id, ...this.inquiry, language: this.language.toUpperCase() }).subscribe({
      next: () => { this.inquiryBusy = false; this.inquirySent = true; this.inquiry = { name: '', company: '', email: '', phone: '', countryCode: '', message: '' }; },
      error: err => { this.inquiryBusy = false; this.error = err?.error?.detail || 'Your request could not be submitted.'; }
    });
  }
}
