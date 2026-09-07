# Hizmet Pazaryeri Platformu (Web & Mobil) Geliştirme Planı

Bu doküman, kullanıcıların "boyacı arıyorum", "bahçıvan arıyorum" gibi ilanlar verebileceği ve hizmet verenlerin bu ilanlara teklif sunabileceği bir hizmet pazaryeri platformunun geliştirme sürecini adım adım özetlemektedir.

## 1. Proje Analizi ve Planlama

Başarılı bir platformun temeli sağlam bir planlamadan geçer. Geliştirmeye başlamadan önce sistemin mimarisini ve kullanıcı akışlarını modellemek kritik önem taşır.

*   **Kullanıcı Rolleri:** Hizmet Alan (Müşteri) ve Hizmet Veren (Usta/Profesyonel) olmak üzere iki temel kullanıcı tipi belirlenmelidir.
*   **Temel Özellikler (MVP):** Kullanıcı kaydı/girişi, ilan oluşturma, ilan listeleme ve arama, teklif verme ve temel mesajlaşma.
*   **Sistem Modelleme:** Veritabanı yapısını, kullanıcı etkileşimlerini ve sistem akışını tasarlamak için **PlantUML** veya **Astah** gibi araçlar kullanarak Use-Case (Kullanım Durumu) ve ER (Varlık-İlişki) diyagramlarını çizebilirsiniz.

## 2. Teknoloji Yığını (Tech Stack) Seçimi

Önce bir web sitesi, ardından mobil uygulama geliştirme hedefine uygun, hızlı prototipleme ve ölçeklenebilirlik sağlayan modern teknolojiler:

### Web (MVP - İlk Aşama)
*   **Frontend:** HTML, CSS ve JavaScript temelinde, tercihen kullanıcı arayüzünü dinamik yönetmek için React gibi bir kütüphane.
*   **Hosting:** Hızlı ve sorunsuz bir yayınlama süreci için **Vercel** gibi platformlar.

### Mobil Uygulama (İkinci Aşama)
*   **Framework:** **React Native** kullanarak tek bir kod tabanıyla hem iOS hem de Android uygulamaları geliştirebilirsiniz.
*   **Geliştirme Araçları:** **Expo** ile mobil geliştirme sürecini, testleri ve derleme aşamalarını büyük ölçüde hızlandırıp basitleştirebilirsiniz.
*   **Editör:** **VS Code** tüm bu ekosistem için ideal ve hafif bir ortam sağlar.

### Backend ve Veritabanı
*   **Hızlı Başlangıç (BaaS):** **Firebase** bu tür projeler için mükemmel bir çözümdür. Firebase Authentication ile kullanıcı girişlerini (Google, Email/Şifre), Cloud Firestore veya Realtime Database ile ilan ve mesajlaşma verilerini, Storage ile de kullanıcı/ilan fotoğraflarını yönetebilirsiniz.
*   **Alternatif (Özel Backend):** Daha karmaşık iş kuralları gerektiğinde arka planda **Python** veya **Java** tabanlı, **SQL** veritabanı kullanan özel bir REST API mimarisine geçiş yapılabilir.

## 3. Geliştirme Aşamaları (Roadmap)

### Aşama 1: Temel Altyapı ve Veritabanı Tasarımı
*   Veritabanı koleksiyonlarının (Kullanıcılar, İlanlar, Teklifler, Mesajlar) tasarlanması.
*   Firebase projesinin oluşturulması ve Authentication altyapısının kurulması.

### Aşama 2: Web MVP (Minimum Viable Product)
*   Kullanıcı dostu, responsive (mobil uyumlu) bir web arayüzünün kodlanması.
*   İlan ekleme, kategori bazlı filtreleme ve detay sayfalarının oluşturulması.
*   Projenin Vercel üzerinden canlıya alınarak ilk testlerinin yapılması.

### Aşama 3: Mobil Uygulama Entegrasyonu
*   Expo ve React Native ile projenin mobil ayağının başlatılması.
*   Web tarafında kurgulanan mantığın ve Firebase bağlantılarının mobile entegre edilmesi.
*   Mobil cihaza özgü deneyimlerin (kamera erişimi, harita lokasyon seçimi) eklenmesi.

### Aşama 4: İleri Seviye Özellikler
*   Kullanıcılar arası gerçek zamanlı mesajlaşma modülü.
*   Push notification (Anlık bildirim) entegrasyonu (yeni teklif geldiğinde bildirim gönderme).
*   Puanlama ve yorum sistemi.

## 4. Yayınlama ve Büyüme
*   İlk aşamada platformu sadece belirli bir bölgede veya belirli bir niş hizmet kategorisinde test edin.
*   Kullanıcı geri bildirimlerini toplayarak platformu optimize edin ve ardından diğer bölgelere/hizmetlere genişleyin.
