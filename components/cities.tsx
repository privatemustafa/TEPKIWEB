import React from "react";

/**
 * Üç şehir line-art sahnesi. Tüm path'ler `.draw` sınıfını taşır;
 * deneyim katmanı (Experience) bunların getTotalLength değerine göre
 * scroll'a bağlı kademeli çizim (stroke-dashoffset) yapar.
 *
 * viewBox: 0 0 1440 900 — beyaz çizgi, siyah arka plan estetiği.
 */

const VB = "0 0 1440 900";
const stroke = "#f5f5f5";

type SceneProps = { className?: string };

/* ----------------------------- KATMAN 1: SEFAKÖY ----------------------------- */
export function SefakoyScene({ className }: SceneProps) {
  return (
    <svg
      className={className}
      viewBox={VB}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="lamp" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sokak lambası ışık coneleri */}
      <polygon points="250,140 180,720 360,720" fill="url(#lamp)" />
      <polygon points="1120,140 1040,720 1240,720" fill="url(#lamp)" />

      {/* zemin / E-5 yanyol */}
      <path className="draw" d="M0 720 H1440" stroke={stroke} strokeWidth="2.5" />
      <path className="draw" d="M0 760 H1440" stroke={stroke} strokeWidth="1" strokeDasharray="0" opacity="0.5" />
      {/* yol şeritleri */}
      <path className="draw" d="M120 740 h60 M320 740 h60 M520 740 h60 M720 740 h60 M920 740 h60 M1120 740 h60 M1320 740 h60" stroke={stroke} strokeWidth="3" opacity="0.6" />

      {/* sol apartman bloğu */}
      <path className="draw" d="M60 720 V300 H300 V720" stroke={stroke} strokeWidth="2.5" />
      <path className="draw" d="M60 300 L180 230 L300 300" stroke={stroke} strokeWidth="2.5" />
      {/* pencereler + balkon parmaklıkları */}
      <path className="draw" d="M90 350 h50 v60 h-50 z M170 350 h50 v60 h-50 z M250 350 h20 v60 h-20 z M90 450 h50 v60 h-50 z M170 450 h50 v60 h-50 z M90 560 h180 v40 h-180 z" stroke={stroke} strokeWidth="1.6" />
      <path className="draw" d="M90 560 v40 M120 560 v40 M150 560 v40 M180 560 v40 M210 560 v40 M240 560 v40" stroke={stroke} strokeWidth="1" opacity="0.7" />
      {/* çatı su deposu */}
      <path className="draw" d="M120 230 h40 v-30 a20 12 0 0 0 -40 0 z" stroke={stroke} strokeWidth="1.8" />

      {/* orta yüksek apartman */}
      <path className="draw" d="M360 720 V180 H560 V720" stroke={stroke} strokeWidth="2.5" />
      <path className="draw" d="M390 230 h40 v50 h-40 z M470 230 h40 v50 h-40 z M390 320 h40 v50 h-40 z M470 320 h40 v50 h-40 z M390 410 h40 v50 h-40 z M470 410 h40 v50 h-40 z M390 500 h40 v50 h-40 z M470 500 h40 v50 h-40 z" stroke={stroke} strokeWidth="1.6" />

      {/* SOKAK TABELASI — 832 YANYOL */}
      <g>
        <rect className="draw" x="640" y="120" width="300" height="90" rx="6" stroke={stroke} strokeWidth="3" />
        <line className="draw" x1="790" y1="210" x2="790" y2="330" stroke={stroke} strokeWidth="4" />
        <text x="790" y="182" textAnchor="middle" fontFamily="var(--font-display)" fontSize="56" fill={stroke} letterSpacing="4">
          832 YANYOL
        </text>
      </g>

      {/* sağ apartman + market vitrini */}
      <path className="draw" d="M1000 720 V260 H1380 V720" stroke={stroke} strokeWidth="2.5" />
      <path className="draw" d="M1030 320 h60 v60 h-60 z M1130 320 h60 v60 h-60 z M1230 320 h60 v60 h-60 z M1310 320 h50 v60 h-50 z M1030 420 h60 v60 h-60 z M1130 420 h60 v60 h-60 z M1230 420 h60 v60 h-60 z" stroke={stroke} strokeWidth="1.6" />
      {/* market vitrin / tente */}
      <path className="draw" d="M1030 600 h300 v80 h-300 z" stroke={stroke} strokeWidth="2" />
      <path className="draw" d="M1030 600 l-10 -30 h320 l-10 30" stroke={stroke} strokeWidth="2" />
      <text x="1180" y="652" textAnchor="middle" fontFamily="var(--font-display)" fontSize="34" fill={stroke} letterSpacing="3">
        MARKET
      </text>

      {/* dolmuş / araç silueti */}
      <path className="draw" d="M620 720 v-70 q0 -20 20 -20 h40 l30 -40 h120 q15 0 25 20 l20 40 h20 q15 0 15 15 v55 z" stroke={stroke} strokeWidth="2.2" />
      <circle className="draw" cx="680" cy="720" r="26" stroke={stroke} strokeWidth="2.2" />
      <circle className="draw" cx="860" cy="720" r="26" stroke={stroke} strokeWidth="2.2" />
      <path className="draw" d="M700 610 h90 v30 h-110 z" stroke={stroke} strokeWidth="1.6" />

      {/* sokak lambası direkleri */}
      <path className="draw" d="M250 720 V150 M180 150 h140" stroke={stroke} strokeWidth="2.2" />
      <path className="draw" d="M1120 720 V150 M1050 150 h140" stroke={stroke} strokeWidth="2.2" />
    </svg>
  );
}

