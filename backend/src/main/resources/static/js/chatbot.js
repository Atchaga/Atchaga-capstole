/* ============================================================
   ATCHAGA MART - AI Shopping Assistant Chatbot
   Floating widget available on all pages.
   ============================================================ */

const Chatbot = {
    isOpen: false,
    suggestions: [
        'Show me laptops',
        'Products under ₹2000',
        'How to track my order',
        'Delivery info',
        'Return policy',
        'What categories do you have?'
    ],

    init() {
        this.renderWidget();
        this.attachEvents();
    },

    renderWidget() {
        if (document.getElementById('am-chatbot-container')) return;

        const container = document.createElement('div');
        container.id = 'am-chatbot-container';
        container.className = 'am-chatbot-container';
        container.innerHTML = `
            <div class="am-chatbot-window" id="am-chatbot-window">
                <div class="am-chatbot-header">
                    <div class="am-chatbot-avatar">🛒</div>
                    <div class="am-chatbot-header-info">
                        <h5>ATCHAGA Assistant</h5>
                        <p>Ask me about products, orders & more</p>
                    </div>
                </div>
                <div class="am-chatbot-messages" id="am-chatbot-messages"></div>
                <div class="am-chatbot-suggestions" id="am-chatbot-suggestions">
                    ${this.suggestions.map(s => `<span class="am-chatbot-suggestion" onclick="Chatbot.sendSuggestion('${s}')">${s}</span>`).join('')}
                </div>
                <div class="am-chatbot-input-area">
                    <input type="text" class="am-chatbot-input" id="am-chatbot-input"
                           placeholder="Ask about products, orders..." onkeypress="Chatbot.handleKeypress(event)">
                    <button class="am-chatbot-send" onclick="Chatbot.sendMessage()" title="Send">
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
            <button class="am-chatbot-toggle" id="am-chatbot-toggle" onclick="Chatbot.toggle()" title="Chat with us">
                <svg class="am-chat-open" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                <svg class="am-chat-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        `;
        document.body.appendChild(container);
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const toggle = document.getElementById('am-chatbot-toggle');
        const windowEl = document.getElementById('am-chatbot-window');
        if (this.isOpen) {
            toggle.classList.add('open');
            windowEl.classList.add('open');
            this.addBotMessage("Hi! I'm your ATCHAGA MART shopping assistant. Ask me about products, prices, orders, or how to use the website!");
        } else {
            toggle.classList.remove('open');
            windowEl.classList.remove('open');
        }
    },

    handleKeypress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    },

    sendSuggestion(text) {
        const input = document.getElementById('am-chatbot-input');
        input.value = text;
        this.sendMessage();
    },

    sendMessage() {
        const input = document.getElementById('am-chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        input.value = '';
        this.addUserMessage(message);
        this.showTyping();

        fetch(AM.API_BASE + '/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(AM.getToken() ? { 'Authorization': 'Bearer ' + AM.getToken() } : {})
            },
            body: JSON.stringify({ message })
        })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {
            this.hideTyping();
            this.addBotMessage(data.reply);
        })
        .catch(error => {
            this.hideTyping();
            this.addBotMessage('Sorry, I had trouble processing that. Please try again.');
        });
    },

    addBotMessage(text) {
        const container = document.getElementById('am-chatbot-messages');
        const div = document.createElement('div');
        div.className = 'am-chatbot-message bot';
        div.textContent = text;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    addUserMessage(text) {
        const container = document.getElementById('am-chatbot-messages');
        const div = document.createElement('div');
        div.className = 'am-chatbot-message user';
        div.textContent = text;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    showTyping() {
        const container = document.getElementById('am-chatbot-messages');
        const div = document.createElement('div');
        div.className = 'am-chatbot-message bot typing';
        div.id = 'am-chatbot-typing';
        div.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    hideTyping() {
        const typing = document.getElementById('am-chatbot-typing');
        if (typing) typing.remove();
    },

    attachEvents() {
        document.addEventListener('click', (e) => {
            if (!this.isOpen) return;
            const container = document.getElementById('am-chatbot-container');
            if (container && !container.contains(e.target)) {
                this.toggle();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Chatbot.init());
