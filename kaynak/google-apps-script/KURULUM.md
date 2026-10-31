# ATACORE sitesi: duyuru ve başvuru kurulumu

Site, kulübün Google hesabındaki bir E-Tablo'ya bağlanır:

- **Duyurular** sekmesine eklenen her satır sitedeki Duyurular bölümünde görünür.
- Sitedeki başvuru formu doldurulunca **Başvurular** sekmesine yeni satır düşer ve `Kod.gs` içinde tanımlanan adrese bildirim e-postası gelir.

Kurulum bir kez yapılır, yaklaşık 10 dakika sürer.

## 1. Tabloyu oluştur

1. Kulübün Google hesabıyla giriş yap ve tarayıcıda `sheets.new` adresini aç.
2. Tablonun adını **ATACORE Site** yap.

## 2. Betiği ekle

1. Menüden **Uzantılar → Apps Komut Dosyası**'nı aç.
2. Açılan editördeki bütün kodu sil, bu klasördeki `Kod.gs` dosyasının içeriğini yapıştır.
3. Kaydet (disket simgesi ya da Ctrl+S).

## 3. Sekmeleri oluştur

1. Editörün üst kısmındaki fonksiyon listesinden **kurulum**'u seç ve **Çalıştır**'a bas.
2. Google izin isteyecek: **İzinleri incele** → kulüp hesabını seç.
3. "Google bu uygulamayı doğrulamadı" uyarısı çıkarsa **Gelişmiş** → **ATACORE Site (güvenli değil) sayfasına git** → **İzin ver**. Bu uyarı, betiği sen yazdığın için çıkar; normaldir.
4. Tabloya dön: **Duyurular** ve **Başvurular** sekmeleri oluşmuş olmalı.

## 4. Web uygulaması olarak yayınla

1. Apps Komut Dosyası editöründe sağ üstten **Dağıt → Yeni dağıtım**.
2. Tür olarak **Web uygulaması**'nı seç.
3. **Şu kullanıcı olarak çalıştır:** Ben · **Erişimi olanlar:** Herkes
4. **Dağıt**'a bas, çıkan **Web uygulaması URL**'sini kopyala (`https://script.google.com/macros/s/.../exec` ile biter).

## 5. Adresi siteye yaz

`kaynak/index.html` dosyasını bir metin düzenleyiciyle aç, `const CONFIG` bloğunu bul ve URL'yi yapıştır:

```js
appsScriptUrl: 'https://script.google.com/macros/s/.../exec',
```

Kaydet. Site artık duyuruları tablodan okur, başvuruları tabloya yazar.

---

## Duyuru eklemek

**Duyurular** sekmesine yeni bir satır ekle. Site yenilendiğinde görünür; dosyaya dokunmana gerek yok.

| Sütun | Ne yazılır | Örnek |
|---|---|---|
| `tarih` | Etkinlik ya da duyuru tarihi. Saat isteğe bağlı. | `2027-03-12` veya `2027-03-12T18:00` veya `12.03.2027 18:00` |
| `baslik` | Kısa başlık (zorunlu) | `Python Bootcamp 1. hafta` |
| `aciklama` | Bir iki cümle ayrıntı | `Oltu Yerleşkesi bilgisayar laboratuvarı, bilgisayarını getir.` |
| `etiket` | `Etkinlik`, `Yarışma`, `Atölye` ya da `Duyuru` (renk buna göre değişir) | `Atölye` |
| `link` | Buton bağlantısı. `#basvur` başvuru formunu açar; `#kadro` gibi sayfa içi adresler ya da `https://` ile başlayan dış linkler de olur. Boş bırakılabilir. | `https://forms.gle/...` |
| `link_metni` | Butonda yazacak metin | `Kayıt ol` |
| `sabit` | `evet` yazarsan duyuru her zaman en üstte büyük kartta durur | `evet` |
| `yayinda` | `hayır` yazarsan duyuru silinmeden siteden gizlenir | `evet` |

Sıralama: sabitlenenler en üstte, sonra tarihi gelmemiş etkinlikler (en yakını önce), sonra geçmiş duyurular (en yenisi önce).

## Başvuruları takip etmek

Her başvuru **Başvurular** sekmesine yeni satır olarak düşer. Son sütundaki **Durum** (`Yeni`) değerini `Görüşüldü`, `Kabul` vb. olarak değiştirip takip edebilirsiniz. Tabloyu yönetim kuruluyla **Paylaş** butonundan paylaşabilirsin.

Bildirim e-postası almak için `Kod.gs` içindeki `BILDIRIM_EPOSTA` değerine adresinizi yazın; boş bırakılırsa e-posta gönderilmez.

## Dikkat

- `Kod.gs`'de bir şey değiştirirsen **Dağıt → Dağıtımları yönet → düzenle (kalem) → Sürüm: Yeni sürüm → Dağıt** ile yeniden yayınlaman gerekir. Tabloya satır eklemek için buna gerek yok.
- Tablo bağlı değilken ya da tabloya ulaşılamazken site, `index.html` içindeki `DEFAULT_NEWS` duyurusunu gösterir ve başvuruyu e-postayla göndermeyi önerir.