/* ------------------------------ KATMAN 2: TİFLİS ----------------------------- */
export function TiflisScene({ className }: SceneProps) {
  return (
    <svg
      className={className}
      viewBox={VB}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* tepe / zemin */}
      <path className="draw" d="M0 780 H1440" stroke={stroke} strokeWidth="2.5" />
      <path className="draw" d="M0 600 q200 -120 420 -60 q220 60 420 -20 q260 -80 600 30" stroke={stroke} strokeWidth="1.6" opacity="0.6" />

      {/* Narıkala Kalesi silueti */}
      <path className="draw" d="M120 600 V360 h40 v-40 h40 v40 h40 v-40 h40 v40 h60 V420 h50 v-40 h40 v40 h40 V600" stroke={stroke} strokeWidth="2.4" />
      <path className="draw" d="M180 600 V480 h40 v120 M320 600 V500 h50 v100" stroke={stroke} strokeWidth="1.4" opacity="0.8" />
      {/* kale kulesi */}
      <path className="draw" d="M520 600 V300 h70 v300 M520 300 v-30 h15 v15 h12 v-15 h16 v15 h12 v-15 h15 v30" stroke={stroke} strokeWidth="2.2" />

      {/* güvercin uçuşları */}
      <path className="draw" d="M700 200 q15 -15 30 0 q15 -15 30 0" stroke={stroke} strokeWidth="2" />
      <path className="draw" d="M780 160 q12 -12 24 0 q12 -12 24 0" stroke={stroke} strokeWidth="2" />
      <path className="draw" d="M860 220 q12 -12 24 0 q12 -12 24 0" stroke={stroke} strokeWidth="2" />
      <path className="draw" d="M620 250 q10 -10 20 0 q10 -10 20 0" stroke={stroke} strokeWidth="1.6" />

      {/* kükürtlü hamam kubbeleri */}
      <path className="draw" d="M260 600 V520 a60 60 0 0 1 120 0 V600" stroke={stroke} strokeWidth="2.2" />
      <circle className="draw" cx="320" cy="510" r="8" stroke={stroke} strokeWidth="1.6" />
      <path className="draw" d="M400 600 V540 a45 45 0 0 1 90 0 V600" stroke={stroke} strokeWidth="2.2" />

      {/* ortaçağ kilise minaresi */}
      <path className="draw" d="M980 600 V360 h70 V600 M980 360 l35 -70 l35 70" stroke={stroke} strokeWidth="2.2" />
      <path className="draw" d="M1015 290 V250 M1000 270 h30" stroke={stroke} strokeWidth="2" />
      <path className="draw" d="M1005 420 h40 v50 h-40 z" stroke={stroke} strokeWidth="1.6" />

      {/* Kura Nehri üzerinde Barış Köprüsü */}
      <path className="draw" d="M650 700 q200 -120 460 0" stroke={stroke} strokeWidth="2.4" />
      <path className="draw" d="M650 740 q200 -120 460 0" stroke={stroke} strokeWidth="2.4" />
      <path className="draw" d="M690 712 v18 M760 690 v22 M840 678 v22 M920 678 v22 M1000 690 v22 M1070 712 v18" stroke={stroke} strokeWidth="1.4" opacity="0.8" />
      {/* nehir suyu */}
      <path className="draw" d="M0 800 q120 -16 240 0 q120 16 240 0 q120 -16 240 0 q120 16 240 0 q120 -16 240 0 q120 16 240 0" stroke={stroke} strokeWidth="1.4" opacity="0.5" />

      {/* ahşap balkonlu eski Tiflis evleri (oriel pencereler) */}
      <path className="draw" d="M1140 700 V470 h180 V700" stroke={stroke} strokeWidth="2.2" />
      <path className="draw" d="M1150 560 h160 v60 h-160 z" stroke={stroke} strokeWidth="1.6" />
      <path className="draw" d="M1150 560 v60 M1180 560 v60 M1210 560 v60 M1240 560 v60 M1270 560 v60 M1300 560 v60" stroke={stroke} strokeWidth="1" opacity="0.7" />
      <path className="draw" d="M1170 500 h40 v40 h-40 z M1250 500 h40 v40 h-40 z" stroke={stroke} strokeWidth="1.4" />
    </svg>
  );
}

