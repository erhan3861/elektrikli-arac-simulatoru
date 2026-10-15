# EV Lab · Elektrikli Araç Simülatörü

Elektrik-Elektronik Teknolojisi meslek lisesi öğrencileri için 3B elektrikli araç dersi ve simülatörü. Tarayıcıda çalışır, kurulum gerektirmez.

**Canlı:** https://erhan3861.github.io/elektrikli-arac-simulatoru/

## Modlar

| Sekme | Ne yapar |
|---|---|
| Keşfet | 8 parçaya dokun, kısa kart ve sesli anlatım |
| Ders | 10 adımda güç akışı: batarya → inverter → motor, rejeneratif fren, şarj, güvenlik |
| Güç Akışı | Gaz/fren pedalı, gerilim-akım-güç-frekans, 3 faz osiloskop, şarj kablosu |
| Ölçüm | Sanal avometre (V⎓, V~, Ω) ve HV eldiven kuralı |
| Arıza | Rastgele arıza senaryosu, ölçerek bul ve onayla |
| Test | 10 soruluk karışık test (parçaya tıkla + çoktan seçmeli) |

## Bağlantı parametreleri

- `?nointro` giriş ekranını atlar
- `?mode=lesson` belirli sekmeyle açar (`explore, lesson, flow, measure, fault, quiz`)
- `?solid` gövdeyi opak başlatır

## Teknoloji

Three.js 0.165 (ES modül, CDN), tek sayfa, bağımlılık kurulumu yok. Dosyalar: `index.html`, `style.css`, `app.js`, `data.js` (ders metinleri ve sorular).
