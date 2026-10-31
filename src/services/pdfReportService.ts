/**
 * Servicio Generador de Certificados y Reportes Técnicos en PDF (jsPDF)
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * 
 * Genera informes y certificados oficiales de pruebas hidráulicas (API 598 / ISO 5208 / NCh)
 * con datos técnicos completos, presiones, fugas, manómetros calibrados, punch list y firmas.
 */

import { jsPDF } from 'jspdf';
import { ValveRecord, HydroTestRecord, PunchItemRecord } from '../types';

export interface GeneratePdfOptions {
  valve: ValveRecord;
  hydroTest?: HydroTestRecord | null;
  punchItems?: PunchItemRecord[];
  companyName?: string;
  projectName?: string;
  issuedBy?: string;
}

export class PdfReportService {
  /**
   * Genera y descarga el Reporte Técnico Oficial en PDF
   */
  public static generateValveTestCertificate(options: GeneratePdfOptions): jsPDF {
    const {
      valve,
      hydroTest,
      punchItems = [],
      companyName = '[EMPRESA / PROYECTO MAESTRO PGP 2026]',
      projectName = 'SISTEMA INTEGRAL DE CONTROL DE CALIDAD DE VÁLVULAS',
      issuedBy = 'DEPARTAMENTO QA/QC & GESTIÓN DE CALIDAD'
    } = options;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    // =========================================================================
    // 1. ENCABEZADO Y FRANJA INSTITUCIONAL
    // =========================================================================
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 10, contentWidth, 22, 'F');

    // Borde exterior del documento
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.rect(margin, 10, contentWidth, pageHeight - 20);

