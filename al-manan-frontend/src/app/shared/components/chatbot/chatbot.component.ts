import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: string;
  options?: string[];
}

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

  // ── Knowledge base ──────────────────────────────────────────
  private readonly KB: { patterns: RegExp[]; response: string; options?: string[] }[] = [
    {
      patterns: [/salam|hello|hi|hey|assalam|aoa|helo/i],
      response: '✨ Assalam-o-Alaikum! Al-Manan mein khush aamdeed!\n\nMain aapki kya madad kar sakta hun?',
      options: ['Products dekhein', 'Order karna hai', 'Shipping info', 'Return policy', 'Contact karein']
    },
    {
      patterns: [/product|collection|dress|suit|kapray|lawn|kameez|kurta|shalwar|women|men|fashion/i],
      response: '👗 Al-Manan ke paas yeh collections hain:\n\n• **Women\'s Collection** — Lawn suits, Shalwar kameez, Formal wear\n• **Men\'s Collection** — Kurta shalwar, Casual wear\n\nHum premium Pakistani fashion offer karte hain. Prices PKR 1,800 se PKR 8,500+ tak hain.',
      options: ['Women collection dekhein', 'Men collection dekhein', 'Prices kya hain', 'Order karna hai']
    },
    {
      patterns: [/price|qeemat|kitna|cost|rate|how much|dam/i],
      response: '💰 Al-Manan ke prices:\n\n• Casual Kurta: PKR 1,800+\n• Cotton Shalwar Kameez: PKR 2,800+\n• Embroidered Lawn: PKR 4,500+\n• Men Kurta Shalwar: PKR 3,200+\n• Silk Formal: PKR 8,500+\n\nSale products par aur discount milta hai!',
      options: ['Shop karo', 'Sale products', 'Order karna hai']
    },
    {
      patterns: [/order|buy|kharidna|purchase|cart|checkout/i],
      response: '🛒 Order karna boht aasaan hai:\n\n1️⃣ Product select karein\n2️⃣ Size choose karein\n3️⃣ "Add to Cart" click karein\n4️⃣ Checkout mein naam, phone, address dein\n5️⃣ Order place karein — bas!\n\nKoi account banana zaroori nahi — guest checkout available hai.',
      options: ['Shop karo', 'Payment methods', 'Shipping info']
    },
    {
      patterns: [/payment|pay|jazz|easypaisa|card|cod|cash|online/i],
      response: '💳 Payment options:\n\n• **JazzCash** ✅\n• **EasyPaisa** ✅\n• **Credit/Debit Card** ✅\n• **Cash on Delivery (COD)** ✅\n\nSab transactions secure hain.',
      options: ['Order karna hai', 'Shipping info', 'Return policy']
    },
    {
      patterns: [/shipping|deliver|delivery|kitne din|when|kab|dispatch|time/i],
      response: '🚚 Delivery details:\n\n• **Lahore, Karachi, Islamabad:** 2-3 working days\n• **Other cities:** 3-5 working days\n• **Remote areas:** 5-7 working days\n\nOrder place hone ke baad tracking number email pe bheja jata hai.',
      options: ['Order track karein', 'Return policy', 'Contact karein']
    },
    {
      patterns: [/return|exchange|refund|wapas|vapas|change/i],
      response: '🔄 Return & Exchange policy:\n\n• **7 din** mein return/exchange\n• Product unworn aur original condition mein hona chahiye\n• Tags attached hone chahiye\n• Exchange free hai, refund 3-5 days mein process hota hai\n\nReturn ke liye WhatsApp karein: 03171656231',
      options: ['WhatsApp karein', 'Contact karein', 'Order karna hai']
    },
    {
      patterns: [/size|size guide|fitting|measurement|small|medium|large|xl/i],
      response: '📏 Size guide:\n\n• **S (Small):** Chest 36", Waist 30"\n• **M (Medium):** Chest 38", Waist 32"\n• **L (Large):** Chest 40", Waist 34"\n• **XL:** Chest 42", Waist 36"\n• **XXL:** Chest 44", Waist 38"\n\nShi size k liye WhatsApp karein — hum help karenge!',
      options: ['WhatsApp karein', 'Order karna hai']
    },
    {
      patterns: [/track|tracking|status|order status|kahan|where/i],
      response: '📦 Order track karne ke liye:\n\n1. Order place karne ke baad aapko **email** milti hai tracking number ke saath\n2. Ya WhatsApp karein **03171656231** apna order number de kar\n\nHum jaldi update karenge!',
      options: ['WhatsApp karein', 'Contact karein']
    },
    {
      patterns: [/contact|phone|whatsapp|call|number|email/i],
      response: '📞 Humse rabta karein:\n\n• **WhatsApp:** 03171656231\n• **Email:** almananshope@gmail.com\n• **Instagram:** @almanan.shop\n• **Facebook:** Al-Manan\n• **TikTok:** @almanan.pk\n\nWhatsApp par fastest response milti hai! 😊',
      options: ['WhatsApp karein', 'Instagram dekhein']
    },
    {
      patterns: [/discount|sale|offer|coupon|promo|deal/i],
      response: '🏷️ Special offers:\n\n• **New arrivals** par 10% off\n• **2 suits** kharido 15% discount\n• **Newsletter** subscribe karein exclusive deals ke liye\n• **Social media** follow karein latest offers ke liye\n\nAbhi shop karein best prices par!',
      options: ['Shop karo', 'Social media', 'Newsletter']
    },
    {
      patterns: [/social|instagram|facebook|tiktok|follow/i],
      response: '📱 Humein follow karein:\n\n• **Instagram:** instagram.com/almanan.shop\n• **Facebook:** facebook.com/almanan\n• **TikTok:** @almanan.pk\n\nLatest collections aur offers pehle social media pe announce hote hain!',
      options: ['WhatsApp karein', 'Shop karo']
    },
    {
      patterns: [/thanks|shukriya|thank you|jazakallah|shukria/i],
      response: '😊 Jazak Allah Khair! Al-Manan choose karne ka shukriya!\n\nKoi aur sawal ho to zaroor poochein. Khush raho! 🌟',
      options: ['Shop karo', 'Contact karein']
    },
    {
      patterns: [/bye|goodbye|khuda hafiz|allah hafiz|tata/i],
      response: '👋 Allah Hafiz! Al-Manan mein dubara khush aamdeed!\n\nHamari website visit karte rahein naye collections ke liye. 🌟',
      options: ['Shop karo']
    }
  ];

  ngOnInit(): void {
    setTimeout(() => this.addBotMessage(
      '✨ Assalam-o-Alaikum! Al-Manan mein khush aamdeed!\n\nMain aapki kya madad kar sakta hun?',
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

    // Special option handlers
    if (/shop karo|products dekhein|women collection|men collection/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('🛍️ Hum aapko shop page par le ja rahe hain...', []);
        setTimeout(() => window.open('/shop', '_self'), 1000);
      }, 800);
      return;
    }

    if (/whatsapp karein/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('📲 WhatsApp chat khul rahi hai...', []);
        setTimeout(() => window.open('https://wa.me/923171656231', '_blank'), 800);
      }, 600);
      return;
    }

    if (/instagram dekhein/i.test(text)) {
      setTimeout(() => {
        this.isTyping = false;
        this.addBotMessage('📸 Instagram profile khul rahi hai...', []);
        setTimeout(() => window.open('https://www.instagram.com/almanan.shop', '_blank'), 800);
      }, 600);
      return;
    }

    // KB matching
    const delay = 700 + Math.random() * 600;
    setTimeout(() => {
      this.isTyping = false;
      const match = this.KB.find(k => k.patterns.some(p => p.test(text)));
      if (match) {
        this.addBotMessage(match.response, match.options);
      } else {
        this.addBotMessage(
          '🤔 Mujhe samajh nahi aaya. Kripya neeche se option choose karein ya WhatsApp karein:\n\n📞 **03171656231**',
          ['Order karna hai', 'Shipping info', 'Return policy', 'WhatsApp karein', 'Contact karein']
        );
      }
    }, delay);
  }

  private addUserMessage(text: string): void {
    this.messages.push({ from: 'user', text, time: this.getTime() });
    this.shouldScroll = true;
  }

  private addBotMessage(text: string, options: string[] = []): void {
    this.messages.push({ from: 'bot', text, time: this.getTime(), options });
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

  // Format **bold** text
  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
