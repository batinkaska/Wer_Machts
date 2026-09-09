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

## Bilinen açık sorun

Gerçek telefon numarasıyla SMS doğrulaması bazen `auth/invalid-app-credential` hatası veriyor (kök neden netleşmedi, muhtemelen Firebase'in reCAPTCHA Enterprise anahtarını Console dışından provision edememesiyle ilgili). Şimdilik Firebase Console'da tanımlı bir test telefon numarasıyla bypass edilip geliştirmeye devam ediliyor.

## Test

UI değişikliklerini gerçek tarayıcıda görmek için `run` skill'i kullanılıyor (Playwright ile dev server'a bağlanıp ekran görüntüsü alma).
