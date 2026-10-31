/**
 * Calculadora Técnica Universal de Presiones, Tiempos y Fugas de Ensayo
 * Sistema Universal de Control de Calidad y Gestión de Válvulas
 * 
 * Basada en estándares internacionales:
 * - API 598 (Valve Inspection and Testing - 10th Ed)
 * - ASME B16.34 (Valves - Flanged, Threaded, and Welding End)
 * - ISO 5208 (Industrial valves - Pressure testing of metallic valves)
 * - NCh 700 / NCh 699 (Válvulas de compuerta e hidráulicas según norma chilena)
 * - MSS-SP-81 (Válvulas de guillotina para minería y celulosa)
 */

import React, { useState, useMemo } from 'react';
import { 
  Gauge, 
  Clock, 
  ShieldCheck, 
  ArrowRightLeft, 
  Sliders, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface UniversalCalculatorViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  openNewValveModal?: () => void;
}

// Clases de presión ASME estándar y su presión de trabajo frío aprox (CWP a temp ambiente, en psi y bar)
const ASME_CLASSES: Record<string, { cwpPsi: number; cwpBar: number; desc: string }> = {
  '150': { cwpPsi: 285, cwpBar: 19.6, desc: 'Clase 150 (PN 20) - Baja presión / Servicios generales' },
  '300': { cwpPsi: 740, cwpBar: 51.1, desc: 'Clase 300 (PN 50) - Media presión / Vapor y proceso' },
  '600': { cwpPsi: 1480, cwpBar: 102.1, desc: 'Clase 600 (PN 100) - Alta presión / Minería y gasoductos' },
  '900': { cwpPsi: 2220, cwpBar: 153.2, desc: 'Clase 900 (PN 150) - Inyección y vapor supercrítico' },
  '1500': { cwpPsi: 3705, cwpBar: 255.3, desc: 'Clase 1500 (PN 250) - Severo / Petróleo y líneas de alta carga' },
  '2500': { cwpPsi: 6170, cwpBar: 425.5, desc: 'Clase 2500 (PN 420) - Servicios ultra críticos' },
  'PN10': { cwpPsi: 145, cwpBar: 10.0, desc: 'DIN/ISO PN 10 (10 bar) - Redes de agua y efluentes' },
  'PN16': { cwpPsi: 232, cwpBar: 16.0, desc: 'DIN/ISO PN 16 (16 bar) - Sanitarias y pulpa' },
  'PN25': { cwpPsi: 362, cwpBar: 25.0, desc: 'DIN/ISO PN 25 (25 bar) - Minería y bombeo' },
  'PN40': { cwpPsi: 580, cwpBar: 40.0, desc: 'DIN/ISO PN 40 (40 bar) - Líneas industriales de vapor' }
};

// Rango de diámetros comunes
const VALVE_SIZES = [
  { nps: '0.5"', dn: 15, label: '1/2" (DN 15)' },
  { nps: '0.75"', dn: 20, label: '3/4" (DN 20)' },
  { nps: '1"', dn: 25, label: '1" (DN 25)' },
  { nps: '1.5"', dn: 40, label: '1-1/2" (DN 40)' },
  { nps: '2"', dn: 50, label: '2" (DN 50)' },
  { nps: '2.5"', dn: 65, label: '2-1/2" (DN 65)' },
  { nps: '3"', dn: 80, label: '3" (DN 80)' },
  { nps: '4"', dn: 100, label: '4" (DN 100)' },
  { nps: '6"', dn: 150, label: '6" (DN 150)' },
  { nps: '8"', dn: 200, label: '8" (DN 200)' },
  { nps: '10"', dn: 250, label: '10" (DN 250)' },
  { nps: '12"', dn: 300, label: '12" (DN 300)' },
  { nps: '14"', dn: 350, label: '14" (DN 350)' },
  { nps: '16"', dn: 400, label: '16" (DN 400)' },
  { nps: '18"', dn: 450, label: '18" (DN 450)' },
  { nps: '20"', dn: 500, label: '20" (DN 500)' },
  { nps: '24"', dn: 600, label: '24" (DN 600)' },
  { nps: '30"', dn: 750, label: '30" (DN 750)' },
  { nps: '36"', dn: 900, label: '36" (DN 900)' }
];