/* --------------------------- KATMAN 3: BUENOS AIRES -------------------------- */
export function BuenosAiresScene({ className }: SceneProps) {
  return (
    <svg
      className={className}
      viewBox={VB}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* La Boca renkli ev dolguları (line-art'a renk) */}
      <g opacity="0.22">
        <rect x="80" y="430" width="120" height="270" fill="#d64545" />
        <rect x="200" y="400" width="120" height="300" fill="#e0b13a" />
        <rect x="320" y="450" width="120" height="250" fill="#3a86c8" />
        <rect x="440" y="410" width="120" height="290" fill="#46b06a" />
      </g>

      {/* zemin — San Telmo taş kaldırım */}
      <path className="draw" d="M0 700 H1440" stroke={stroke} strokeWidth="2.5" />
      <path className="draw" d="M0 760 q60 -10 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
      <path className="draw" d="M0 820 q60 -10 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" stroke={stroke} strokeWidth="1.2" opacity="0.4" />

      {/* La Boca renkli ahşap evler (Caminito) */}
      <path className="draw" d="M80 700 V430 h120 V700 M200 700 V400 h120 V700 M320 700 V450 h120 V700 M440 700 V410 h120 V700" stroke={stroke} strokeWidth="2.2" />
      <path className="draw" d="M110 470 h60 v50 h-60 z M110 560 h60 v50 h-60 z M230 440 h60 v50 h-60 z M230 540 h60 v50 h-60 z M350 490 h60 v50 h-60 z M470 450 h60 v50 h-60 z M470 550 h60 v50 h-60 z" stroke={stroke} strokeWidth="1.5" />

      {/* Obelisco de Buenos Aires */}
      <path className="draw" d="M720 700 V240 l28 -120 l28 120 V700 Z" stroke={stroke} strokeWidth="2.4" />
      <path className="draw" d="M730 360 h36 M725 500 h46" stroke={stroke} strokeWidth="1.4" opacity="0.7" />

      {/* tango çifti (çizgi figürleri) */}
      <g stroke={stroke} strokeWidth="2.2" strokeLinecap="round">
        {/* erkek */}
        <circle className="draw" cx="980" cy="430" r="16" />
        <path className="draw" d="M980 446 V560 l-26 90 M980 560 l26 80" />
        <path className="draw" d="M980 480 l60 -10" />
        {/* kadın */}
        <circle className="draw" cx="1090" cy="420" r="15" />
        <path className="draw" d="M1090 435 V540 l40 110 M1090 540 l-20 70" />
        <path className="draw" d="M1090 470 l-50 0" />
        {/* kol bağlantısı */}
        <path className="draw" d="M1040 470 q5 -25 50 -50" />
      </g>

      {/* Yerba Mate bardağı */}
      <g stroke={stroke} strokeWidth="2.2">
        <path className="draw" d="M1240 700 q-30 0 -30 -80 q0 -50 50 -50 q50 0 50 50 q0 80 -30 80 Z" />
        <path className="draw" d="M1255 570 v-40 M1245 540 q15 -20 30 0" />
      </g>

      {/* tango notaları / atmosfer */}
      <path className="draw" d="M640 200 q20 -20 0 -40 M660 160 a10 10 0 1 0 0.1 0" stroke={stroke} strokeWidth="2" />
      <path className="draw" d="M1180 200 q20 -20 0 -40 M1200 160 a10 10 0 1 0 0.1 0" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}
