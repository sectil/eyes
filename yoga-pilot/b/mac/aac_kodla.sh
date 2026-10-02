#!/bin/bash
# Nefona Yoga · onaylı karışımların uygulama dosyasına kodlanması (SPEC.v3 §14.4). Sahibin Mac'inde.
# BU ORTAMDA DENENMEDİ. BIT: kodek testinin sonucu (64000 ya da 96000).
# Kullanım:  BIT=64000 bash aac_kodla.sh <ana_kopya_klasoru> <cikti_klasoru>
#   ana kopya adları: yoga-dNN-MMdk.wav ve yardımcılar (SPEC.v3 §10); çıktı: aynı ad .m4a + çözülmüş .dec.wav + .afinfo.txt
set -euo pipefail
BIT="${BIT:?BIT=64000 ya da BIT=96000}"
IN="${1:?ana kopya klasörü}"; OUT="${2:?çıktı klasörü}"
mkdir -p "$OUT/_olcum"
for W in "$IN"/yoga-*.wav; do
  b=$(basename "$W" .wav)
  afconvert -f m4af -d aac@44100 -b "$BIT" -s 0 -q 127 "$W" "$OUT/$b.m4a"
  afinfo "$OUT/$b.m4a" > "$OUT/_olcum/$b.afinfo.txt"
  # yeniden ölçüm için çözülmüş kopya (konum, tık, gerçek tepe, yükseklik; SPEC.v3 §12–13)
  afconvert -f WAVE -d LEF32@44100 "$OUT/$b.m4a" "$OUT/_olcum/$b.dec.wav"
done
shasum -a 256 "$OUT"/*.m4a > "$OUT/_olcum/m4a.sha256"
ls -l "$OUT"/*.m4a
