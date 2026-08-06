import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: string;
  options?: string[];
  icon?: string;
}

const ICONS: Record<string, string> = {
  star:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#b8952a"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  shirt:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>`,
  tag:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  cart:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
  card:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  truck:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  refresh: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
  ruler:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>`,
  box:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  phone:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.22 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>`,
  percent: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  share:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  heart:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#b8952a" stroke="#b8952a" stroke-width="1"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#b8952a"><path d="M12 0L14.59 9.41 24 12 14.59 14.59 12 24 9.41 14.59 0 12 9.41 9.41 12 0z"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  shield:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  map:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  gift:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>`,
  bye:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
};

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  userInput = '';
  messages: ChatMessage[] = [];
  private shouldScroll = false;

  private readonly KB: { patterns: RegExp[]; response: string; icon: string; options?: string[] }[] = [

    // ── GREETINGS ────────────────────────────────────────────────
    {
      patterns: [/^(salam|hello|hi|hey|assalam|aoa|helo|السلام|hii|hiii|helo|hlw|howdy|sup|what.?s up|kya hal|kaise ho|kaisa|good morning|good evening|good afternoon|subah|shaam)/i],
      icon: 'sparkle',
      response: 'Assalam-o-Alaikum! Al-Manan Premium Fashion mein khush aamdeed!\n\nMain aapka personal fashion assistant hun. Aap se milke khushi hui!\n\nMain in cheezon mein madad kar sakta hun:',
      options: ['Products & Collections', 'Order karna hai', 'Shipping & Delivery', 'Return & Exchange', 'Size Guide', 'Contact karein']
    },

    // ── ABOUT BRAND ──────────────────────────────────────────────
    {
      patterns: [/kaun|kon ho|what are you|who are you|al.?manan kya|brand|company|about|bare mein|ke bare|history|kahani|story|founded|kb bana|kab se/i],
      icon: 'info',
      response: '**Al-Manan** ek premium Pakistani fashion brand hai.\n\nHamari kahani:\n• Pakistani heritage aur artisan craftsmanship ka ek celebration\n• High-quality fabrics — Lawn, Chiffon, Silk, Cotton\n• Women\'s aur Men\'s dono collections available\n• Har piece mein traditional aur modern design ka unique blend\n• Affordable luxury — PKR 1,800 se PKR 8,500+\n\nHamara mission: Har Pakistani ko premium fashion accessible banana.',
      options: ['Collections dekhein', 'Prices kya hain', 'Contact karein']
    },

    // ── WOMEN COLLECTION ─────────────────────────────────────────
    {
      patterns: [/women|woman|ladies|girls|larki|aurat|khawateen|female|lawn suit|shalwar kameez|formal wear|chiffon|bridal|party wear|embroidered/i],
      icon: 'shirt',
      response: '**Women\'s Collection** — Al-Manan ki speciality:\n\n**Lawn Collection**\n• Embroidered Lawn Suit — PKR 4,500+\n• Printed Lawn — PKR 2,800+\n\n**Shalwar Kameez**\n• Cotton — PKR 2,800+\n• Chiffon Party Wear — PKR 6,500+\n\n**Formal Wear**\n• Silk Formal Dress — PKR 8,500+\n• Embellished Party Dress — PKR 7,000+\n\nSab products high-quality fabrics se banaye hain.',
      options: ['Shop karo', 'Prices kya hain', 'Size Guide', 'Order karna hai']
    },

    // ── MEN COLLECTION ───────────────────────────────────────────
    {
      patterns: [/men|man|gents|mard|boys|larka|male|kurta|shalwar|kameez|sherwani|waistcoat|casual wear|men.?s/i],
      icon: 'shirt',
      response: '**Men\'s Collection** — Classic Pakistani fashion:\n\n**Kurta Shalwar**\n• Classic Men Kurta Shalwar — PKR 3,200+\n• Embroidered Kurta — PKR 4,000+\n\n**Casual Wear**\n• Casual Men Kurta — PKR 1,800+\n• Cotton Kurta — PKR 2,200+\n\n**Formal**\n• Waistcoat Set — PKR 5,500+\n• Sherwani Style — PKR 7,500+\n\nPremium fabric, comfortable fitting.',
      options: ['Shop karo', 'Size Guide', 'Order karna hai', 'Prices kya hain']
    },

    // ── PRICES ───────────────────────────────────────────────────
    {
      patterns: [/price|qeemat|kitna|cost|rate|how much|dam|mehnga|sasta|afford|budget|pkr|rupee|paisa/i],
      icon: 'tag',
      response: '**Al-Manan Price Range:**\n\n**Women\'s:**\n• Casual Cotton — PKR 1,800 – 2,800\n• Lawn Suits — PKR 2,800 – 4,500\n• Chiffon / Party — PKR 5,000 – 7,000\n• Silk Formal — PKR 7,000 – 9,000+\n\n**Men\'s:**\n• Casual Kurta — PKR 1,800 – 2,500\n• Kurta Shalwar Set — PKR 2,800 – 4,000\n• Formal / Embroidered — PKR 4,000 – 7,500+\n\nSale mein aur bhi kam price milti hai!',
      options: ['Shop karo', 'Discount kya hai', 'Order karna hai']
    },

    // ── ORDER PROCESS ────────────────────────────────────────────
    {
      patterns: [/order|buy|kharid|purchase|cart|checkout|kaise order|order karna|how to buy|place order/i],
      icon: 'cart',
      response: '**Order karna bilkul aasaan hai:**\n\n**Step 1** — Shop page pe jao\n**Step 2** — Pasand ka product click karo\n**Step 3** — Size aur quantity choose karo\n**Step 4** — "Add to Cart" click karo\n**Step 5** — Cart mein jao → Checkout\n**Step 6** — Naam, phone number, complete address dein\n**Step 7** — Payment method choose karo\n**Step 8** — Order confirm!\n\nKoi account banana zaroori nahi — **Guest Checkout** available hai.\nOrder ke baad confirmation email milegi.',
      options: ['Shop karo', 'Payment methods', 'Shipping info', 'Contact karein']
    },

    // ── PAYMENT ──────────────────────────────────────────────────
    {
      patterns: [/payment|pay|jazz|easypaisa|card|cod|cash|online|bank|transfer|debit|credit|visa|mastercard/i],
      icon: 'card',
      response: '**Payment Methods — Sab available hain:**\n\n• **JazzCash** — Mobile wallet\n• **EasyPaisa** — Mobile wallet\n• **Credit Card** — Visa / Mastercard\n• **Debit Card** — All banks\n• **Cash on Delivery (COD)** — Ghar pe cash dein\n\n**Security:** Sab transactions SSL-encrypted hain, aapka data 100% safe hai.\n\n**COD:** Extra charge nahi, same price.',
      options: ['Order karna hai', 'Shipping info', 'Contact karein']
    },

    // ── SHIPPING ─────────────────────────────────────────────────
    {
      patterns: [/ship|deliver|delivery|kitne din|when|kab|dispatch|time|kitna waqt|courier|tracking|lahore|karachi|islamabad|city|area|pakistan/i],
      icon: 'truck',
      response: '**Delivery Details:**\n\n**Major Cities** (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad):\n→ 2-3 working days\n\n**Other Cities:**\n→ 3-5 working days\n\n**Remote Areas:**\n→ 5-7 working days\n\n**Shipping Cost:** PKR 150-200 (free above PKR 5,000)\n\n**Courier Partners:** TCS, Leopards, M&P\n\nOrder dispatch ke baad tracking number email/SMS pe milta hai.',
      options: ['Order karna hai', 'Order track karein', 'Return policy', 'Contact karein']
    },

    // ── RETURN & EXCHANGE ────────────────────────────────────────
    {
      patterns: [/return|exchange|refund|wapas|vapas|change|wrong|galat|damaged|kharab|torn|phat|size issue|fit nahi|different/i],
      icon: 'refresh',
      response: '**Return & Exchange Policy:**\n\n**Return:**\n• Delivery ke **7 din** andar\n• Product unworn, unwashed hona chahiye\n• Original tags attached hone chahiye\n• Damaged/wrong item free return\n\n**Exchange:**\n• Size exchange bilkul **free**\n• 7 din ke andar contact karein\n\n**Refund:**\n• 3-5 working days mein process\n• Same payment method pe wapas\n\n**Process:** WhatsApp pe order number bhejein → hum guide karenge.',
      options: ['WhatsApp karein', 'Contact karein', 'Order karna hai']
    },

    // ── SIZE GUIDE ───────────────────────────────────────────────
    {
      patterns: [/size|fitting|measurement|small|medium|large|xl|xxl|chest|waist|length|height|qad|chaati|kamar|naap|kaunsa size/i],
      icon: 'ruler',
      response: '**Size Guide — Al-Manan:**\n\n**Women\'s Sizes:**\n• S (Small) — Chest 34-36"\n• M (Medium) — Chest 36-38"\n• L (Large) — Chest 38-40"\n• XL — Chest 40-42"\n• XXL — Chest 42-44"\n\n**Men\'s Sizes:**\n• S — Chest 36", Waist 30"\n• M — Chest 38", Waist 32"\n• L — Chest 40", Waist 34"\n• XL — Chest 42", Waist 36"\n• XXL — Chest 44", Waist 38"\n\n**Tip:** Agar do sizes ke beech mein hain to bada size lein.\nShi size ke liye WhatsApp karein!',
      options: ['WhatsApp karein', 'Order karna hai', 'Return policy']
    },

    // ── ORDER TRACKING ───────────────────────────────────────────
    {
      patterns: [/track|tracking|status|order status|kahan|where is|mera order|parcel|pakage|package|dispatch hua|shipped/i],
      icon: 'box',
      response: '**Order Track karne ke tarike:**\n\n**Option 1 — Email:**\n• Order dispatch ke baad tracking email milti hai\n• Email mein courier aur tracking number hota hai\n\n**Option 2 — WhatsApp:**\n• 03171656231 pe WhatsApp karein\n• Order number ya phone number dein\n• Hum 30 minutes mein update denge\n\n**Option 3 — Phone:**\n• Direct call: 03171656231\n• Working hours: 9am – 9pm\n\n**Note:** Order place ke 24 hours baad dispatch hota hai.',
      options: ['WhatsApp karein', 'Contact karein']
    },

    // ── CONTACT ──────────────────────────────────────────────────
    {
      patterns: [/contact|phone|whatsapp|call|number|email|address|office|shop|store|location|kahan hai|milna|customer service|helpline/i],
      icon: 'phone',
      response: '**Al-Manan — Humse Rabta Karein:**\n\n**WhatsApp (Fastest):**\n• 03171656231\n• 9am – 9pm, 7 days a week\n\n**Email:**\n• almananshope@gmail.com\n• Reply 2-4 hours mein\n\n**Social Media:**\n• Instagram: @almanan.shop\n• Facebook: Al-Manan Official\n• TikTok: @almanan.pk\n\n**Response Time:**\n• WhatsApp: 15-30 minutes\n• Email: 2-4 hours',
      options: ['WhatsApp karein', 'Instagram dekhein', 'Order karna hai']
    },

    // ── DISCOUNT & OFFERS ────────────────────────────────────────
    {
      patterns: [/discount|sale|offer|coupon|promo|deal|sasta|save|bachao|off|special|code|voucher/i],
      icon: 'percent',
      response: '**Al-Manan Special Offers:**\n\n**Current Deals:**\n• New arrivals — 10% off\n• 2+ suits — 15% discount\n• Free shipping — Orders above PKR 5,000\n\n**Kaise paaein:**\n• Newsletter subscribe karein\n• Instagram follow karein (@almanan.shop)\n• WhatsApp pe "SALE" bhejein latest offers ke liye\n\n**Seasonal Sales:**\n• Eid Special Sale\n• Summer/Winter Clearance\n• New Year Deals\n\nLatest offers ke liye social media follow zaroor karein!',
      options: ['Shop karo', 'Social media', 'WhatsApp karein']
    },

    // ── FABRIC & QUALITY ─────────────────────────────────────────
    {
      patterns: [/fabric|quality|material|kapra|maal|cotton|silk|chiffon|lawn|washing|dhona|care|ironing|press|shrink|color fade/i],
      icon: 'shield',
      response: '**Fabric Quality & Care:**\n\n**Our Fabrics:**\n• **Lawn** — Breathable, summer-perfect, pure cotton\n• **Cotton** — Comfortable, durable, daily wear\n• **Chiffon** — Light, elegant, party wear\n• **Silk** — Premium, smooth, formal occasions\n\n**Washing Instructions:**\n• Cold water hand wash ya gentle machine wash\n• Color ke liye salt mein pehli dafa bhigo lein\n• Direct sunlight mein na sukhayein\n• Iron medium heat pe karein\n\n**Quality Promise:** Hum sirf premium quality fabrics use karte hain.',
      options: ['Collections dekhein', 'Order karna hai', 'Contact karein']
    },

    // ── GIFTING ──────────────────────────────────────────────────
    {
      patterns: [/gift|toh|present|birthday|eid|wedding|shadi|mehndi|diwali|anniversary|surprise|wrap|packaging/i],
      icon: 'gift',
      response: '**Gift Karna Chahte Hain?**\n\nAl-Manan products best gift hain!\n\n**Gift Options:**\n• Special gift wrapping available\n• Personalized note add kar sakte hain\n• Direct recipient ke address pe delivery\n\n**Occasions perfect hain:**\n• Eid ul Fitr / Eid ul Adha\n• Birthdays\n• Weddings / Mehndi\n• Anniversaries\n• Mother\'s Day\n\n**Gift Order ke liye:**\nWhatsApp karein — hum special arrangements karenge!',
      options: ['WhatsApp karein', 'Shop karo', 'Prices kya hain']
    },

    // ── CUSTOM ORDER ─────────────────────────────────────────────
    {
      patterns: [/custom|customize|tailor|silai|apna design|khud ka|specific color|bulk|wholesale|reseller|business/i],
      icon: 'shirt',
      response: '**Custom Orders & Bulk:**\n\n**Custom Orders:**\n• Specific color ya design chahiye? WhatsApp karein\n• Stitching available hai\n• Lead time: 7-10 working days\n\n**Bulk / Wholesale:**\n• 10+ pieces pe special rates\n• Resellers ke liye discount package\n• Corporate gifting available\n\n**Stitching Service:**\n• Measurements de kar custom stitched suit mangwa sakte hain\n• Price depends on design\n\nDetails ke liye WhatsApp karein: **03171656231**',
      options: ['WhatsApp karein', 'Contact karein', 'Prices kya hain']
    },

    // ── WEBSITE / APP ────────────────────────────────────────────
    {
      patterns: [/website|site|app|login|account|register|password|forgot|sign in|sign up|profile|log out/i],
      icon: 'info',
      response: '**Website Information:**\n\n**Shopping:**\n• Account banana zaroori nahi\n• Guest checkout available\n• Cart automatic save hoti hai\n\n**Account Benefits (optional):**\n• Order history dekh sakte hain\n• Easy reorder\n• Saved address\n\n**Website:** almanan.shop\n\n**Admin Login:** Sirf store admin ke liye (/admin)\n\nKisi bhi problem pe WhatsApp karein!',
      options: ['Order karna hai', 'WhatsApp karein', 'Contact karein']
    },

    // ── LOCATION ─────────────────────────────────────────────────
    {
      patterns: [/location|address|office|shop location|showroom|physical store|visit|aa sakta|aa sakti|kahan|lahore|karachi|islamabad/i],
      icon: 'map',
      response: '**Al-Manan — Online Store:**\n\nHum primarily **online store** hain.\n\n**Website:** almanan.shop\n\n**Delivery:** Poore Pakistan mein\n• Lahore, Karachi, Islamabad — 2-3 days\n• All other cities — 3-7 days\n\n**Physical Visit:**\nAbhi sirf online available hai. Future mein showroom open karne ka plan hai.\n\nOnline order karo — ghar pe delivery!',
      options: ['Order karna hai', 'Shipping info', 'Contact karein']
    },

    // ── COMPLAINT / PROBLEM ──────────────────────────────────────
    {
      patterns: [/complaint|problem|issue|masla|galat|wrong item|missing|nahi mila|late|delay|fraud|cheating|dhoka|paisa wapas/i],
      icon: 'refresh',
      response: '**Hum Maafi Chahte Hain!**\n\nAapki problem humein zaroor solve karni hai.\n\n**Immediate Help:**\nWhatsApp karein: **03171656231**\n• Wrong item mila → Free replacement\n• Damaged item → Full refund ya exchange\n• Order nahi mila → Trace karenge\n• Delay → Update denge\n\n**Evidence ke liye:**\nProduct ki photo WhatsApp pe bhejein\n\n**Promise:** Hum 24 hours mein aapki problem solve karenge.',
      options: ['WhatsApp karein', 'Return policy', 'Contact karein']
    },

    // ── SOCIAL MEDIA ─────────────────────────────────────────────
    {
      patterns: [/social|instagram|facebook|tiktok|follow|insta|fb|social media|youtube/i],
      icon: 'share',
      response: '**Al-Manan Social Media:**\n\n**Instagram** (@almanan.shop)\n• Latest collections\n• Styling tips\n• Behind the scenes\n\n**Facebook** (Al-Manan Official)\n• Updates & offers\n• Customer reviews\n\n**TikTok** (@almanan.pk)\n• Fashion reels\n• New arrivals\n\n**Benefits of Following:**\n• Pehle sale ka pata chalta hai\n• Exclusive discount codes\n• New collection preview',
      options: ['Instagram dekhein', 'WhatsApp karein', 'Shop karo']
    },

    // ── THANKS ───────────────────────────────────────────────────
    {
      patterns: [/thanks|shukriya|thank you|jazakallah|shukria|meherbani|nawazish|bahut acha|boht acha|great|perfect|wonderful|zabardast/i],
      icon: 'heart',
      response: 'Jazak Allah Khair! Al-Manan choose karne ka shukriya!\n\nAapki khushi hamara maqsad hai.\n\nKoi aur sawal ho to main hamesha yahaan hun. Khush raho aur fashionable raho!',
      options: ['Shop karo', 'Contact karein', 'Social media']
    },

    // ── GOODBYE ──────────────────────────────────────────────────
    {
      patterns: [/bye|goodbye|khuda hafiz|allah hafiz|tata|ok bye|chalta hun|chalti hun|ja raha|ja rahi/i],
      icon: 'bye',
      response: 'Allah Hafiz! Al-Manan mein dubara khush aamdeed!\n\nHamari website visit karte rahein naye collections ke liye.\nInstagram follow karein — @almanan.shop',
      options: ['Shop karo']
    },
  ];

  getIcon(name: string): string {
    return ICONS[name] || ICONS['sparkle'];
  }

  ngOnInit(): void {
    setTimeout(() => this.addBotMessage(
      'Assalam-o-Alaikum! Al-Manan Premium Fashion mein khush aamdeed!\n\nMain aapka personal fashion assistant hun.\nAapki kya madad kar sakta hun?',
      'sparkle',
      ['Products & Collections', 'Order karna hai', 'Shipping & Delivery', 'Return & Exchange', 'Size Guide', 'Contact karein']
    ), 800);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.shouldScroll = true;
  }

  closeChat(): void { this.isOpen = false; }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text) return;
    this.addUserMessage(text);
    this.userInput = '';
    this.processResponse(text);
  }

  onOptionClick(option: string): void {
    this.addUserMessage(option);
    this.processResponse(option);
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
  }

  private processResponse(text: string): void {
    this.isTyping = true;
    this.shouldScroll = true;

    // Special navigation handlers
    if (/shop karo|products.?collection|women collection|men collection/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('Aapko shop page par le ja rahe hain...', 'cart', []);
        setTimeout(() => window.open('/shop', '_self'), 900);
      }, 700);
      return;
    }
    if (/whatsapp karein/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('WhatsApp chat khul rahi hai...', 'phone', []);
        setTimeout(() => window.open('https://wa.me/923171656231', '_blank'), 700);
      }, 500);
      return;
    }
    if (/instagram dekhein/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('Instagram profile khul rahi hai...', 'share', []);
        setTimeout(() => window.open('https://www.instagram.com/almanan.shop', '_blank'), 700);
      }, 500);
      return;
    }
    if (/social media/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('Hamari social media profiles:\n\n• **Instagram:** instagram.com/almanan.shop\n• **Facebook:** Al-Manan Official\n• **TikTok:** @almanan.pk', 'share',
          ['Instagram dekhein', 'WhatsApp karein', 'Shop karo']);
      }, 600);
      return;
    }

    const delay = 600 + Math.random() * 500;
    setTimeout(() => {
      this.isTyping = false;
      const match = this.KB.find(k => k.patterns.some(p => p.test(text)));
      if (match) {
        this.addBotMessage(match.response, match.icon, match.options);
      } else {
        // Fallback — still helpful
        this.addBotMessage(
          'Samajhne ki koshish ki lekin bilkul clear nahi hua.\n\nKripya neeche se option choose karein ya aur detail mein likhein.\n\nYa seedha WhatsApp karein: **03171656231** — hum personally help karenge!',
          'phone',
          ['Products & Collections', 'Order karna hai', 'Shipping & Delivery', 'Return & Exchange', 'WhatsApp karein', 'Contact karein']
        );
      }
    }, delay);
  }

  private addUserMessage(text: string): void {
    this.messages.push({ from: 'user', text, time: this.getTime() });
    this.shouldScroll = true;
  }

  private addBotMessage(text: string, icon: string, options: string[] = []): void {
    this.messages.push({ from: 'bot', text, time: this.getTime(), options, icon });
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private getTime(): string {
    return new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
