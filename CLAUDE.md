# Wer Macht

Kleinanzeigen tarzı Almanca hizmet pazar yeri (service marketplace). Vite + React + TypeScript + Firebase (Auth/Firestore/Storage).

## Kullanıcı

Kullanıcı sadece Türkçe konuşuyor — ona her zaman Türkçe cevap ver.

## Mimari kurallar

- **Firestore sorguları**: composite index yerine tek-alan sorgu + client-side filtreleme tercih edilir (bilinçli bir proje tercihi, index eksikliği değil).
- **Denormalizasyon deseni**: ilişkili veriler dokümanlara denormalize edilir (örn. `ownerName` ilan üzerinde, `providerName` teklif üzerinde) — join yerine.
- **Dark mode**: her yeni bileşende `dark:` sınıflarıyla desteklenmeli, istisnasız.
- **i18n**: 5 dil destekleniyor (de/en/ru/tr/ar), Almanca kaynak dil. Yeni metin eklerken `web/src/i18n/locales/*.json` dosyalarının hepsi güncellenmeli.
- **Doğrulama akışı**: e-posta doğrulama kayıtta zorunlu sert kapı (`AuthContext.needsActivation`, `ProtectedRoute` → `/konto-aktivieren`). Telefon doğrulama zorunlu değil, aksiyona bağlı — teklif verme veya ilan yayınlama anında `PhoneVerificationModal` tetiklenir.

## Firebase

- Proje ID: `wermacht-7764c`
- Firestore/Storage kuralları repo kökünde (`firestore.rules`, `storage.rules`), Firebase CLI ile deploy edilir.

## Yarım Kalan / Çözülemeyen Denemeler

Bir sorun uzun süre çözülemezse veya planlanıp tamamlanmayan bir yaklaşım varsa buraya not edilir — amaç, bir sonraki oturumun aynı çıkmaza tekrar girmemesi.

- **[ÖNCELİKLİ, hâlâ aktif] SMS/telefon doğrulama hatalı çalışıyor** (`auth/invalid-app-credential`): Gerçek telefon numarasıyla test edilirken bazen bu hata alınıyor, kök neden netleşmedi (muhtemelen Firebase'in reCAPTCHA Enterprise anahtarını Console dışından provision edememesiyle ilgili). Şimdilik Firebase Console'da tanımlı bir test telefon numarasıyla bypass edilip geliştirmeye devam ediliyor.
- **[YAPILACAK] Footer eksik/tamamlanmadı**: Impressum, Datenschutz, AGB (üçü de artık sayfa olarak var — `/agb`, `/datenschutz`, `/nutzungsbedingungen` — ama Footer'dan hiçbirine link verilmiyor), Cookie bilgilendirmesi/banner'ı (hiç yok), Instagram sosyal medya linki, Yardım (destek) e-posta linki, Şikayet/dilekçe e-posta linki — Footer bileşenine eklenmeli.
- **[YAPILACAK] Destek/İletişim formu ve dilekçe/şikayet sayfası yok**: Kullanıcıların soru/şikayet/dilekçe gönderebileceği gerçek bir form sayfası (backend'e nasıl ulaşacağı — Firestore koleksiyonu mu, e-posta mı — ayrıca kararlaştırılmalı) henüz yok.
- **[YAPILACAK] Stripe ile gerçek online ödeme entegrasyonu yok**: Şu anki "Zahlung" sayfası sadece Kart/Nakit seçimini bir Firestore alanına yazıyor, gerçek bir ödeme işlemcisi (Stripe vb.) ile tahsilat yapılmıyor — bu placeholder bir akış, gerçek ödeme altyapısı (muhtemelen Cloud Functions + Stripe Checkout/PaymentIntent) kurulmalı.

## Test

UI değişikliklerini gerçek tarayıcıda görmek için `run` skill'i kullanılıyor (Playwright ile dev server'a bağlanıp ekran görüntüsü alma).

## Değişiklik Geçmişi

En son değişiklik en üstte. Her site değişikliğinden sonra buraya kısa bir madde eklenir.

- **2026-09-11** — E-posta doğrulama tamamen yenilendi: Firebase'in çirkin/spam'e düşen varsayılan maili yerine Cloud Functions + Resend (kendi doğrulanmış `wermacht.app` domaininden, DKIM/SPF ile) üzerinden gönderilen özel tasarımlı HTML mail eklendi (logo+wordmark görselleri Firebase Storage'dan, mail içinde "yeni link iste" seçeneği var). Doğrulama linki artık Firebase'in çirkin varsayılan sayfasına değil, kendi tasarladığımız `/email-bestaetigen` sayfasına gidiyor (`oobCode` linkten çıkarılıp client-side `applyActionCode` ile işleniyor — Firebase Console'daki proje-geneli "Action URL" ayarı Admin SDK ile üretilen linkleri etkilemiyor, o yüzden bu yönteme geçildi). Ayrıca `wermacht.app` domaini ilk kez gerçek bir Vercel deploy'a bağlandı (`web/` klasörü root olacak şekilde) — daha önce domain sadece satın alınmıştı, hiçbir siteye bağlı değildi.
- **2026-09-09** — İlan listesine fiyat aralığı / sunuyorum-arıyorum / kargo mümkün filtreleri + sıralama eklendi; "biete" ilanlarında artık isteği kabul eden ilan sahibi değil, isteği gönderen müşteri ödeme sayfasına yönlendiriliyor; Privat/Gewerblich hesap tipi ve işletme bilgileri (Impressum, Vergi No, Widerrufsrecht, AGB) eklenip ilan/profil sayfasında herkese açık gösteriliyor; AGB ve Datenschutzerklärung sayfalarına gerçek içerik eklendi (`8bfb999`).
- **2026-09-08** — 4 yeni ana kategori grubu eklendi (Gastronomie, Auto/Rad/Boot, Dienstleistungen, Elektronik); Meine Aufträge'de ilan silme, saatlik fiyat tipi, +Versand seçeneği eklendi; teklif verenlerin ismi ilan sayfasında maskeleniyor (`bec9b8a`).
