#!/bin/bash
# Nefona Yoga · kodek testi (SPEC.v3 §14). Sahibin Mac'inde çalışır; afconvert ve afinfo macOS ile gelir.
# BU ORTAMDA DENENMEDİ (Linux; afconvert yok). İlk çalıştırmada çıktı dosyaları afinfo ile denetlenir.
#
# Girdi klasörü (render ortamında hazırlanır, SPEC.v3 §14.2):
#   parca1.wav parca2.wav parca3.wav   44,1 kHz stereo ana kopya kesitleri (WAV, kodlanmamış)
#   parca1.mp3 parca2.mp3 parca3.mp3   aynı kesitlerin pilot biçimi (MP3 ABR 120, render ortamında kodlanır)
# Kullanım:  bash kodek_testi.sh <girdi_klasoru> [cikti_klasoru]
set -euo pipefail
IN="${1:?girdi klasörü}"
OUT="${2:-$IN/kodek_testi}"
mkdir -p "$OUT/_anahtar" "$OUT/dinle"
: > "$OUT/_anahtar/anahtar.txt"
for n in 1 2 3; do
  W="$IN/parca$n.wav"; M="$IN/parca$n.mp3"
  [ -f "$W" ] && [ -f "$M" ] || { echo "eksik: parca$n.wav ya da parca$n.mp3" >&2; exit 1; }
  # 1) AAC-LC 64 ve 96 kbit/sn, sabit bit hızı (-s 0), en yüksek kodlayıcı kalitesi (-q 127), 44,1 kHz, m4a kabı
  afconvert -f m4af -d aac@44100 -b 64000 -s 0 -q 127 "$W" "$OUT/_anahtar/parca$n.aac64.m4a"
  afconvert -f m4af -d aac@44100 -b 96000 -s 0 -q 127 "$W" "$OUT/_anahtar/parca$n.aac96.m4a"
  afinfo "$OUT/_anahtar/parca$n.aac64.m4a" > "$OUT/_anahtar/parca$n.aac64.afinfo.txt"
  afinfo "$OUT/_anahtar/parca$n.aac96.m4a" > "$OUT/_anahtar/parca$n.aac96.afinfo.txt"
  # 2) Kör dinleme için üç adayın hepsi aynı kaba çözülür (24 bit WAV): uzantı ve boyut adayı ele vermez
  afconvert -f WAVE -d LEI24@44100 "$M" "$OUT/_anahtar/parca$n.mp3.dec.wav"
  afconvert -f WAVE -d LEI24@44100 "$OUT/_anahtar/parca$n.aac64.m4a" "$OUT/_anahtar/parca$n.aac64.dec.wav"
  afconvert -f WAVE -d LEI24@44100 "$OUT/_anahtar/parca$n.aac96.m4a" "$OUT/_anahtar/parca$n.aac96.dec.wav"
  # 3) Rastgele harf: her kesitte ayrı karıştırma; anahtar _anahtar/ içinde kalır, dinlemeden önce açılmaz
  c=(mp3 aac64 aac96)
  for i in 2 1; do j=$((RANDOM % (i + 1))); t=${c[$i]}; c[$i]=${c[$j]}; c[$j]=$t; done
  L=(A B C)
  for k in 0 1 2; do
    cp "$OUT/_anahtar/parca$n.${c[$k]}.dec.wav" "$OUT/dinle/parca$n-${L[$k]}.wav"
    echo "parca$n-${L[$k]} = ${c[$k]}" >> "$OUT/_anahtar/anahtar.txt"
  done
done
shasum -a 256 "$OUT"/dinle/*.wav > "$OUT/_anahtar/dinle.sha256"
echo "Hazır: $OUT/dinle (9 dosya). Anahtar: $OUT/_anahtar/anahtar.txt (dinlemeden önce açma)."
