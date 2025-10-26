# Backend ve Mobile Klasörlerini Getirme Talimatları

## Mac'te Yapılacaklar:

```bash
cd /Users/haydarerkaya/Documents/eyes

# Şu anda claude/fix-metro-package-export branch'indesiniz
# Önceki branch'ten backend ve mobile klasörlerini alın

# 1. Önceki branch'e geçici olarak geçin
git checkout claude/improve-project-appearance-011CUVgDFoAwkQn52bvNXzPy

# 2. Backend ve mobile klasörlerinin olduğunu doğrulayın
ls -la backend/
ls -la mobile/

# 3. Geri kalibrasy branch'ine dönün
git checkout claude/fix-metro-package-export-011CUVwPfC86uR2miwR2Nnws

# 4. Backend ve mobile klasörlerini önceki branch'ten kopyalayın
git checkout claude/improve-project-appearance-011CUVgDFoAwkQn52bvNXzPy -- backend/
git checkout claude/improve-project-appearance-011CUVgDFoAwkQn52bvNXzPy -- mobile/

# 5. Dosyaların geldiğini kontrol edin
ls -la backend/
ls -la mobile/

# 6. Commit edin
git add backend/ mobile/
git commit -m "Merge backend and mobile from previous branch for Expo Go integration"

# 7. Push edin
git push origin claude/fix-metro-package-export-011CUVwPfC86uR2miwR2Nnws

# 8. Bana haber verin, ben de devam edeyim!
```

## Neden Bu Gerekli?

- Backend ve mobile klasörleri `claude/improve-project-appearance-...` branch'inde var
- Kalibrasyon özellikleri `claude/fix-metro-package-export-...` branch'inde var
- İkisini birleştirip Expo Go'da çalışan tam sistem yapacağız

## Sonrası

Siz bu adımları yaptıktan sonra ben:
1. Mobile app'e kalibrasyon ekranını ekleyeceğim
2. Backend'e kalibrasyon kaydetme endpoint'leri ekleyeceğim
3. start-all.sh'ı güncelleyeceğim (AI + Backend + Mobile tek komut)
4. Expo Go'da test edip size hazır hale getireceğim

**Şimdi Mac'te bu komutları çalıştırın!**
