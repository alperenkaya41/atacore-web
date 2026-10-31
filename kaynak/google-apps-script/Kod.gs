/**
 * ATACORE web sitesi — Google Apps Script arka ucu
 *
 * Bu betik, bağlı olduğu Google E-Tablosu ile siteyi birbirine bağlar:
 *   GET  → "Duyurular" sekmesindeki satırları siteye gönderir
 *   POST → siteden gelen üyelik başvurusunu "Başvurular" sekmesine yazar
 *          ve (isteğe bağlı) kulüp e-postasına bildirim atar.
 *
 * Kurulum adımları: KURULUM.md
 */

const SEKME_DUYURU = 'Duyurular';
const SEKME_BASVURU = 'Başvurular';

// Her yeni başvuruda bildirim gidecek adres. İstemiyorsanız '' yapın.
const BILDIRIM_EPOSTA = ''; // Bildirim gidecek adres, örn. 'kulup@ornek.com' (depoda boş bırakıldı)

const DUYURU_BASLIKLAR = ['tarih', 'baslik', 'aciklama', 'etiket', 'link', 'link_metni', 'sabit', 'yayinda'];
const BASVURU_BASLIKLAR = ['Zaman', 'Ad soyad', 'E-posta', 'Bölüm', 'Sınıf', 'Komite tercihi', 'İlgi alanları', 'Not', 'Durum'];

/** İlk kurulumda bir kez çalıştırın: iki sekmeyi başlıklarıyla oluşturur. */
function kurulum() {
  const ss = SpreadsheetApp.getActive();

  let d = ss.getSheetByName(SEKME_DUYURU);
  if (!d) {
    d = ss.insertSheet(SEKME_DUYURU);
    d.appendRow(DUYURU_BASLIKLAR);
    d.getRange('A:A').setNumberFormat('@'); // tarihleri düz metin olarak tut (2027-03-12 veya 2027-03-12T18:00)
    d.appendRow([
      '2026-10-21', '2026-2027 dönemi üye başvuruları açık',
      'Dört icra komitesine başvurular sürüyor. Hangi komitenin sana uygun olduğunu eşleştiriciyle bul, ardından başvuru formunu doldur.',
      'Duyuru', '#basvur', 'Başvuru formunu aç', 'evet', 'evet'
    ]);
    d.setFrozenRows(1);
    d.getRange(1, 1, 1, DUYURU_BASLIKLAR.length).setFontWeight('bold').setBackground('#0B1F4B').setFontColor('#FFFFFF');
    d.setColumnWidth(2, 280); d.setColumnWidth(3, 420);
  }

  let b = ss.getSheetByName(SEKME_BASVURU);
  if (!b) {
    b = ss.insertSheet(SEKME_BASVURU);
    b.appendRow(BASVURU_BASLIKLAR);
    b.setFrozenRows(1);
    b.getRange(1, 1, 1, BASVURU_BASLIKLAR.length).setFontWeight('bold').setBackground('#0B1F4B').setFontColor('#FFFFFF');
  }
}

/** Site duyuruları okur. */
function doGet() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SEKME_DUYURU);
  if (!sh) return json_({ ok: true, duyurular: [] });

  const values = sh.getDataRange().getValues();
  const head = (values.shift() || []).map(h => String(h).trim().toLowerCase());
  const tz = Session.getScriptTimeZone() || 'Europe/Istanbul';

  const duyurular = values
    .filter(r => r.some(c => String(c).trim() !== ''))
    .map(r => {
      const o = {};
      head.forEach((h, i) => {
        let v = r[i];
        if (v instanceof Date) {
          const saatVar = v.getHours() || v.getMinutes();
          v = Utilities.formatDate(v, tz, saatVar ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd');
        }
        o[h] = String(v == null ? '' : v).trim();
      });
      return o;
    })
    .filter(o => !/^(hay[ıi]r|h|false|0)$/i.test(o.yayinda || ''));

  return json_({ ok: true, duyurular: duyurular });
}

/** Site başvuruyu gönderir. */
function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Spam tuzağı: gerçek kullanıcılar bu alanı hiç görmez
    if (d.website) return json_({ ok: true });

    if (!d.ad || !d.eposta || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.eposta)) {
      return json_({ ok: false, hata: 'Ad ve geçerli e-posta zorunlu.' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      let sh = SpreadsheetApp.getActive().getSheetByName(SEKME_BASVURU);
      if (!sh) { kurulum(); sh = SpreadsheetApp.getActive().getSheetByName(SEKME_BASVURU); }
      sh.appendRow([
        new Date(),
        guvenli_(d.ad), guvenli_(d.eposta), guvenli_(d.bolum), guvenli_(d.sinif),
        guvenli_(d.komite), guvenli_((d.ilgi || []).join(', ')), guvenli_(d.not), 'Yeni'
      ]);
    } finally {
      lock.releaseLock();
    }

    if (BILDIRIM_EPOSTA) {
      MailApp.sendEmail({
        to: BILDIRIM_EPOSTA,
        replyTo: String(d.eposta),
        subject: 'Yeni ATACORE başvurusu: ' + String(d.ad).slice(0, 80),
        body:
          'Ad soyad: ' + d.ad + '\n' +
          'E-posta: ' + d.eposta + '\n' +
          'Bölüm: ' + (d.bolum || '-') + '\n' +
          'Sınıf: ' + (d.sinif || '-') + '\n' +
          'Komite tercihi: ' + (d.komite || '-') + '\n' +
          'İlgi alanları: ' + ((d.ilgi || []).join(', ') || '-') + '\n' +
          'Not: ' + (d.not || '-') + '\n\n' +
          'Tüm başvurular: ' + SpreadsheetApp.getActive().getUrl()
      });
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, hata: String(err) });
  }
}

/* --- yardımcılar --- */
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
// Hücreye formül olarak yorumlanabilecek girdileri (=, +, -, @ ile başlayan) etkisiz hale getirir, uzunluğu sınırlar.
function guvenli_(v) {
  let s = String(v == null ? '' : v).slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
