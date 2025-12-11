// --- AYARLAR ---
const API_KEY = "20b5f63797f4ff423d609309"; // API Anahtarını buraya yapıştır
const BASE_CURRENCY = "TRY"; // Hangi para birimi baz alınacak?

// Takip Edilecek Para Birimleri
const currencies = [
    { code: "USD", name: "ABD Doları" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "İngiliz Sterlini" },
    { code: "CHF", name: "İsviçre Frangı" },
    { code: "CAD", name: "Kanada Doları" },
    { code: "JPY", name: "Japon Yeni" },
    { code: "RUB", name: "Rus Rublesi" },
    { code: "AUD", name: "Avustralya Doları" },
    { code: "CNY", name: "Çin Yuanı" },
    { code: "AZN", name: "Azerbaycan Manatı" },
    { code: "SAR", name: "Suudi Riyali" },
    { code: "KWD", name: "Kuveyt Dinarı" }
];

let oldRates = {}; 

async function getData() {
    const container = document.getElementById('currencyGrid');
    const updateLabel = document.getElementById('lastUpdate');

    try {
        // Eğer API Key girilmediyse uyarı ver
        if (API_KEY === "20b5f63797f4ff423d609309") {
            container.innerHTML = "<div class='loading-text' style='color:red;'>Lütfen script.js dosyasına API Key giriniz!</div>";
            return;
        }

        // V6 Endpoint (API Key ile çalışan profesyonel sürüm)
        const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
        
        const res = await fetch(url);
        
        // Hata kontrolü (API Key yanlışsa vs.)
        if (!res.ok) {
            throw new Error(`API Hatası: ${res.status}`);
        }

        const data = await res.json();
        
        // İlk yükleme yazısını temizle
        if(container.querySelector('.loading-text')){
            container.innerHTML = "";
        }

        updateLabel.innerText = `Son Güncelleme: ${new Date().toLocaleTimeString()}`;

        currencies.forEach(curr => {
            // API TRY bazlı veriyor: 1 TRY = 0.034 USD gibi.
            // Bizim istediğimiz: 1 USD = 29.XX TL.
            // Bu yüzden "1 / Oran" formülünü kullanıyoruz.
            
            let rawRate = data.conversion_rates[curr.code];
            let rate = (1 / rawRate).toFixed(4); // Virgülden sonra 4 hane
            
            // Değişim Yönü
            let statusClass = "neutral";
            let arrow = "-";
            let flashClass = "";

            if(oldRates[curr.code]) {
                // String karşılaştırmasını önlemek için parseFloat kullanıyoruz
                let currentVal = parseFloat(rate);
                let oldVal = parseFloat(oldRates[curr.code]);

                if(currentVal > oldVal) {
                    statusClass = "up";
                    arrow = "▲";
                    flashClass = "flash-green";
                } else if(currentVal < oldVal) {
                    statusClass = "down";
                    arrow = "▼";
                    flashClass = "flash-red";
                }
            }

            // DOM İşlemleri
            let card = document.getElementById(`card-${curr.code}`);
            
            if(!card) {
                // Kart Oluşturma
                let html = `
                    <div class="card" id="card-${curr.code}">
                        <div class="info">
                            <h2>${curr.code}</h2>
                            <span>${curr.name}</span>
                        </div>
                        <div class="price-box">
                            <div class="price" id="price-${curr.code}">₺${rate}</div>
                            <div class="change ${statusClass}" id="change-${curr.code}">${arrow}</div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);

                // İlk oluştuğunda efekt varsa ekle
                if(flashClass) {
                    let newCard = document.getElementById(`card-${curr.code}`);
                    newCard.classList.add(flashClass);
                    setTimeout(() => newCard.classList.remove(flashClass), 1000);
                }

            } else {
                // Güncelleme
                document.getElementById(`price-${curr.code}`).innerText = `₺${rate}`;
                let changeElem = document.getElementById(`change-${curr.code}`);
                changeElem.className = `change ${statusClass}`;
                changeElem.innerText = arrow;
                
                if(flashClass) {
                    card.classList.add(flashClass);
                    setTimeout(() => card.classList.remove(flashClass), 1000);
                }
            }

            oldRates[curr.code] = rate;
        });

    } catch (err) {
        console.error("Hata:", err);
        updateLabel.innerText = "Bağlantı Hatası veya Geçersiz API Key";
        // Kullanıcıya da gösterelim
        if(container.innerHTML === "") {
             container.innerHTML = `<div class='loading-text'>Veri çekilemedi. API Key kontrol ediniz.</div>`;
        }
    }
}

// Başlat
getData();

// API Key limitini doldurmamak için süreyi biraz uzatabiliriz (örneğin 15 saniye)
setInterval(getData, 15000);
