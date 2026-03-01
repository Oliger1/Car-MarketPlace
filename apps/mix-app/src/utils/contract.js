/**
 * Gjenero kontratë rezervimi si PDF duke printuar HTML
 * Nuk kërkon asnjë library — përdor window.print()
 */

export function generateContract(booking, car, customer, company) {
  const fmtDate = d => d ? new Date(d).toLocaleDateString('sq-AL', { day:'2-digit', month:'long', year:'numeric' }) : '—'
  const fmtMoney = (v, c='EUR') => v ? `${parseFloat(v).toLocaleString('sq-AL', { minimumFractionDigits:2 })} ${c}` : '—'
  const days = booking?.date_from && booking?.date_to
    ? Math.ceil((new Date(booking.date_to) - new Date(booking.date_from)) / (1000*86400))
    : 0

  const contractNo = `MIX-${String(booking?.id || '').slice(0,8).toUpperCase()}`
  const today = new Date().toLocaleDateString('sq-AL', { day:'2-digit', month:'long', year:'numeric' })

  const html = `
<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8" />
  <title>Kontratë Qiraje — ${contractNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', serif; color: #1a1a1a; background: white; font-size: 11pt; line-height: 1.6; }
    .page { max-width: 210mm; margin: 0 auto; padding: 20mm 18mm; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2.5px solid #1a1a1a; }
    .company-name { font-size: 22pt; font-weight: 800; letter-spacing: -.5px; }
    .contract-info { text-align: right; }
    .contract-no { font-size: 13pt; font-weight: 700; }
    .contract-date { font-size: 9pt; color: #555; margin-top: 4px; }

    /* Title */
    .title { text-align: center; margin: 28px 0; }
    .title h1 { font-size: 16pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .title p { font-size: 9pt; color: #666; margin-top: 4px; }

    /* Sections */
    .section { margin-bottom: 24px; }
    .section-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #333; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }

    /* Grid */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

    /* Field */
    .field { margin-bottom: 8px; }
    .field-label { font-size: 8pt; text-transform: uppercase; letter-spacing: .5px; color: #777; margin-bottom: 2px; }
    .field-value { font-size: 10.5pt; font-weight: 500; padding: 4px 0; border-bottom: 1px solid #e5e5e5; }

    /* Highlight box */
    .highlight { background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin-bottom: 20px; }
    .price-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 10.5pt; }
    .price-row.total { border-top: 1.5px solid #1a1a1a; margin-top: 8px; padding-top: 12px; font-size: 13pt; font-weight: 700; }

    /* Terms */
    .terms { font-size: 9pt; color: #555; line-height: 1.7; }
    .terms h4 { font-size: 9.5pt; font-weight: 700; color: #333; margin: 12px 0 4px; }
    .terms ol { padding-left: 18px; }
    .terms li { margin-bottom: 4px; }

    /* Signatures */
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 40px; }
    .sig-block { }
    .sig-label { font-size: 9pt; text-transform: uppercase; letter-spacing: .5px; color: #777; margin-bottom: 50px; }
    .sig-line { border-top: 1px solid #333; padding-top: 6px; font-size: 9pt; }
    .sig-name { font-weight: 600; font-size: 10pt; }

    /* Footer */
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; text-align: center; font-size: 8pt; color: #999; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 12mm 14mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Print button (hidden on print) -->
  <div class="no-print" style="text-align:right; margin-bottom:20px;">
    <button onclick="window.print()" style="background:#1a1a1a; color:white; border:none; padding:10px 24px; border-radius:6px; font-size:13px; cursor:pointer; font-weight:600;">
      🖨️ Printo / Ruaj PDF
    </button>
    <button onclick="window.close()" style="background:#f0f0f0; color:#333; border:none; padding:10px 18px; border-radius:6px; font-size:13px; cursor:pointer; margin-left:8px;">
      Mbyll
    </button>
  </div>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">${company?.name || 'Kompania'}</div>
      <div style="font-size:9pt; color:#666; margin-top:4px;">${company?.city || ''} ${company?.phone ? '· Tel: ' + company.phone : ''}</div>
    </div>
    <div class="contract-info">
      <div class="contract-no">Nr. ${contractNo}</div>
      <div class="contract-date">Datë: ${today}</div>
    </div>
  </div>

  <!-- Title -->
  <div class="title">
    <h1>Kontratë Qiraje Automjeti</h1>
    <p>Kjo kontratë është lidhur ndërmjet palëve të mëposhtme</p>
  </div>

  <!-- Parties -->
  <div class="grid-2" style="margin-bottom:24px;">
    <div class="section">
      <div class="section-title">Qiradhënësi</div>
      <div class="field"><div class="field-label">Kompania</div><div class="field-value">${company?.name || '—'}</div></div>
      <div class="field"><div class="field-label">Qyteti</div><div class="field-value">${company?.city || '—'}</div></div>
      <div class="field"><div class="field-label">Telefon</div><div class="field-value">${company?.phone || '—'}</div></div>
    </div>
    <div class="section">
      <div class="section-title">Qiramarrësi</div>
      <div class="field"><div class="field-label">Emri</div><div class="field-value">${customer?.name || '—'}</div></div>
      <div class="field"><div class="field-label">Telefon</div><div class="field-value">${customer?.phone || '—'}</div></div>
      <div class="field"><div class="field-label">Nr. ID / Pasaportë</div><div class="field-value">${customer?.id_number || '—'}</div></div>
    </div>
  </div>

  <!-- Vehicle -->
  <div class="section">
    <div class="section-title">Automjeti</div>
    <div class="grid-3">
      <div class="field"><div class="field-label">Emërtimi</div><div class="field-value">${car?.title || '—'}</div></div>
      <div class="field"><div class="field-label">Marka / Modeli</div><div class="field-value">${car?.make || ''} ${car?.model || ''}</div></div>
      <div class="field"><div class="field-label">Viti i prodhimit</div><div class="field-value">${car?.year || '—'}</div></div>
      <div class="field"><div class="field-label">Karburanti</div><div class="field-value">${car?.fuel || '—'}</div></div>
      <div class="field"><div class="field-label">Transmisioni</div><div class="field-value">${car?.transmission || '—'}</div></div>
      <div class="field"><div class="field-label">Vendndodhja</div><div class="field-value">${car?.location_text || company?.city || '—'}</div></div>
    </div>
  </div>

  <!-- Period & Price -->
  <div class="section">
    <div class="section-title">Periudha dhe Çmimi</div>
    <div class="grid-2" style="margin-bottom:16px;">
      <div class="field"><div class="field-label">Data e fillimit</div><div class="field-value" style="font-size:12pt; font-weight:700;">${fmtDate(booking?.date_from)}</div></div>
      <div class="field"><div class="field-label">Data e mbarimit</div><div class="field-value" style="font-size:12pt; font-weight:700;">${fmtDate(booking?.date_to)}</div></div>
    </div>
    <div class="highlight">
      <div class="price-row"><span>Numri i ditëve</span><span style="font-weight:600;">${days} ditë</span></div>
      <div class="price-row"><span>Çmimi për ditë</span><span>${fmtMoney(car?.price_per_day, booking?.currency)}</span></div>
      <div class="price-row total"><span>TOTALI</span><span>${fmtMoney(booking?.price_total, booking?.currency)}</span></div>
      ${booking?.deposit_amount ? `<div class="price-row" style="font-size:9pt; color:#666;"><span>Depozitë (e kthyeshme)</span><span>${fmtMoney(booking?.deposit_amount, booking?.currency)}</span></div>` : ''}
    </div>
  </div>

  ${booking?.notes ? `
  <div class="section">
    <div class="section-title">Shënime</div>
    <div style="background:#f8f8f8; border-radius:4px; padding:10px 14px; font-size:10pt; color:#555;">${booking.notes}</div>
  </div>` : ''}

  <!-- Terms -->
  <div class="section">
    <div class="section-title">Kushtet e Qirasë</div>
    <div class="terms">
      <ol>
        <li>Qiramarrësi merr automjetin në gjendje të mirë dhe obligohet ta kthejë në të njëjtën gjendje.</li>
        <li>Qiramarrësi është përgjegjës për çdo dëmtim që ndodh gjatë periudhës së qirasë.</li>
        <li>Karburanti duhet të jetë i njëjtë si në momentin e marrjes së automjetit.</li>
        <li>Ndalohet rreptësisht pirja e duhanit brenda automjetit.</li>
        <li>Automjeti mund të përdoret vetëm brenda territorit të lejuar.</li>
        <li>Çdo aksident duhet të raportohet menjëherë te qiradhënësi.</li>
        <li>Depozita kthehet brenda 3 ditëve pune pas kthimit të automjetit, nëse nuk ka dëmtime.</li>
        <li>Vonesa në kthim të automjetit tarifon ditë shtesë sipas çmimit ditor të kontratës.</li>
      </ol>
    </div>
  </div>

  <!-- Signatures -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-label">Nënshkrimi i Qiradhënësit</div>
      <div class="sig-line">
        <div class="sig-name">${company?.name || '—'}</div>
        <div style="font-size:9pt; color:#777; margin-top:2px;">Data: _______________</div>
      </div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Nënshkrimi i Qiramarrësit</div>
      <div class="sig-line">
        <div class="sig-name">${customer?.name || '—'}</div>
        <div style="font-size:9pt; color:#777; margin-top:2px;">Data: _______________</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    Gjeneruar nga platforma Mix · ${today} · Nr. Kontratës: ${contractNo}
  </div>

</div>
</body>
</html>`

  // Open in new window and print
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
  win.focus()
}