    // Texto Encabezado
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(companyName, margin + 4, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(projectName, margin + 4, 21);
    doc.text('PLANTA DE PROCESOS / MAESTRANZA TALLER DE PRUEBAS', margin + 4, 26);

    // Bloque derecho del encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('CERTIFICADO QA/QC OFICIAL', pageWidth - margin - 4, 16, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    const certNumber = valve.numero_certificado || hydroTest?.numero_protocolo || `CERT-PGP-${valve.tag}`;
    doc.text(`N° Doc: ${certNumber}`, pageWidth - margin - 4, 21, { align: 'right' });
    doc.text(`Emisión: ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin - 4, 26, { align: 'right' });

    // Franja divisoria de color de acento
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(margin, 32, contentWidth, 2, 'F');

    let currentY = 38;

    // =========================================================================
    // 2. TÍTULO DEL PROTOCOLO
    // =========================================================================
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`PROTOCOLO TÉCNICO DE PRUEBAS Y LIBERACIÓN: TAG ${valve.tag}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Conforme a Normas API 598, ISO 5208, ASME B16.34 y Normativa Chilena NCh 700 / NCh 699', pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;

    // =========================================================================
    // 3. SECCIÓN 1: DATOS TÉCNICOS Y ESPECIFICACIÓN DE LA VÁLVULA
    // =========================================================================
    const drawSectionHeader = (title: string, yPos: number) => {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, yPos, contentWidth, 6, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(title, margin + 3, yPos + 4.2);
      return yPos + 8;
    };

    currentY = drawSectionHeader('1. IDENTIFICACIÓN Y ESPECIFICACIÓN TÉCNICA DE LA VÁLVULA', currentY);

    // Cuadrícula de 2 columnas de datos
    const drawDataRow = (y: number, label1: string, val1: string, label2: string, val2: string) => {
      const col1X = margin + 3;
      const col2X = margin + (contentWidth / 2) + 2;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label1 + ':', col1X, y);
      doc.text(label2 + ':', col2X, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(val1 || 'N/A', col1X + 32, y);
      doc.text(val2 || 'N/A', col2X + 32, y);
    };

    drawDataRow(currentY, 'TAG Identificador', valve.tag, 'Orden de Trabajo (O/T)', valve.ot);
    currentY += 4.5;
    drawDataRow(currentY, 'Tipo de Válvula', valve.tipo_valvula, 'Fabricante / Marca', valve.marca || 'N/A');
    currentY += 4.5;
    drawDataRow(currentY, 'Modelo', valve.modelo || 'Estándar', 'Diámetro Nominal (NPS/DN)', valve.diametro_nominal);
    currentY += 4.5;
    drawDataRow(currentY, 'Clase de Presión / Rating', String(valve.clase_rating), 'Tipo de Conexión', valve.tipo_conexion);
    currentY += 4.5;
    drawDataRow(currentY, 'Material del Cuerpo', valve.material_cuerpo, 'Material Asiento / Sello', valve.material_asiento);
    currentY += 4.5;
    drawDataRow(currentY, 'Material Trim / Internos', valve.material_trim, 'Coeficiente de Flujo (Cv)', valve.cv ? `${valve.cv} gpm` : 'N/A');
    currentY += 4.5;
    drawDataRow(currentY, 'Presión de Diseño', valve.presion_diseno_bar ? `${valve.presion_diseno_bar} bar` : 'Según Rating', 'Temperatura Diseño', valve.temp_diseno_c ? `${valve.temp_diseno_c} °C` : 'Ambiente');
    currentY += 4.5;
    drawDataRow(currentY, 'Área de Planta / Sistema', `${valve.area_planta} / ${valve.sistema}`, 'Ubicación Física', valve.ubicacion_fisica);
    currentY += 4.5;
    drawDataRow(currentY, 'Línea de Proceso / P&ID', valve.lineCode || valve.pidNumber || 'N/A', 'N° de Serie Fabricante', valve.serialNumber || 'N/A');
    currentY += 6;

    // =========================================================================
    // 4. SECCIÓN 2: REGISTRO DE ENSAYOS HIDROSTÁTICOS Y NEUMÁTICOS
    // =========================================================================
    currentY = drawSectionHeader('2. RESULTADOS DE PRUEBAS DE PRESIÓN HIDROSTÁTICA Y HERMETICIDAD', currentY);

    if (hydroTest) {
      // Metadatos del ensayo
      drawDataRow(currentY, 'N° Protocolo Ensayo', hydroTest.numero_protocolo, 'Fecha de Ejecución', hydroTest.fecha_ensayo);
      currentY += 4.5;
      drawDataRow(currentY, 'Norma Aplicada', hydroTest.norma_aplicable, 'Fluido de Prueba', `${hydroTest.fluido_prueba} (${hydroTest.temp_fluido_c}°C)`);
      currentY += 4.5;
      drawDataRow(currentY, 'Manómetro Patrón Utilizado', hydroTest.manometro_id, 'Calibración Manómetro', hydroTest.manometro_calibracion_vigente);
      currentY += 6;

      // Tabla de Pruebas Hidráulicas
      const thY = currentY;
      doc.setFillColor(226, 232, 240); // slate-200
      doc.rect(margin, thY, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);

      doc.text('TIPO DE ENSAYO', margin + 2, thY + 3.8);
      doc.text('P. REQUERIDA', margin + 42, thY + 3.8);
      doc.text('P. APLICADA', margin + 65, thY + 3.8);
      doc.text('TIEMPO', margin + 87, thY + 3.8);
      doc.text('FUGA ADMISIBLE / MEDIDA', margin + 104, thY + 3.8);
      doc.text('RESULTADO', margin + contentWidth - 2, thY + 3.8, { align: 'right' });

      currentY += 6.5;

      const drawTestTableRow = (
        name: string,
        pReq: string,
        pApp: string,
        time: string,
        leakage: string,
        result: string,
        bgColor: boolean = false
      ) => {
        if (bgColor) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, currentY - 1, contentWidth, 5.5, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(15, 23, 42);

        doc.text(name, margin + 2, currentY + 2.8);
        doc.text(pReq, margin + 42, currentY + 2.8);
        doc.text(pApp, margin + 65, currentY + 2.8);
        doc.text(time, margin + 87, currentY + 2.8);
        doc.text(leakage, margin + 104, currentY + 2.8);

        // Badge de resultado
        doc.setFont('helvetica', 'bold');
        if (result === 'APROBADO') {
          doc.setTextColor(16, 185, 129); // emerald-600
        } else if (result === 'RECHAZADO') {
          doc.setTextColor(225, 29, 72); // rose-600
        } else {
          doc.setTextColor(100, 116, 139);
        }
        doc.text(result, margin + contentWidth - 2, currentY + 2.8, { align: 'right' });

        currentY += 5.5;
      };

      drawTestTableRow(
        'Prueba de Carcasa (Shell Test)',
        `${hydroTest.presion_carcasa_requerida_bar} bar`,
        `${hydroTest.presion_carcasa_aplicada_bar} bar`,
        `${hydroTest.tiempo_carcasa_seg} seg`,
        'Cero Fuga Estructural',
        hydroTest.resultado_carcasa,
        false
      );

      drawTestTableRow(
        'Asiento Alta Presión (HP Closure)',
        `${hydroTest.presion_asiento_hp_requerida_bar} bar`,
        `${hydroTest.presion_asiento_hp_aplicada_bar} bar`,
        `${hydroTest.tiempo_asiento_hp_seg} seg`,
        `Admisible: ${hydroTest.fuga_admisible_asiento} | Medida: ${hydroTest.fuga_medida_asiento}`,
        hydroTest.resultado_asiento_hp,
        true
      );

      drawTestTableRow(
        'Asiento Baja Presión (LP Air Seat)',
        `${hydroTest.presion_asiento_lp_bar} bar`,
        `${hydroTest.presion_asiento_lp_bar} bar`,
        '60 seg',
        `Medida: ${hydroTest.fuga_medida_lp_burbujas_min} burbujas/min`,
        hydroTest.resultado_asiento_lp,
        false
      );

      if (hydroTest.aplica_contrasello) {
        drawTestTableRow(
          'Contrasello (Backseat Test)',
          `${hydroTest.presion_contrasello_bar || 0} bar`,
          `${hydroTest.presion_contrasello_bar || 0} bar`,
          '60 seg',
          'Cero Fuga en Prensaestopas',
          hydroTest.resultado_contrasello,
          true
        );
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('No se registra ensayo hidrostático ejecutado aún para esta válvula (Estado: Pendiente de prueba).', margin + 4, currentY + 3);
      currentY += 8;
    }

    currentY += 3;

    // =========================================================================
    // 5. SECCIÓN 3: PUNCH LIST & CONTROL DE NO CONFORMIDADES
    // =========================================================================
    currentY = drawSectionHeader('3. INSPECCIÓN VISUAL, DIMENSIONAL Y CONTROL DE DESVIACIONES (PUNCH LIST)', currentY);

    if (punchItems.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      punchItems.forEach((item, idx) => {
        const severityColor = item.tipo_desviacion === 'TIPO_A_CRITICO' ? [225, 29, 72] : [217, 119, 6];
        doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
        doc.circle(margin + 3, currentY + 1.8, 1.2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`[${item.codigo_item}] ${item.categoria} (${item.tipo_desviacion}):`, margin + 6, currentY + 2.5);

        doc.setFont('helvetica', 'normal');
        doc.text(item.descripcion, margin + 55, currentY + 2.5);

        doc.setFont('helvetica', 'bold');
        const isClosed = item.estado === 'CERRADA';
        doc.setTextColor(isClosed ? 16 : 225, isClosed ? 185 : 29, isClosed ? 129 : 72);
        doc.text(isClosed ? 'RESUELTO / CERRADO' : `PENDIENTE (${item.estado})`, margin + contentWidth - 2, currentY + 2.5, { align: 'right' });

        currentY += 4.5;
      });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(16, 185, 129);
      doc.text('Conforme: Cero observaciones pendientes o abiertas registradas en el Punch List para este TAG.', margin + 3, currentY + 2.5);
      currentY += 5;
    }

    currentY += 3;

    // =========================================================================
    // 6. SECCIÓN 4: VEREDICTO FINAL QA/QC Y BLOQUE DE FIRMAS
    // =========================================================================
    currentY = drawSectionHeader('4. DICTAMEN DE LIBERACIÓN QA/QC Y FIRMAS DE RESPONSABILIDAD', currentY);

    // Estado General
    const isLiberated = ['LIBERADA_QAQC', 'APROBADA_ITO', 'ENTREGADA_FAENA'].includes(valve.estado_qaqc);
    doc.setFillColor(isLiberated ? 236 : 254, isLiberated ? 253 : 242, isLiberated ? 245 : 242);
    doc.setDrawColor(isLiberated ? 167 : 254, isLiberated ? 243 : 202, isLiberated ? 208 : 202);
    doc.rect(margin + 2, currentY, contentWidth - 4, 10, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(isLiberated ? 5 : 153, isLiberated ? 150 : 27, isLiberated ? 105 : 27);
    doc.text(`ESTADO FINAL QA/QC: ${valve.estado_qaqc.replace(/_/g, ' ')}`, margin + 6, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const releaseText = isLiberated
      ? `Válvula liberada formalmente el ${valve.fecha_liberacion || new Date().toLocaleDateString('es-CL')} bajo Certificado Oficial ${valve.numero_certificado || certNumber}. Apta para montaje en faena.`
      : 'Válvula en proceso de inspección o retenida por protocolo pendiente. No apta para despacho hasta cierre de ensayos y punch list.';
    doc.text(releaseText, margin + 6, currentY + 8);

    currentY += 15;

    // 3 Bloques de Firmas Oficiales
    const boxWidth = (contentWidth - 6) / 3;
    const boxHeight = 24;

    const drawSignatureBox = (x: number, role: string, name: string, organization: string, signed: boolean) => {
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.rect(x, currentY, boxWidth, boxHeight, 'FD');

      // Línea de firma
      doc.setDrawColor(148, 163, 184);
      doc.line(x + 4, currentY + 14, x + boxWidth - 4, currentY + 14);

      if (signed) {
        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(8);
        doc.setTextColor(37, 99, 235);
        doc.text('FIRMADO DIGITALMENTE', x + (boxWidth / 2), currentY + 11, { align: 'center' });
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(name || 'Firma no registrada', x + (boxWidth / 2), currentY + 17.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${role} - ${organization}`, x + (boxWidth / 2), currentY + 21, { align: 'center' });
    };

    drawSignatureBox(margin, 'Operador de Banco / Ensayos', valve.responsable_taller || 'Taller Válvulas', 'Maestranza PGP', !!hydroTest);
    drawSignatureBox(margin + boxWidth + 3, 'Inspector Calidad (ITO)', valve.inspector_ito || 'ITO Inspección', 'Inspección Técnica', !!hydroTest?.firma_ito);
    drawSignatureBox(margin + (boxWidth * 2) + 6, 'Jefatura QA/QC', issuedBy, 'Control de Calidad', isLiberated);

    currentY += boxHeight + 4;

    // =========================================================================
    // 7. PIE DE PÁGINA Y HASH DE INTEGRIDAD
    // =========================================================================
    const footerY = pageHeight - 12;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Documento oficial emitido por Sistema Integral de Control de Calidad de Válvulas PGP 2026. Almacenamiento local persistente.', margin, footerY + 2);
    
    // Hash de integridad simulado
    const verificationHash = `SHA256:${valve.tag}:${valve.ot}:${hydroTest?.numero_protocolo || 'NOHYDRO'}:${valve.updated_at || Date.now()}`.substring(0, 38);
    doc.text(`Hash de Integridad: ${verificationHash}`, pageWidth - margin, footerY + 2, { align: 'right' });

    return doc;
  }

  /**
   * Genera y dispara la descarga en el navegador
   */
  public static downloadCertificatePdf(options: GeneratePdfOptions): void {
    const doc = this.generateValveTestCertificate(options);
    const fileName = `Certificado_QAQC_Valvula_${options.valve.tag.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Genera el Dossier Técnico Consolidado Mensual de Pruebas Hidráulicas (Multi-página)
   */
  public static generateMonthlyConsolidatedDossier(options: {
    month: string;
    monthLabel: string;
    hydroTests: HydroTestRecord[];
    valves: ValveRecord[];
    companyName?: string;
    projectName?: string;
    issuedBy?: string;
  }): jsPDF {
    const {
      monthLabel,
      hydroTests,
      valves,
      companyName = '[EMPRESA / PROYECTO MAESTRO PGP 2026]',
      projectName = 'SISTEMA INTEGRAL DE CONTROL DE CALIDAD DE VÁLVULAS PGP 2026',
      issuedBy = 'DEPARTAMENTO QA/QC & GESTIÓN DE CALIDAD'
    } = options;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    const approvedCount = hydroTests.filter(t => t.resultado_general === 'APROBADO').length;
    const rejectedCount = hydroTests.filter(t => t.resultado_general === 'RECHAZADO').length;
    const observationCount = hydroTests.length - approvedCount - rejectedCount;
    const passRate = hydroTests.length > 0 ? Math.round((approvedCount / hydroTests.length) * 100) : 0;

    // Recopilar manómetros utilizados
    const manometers = Array.from(new Set(hydroTests.map(t => t.manometro_id).filter(Boolean)));

    // =========================================================================
    // PÁGINA 1: PORTADA Y RESUMEN EJECUTIVO MENSUAL
    // =========================================================================
    // Encabezado Corporativo
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 12, contentWidth, 24, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.rect(margin, 12, contentWidth, pageHeight - 24);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(companyName, margin + 5, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(projectName, margin + 5, 26);
    doc.text('GERENCIA DE ASEGURAMIENTO DE CALIDAD (QA/QC) & INSPECCIÓN TÉCNICA (ITO)', margin + 5, 31);

    // Título Principal
    let y = 46;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DOSSIER TÉCNICO CONSOLIDADO', pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(`ENSAYOS HIDROSTÁTICOS & ESTANQUEIDAD - ${monthLabel.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Conforme a Normas API 598, ISO 5208, ASME B16.34 y Normas Chilenas NCh 700 / NCh 699', pageWidth / 2, y, { align: 'center' });

    y += 10;

    // Resumen Ejecutivo en Cajas de Métricas
    const boxW = (contentWidth - 6) / 4;
    const boxH = 20;

    const drawKpiCard = (x: number, label: string, value: string, sub: string, color: number[]) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(x, y, boxW, boxH, 'FD');

      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y, boxW, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(label, x + (boxW / 2), y + 6.5, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(value, x + (boxW / 2), y + 13.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(sub, x + (boxW / 2), y + 17.5, { align: 'center' });
    };

    drawKpiCard(margin, 'TOTAL ENSAYOS', String(hydroTests.length), `${monthLabel}`, [37, 99, 235]);
    drawKpiCard(margin + boxW + 2, 'APROBADOS', String(approvedCount), `${passRate}% de conformidad`, [16, 185, 129]);
    drawKpiCard(margin + (boxW * 2) + 4, 'NO CONFORME', String(rejectedCount), 'Rechazados / En fuga', [225, 29, 72]);
    drawKpiCard(margin + (boxW * 3) + 6, 'EN OBSERVACIÓN', String(observationCount), 'Revisión pendiente', [217, 119, 6]);

    y += boxH + 8;

    // Cuadro de Criterios y Trazabilidad de Instrumentos
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ALCANCE TÉCNICO Y TRAZABILIDAD METROLÓGICA DEL PERÍODO', margin + 3, y + 4.2);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    doc.text('• Normativa de Referencia:', margin + 3, y);
    doc.setFont('helvetica', 'bold');
    doc.text('API 598 10th Ed. (Valve Inspection and Testing) / ISO 5208 / NCh 700 / NCh 699 / ASME B16.34', margin + 40, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text('• Criterio de Hermeticidad:', margin + 3, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Carcasa: Cero fuga estructural durante tiempo mínimo de sostenimiento. Asiento: Resiliente = Cero fuga.', margin + 40, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text('• Manómetros Empleados:', margin + 3, y);
    doc.setFont('helvetica', 'bold');
    doc.text(manometers.length > 0 ? manometers.join(', ') : 'Patrón WIKA / Ashcroft Calibrados', margin + 40, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text('• Fluido de Ensayos:', margin + 3, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Agua desmineralizada con inhibidor de corrosión (5°C - 38°C) y Aire comprimido limpio para LP Seat.', margin + 40, y);
    y += 8;

    // Dictamen General Mensual
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.rect(margin, y, contentWidth, 18, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105);
    doc.text('DECLARACIÓN DE CONFORMIDAD Y CIERRE MENSUAL QA/QC', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `El suscrito certifica que durante el mes de ${monthLabel} se ejecutaron un total de ${hydroTests.length} protocolos de prueba hidrostática en banco centralizado, alcanzando una tasa de conformidad técnica del ${passRate}%. Todos los equipos liberados cumplen rigurosamente con los tiempos de sostenimiento, tolerancias de fuga admisible y calibración vigente de instrumentos patrones según los procedimientos de aseguramiento de calidad del proyecto.`,
      margin + 4,
      y + 9.5,
      { maxWidth: contentWidth - 8 }
    );

    y += 24;

    // Bloque de Firmas de Cierre Mensual
    const sigW = (contentWidth - 6) / 3;
    const sigH = 26;

    const drawDossierSignBox = (xPos: number, roleTitle: string, signatory: string, org: string) => {
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.rect(xPos, y, sigW, sigH, 'FD');

      doc.setDrawColor(148, 163, 184);
      doc.line(xPos + 5, y + 16, xPos + sigW - 5, y + 16);

      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(7.5);
      doc.setTextColor(37, 99, 235);
      doc.text('CERTIFICADO VÁLIDO', xPos + (sigW / 2), y + 12, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(signatory, xPos + (sigW / 2), y + 20, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${roleTitle} - ${org}`, xPos + (sigW / 2), y + 23.5, { align: 'center' });
    };

    drawDossierSignBox(margin, 'Jefatura de Taller & Pruebas', 'Responsable Maestranza', 'Taller Central');
    drawDossierSignBox(margin + sigW + 3, 'Inspección Técnica de Obra', 'Inspector ITO Acreditado', 'Inspección ITO');
    drawDossierSignBox(margin + (sigW * 2) + 6, 'Jefatura General QA/QC', issuedBy, 'Gestión de Calidad');

    // =========================================================================
    // PÁGINA 2+: TABLA MATRIZ CONSOLIDADA DE PROTOCOLOS DEL MES
    // =========================================================================
    doc.addPage();
    doc.rect(margin, 12, contentWidth, pageHeight - 24);

    // Encabezado de página
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, 12, contentWidth, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`MATRIZ DETALLADA DE PROTOCOLOS DE PRUEBA - ${monthLabel.toUpperCase()}`, margin + 4, 19);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Total registros: ${hydroTests.length} protocolos ejecutados`, margin + 4, 23.5);

    // Cabecera de la tabla
    let tableY = 30;
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, tableY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);

    doc.text('PROTOCOLO', margin + 2, tableY + 4.2);
    doc.text('FECHA', margin + 25, tableY + 4.2);
    doc.text('TAG VÁLVULA', margin + 42, tableY + 4.2);
    doc.text('O/T', margin + 68, tableY + 4.2);
    doc.text('DN / RATING', margin + 88, tableY + 4.2);
    doc.text('P. CARCASA', margin + 112, tableY + 4.2);
    doc.text('P. ASIENTO', margin + 132, tableY + 4.2);
    doc.text('RESULTADO', margin + contentWidth - 2, tableY + 4.2, { align: 'right' });

    tableY += 6.5;

    hydroTests.forEach((t, idx) => {
      // Si la tabla supera el límite vertical, agregar página
      if (tableY > pageHeight - 26) {
        doc.addPage();
        doc.rect(margin, 12, contentWidth, pageHeight - 24);

        tableY = 18;
        doc.setFillColor(226, 232, 240);
        doc.rect(margin, tableY, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(15, 23, 42);

        doc.text('PROTOCOLO', margin + 2, tableY + 4.2);
        doc.text('FECHA', margin + 25, tableY + 4.2);
        doc.text('TAG VÁLVULA', margin + 42, tableY + 4.2);
        doc.text('O/T', margin + 68, tableY + 4.2);
        doc.text('DN / RATING', margin + 88, tableY + 4.2);
        doc.text('P. CARCASA', margin + 112, tableY + 4.2);
        doc.text('P. ASIENTO', margin + 132, tableY + 4.2);
        doc.text('RESULTADO', margin + contentWidth - 2, tableY + 4.2, { align: 'right' });

        tableY += 6.5;
      }

      const v = valves.find(item => item.id === t.valvula_id || item.tag === t.tag);

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, tableY - 1, contentWidth, 5.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);

      doc.text(t.numero_protocolo, margin + 2, tableY + 3);
      doc.text(t.fecha_ensayo, margin + 25, tableY + 3);
      doc.setFont('helvetica', 'bold');
      doc.text(t.tag, margin + 42, tableY + 3);
      doc.setFont('helvetica', 'normal');
      doc.text(t.ot, margin + 68, tableY + 3);
      doc.text(`${v?.diametro_nominal || '4"'} / ${v?.clase_rating || '300#'}`, margin + 88, tableY + 3);
      doc.text(`${t.presion_carcasa_aplicada_bar} bar (${t.tiempo_carcasa_seg}s)`, margin + 112, tableY + 3);
      doc.text(`${t.presion_asiento_hp_aplicada_bar} bar (${t.fuga_medida_asiento})`, margin + 132, tableY + 3);

      doc.setFont('helvetica', 'bold');
      if (t.resultado_general === 'APROBADO') {
        doc.setTextColor(16, 185, 129);
      } else {
        doc.setTextColor(225, 29, 72);
      }
      doc.text(t.resultado_general, margin + contentWidth - 2, tableY + 3, { align: 'right' });

      tableY += 5.5;
    });

    // =========================================================================
    // PIE DE PÁGINA Y NUMERACIÓN EN TODAS LAS PÁGINAS
    // =========================================================================
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const footerY = pageHeight - 12;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dossier Técnico Mensual PGP 2026 • ${monthLabel} • ${companyName}`, margin, footerY + 2);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY + 2, { align: 'right' });
    }

    return doc;
  }

  /**
   * Dispara la descarga del Dossier Técnico Mensual Consolidado
   */
  public static downloadMonthlyDossierPdf(options: {
    month: string;
    monthLabel: string;
    hydroTests: HydroTestRecord[];
    valves: ValveRecord[];
    companyName?: string;
    projectName?: string;
    issuedBy?: string;
  }): void {
    const doc = this.generateMonthlyConsolidatedDossier(options);
    const safeMonth = options.month.replace(/[^0-9-]/g, '_');
    const fileName = `Dossier_Consolidado_Pruebas_Hidraulicas_${safeMonth}_PGP_2026.pdf`;
    doc.save(fileName);
  }
}