export const UniversalCalculatorView: React.FC<UniversalCalculatorViewProps> = ({ 
  setActiveTab,
  openNewValveModal 
}) => {
  // Estado de la Calculadora de Pruebas
  const [selectedClass, setSelectedClass] = useState<string>('150');
  const [customCwpPsi, setCustomCwpPsi] = useState<number>(285);
  const [useCustomCwp, setUseCustomCwp] = useState<boolean>(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(4); // default 2" (DN 50)
  const [selectedValveType, setSelectedValveType] = useState<string>('Compuerta (Gate)');
  const [seatMaterial, setSeatMaterial] = useState<'SOFT' | 'METAL'>('SOFT');
  const [standard, setStandard] = useState<'API 598' | 'ISO 5208' | 'NCh 700' | 'MSS-SP-81'>('API 598');

  // Estado del Conversor de Unidades
  const [convPressureVal, setConvPressureVal] = useState<number>(10);
  const [convPressureUnit, setConvPressureUnit] = useState<'bar' | 'psi' | 'kpa' | 'mpa' | 'kgcm2'>('bar');

  const [convFlowVal, setConvFlowVal] = useState<number>(100);
  const [convFlowUnit, setConvFlowUnit] = useState<'cv' | 'kv'>('cv');

  // Sincronizar presión base al cambiar clase
  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    if (!useCustomCwp) {
      setCustomCwpPsi(ASME_CLASSES[cls]?.cwpPsi || 285);
    }
  };

  // Diámetro actual
  const currentSize = VALVE_SIZES[selectedSizeIndex] || VALVE_SIZES[4];

  // Presión CWP efectiva en PSI y BAR
  const effectiveCwpPsi = useCustomCwp ? customCwpPsi : (ASME_CLASSES[selectedClass]?.cwpPsi || 285);
  const effectiveCwpBar = effectiveCwpPsi / 14.5038;

  // Cálculos de Presión según API 598 / ISO 5208 / ASME B16.34:
  // 1. Shell (Cuerpo): 1.5 × CWP (agua con inhibidor a temp ambiente)
  const shellPressurePsi = Math.round(effectiveCwpPsi * 1.5);
  const shellPressureBar = Number((effectiveCwpBar * 1.5).toFixed(1));

  // 2. High Pressure Closure / Seat (Asiento alta presión): 1.1 × CWP
  const seatHpPressurePsi = Math.round(effectiveCwpPsi * 1.1);
  const seatHpPressureBar = Number((effectiveCwpBar * 1.1).toFixed(1));

  // 3. Low Pressure Closure / Seat (Asiento baja presión aire/gas): 60 - 100 psi (estándar 80 psi / 5.5 - 6 bar)
  const seatLpPressurePsi = 80;
  const seatLpPressureBar = 5.5;

  // 4. Backseat Test (si aplica a compuerta/globo): 1.1 × CWP
  const backseatPressurePsi = Math.round(effectiveCwpPsi * 1.1);
  const backseatPressureBar = Number((effectiveCwpBar * 1.1).toFixed(1));

  // Tiempos mínimos de sostenimiento de presión según API 598 (segundos)
  const testDurations = useMemo(() => {
    const dn = currentSize.dn;
    let shellSec = 15;
    let backseatSec = 15;
    let seatClosureSec = 15;

    if (dn <= 50) { // NPS <= 2"
      shellSec = 15;
      backseatSec = 15;
      seatClosureSec = 15;
    } else if (dn <= 150) { // 2.5" <= NPS <= 6"
      shellSec = 60;
      backseatSec = 60;
      seatClosureSec = 60;
    } else if (dn <= 300) { // 8" <= NPS <= 12"
      shellSec = 120;
      backseatSec = 60;
      seatClosureSec = 120;
    } else { // NPS >= 14"
      shellSec = 300;
      backseatSec = 60;
      seatClosureSec = 120;
    }

    return { shellSec, backseatSec, seatClosureSec };
  }, [currentSize.dn]);

  // Criterio de Fuga Admisible según Norma
  const allowableLeakage = useMemo(() => {
    if (seatMaterial === 'SOFT') {
      return {
        rate: 'Rate A (Cero Fuga Visible)',
        desc: 'Para asientos blandos (PTFE, RPTFE, EPDM, NBR, Viton, Peek): No se admite ninguna gota ni burbuja durante el tiempo total del ensayo (API 598 / ISO 5208 Rate A).'
      };
    }

    // Metal-Metal según tamaño
    const dn = currentSize.dn;
    if (standard === 'API 598') {
      const dropsPerMin = dn <= 50 ? 0 : dn <= 150 ? 12 : dn <= 300 ? 20 : 28;
      const gasBubbles = dn <= 50 ? 24 : dn <= 150 ? 40 : 60;
      return {
        rate: `API 598 Metal-Metal: Máx ${dropsPerMin} gotas/min (Líquido) o ${gasBubbles} burbujas/min (Aire)`,
        desc: `Para válvulas de compuerta, globo o bola con asiento metálico en DN ${dn}. Si es válvula de retención (check), se admite hasta ${dropsPerMin * 2} gotas/min.`
      };
    } else if (standard === 'ISO 5208') {
      return {
        rate: 'ISO 5208 Rate B / Rate C',
        desc: `Tolerancia de fuga proporcional al diámetro: Rate B = 0.01 × DN mm³/s líquido. Rate C = 0.03 × DN mm³/s.`
      };
    } else {
      return {
        rate: 'Cero Fuga según NCh / MSS-SP-81',
        desc: 'En redes de agua y pulpa se exige hermeticidad según especificación técnica de proyecto.'
      };
    }
  }, [seatMaterial, standard, currentSize.dn]);

  // Conversiones de Presión
  const pressureConversions = useMemo(() => {
    let inBar = 0;
    switch (convPressureUnit) {
      case 'bar': inBar = convPressureVal; break;
      case 'psi': inBar = convPressureVal / 14.5038; break;
      case 'kpa': inBar = convPressureVal / 100; break;
      case 'mpa': inBar = convPressureVal * 10; break;
      case 'kgcm2': inBar = convPressureVal * 0.980665; break;
    }

    return {
      bar: Number(inBar.toFixed(3)),
      psi: Number((inBar * 14.5038).toFixed(2)),
      kpa: Number((inBar * 100).toFixed(1)),
      mpa: Number((inBar / 10).toFixed(4)),
      kgcm2: Number((inBar / 0.980665).toFixed(3))
    };
  }, [convPressureVal, convPressureUnit]);

  // Conversiones de Caudal (Cv / Kv)
  const flowConversions = useMemo(() => {
    if (convFlowUnit === 'cv') {
      const kv = convFlowVal / 1.156;
      return { cv: convFlowVal, kv: Number(kv.toFixed(2)) };
    } else {
      const cv = convFlowVal * 1.156;
      return { cv: Number(cv.toFixed(2)), kv: convFlowVal };
    }
  }, [convFlowVal, convFlowUnit]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* ============================================================== */}
      {/* 1. HERO HEADER DE LA CALCULADORA UNIVERSAL */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>MÓDULO DE INGENIERÍA & MEJORAS TÉCNICAS UNIVERSALES</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Calculadora Universal de Presiones y Tiempos de Ensayo de Válvulas
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
            Herramienta técnica universal para determinar los parámetros exactos de pruebas hidrostáticas y neumáticas 
            según las normas <strong>API 598 (10ª Edición)</strong>, <strong>ASME B16.34</strong>, <strong>ISO 5208</strong> y <strong>NCh 700 / 699</strong>. 
            Aplica a cualquier tipo de válvula (Compuerta, Globo, Bola, Mariposa, Retención, Guillotina, Macho y PSV) para todas las industrias.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shell: 1.5× CWP</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Seat HP: 1.1× CWP</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Seat LP: 6 bar / 80 psi Aire</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Tiempos de retención por NPS</span>
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. PANEL PRINCIPAL DE CÁLCULO INTERACTIVO */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: PARÁMETROS DE LA VÁLVULA (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Parámetros de la Válvula</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              CONFIGURADOR
            </span>
          </div>

          {/* Tipo de Válvula */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Válvula:
            </label>
            <select
              aria-label="Tipo de Válvula"
              value={selectedValveType}
              onChange={(e) => setSelectedValveType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Compuerta (Gate)">Compuerta (Gate Valve) - API 600 / API 602 / NCh 700</option>
              <option value="Globo (Globe)">Globo (Globe Valve) - API 623 / ASME B16.34</option>
              <option value="Bola Flotante / Trunnion (Ball)">Bola (Ball Valve) - API 608 / API 6D</option>
              <option value="Mariposa Concéntrica / Triple Excéntrica">Mariposa (Butterfly) - API 609 Cat A/B</option>
              <option value="Retención / Check (Swing / Piston / Dual Plate)">Retención / Check (Swing / Dual Plate) - API 594</option>
              <option value="Guillotina / Knife Gate (Minería)">Guillotina / Cuchillo (Knife Gate) - MSS-SP-81</option>
              <option value="Macho / Plug Valve">Macho (Plug Valve) - API 599</option>
              <option value="Seguridad y Alivio (PSV / PRV)">Seguridad y Alivio (PSV) - API 526 / API 527</option>
              <option value="Diafragma (Sanitaria / Corrosivos)">Diafragma (Sanitary / Chemical)</option>
            </select>
          </div>

          {/* Diámetro Nominal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Diámetro Nominal (NPS / DN):
              </label>
              <span className="text-xs font-mono font-bold text-blue-400">
                {currentSize.label}
              </span>
            </div>
            <select
              aria-label="Diámetro Nominal"
              value={selectedSizeIndex}
              onChange={(e) => setSelectedSizeIndex(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-mono"
            >
              {VALVE_SIZES.map((sz, idx) => (
                <option key={idx} value={idx}>{sz.label}</option>
              ))}
            </select>
          </div>

          {/* Clase de Presión */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Clase de Presión / Rating:
              </label>
              <span className="text-[11px] font-mono text-emerald-400">
                CWP: {effectiveCwpPsi} psi ({effectiveCwpBar.toFixed(1)} bar)
              </span>
            </div>
            <select
              aria-label="Clase de Presión"
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={useCustomCwp}
              className={`w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer ${
                useCustomCwp ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {Object.entries(ASME_CLASSES).map(([clsKey, clsInfo]) => (
                <option key={clsKey} value={clsKey}>{clsInfo.desc}</option>
              ))}
            </select>
          </div>

          {/* Opción CWP Personalizado */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomCwp}
                  onChange={(e) => setUseCustomCwp(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Especificar CWP / Presión de Diseño Manual</span>
              </label>
            </div>

            {useCustomCwp && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">CWP (psi):</span>
                  <input
                    type="number"
                    value={customCwpPsi}
                    onChange={(e) => setCustomCwpPsi(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">CWP (bar aprox):</span>
                  <input
                    type="number"
                    disabled
                    value={(customCwpPsi / 14.5038).toFixed(1)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Asiento */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Material del Asiento de Cierre:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSeatMaterial('SOFT')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
                  seatMaterial === 'SOFT'
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Blando / Resiliente (Soft)</span>
                <span className="text-[10px] opacity-80 font-normal">PTFE, EPDM, NBR (Cero Fuga)</span>
              </button>
              <button
                type="button"
                onClick={() => setSeatMaterial('METAL')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
                  seatMaterial === 'METAL'
                    ? 'bg-blue-950/70 border-blue-500/50 text-blue-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Metálico (Metal-to-Metal)</span>
                <span className="text-[10px] opacity-80 font-normal">Stellite, Inconel, Inox</span>
              </button>
            </div>
          </div>

          {/* Norma de Ensayo Aplicable */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Norma de Inspección & Ensayos:
            </label>
            <select
              aria-label="Norma de Inspección"
              value={standard}
              onChange={(e) => setStandard(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
            >
              <option value="API 598">API 598 (Valve Inspection and Testing - 10th Ed)</option>
              <option value="ISO 5208">ISO 5208 (Industrial valves - Metallic pressure tests)</option>
              <option value="NCh 700">NCh 700 / NCh 699 (Norma Chilena Obras Hidráulicas)</option>
              <option value="MSS-SP-81">MSS-SP-81 (Knife Gate Valves - Minería / Celulosa)</option>
            </select>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS DE INGENIERÍA CALCULADOS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Tarjeta Resumen de Presiones Calculadas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Gauge className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Protocolo Oficial de Ensayos ({standard})
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                {currentSize.label} • {selectedClass}
              </span>
            </div>

            {/* Grilla de Presiones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* 1. SHELL TEST */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    1. CUERPO (SHELL)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">1.5× CWP</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    {shellPressurePsi} <span className="text-xs font-normal text-slate-400">psi</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {shellPressureBar} <span className="text-xs font-normal text-slate-300">bar</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Tiempo mín:</span>
                  </span>
                  <strong className="text-white font-mono">{testDurations.shellSec} seg</strong>
                </div>
              </div>

              {/* 2. SEAT HIGH PRESSURE */}
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    2. ASIENTO ALTA
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">1.1× CWP</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    {seatHpPressurePsi} <span className="text-xs font-normal text-slate-400">psi</span>
                  </div>
                  <div className="text-sm font-bold text-blue-400 font-mono">
                    {seatHpPressureBar} <span className="text-xs font-normal text-slate-300">bar</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Tiempo mín:</span>
                  </span>
                  <strong className="text-white font-mono">{testDurations.seatClosureSec} seg</strong>
                </div>
              </div>

              {/* 3. SEAT LOW PRESSURE */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    3. ASIENTO BAJA
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Aire / N2</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    {seatLpPressurePsi} <span className="text-xs font-normal text-slate-400">psi</span>
                  </div>
                  <div className="text-sm font-bold text-amber-400 font-mono">
                    {seatLpPressureBar} <span className="text-xs font-normal text-slate-300">bar</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Tiempo mín:</span>
                  </span>
                  <strong className="text-white font-mono">{testDurations.seatClosureSec} seg</strong>
                </div>
              </div>
            </div>

            {/* Backseat si aplica */}
            {(selectedValveType.includes('Compuerta') || selectedValveType.includes('Globo')) && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">
                    <strong>Prueba de Asiento Trasero (Backseat Test):</strong> 1.1× CWP = {backseatPressurePsi} psi ({backseatPressureBar} bar)
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">Sostenimiento: {testDurations.backseatSec} seg</span>
              </div>
            )}

            {/* Fuga Máxima Admisible */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Criterio de Aceptación de Fuga en Asiento:
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                  {allowableLeakage.rate}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                {allowableLeakage.desc}
              </p>
            </div>

            {/* Acción: Contactar a Jorge Ferrada para asesoría en banco */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                ¿Necesitas calibrar tu banco de pruebas o validar este procedimiento con la ITO?
              </p>
              <button
                onClick={() => setActiveTab('support')}
                className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Consultar con Jorge Ferrada (WSP 933331425)</span>
              </button>
            </div>
          </div>

          {/* Tabla Resumen de Tiempos Mínimos según API 598 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Tabla Oficial de Tiempos de Retención de Presión (API 598)</span>
            </h4>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">Tamaño de Válvula (NPS)</th>
                    <th className="py-2 px-3">Cuerpo (Shell)</th>
                    <th className="py-2 px-3">Backseat</th>
                    <th className="py-2 px-3">Cierre / Asiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  <tr className={currentSize.dn <= 50 ? 'bg-blue-900/30 font-bold text-white' : ''}>
                    <td className="py-2 px-3">≤ 2" (DN 50)</td>
                    <td className="py-2 px-3">15 s</td>
                    <td className="py-2 px-3">15 s</td>
                    <td className="py-2 px-3">15 s</td>
                  </tr>
                  <tr className={currentSize.dn > 50 && currentSize.dn <= 150 ? 'bg-blue-900/30 font-bold text-white' : ''}>
                    <td className="py-2 px-3">2-1/2" a 6" (DN 65 - 150)</td>
                    <td className="py-2 px-3">60 s</td>
                    <td className="py-2 px-3">60 s</td>
                    <td className="py-2 px-3">60 s</td>
                  </tr>
                  <tr className={currentSize.dn > 150 && currentSize.dn <= 300 ? 'bg-blue-900/30 font-bold text-white' : ''}>
                    <td className="py-2 px-3">8" a 12" (DN 200 - 300)</td>
                    <td className="py-2 px-3">120 s</td>
                    <td className="py-2 px-3">60 s</td>
                    <td className="py-2 px-3">120 s</td>
                  </tr>
                  <tr className={currentSize.dn > 300 ? 'bg-blue-900/30 font-bold text-white' : ''}>
                    <td className="py-2 px-3">≥ 14" (DN 350+)</td>
                    <td className="py-2 px-3">300 s (5 min)</td>
                    <td className="py-2 px-3">60 s</td>
                    <td className="py-2 px-3">120 s (2 min)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CONVERSOR TÉCNICO UNIVERSAL DE UNIDADES */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Conversor Técnico Universal de Unidades de Válvulas
            </h2>
            <p className="text-xs text-slate-400">
              Conversión instantánea bidireccional entre sistemas Métrico, Imperial y ASME para taller y terreno
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CONVERSOR DE PRESIÓN */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>Conversión de Presión</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Exactitud industrial</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Valor a convertir:</label>
                <input
                  type="number"
                  value={convPressureVal}
                  onChange={(e) => setConvPressureVal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Unidad base:</label>
                <select
                  aria-label="Unidad base de presión"
                  value={convPressureUnit}
                  onChange={(e) => setConvPressureUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                >
                  <option value="bar">Bar (bar)</option>
                  <option value="psi">Libras / pulg² (PSI)</option>
                  <option value="kpa">Kilopascales (kPa)</option>
                  <option value="mpa">Megapascales (MPa)</option>
                  <option value="kgcm2">kg/cm² (Atm Técnica)</option>
                </select>
              </div>
            </div>

            {/* Resultados equivalentes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">BAR:</span>
                <span className="text-sm font-bold text-emerald-400">{pressureConversions.bar}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">PSI:</span>
                <span className="text-sm font-bold text-blue-400">{pressureConversions.psi}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">KPA:</span>
                <span className="text-sm font-bold text-amber-400">{pressureConversions.kpa}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">MPA:</span>
                <span className="text-sm font-bold text-purple-400">{pressureConversions.mpa}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block">KG/CM²:</span>
                <span className="text-sm font-bold text-teal-400">{pressureConversions.kgcm2}</span>
              </div>
            </div>
          </div>

          {/* CONVERSOR DE CAUDAL / COEFICIENTE DE FLUJO (Cv / Kv) */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Coeficiente de Flujo (Cv ⇄ Kv)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Cv = 1.156 × Kv</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Valor:</label>
                <input
                  type="number"
                  value={convFlowVal}
                  onChange={(e) => setConvFlowVal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Unidad:</label>
                <select
                  aria-label="Unidad de coeficiente de flujo"
                  value={convFlowUnit}
                  onChange={(e) => setConvFlowUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
                >
                  <option value="cv">Cv (US gpm @ 1 psi ΔP)</option>
                  <option value="kv">Kv (m³/h @ 1 bar ΔP)</option>
                </select>
              </div>
            </div>

            {/* Resultados Cv / Kv */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/30">
                <span className="text-[10px] text-slate-400 block">COEFICIENTE Cv (US):</span>
                <span className="text-lg font-black text-blue-400">{flowConversions.cv}</span>
                <span className="text-[10px] text-slate-500 block mt-1">GPM a 60°F con ΔP 1 psi</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
                <span className="text-[10px] text-slate-400 block">COEFICIENTE Kv (Métrico):</span>
                <span className="text-lg font-black text-emerald-400">{flowConversions.kv}</span>
                <span className="text-[10px] text-slate-500 block mt-1">m³/h de 5-30°C con ΔP 1 bar</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              El coeficiente de flujo determina la capacidad hidráulica de la válvula para dimensionamiento de bombas, cálculo de pérdidas de carga y balanceo de líneas.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. BANNER DE SOPORTE JORGE FERRADA */}
      {/* ============================================================== */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-400 font-mono">ASESORÍA OFICIAL</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-300">Jorge Ferrada (WSP: 933331425)</span>
          </div>
          <h3 className="text-base font-bold text-white">¿Tienes requerimientos especiales de prueba para faena minera o sanitaria?</h3>
          <p className="text-xs text-slate-400">
            Jorge Ferrada entrega asesoría técnica en dimensionamiento, inspección en fábrica y homologación de protocolos.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('support')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ir a Soporte & Contacto WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
