import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: string;
  options?: string[];
  icon?: string; // SVG icon name
}

// SVG icon map — gold themed 2D icons
const ICONS: Record<string, string> = {
  star:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#b8952a" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  shirt:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>`,
  tag:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  cart:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
  card:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  truck:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  refresh:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
  ruler:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>`,
  box:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  phone:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.22 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>`,
  percent:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  share:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  heart:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#b8952a" stroke="#b8952a" stroke-width="1"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  sparkle:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#b8952a" stroke="none"><path d="M12 0L14.59 9.41 24 12 14.59 14.59 12 24 9.41 14.59 0 12 9.41 9.41 12 0z"/></svg>`,
  bye:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
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
    {
      patterns: [/salam|hello|hi|hey|assalam|aoa|helo/i],
      icon: 'sparkle',
      response: 'Assalam-o-Alaikum! Al-Manan mein khush aamdeed!\n\nMain aapki kya madad kar sakta hun?',
      options: ['Products dekhein', 'Order karna hai', 'Shipping info', 'Return policy', 'Contact karein']
    },
    {
      patterns: [/product|collection|dress|suit|kapray|lawn|kameez|kurta|shalwar|women|men|fashion/i],
      icon: 'shirt',
      response: 'Al-Manan ke paas yeh collections hain:\n\n• **Women\'s Collection** — Lawn suits, Shalwar kameez, Formal wear\n• **Men\'s Collection** — Kurta shalwar, Casual wear\n\nPremium Pakistani fashion. Prices PKR 1,800 se PKR 8,500+ tak.',
      options: ['Women collection dekhein', 'Men collection dekhein', 'Prices kya hain', 'Order karna hai']
    },
    {
      patterns: [/price|qeemat|kitna|cost|rate|how much|dam/i],
      icon: 'tag',
      response: 'Al-Manan ke prices:\n\n• Casual Kurta: PKR 1,800+\n• Cotton Shalwar Kameez: PKR 2,800+\n• Embroidered Lawn: PKR 4,500+\n• Men Kurta Shalwar: PKR 3,200+\n• Silk Formal: PKR 8,500+\n\nSale products par extra discount milta hai!',
      options: ['Shop karo', 'Sale products', 'Order karna hai']
    },
    {
      patterns: [/order|buy|kharidna|purchase|cart|checkout/i],
      icon: 'cart',
      response: 'Order karna boht aasaan hai:\n\n**1.** Product select karein\n**2.** Size choose karein\n**3.** "Add to Cart" click karein\n**4.** Checkout mein naam, phone, address dein\n**5.** Order place karein — bas!\n\nKoi account banana zaroori nahi — guest checkout available hai.',
      options: ['Shop karo', 'Payment methods', 'Shipping info']
    },
    {
      patterns: [/payment|pay|jazz|easypaisa|card|cod|cash|online/i],
      icon: 'card',
      response: 'Payment options:\n\n• **JazzCash**\n• **EasyPaisa**\n• **Credit / Debit Card**\n• **Cash on Delivery (COD)**\n\nSab transactions 100% secure hain.',
      options: ['Order karna hai', 'Shipping info', 'Return policy']
    },
    {
      patterns: [/shipping|deliver|delivery|kitne din|when|kab|dispatch|time/i],
      icon: 'truck',
      response: 'Delivery details:\n\n• **Lahore, Karachi, Islamabad:** 2-3 working days\n• **Other cities:** 3-5 working days\n• **Remote areas:** 5-7 working days\n\nOrder place hone ke baad tracking number email pe bheja jata hai.',
      options: ['Order track karein', 'Return policy', 'Contact karein']
    },
    {
      patterns: [/return|exchange|refund|wapas|vapas|change/i],
      icon: 'refresh',
      response: 'Return & Exchange policy:\n\n• **7 din** mein return ya exchange\n• Product unworn aur original condition mein hona chahiye\n• Tags attached hone chahiye\n• Exchange free — refund 3-5 days mein\n\nReturn ke liye WhatsApp karein: **03171656231**',
      options: ['WhatsApp karein', 'Contact karein', 'Order karna hai']
    },
    {
      patterns: [/size|size guide|fitting|measurement|small|medium|large|xl/i],
      icon: 'ruler',
      response: 'Size guide:\n\n• **S** — Chest 36", Waist 30"\n• **M** — Chest 38", Waist 32"\n• **L** — Chest 40", Waist 34"\n• **XL** — Chest 42", Waist 36"\n• **XXL** — Chest 44", Waist 38"\n\nSahi size ke liye WhatsApp karein!',
      options: ['WhatsApp karein', 'Order karna hai']
    },
    {
      patterns: [/track|tracking|status|order status|kahan|where/i],
      icon: 'box',
      response: 'Order track karne ke liye:\n\n**1.** Order ke baad aapko email milti hai tracking number ke saath\n**2.** Ya WhatsApp karein **03171656231** — apna order number de kar\n\nHum jaldi update karenge!',
      options: ['WhatsApp karein', 'Contact karein']
    },
    {
      patterns: [/contact|phone|whatsapp|call|number|email/i],
      icon: 'phone',
      response: 'Humse rabta karein:\n\n• **WhatsApp:** 03171656231\n• **Email:** almananshope@gmail.com\n• **Instagram:** @almanan.shop\n• **Facebook:** Al-Manan\n• **TikTok:** @almanan.pk\n\nWhatsApp par fastest response milti hai!',
      options: ['WhatsApp karein', 'Instagram dekhein']
    },
    {
      patterns: [/discount|sale|offer|coupon|promo|deal/i],
      icon: 'percent',
      response: 'Special offers:\n\n• **New arrivals** par 10% off\n• **2 suits** kharido — 15% discount\n• **Newsletter** subscribe karein exclusive deals ke liye\n• **Social media** follow karein latest offers ke liye\n\nAbhi shop karein best prices par!',
      options: ['Shop karo', 'Social media', 'Contact karein']
    },
    {
      patterns: [/social|instagram|facebook|tiktok|follow/i],
      icon: 'share',
      response: 'Humein follow karein:\n\n• **Instagram:** instagram.com/almanan.shop\n• **Facebook:** Al-Manan Official\n• **TikTok:** @almanan.pk\n\nLatest collections aur offers pehle social media pe announce hote hain!',
      options: ['WhatsApp karein', 'Shop karo']
    },
    {
      patterns: [/thanks|shukriya|thank you|jazakallah|shukria/i],
      icon: 'heart',
      response: 'Jazak Allah Khair! Al-Manan choose karne ka shukriya!\n\nKoi aur sawal ho to zaroor poochein. Khush raho!',
      options: ['Shop karo', 'Contact karein']
    },
    {
      patterns: [/bye|goodbye|khuda hafiz|allah hafiz|tata/i],
      icon: 'bye',
      response: 'Allah Hafiz! Al-Manan mein dubara khush aamdeed!\n\nHamari website visit karte rahein naye collections ke liye.',
      options: ['Shop karo']
    }
  ];

  // Expose icons to template
  getIcon(name: string): string {
    return ICONS[name] || ICONS['sparkle'];
  }

  ngOnInit(): void {
    setTimeout(() => this.addBotMessage(
      'Assalam-o-Alaikum! Al-Manan mein khush aamdeed!\n\nMain aapki kya madad kar sakta hun?',
      'sparkle',
      ['Products dekhein', 'Order karna hai', 'Shipping info', 'Return policy', 'Contact karein']
    ), 800);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.shouldScroll = true;
  }

  closeChat(): void {
    this.isOpen = false;
  }

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  private processResponse(text: string): void {
    this.isTyping = true;
    this.shouldScroll = true;

    if (/shop karo|products dekhein|women collection|men collection/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('Aapko shop page par le ja rahe hain...', 'cart', []);
        setTimeout(() => window.open('/shop', '_self'), 1000);
      }, 800);
      return;
    }

    if (/whatsapp karein/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('WhatsApp chat khul rahi hai...', 'phone', []);
        setTimeout(() => window.open('https://wa.me/923171656231', '_blank'), 800);
      }, 600);
      return;
    }

    if (/instagram dekhein/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('Instagram profile khul rahi hai...', 'share', []);
        setTimeout(() => window.open('https://www.instagram.com/almanan.shop', '_blank'), 800);
      }, 600);
      return;
    }

    const delay = 700 + Math.random() * 500;
    setTimeout(() => {
      this.isTyping = false;
      const match = this.KB.find(k => k.patterns.some(p => p.test(text)));
      if (match) {
        this.addBotMessage(match.response, match.icon, match.options);
      } else {
        this.addBotMessage(
          'Mujhe samajh nahi aaya. Kripya neeche se option choose karein ya WhatsApp karein:\n\n**03171656231**',
          'phone',
          ['Order karna hai', 'Shipping info', 'Return policy', 'WhatsApp karein', 'Contact karein']
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
