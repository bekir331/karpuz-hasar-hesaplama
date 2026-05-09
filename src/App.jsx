import React, { useState } from 'react';
import './App.css';
import FruitYieldCalculator from './FruitYieldCalculator';

function App() {
  const [activePage, setActivePage] = useState('watermelon'); // 'watermelon' or 'fruit'
  const [policeInfo, setPoliceInfo] = useState({
    policeNo: '', adSoyad: '', eksper: '', tarih: '', gelismeEvresi: '', cesit: '',
    policeVerimi: '', sigortaliAlan: '', hasarliAlan: '', hasarOraniAlan: ''
  });

  // Tablo 1: Verim Tespiti (Yeni Form)
  // a: Sıra Arası, b: Sıra Üzeri, e: 10 Bitkide Meyve Sayısı, g: Ort. Ağırlık, iH: Hasat Edilen Meyve Sayısı, iA: Alınabilecek Meyve Sayısı
  const [tablo1, setTablo1] = useState(Array(7).fill({ a: '', b: '', e: '', g: '', iH: '', iA: '' }));

  // Tablo 2: Hasar Tespiti (J, R, S, n1..n4)
  const [tablo2, setTablo2] = useState(Array(7).fill({ j: '', r: '', s: '', n1: '', n2: '', n3: '', n4: '' }));

  // Tablo 3: Yaprak Hasarı (U) KALDIRILDI, tek bir state eklendi
  const [yaprakHasari, setYaprakHasari] = useState('');

  const [eksperAciklama, setEksperAciklama] = useState('');

  const n = (v) => {
    if (v === '' || v === undefined || v === null) return 0;
    if (typeof v === 'string') {
      const normalized = v.replace(',', '.');
      const num = parseFloat(normalized);
      return isNaN(num) ? 0 : num;
    }
    return parseFloat(v) || 0;
  };

  // İnsan gibi hesaplama fonksiyonları (Küsuratı yuvarlamak yerine kesip atma / düz hesap)
  const trunc2 = (num) => Math.floor(num * 100 + 0.00001) / 100;
  const trunc0 = (num) => Math.floor(num + 0.00001);
  const round2 = (num) => Math.round(num * 100) / 100;

  const calculateTableAvg2 = (rows, resultKey, inputKeys) => {
    const validRows = rows.filter(r => inputKeys.some(key => r[key] !== ''));
    if (validRows.length === 0) return 0;
    const sum = validRows.reduce((acc, r) => acc + n(r[resultKey]), 0);
    return trunc2(sum / validRows.length);
  };

  const calculateTableAvg0 = (rows, resultKey, inputKeys) => {
    const validRows = rows.filter(r => inputKeys.some(key => r[key] !== ''));
    if (validRows.length === 0) return 0;
    const sum = validRows.reduce((acc, r) => acc + n(r[resultKey]), 0);
    return trunc0(sum / validRows.length);
  };

  // Tablo 1 Hesaplamaları (Verim Tespiti) - İnsan gibi tam sayıya kesme
  const t1Rows = tablo1.map(r => {
    const C = (n(r.a) > 0 && n(r.b) > 0) ? Math.round(1000 / (n(r.a) * n(r.b))) : 0;
    const D = trunc0((C * n(r.e) * n(r.g)) / 10);
    const F = trunc0((C * n(r.g) * n(r.iH)) / 10);
    const V = trunc0((C * n(r.g) * n(r.iA)) / 10);
    return { ...r, cVal: C, d: D, f: F, v: V };
  });

  const dOrt = calculateTableAvg0(t1Rows, 'd', ['a', 'b', 'e', 'g']);
  const fOrt = calculateTableAvg0(t1Rows, 'f', ['a', 'b', 'g', 'iH']);
  const vOrt = calculateTableAvg0(t1Rows, 'v', ['a', 'b', 'g', 'iA']);

  // Tablo 2 Hesaplamaları (Hasar Tespiti) - İnsan gibi küsuratı 2 hanede kesme
  const t2Rows = tablo2.map(r => {
    const p = n(r.j) * 10;
    const t = n(r.r) > 0 ? trunc2((n(r.s) * 100) / n(r.r)) : 0;
    const totalN = n(r.n1) + n(r.n2) + n(r.n3) + n(r.n4);
    const y = totalN > 0 ? trunc2(((n(r.n2) * 25) + (n(r.n3) * 50) + (n(r.n4) * 75)) / totalN) : 0;
    const kalan = n(r.r) - (n(r.s) + totalN);
    return { ...r, p, t, y, kalan };
  });
  const pOrt = calculateTableAvg2(t2Rows, 'p', ['j']);
  const tOrt = calculateTableAvg2(t2Rows, 't', ['r', 's']);
  const yOrt = calculateTableAvg2(t2Rows, 'y', ['n1', 'n2', 'n3', 'n4']);

  // Yaprak Hasarı Doğrudan Kullanıcı Girişi (U ve Z aynı değer)
  const uOrt = n(yaprakHasari);
  const zOrt = n(yaprakHasari);

  // ADIMLAR (Yeni Formüller)
  const K = round2(pOrt * (vOrt > 0 ? (dOrt / vOrt) : 0));
  const L = round2(tOrt * ((100 - K) / 100));
  const M = round2(zOrt * ((100 - (K + L)) / 100));
  const hMiktar = round2(K + L + M);

  const N_Step = round2(pOrt * (vOrt > 0 ? (vOrt - (fOrt + dOrt)) / vOrt : 0));
  const O_Step = round2(zOrt * ((100 - N_Step) / 100));
  const hKalan = round2(N_Step + O_Step);

  const kayipVerim = round2((dOrt * (hMiktar / 100)) + ((vOrt - (dOrt + fOrt)) * (hKalan / 100)));
  const kalanVerim = round2((vOrt - fOrt) - kayipVerim);

  const kaliteGercekHasar = round2(vOrt > 0 ? (dOrt * (1 - (hMiktar / 100)) * yOrt) / vOrt : 0);
  const miktarGercekHasarOrani = round2(vOrt > 0 ? (kayipVerim / vOrt) * 100 : 0);
  const toplamYayilmisHasar = round2(miktarGercekHasarOrani + kaliteGercekHasar);

  const policeVerimiVar = n(policeInfo.policeVerimi) > 0;
  const hesaplananMiktarKaybi = policeVerimiVar ? round2(Math.max(0, (1 - (vOrt - kayipVerim) / n(policeInfo.policeVerimi)) * 100)) : 0;
  const nihaiMiktarHasari = policeVerimiVar ? hesaplananMiktarKaybi : miktarGercekHasarOrani;
  const tumSezonToplamHasar = round2(nihaiMiktarHasari + kaliteGercekHasar);
  const alanBazliHasar = round2(n(policeInfo.sigortaliAlan) > 0 ? (n(policeInfo.hasarliAlan) * n(policeInfo.hasarOraniAlan)) / n(policeInfo.sigortaliAlan) : 0);

  const handleT1 = (i, f, v) => {
    const a = [...tablo1];
    a[i] = { ...a[i], [f]: v };

    // Otomatik Doldurma: İlk satıra A, B veya G girilince diğer satırlara da kopyala
    if (i === 0 && (f === 'a' || f === 'b' || f === 'g')) {
      const oldValue = tablo1[0][f];
      for (let j = 1; j < a.length; j++) {
        // Eğer alt satır boşsa VEYA üst satırın eski değeriyle aynıysa (yani kullanıcı değiştirmemişse) güncelle
        if (a[j][f] === '' || a[j][f] === oldValue) {
          a[j] = { ...a[j], [f]: v };
        }
      }
    }
    // Verim Tespiti (E) -> Hasar Tespiti (R) Senkronizasyonu
    if (f === 'e') {
      const b = [...tablo2];
      b[i] = { ...b[i], r: v };
      setTablo2(b);
    }

    setTablo1(a);
  };

  const clearRowT1 = (i) => {
    const a = [...tablo1];
    a[i] = { a: '', b: '', e: '', g: '', iH: '', iA: '' };
    setTablo1(a);
  };

  const handleT2 = (i, f, v) => { const a = [...tablo2]; a[i] = { ...a[i], [f]: v }; setTablo2(a); };

  const clearRowT2 = (i) => {
    const a = [...tablo2];
    a[i] = { j: '', r: '', s: '', n1: '', n2: '', n3: '', n4: '' };
    setTablo2(a);
  };

  return (
    <div className="form-app">
      <header className="header-bar">
        <div className="logo-box">
          <svg width="40" height="40" viewBox="0 0 100 100" style={{ marginRight: '10px' }}>
            <circle cx="50" cy="50" r="45" fill="#1e293b" />
            <text x="50" y="65" fontSize="40" textAnchor="middle" fill="white">🍉</text>
          </svg>
          TARSİM HESAPLAMA PANELİ
        </div>
        <nav className="nav-menu">
          <div
            className={`nav-item ${activePage === 'watermelon' ? 'active' : ''}`}
            onClick={() => setActivePage('watermelon')}
          >
            KAVUN / KARPUZ
          </div>
          <div
            className={`nav-item ${activePage === 'fruit' ? 'active' : ''}`}
            onClick={() => setActivePage('fruit')}
          >
            MEYVE VERİM TESPİTİ
          </div>
        </nav>
        <div className="actions">
          <button className="btn-modern btn-red" onClick={() => window.location.reload()}>SIFIRLA</button>
          <button className="btn-modern btn-blue" onClick={() => window.print()}>YAZDIR / PDF</button>
        </div>
      </header>

      <main className="form-container">
        {activePage === 'watermelon' ? (
          <>
            {/* POLIÇE BILGILERI */}
            <div className="form-card">
              <div className="row">
                <div className="col"><strong>POLİÇE NO:</strong> <input type="text" value={policeInfo.policeNo} onChange={e => setPoliceInfo({ ...policeInfo, policeNo: e.target.value })} /></div>
                <div className="col"><strong>TARİH:</strong> <input type="date" value={policeInfo.tarih} onChange={e => setPoliceInfo({ ...policeInfo, tarih: e.target.value })} /></div>
              </div>
              <div className="row">
                <div className="col"><strong>SIGORTALI:</strong> <input type="text" value={policeInfo.adSoyad} onChange={e => setPoliceInfo({ ...policeInfo, adSoyad: e.target.value })} /></div>
                <div className="col"><strong>EVRE / ÇEŞİT:</strong> <input type="text" value={`${policeInfo.gelismeEvresi} / ${policeInfo.cesit}`} readOnly /></div>
              </div>
            </div>

            {/* TABLO 1: Dal ve Yapraklardaki Hasarın Verime Etkisi */}
            <div className="form-card">
              <h4 className="card-title grey">Tablo 1 - Dal ve Yapraklardaki Hasarın Verime Etkisi (U) (%)</h4>
              <div className="scroll-table">
                <table className="calc-table">
                  <thead>
                    <tr>
                      <th rowSpan="2" style={{ textAlign: 'left', paddingLeft: '10px' }}>Bitkinin Hasar Anındaki Gelişme Evresi</th>
                      <th colSpan="3">Bitkinin Hasar Derecesi</th>
                    </tr>
                    <tr>
                      <th>0-33</th>
                      <th>34-67</th>
                      <th>68-100</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>VE</strong> Çıkış</td><td>0</td><td>1</td><td>4</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>V1</strong> Yaprak Gelişimi (Fide)</td><td>0</td><td>2</td><td>8</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>V2</strong> Yan Sürgünlerin Oluşumu</td><td>0</td><td>3</td><td>15</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>R</strong> Çiçek Tomurcuklarının Görülmesi</td><td>0</td><td>4</td><td>16</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>R1</strong> Çiçeklenme</td><td>1</td><td>5</td><td>17</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>R2</strong> İlk Meyve Dönemi (Çap 1 - 4 cm)</td><td>2</td><td>6</td><td>20</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>R3</strong> Küçük Meyve Dönemi (Çap 4 - 10 cm )</td><td>4</td><td>11</td><td>25</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>R4</strong> Meyve Çapı 10 cm'den Büyük</td><td>2</td><td>6</td><td>15</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>R5</strong> Çeşide Özgü Maks. Büyüklük</td><td>0</td><td>0</td><td>0</td></tr>
                    <tr><td style={{ textAlign: 'left', paddingLeft: '10px' }}><strong>R6</strong> Hasat Dönemi</td><td>0</td><td>0</td><td>0</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLO 2: VERIM TESPITI */}
            <div className="form-card">
              <h4 className="card-title grey">Tablo 2 - Verim Tespiti</h4>
              <div className="scroll-table">
                <table className="calc-table">
                  <thead>
                    <tr style={{ fontSize: '11px' }}>
                      <th rowSpan="2">Sayım<br />No</th>
                      <th colSpan="2">Mesafe (m)</th>
                      <th rowSpan="2" style={{ minWidth: '100px' }}>Da'ki Bitki<br />Sayısı<br /><br /><strong>C = </strong> <div style={{ display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', fontSize: '10px', marginLeft: '2px' }}><span style={{ borderBottom: '1px solid #111' }}>1000</span><span>A x B</span></div></th>
                      <th colSpan="3">Hasar Anında Mevcut Verim</th>
                      <th colSpan="2">Hasat Edilen Ürün Miktarı</th>
                      <th colSpan="2">Alınabilecek Ürün Miktarı</th>
                      <th rowSpan="2" style={{ width: '30px' }}></th>
                    </tr>
                    <tr style={{ fontSize: '10px' }}>
                      <th style={{ fontWeight: 'normal' }}>Sıra<br />Arası<br />Mesafe<br />(m)<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>A</strong></th>
                      <th style={{ fontWeight: 'normal' }}>Sıra<br />Üzeri<br />Mesafe<br />(m)<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>B</strong></th>

                      <th style={{ fontWeight: 'normal' }}>Ardışık 10 Bitkide<br />Mevcut Meyve ve<br />Dişi Çiçek* Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>E</strong></th>
                      <th style={{ fontWeight: 'normal' }}>Ortalama<br />Meyve<br />Ağırlığı<br />(Kg)<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>G</strong></th>
                      <th style={{ fontWeight: 'normal' }}>Hasar Anında<br />Mevcut Verim<br />(Kg/Da)<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>D = (C x E x G) / 10</strong></th>

                      <th style={{ fontWeight: 'normal' }}>Ardışık 10 Bitkide<br />Hasat Edilen<br />Toplam Meyve<br />Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>I</strong></th>
                      <th style={{ fontWeight: 'normal' }}>Hasat Edilen Toplam<br />Ürün Miktarı (Kg/Da)<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>F = (C x G x I) / 10</strong></th>

                      <th style={{ fontWeight: 'normal' }}>Ardışık 10 Bitkiden<br />Toplam<br />Alınabilecek Meyve<br />Sayısı<br />(Üretim Sezonu)<br /><strong style={{ fontSize: '12px', color: '#111' }}>İ</strong></th>
                      <th style={{ fontWeight: 'normal' }}>Alınabilecek Toplam<br />Ürün Miktarı (Kg/Da)<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>V = (C x G x İ) / 10</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {t1Rows.map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><input type="text" inputMode="decimal" value={r.a} onChange={e => handleT1(i, 'a', e.target.value)} /></td>
                        <td><input type="text" inputMode="decimal" value={r.b} onChange={e => handleT1(i, 'b', e.target.value)} /></td>
                        <td className="res">{r.cVal.toFixed(0)}</td>
                        <td><input type="text" inputMode="decimal" value={r.e} onChange={e => handleT1(i, 'e', e.target.value)} /></td>
                        <td><input type="text" inputMode="decimal" value={r.g} onChange={e => handleT1(i, 'g', e.target.value)} /></td>
                        <td className="res">{r.d.toFixed(2)}</td>
                        <td><input type="text" inputMode="decimal" value={r.iH} onChange={e => handleT1(i, 'iH', e.target.value)} /></td>
                        <td className="res">{r.f.toFixed(2)}</td>
                        <td><input type="text" inputMode="decimal" value={r.iA} onChange={e => handleT1(i, 'iA', e.target.value)} /></td>
                        <td className="res">{r.v.toFixed(2)}</td>
                        <td><button className="btn-row-clear" onClick={() => clearRowT1(i)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="compact-footer">
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'right', paddingRight: '10px' }}>D Ort.</td><td className="res"><strong>{dOrt.toFixed(2)}</strong></td>
                      <td style={{ textAlign: 'right', paddingRight: '10px' }}>F Ort.</td><td className="res"><strong>{fOrt.toFixed(2)}</strong></td>
                      <td style={{ textAlign: 'right', paddingRight: '10px' }}>V Ort.</td><td className="res"><strong>{vOrt.toFixed(2)}</strong></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* TABLO 3: HASAR TESPITI */}
            <div className="form-card">
              <h4 className="card-title red">Tablo 3 - Hasar Tespiti</h4>
              <div className="scroll-table">
                <table className="calc-table">
                  <thead>
                    <tr style={{ fontSize: '11px' }}>
                      <th rowSpan="3">Sayım<br />No</th>
                      <th colSpan="2">Tam Hasar</th>
                      <th colSpan="3">Meyve ve Çiçek Hasar Oranı</th>
                      <th colSpan="5">Kalite Kaybı</th>
                      <th rowSpan="3" style={{backgroundColor: '#fefce8', color: '#854d0e', fontSize: '10px'}}>Kalan<br/>R-Hepsi</th>
                      <th rowSpan="3" style={{ width: '30px' }}></th>
                    </tr>
                    <tr style={{ fontSize: '10px' }}>
                      <th rowSpan="2" style={{ fontWeight: 'normal' }}>Ardışık 10<br />Bitkide<br />Tam<br />Hasarlı<br />Bitki<br />Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>J</strong></th>
                      <th rowSpan="2" style={{ fontWeight: 'normal' }}>Tam Hasarlı<br />Bitki Hasar<br />Oranı (%)<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>P = J x 10</strong></th>

                      <th rowSpan="2" style={{ fontWeight: 'normal' }}>Ardışık 10<br />Bitkide<br />Meyve<br />Bağlayan Dişi<br />Çiçek/Meyve<br />Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>R</strong></th>
                      <th rowSpan="2" style={{ fontWeight: 'normal' }}>Ardışık 10<br />Bitkide Tam<br />Hasarlı Dişi<br />Çiçek/Meyve<br />Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>S</strong></th>
                      <th rowSpan="2" style={{ fontWeight: 'normal' }}>Tam Hasarlı Dişi<br />Çiçek/Meyve Hasar<br />Oranı (%)<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>T = </strong> <div style={{ display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', fontSize: '10px', marginLeft: '2px' }}><span style={{ borderBottom: '1px solid #111' }}>(S x 100)</span><span>R</span></div></th>

                      <th colSpan="4">Ardaşık 10 Bitkide</th>
                      <th rowSpan="2" style={{ fontWeight: 'normal' }}>Her Bir Hasar Grubundaki Bitki Sayısı<br />x Kalite Kaybı / Sayım Yapılan Bitki<br />Adedi<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>Y = </strong> <div style={{ display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', fontSize: '10px', marginLeft: '2px' }}><span style={{ borderBottom: '1px solid #111' }}>(n2 x 25)+(n3 x 50)+(n4 x 75)</span><span>(n1+n2+n3+n4)</span></div></th>
                    </tr>
                    <tr style={{ fontSize: '10px' }}>
                      <th style={{ fontWeight: 'normal' }}>Hasarsız<br />Meyve<br />Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>n1</strong></th>
                      <th style={{ fontWeight: 'normal' }}>%25<br />Hasarlı<br />Meyve<br />Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>n2</strong></th>
                      <th style={{ fontWeight: 'normal' }}>%50<br />Hasarlı<br />Meyve<br />Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>n3</strong></th>
                      <th style={{ fontWeight: 'normal' }}>%75<br />Hasarlı<br />Meyve<br />Sayısı<br /><br /><strong style={{ fontSize: '12px', color: '#111' }}>n4</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {t2Rows.map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><input type="text" inputMode="decimal" value={r.j} onChange={e => handleT2(i, 'j', e.target.value)} /></td>
                        <td className="res">{r.p}%</td>
                        <td><input type="text" inputMode="decimal" value={r.r} onChange={e => handleT2(i, 'r', e.target.value)} /></td>
                        <td><input type="text" inputMode="decimal" value={r.s} onChange={e => handleT2(i, 's', e.target.value)} /></td>
                        <td className="res">{r.t.toFixed(2)}%</td>
                        <td><input type="text" inputMode="decimal" value={r.n1} onChange={e => handleT2(i, 'n1', e.target.value)} /></td>
                        <td><input type="text" inputMode="decimal" value={r.n2} onChange={e => handleT2(i, 'n2', e.target.value)} /></td>
                        <td><input type="text" inputMode="decimal" value={r.n3} onChange={e => handleT2(i, 'n3', e.target.value)} /></td>
                        <td><input type="text" inputMode="decimal" value={r.n4} onChange={e => handleT2(i, 'n4', e.target.value)} /></td>
                        <td className="res">{r.y.toFixed(2)}%</td>
                        <td style={{ 
                          fontWeight: 'bold', 
                          backgroundColor: r.kalan === 0 ? '#dcfce7' : (r.kalan < 0 ? '#fee2e2' : '#fefce8'),
                          color: r.kalan === 0 ? '#166534' : (r.kalan < 0 ? '#991b1b' : '#854d0e'),
                          textAlign: 'center',
                          fontSize: '12px'
                        }}>
                          {r.kalan}
                        </td>
                        <td><button className="btn-row-clear" onClick={() => clearRowT2(i)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="compact-footer">
                    <tr>
                      <td colSpan="2"></td>
                      <td className="res"><strong>P Ort.<br />{pOrt.toFixed(2)}%</strong></td>
                      <td colSpan="2"></td>
                      <td className="res"><strong>T Ort.<br />{tOrt.toFixed(2)}%</strong></td>
                      <td colSpan="4"></td>
                      <td className="res"><strong>Y Ort.<br />{yOrt.toFixed(2)}%</strong></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ADIM 1 & 2 GÖRSEL TASARIM */}
            <div className="visual-steps-grid">
              {/* ADIM 1 */}
              <div className="exact-step">
                <div className="exact-step-title">1. Adım: Mevcut Verim Hasar Oranını Hesaplayınız !</div>

                <div className="exact-top-row">
                  <div className="exact-box-col">
                    <div className="exact-box-title">Tam Hasar<br />(P Ort.)</div>
                    <div className="exact-box-val">{pOrt.toFixed(2)} <span className="pct">%</span></div>
                  </div>
                  <div className="exact-box-col">
                    <div className="exact-box-title">Tam Hasarlı Meyve ve Çiçek Hasar<br />Oranı (T Ort.)</div>
                    <div className="exact-box-val">{tOrt.toFixed(2)} <span className="pct">%</span></div>
                  </div>
                </div>

                <div className="arrow-down-connector">&#x2193;</div>

                <div className="exact-formula-box">
                  <div className="exact-f-header">
                    <span className="exact-f-source">Tablo 3'den</span>
                    <span className="exact-f-var">K</span>
                  </div>
                  <div className="exact-f-content">
                    <div className="exact-f-label">Tam<br />Hasar</div>
                    <div className="exact-f-math">
                      <span>= P Ort. x</span>
                      <div className="exact-frac">
                        <span className="up">D Ort.</span>
                        <span className="down">V Ort.</span>
                      </div>
                      <span>=</span>
                      <span className="exact-blank">{pOrt.toFixed(2)}</span>
                      <span>x</span>
                      <span className="exact-blank">{(vOrt > 0 ? (dOrt / vOrt) : 0).toFixed(4)}</span>
                      <span>= <strong style={{ color: '#16a34a' }}>{K.toFixed(2)} %</strong></span>
                    </div>
                  </div>
                </div>

                <div className="arrow-down-connector">&#x2193;</div>

                <div className="exact-formula-box">
                  <div className="exact-f-header">
                    <span className="exact-f-source">Tablo 3'den</span>
                    <span className="exact-f-var">L</span>
                  </div>
                  <div className="exact-f-content">
                    <div className="exact-f-label">Meyve ve Çiçek Hasar<br />Oranı</div>
                    <div className="exact-f-math">
                      <span className="exact-blank" style={{ minWidth: '40px' }}>{tOrt.toFixed(2)}</span>
                      <span>% x</span>
                      <div className="exact-frac">
                        <span className="up">100 - K</span>
                        <span className="down">100</span>
                      </div>
                      <span>= <strong style={{ color: '#16a34a' }}>{L.toFixed(2)} %</strong></span>
                    </div>
                  </div>
                </div>

                <div className="arrow-down-connector">&#x2193;</div>

                <div className="exact-formula-box">
                  <div className="exact-f-header">
                    <span className="exact-f-source">Tablo 1'den</span>
                    <span className="exact-f-var">M</span>
                  </div>
                  <div className="exact-f-content">
                    <div className="exact-f-label">Dal ve Yapraklardaki<br />Hasarın Verime Etkisi<br />(Z)</div>
                    <div className="exact-f-math">
                      <span className="exact-blank" style={{ minWidth: '40px' }}>
                        <input type="text" inputMode="decimal" style={{ border: 'none', width: '40px', textAlign: 'center', fontWeight: 'bold', backgroundColor: 'transparent' }} value={yaprakHasari} onChange={e => setYaprakHasari(e.target.value)} />
                      </span>
                      <span>% x</span>
                      <div className="exact-frac">
                        <span className="up">100 - (K+L)</span>
                        <span className="down">100</span>
                      </div>
                      <span>= <strong style={{ color: '#16a34a' }}>{M.toFixed(2)} %</strong></span>
                    </div>
                  </div>
                </div>

                <div className="arrow-down-connector">&#x2193;</div>

                <div className="exact-result-box">
                  <div className="exact-res-title">Mevcut Verimdeki Miktar Kaybı</div>
                  <div className="exact-res-math">
                    Toplam Hasar Oranı H Miktar = (K + L + M) = <strong style={{ color: '#16a34a' }}>{hMiktar.toFixed(2)} %</strong>
                  </div>
                </div>
              </div>

              {/* ADIM 2 */}
              <div className="exact-step">
                <div className="exact-step-title">2. Adım: Kalan Verim Hasar Oranını Hesaplayınız !</div>

                <div className="exact-top-row">
                  <div className="exact-box-col">
                    <div className="exact-box-title">Tam Hasar (P Ort.)</div>
                    <div className="exact-box-val">{pOrt.toFixed(2)} <span className="pct">%</span></div>
                  </div>
                  <div className="exact-box-col">
                    <div className="exact-box-title">Dal ve Yapraklardaki Hasarın Verime Etkisi<br />(U)</div>
                    <div className="exact-box-val">
                      <input type="text" inputMode="decimal" style={{ border: 'none', borderBottom: '1px dotted #111', width: '50px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', backgroundColor: 'transparent' }} value={yaprakHasari} onChange={e => setYaprakHasari(e.target.value)} /> <span className="pct">%</span>
                    </div>
                  </div>
                </div>

                <div className="arrow-down-connector">&#x2193;</div>

                <div className="exact-formula-box">
                  <div className="exact-f-header">
                    <span className="exact-f-source">Tablo 3'den</span>
                    <span className="exact-f-var">N</span>
                  </div>
                  <div className="exact-f-content">
                    <div className="exact-f-label">Tam<br />Hasar</div>
                    <div className="exact-f-math">
                      <span>= P Ort. x</span>
                      <div className="exact-frac">
                        <span className="up">V Ort. - ( F Ort. + D Ort. )</span>
                        <span className="down">V Ort.</span>
                      </div>
                      <span>=</span>
                      <span className="exact-blank">{pOrt.toFixed(2)}</span>
                      <span>x</span>
                      <div className="exact-frac">
                        <span className="up">{vOrt.toFixed(2)} - ( {fOrt.toFixed(2)} + {dOrt.toFixed(2)} )</span>
                        <span className="down">{vOrt.toFixed(2)}</span>
                      </div>
                      <span>= <strong style={{ color: '#2563eb' }}>{N_Step.toFixed(2)} %</strong></span>
                    </div>
                  </div>
                </div>

                <div className="arrow-down-connector">&#x2193;</div>

                <div className="exact-formula-box">
                  <div className="exact-f-header">
                    <span className="exact-f-source">Tablo 1'den</span>
                    <span className="exact-f-var">O</span>
                  </div>
                  <div className="exact-f-content">
                    <div className="exact-f-label">Dal ve Yapraklardaki<br />Hasarın Verime Etkisi (Z)</div>
                    <div className="exact-f-math">
                      <span className="exact-blank" style={{ minWidth: '40px' }}>
                        <input type="text" inputMode="decimal" style={{ border: 'none', width: '40px', textAlign: 'center', fontWeight: 'bold', backgroundColor: 'transparent' }} value={yaprakHasari} onChange={e => setYaprakHasari(e.target.value)} />
                      </span>
                      <span>% x</span>
                      <div className="exact-frac">
                        <span className="up">100 - N</span>
                        <span className="down">100</span>
                      </div>
                      <span>= <strong style={{ color: '#2563eb' }}>{O_Step.toFixed(2)} %</strong></span>
                    </div>
                  </div>
                </div>

                <div className="arrow-down-connector">&#x2193;</div>

                <div className="exact-result-box" style={{ marginTop: 'auto' }}>
                  <div className="exact-res-title">Hasar Sonrası Alınabilecek Verimdeki</div>
                  <div className="exact-res-math">
                    Toplam Hasar Oranı H Kalan = (N + O) = <strong style={{ color: '#2563eb' }}>{hKalan.toFixed(2)} %</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ADIM 3 GÖRSEL */}
            <div className="exact-step" style={{ marginTop: '1.5rem' }}>
              <div className="exact-step-title" style={{ backgroundColor: '#e5e7eb' }}>3. Adım: Hasar Sonrası Kalan Verimi Hesaplayınız !</div>
              <div className="exact-formula-box" style={{ padding: '10px', backgroundColor: '#e5e7eb', marginTop: '0' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', textAlign: 'center', marginBottom: '10px' }}>
                  Hasar Sonrası Kalan Verim (Kg/Da) = ( V Ort. - F Ort. ) - ( D Ort. x <div className="exact-frac" style={{ display: 'inline-flex', verticalAlign: 'middle' }}><span className="up" style={{ borderBottom: '1px solid #111' }}>H Miktar</span><span className="down">100</span></div> ) - ( ( V Ort. - ( D Ort. + F Ort. ) ) x <div className="exact-frac" style={{ display: 'inline-flex', verticalAlign: 'middle' }}><span className="up" style={{ borderBottom: '1px solid #111' }}>H Kalan</span><span className="down">100</span></div> )
                </div>

                <div className="exact-f-math" style={{ justifyContent: 'center', borderTop: '1px solid #111', paddingTop: '10px' }}>
                  <div style={{ marginRight: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>Hasar Sonrası<br />Kalan Verim =<br />(Kg/Da)</div>

                  <span>(</span>
                  <span className="exact-blank">{vOrt.toFixed(2)}</span>
                  <span>-</span>
                  <span className="exact-blank">{fOrt.toFixed(2)}</span>
                  <span>) - (</span>
                  <span className="exact-blank">{dOrt.toFixed(2)}</span>
                  <span>x</span>
                  <div className="exact-frac">
                    <span className="up">{hMiktar.toFixed(2)}</span>
                    <span className="down">100</span>
                  </div>
                  <span>) - ((</span>
                  <span className="exact-blank">{vOrt.toFixed(2)}</span>
                  <span>- (</span>
                  <span className="exact-blank">{dOrt.toFixed(2)}</span>
                  <span>+</span>
                  <span className="exact-blank">{fOrt.toFixed(2)}</span>
                  <span>)) x</span>
                  <div className="exact-frac">
                    <span className="up">{hKalan.toFixed(2)}</span>
                    <span className="down">100</span>
                  </div>
                  <span>) =</span>
                  <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                    {kalanVerim.toFixed(2)} Kg/Da
                  </div>
                </div>
              </div>
            </div>

            {/* ADIM 4 GÖRSEL */}
            <div className="exact-step" style={{ marginTop: '1.5rem' }}>
              <div className="exact-step-title">4. Adım: Hasar Nedenli Kayıp Verimi Hesaplayınız !</div>
              <div className="exact-formula-box" style={{ padding: '10px', backgroundColor: '#e5e7eb' }}>
                <div className="exact-f-math" style={{ justifyContent: 'center' }}>
                  <div style={{ marginRight: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>Kayıp Verim =<br />(Kg/Da)</div>
                  <span>(</span>
                  <span className="exact-blank">{dOrt.toFixed(2)}</span>
                  <span>x</span>
                  <div className="exact-frac">
                    <span className="up">{hMiktar.toFixed(2)}</span>
                    <span className="down">100</span>
                  </div>
                  <span>) + ((</span>
                  <span className="exact-blank">{vOrt.toFixed(2)}</span>
                  <span>- (</span>
                  <span className="exact-blank">{dOrt.toFixed(2)}</span>
                  <span>+</span>
                  <span className="exact-blank">{fOrt.toFixed(2)}</span>
                  <span>)) x</span>
                  <div className="exact-frac">
                    <span className="up">{hKalan.toFixed(2)}</span>
                    <span className="down">100</span>
                  </div>
                  <span>) =</span>
                  <div style={{ backgroundColor: '#c2410c', color: 'white', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                    {kayipVerim.toFixed(2)} Kg/Da
                  </div>
                </div>
              </div>
            </div>

            {/* ADIM 5 GÖRSEL */}
            <div className="exact-step" style={{ marginTop: '1.5rem' }}>
              <div className="exact-step-title" style={{ backgroundColor: '#e5e7eb' }}>5. Adım: Kalite Kaybı Gerçek Hasar Oranı (Z) (%)</div>
              <div className="exact-formula-box" style={{ padding: '10px', backgroundColor: '#e5e7eb', marginTop: '0' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginRight: '10px' }}>
                    Z (%) =
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Pay */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '5px', fontWeight: 'bold', fontSize: '11px' }}>
                      <span>( D Ort. x ( 1 - </span>
                      <div className="exact-frac" style={{ margin: '0 5px' }}>
                        <span className="up" style={{ borderBottom: '1px solid #111', paddingBottom: '2px' }}>H Miktar</span>
                        <span className="down" style={{ paddingTop: '2px' }}>100</span>
                      </div>
                      <span>) ) x Y Ort.</span>
                    </div>
                    {/* Çizgi */}
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#111' }}></div>
                    {/* Payda */}
                    <div style={{ paddingTop: '5px', fontWeight: 'bold', fontSize: '11px' }}>
                      V Ort.
                    </div>
                  </div>
                </div>

                {/* Rakamlı Hali */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #111', paddingTop: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginRight: '10px' }}>
                    Z (%) =
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Pay */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '5px' }}>
                      <span>(</span>
                      <span className="exact-blank">{dOrt.toFixed(2)}</span>
                      <span>x ( 1 - </span>
                      <div className="exact-frac" style={{ margin: '0 5px' }}>
                        <span className="up" style={{ borderBottom: '1px solid #111', paddingBottom: '2px' }}>{hMiktar.toFixed(2)}</span>
                        <span className="down" style={{ paddingTop: '2px' }}>100</span>
                      </div>
                      <span>) ) x</span>
                      <span className="exact-blank" style={{ marginLeft: '5px' }}>{yOrt.toFixed(2)}</span>
                    </div>
                    {/* Çizgi */}
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#111' }}></div>
                    {/* Payda */}
                    <div style={{ paddingTop: '5px' }}>
                      <span className="exact-blank">{vOrt.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', marginRight: '10px' }}>=</span>
                    <div style={{ border: '2px solid #16a34a', color: '#16a34a', padding: '6px 12px', fontWeight: 'bold', fontSize: '14px', backgroundColor: '#fff' }}>
                      {kaliteGercekHasar.toFixed(2)} %
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ADIM 6 GÖRSEL */}
            <div className="exact-step" style={{ marginTop: '1.5rem' }}>
              <div className="exact-step-title">6. Adım: Miktar ve Kalite Kaybı Yayılmış Hasar Oranını Hesaplayınız !</div>
              <div className="exact-formula-box" style={{ padding: '10px', backgroundColor: '#e5e7eb' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginRight: '10px', textAlign: 'center' }}>
                    Gerçek<br />Hasar<br />Oranı<br />(%)<br />=
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Pay */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '5px' }}>
                      <span>(</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 5px', fontSize: '11px', fontWeight: 'bold' }}>
                        <span>Mevcut</span>
                        <span>Verim</span>
                        <span>(D Ort.)</span>
                      </div>
                      <span>x</span>
                      <div className="exact-frac" style={{ margin: '0 5px' }}>
                        <span className="up" style={{ borderBottom: '1px solid #111', paddingBottom: '2px' }}>H Miktar</span>
                        <span className="down" style={{ paddingTop: '2px' }}>100</span>
                      </div>
                      <span>) + (</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 5px', fontSize: '11px', fontWeight: 'bold' }}>
                        <span>Kalan Verim</span>
                        <span>V Ort. - (D Ort. + F Ort.)</span>
                      </div>
                      <span>x</span>
                      <div className="exact-frac" style={{ margin: '0 5px' }}>
                        <span className="up" style={{ borderBottom: '1px solid #111', paddingBottom: '2px' }}>H Kalan</span>
                        <span className="down" style={{ paddingTop: '2px' }}>100</span>
                      </div>
                      <span>)</span>
                    </div>
                    {/* Çizgi */}
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#111' }}></div>
                    {/* Payda */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5px', fontSize: '11px', fontWeight: 'bold' }}>
                      <span>Alınabilecek Toplam Ürün Miktarı</span>
                      <span>(V Ort.)</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: '10px', fontWeight: 'bold', fontSize: '12px' }}>
                    x 100 =
                  </div>
                </div>

                {/* Rakamlı Hali */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Pay */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '5px' }}>
                      <span>(</span>
                      <span className="exact-blank">{dOrt.toFixed(2)}</span>
                      <span>x</span>
                      <div className="exact-frac" style={{ margin: '0 5px' }}>
                        <span className="up" style={{ borderBottom: '1px solid #111', paddingBottom: '2px' }}>{hMiktar.toFixed(2)}</span>
                        <span className="down" style={{ paddingTop: '2px' }}>100</span>
                      </div>
                      <span>) + (</span>
                      <span className="exact-blank">{(vOrt - (dOrt + fOrt)).toFixed(2)}</span>
                      <span>x</span>
                      <div className="exact-frac" style={{ margin: '0 5px' }}>
                        <span className="up" style={{ borderBottom: '1px solid #111', paddingBottom: '2px' }}>{hKalan.toFixed(2)}</span>
                        <span className="down" style={{ paddingTop: '2px' }}>100</span>
                      </div>
                      <span>)</span>
                    </div>
                    {/* Çizgi */}
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#111' }}></div>
                    {/* Payda */}
                    <div style={{ paddingTop: '5px' }}>
                      <span className="exact-blank">{vOrt.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', marginRight: '10px' }}>x 100 = </span>
                    <span className="exact-blank"><strong>{miktarGercekHasarOrani.toFixed(2)}</strong></span>
                  </div>
                </div>

                {/* Alt Kısım - Toplam Yayılmış Hasar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #111', paddingTop: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center', width: '20%' }}>
                    Miktar ve Kalite Kaybı<br />Yayılmış Hasar Oranı
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center', width: '5%' }}>=</div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center', width: '20%' }}>
                    Gerçek Hasar Oranı
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center', width: '5%' }}>+</div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center', width: '25%' }}>
                    Kalite Kaybı Gerçek<br />Hasar Oranı (Z)
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center', width: '5%' }}>=</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20%' }}>
                    <span className="exact-blank" style={{ fontSize: '13px' }}>{miktarGercekHasarOrani.toFixed(2)}</span>
                    <span style={{ margin: '0 5px', fontWeight: 'bold' }}>+</span>
                    <span className="exact-blank" style={{ fontSize: '13px' }}>{kaliteGercekHasar.toFixed(2)}</span>
                    <span style={{ margin: '0 5px', fontWeight: 'bold' }}>=</span>
                    <span className="exact-blank" style={{ fontSize: '15px' }}><strong>{toplamYayilmisHasar.toFixed(2)}</strong></span>
                  </div>
                </div>

              </div>
            </div>

            {/* ADIM 7 GÖRSEL */}
            <div className="exact-step" style={{ marginTop: '1.5rem' }}>
              <div className="exact-step-title" style={{ backgroundColor: '#e5e7eb' }}>7. Adım: Poliçe Verimi Üzerinden Hasar Yayma</div>

              <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>
                Poliçe Verimi: <input type="text" inputMode="decimal" style={{ border: '1px solid #111', width: '80px', padding: '2px', fontWeight: 'bold', textAlign: 'center', marginLeft: '5px' }} value={policeInfo.policeVerimi} onChange={e => setPoliceInfo({ ...policeInfo, policeVerimi: e.target.value })} /> Kg/Da
              </div>

              <div className="exact-formula-box" style={{ padding: '10px', backgroundColor: '#e5e7eb', marginTop: '0' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', textAlign: 'center', marginBottom: '10px' }}>
                  Miktar Kaybına Bağlı Hasar = ( 1 - <div className="exact-frac" style={{ display: 'inline-flex', verticalAlign: 'middle' }}><span className="up" style={{ borderBottom: '1px solid #111' }}>V Ort. - Kayıp Verim</span><span className="down">Poliçe Verimi</span></div> ) x 100
                </div>

                <div className="exact-f-math" style={{ justifyContent: 'center', borderTop: '1px solid #111', paddingTop: '10px', marginBottom: '10px' }}>
                  <div style={{ marginRight: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>Miktar Kaybı =</div>
                  <span>( 1 -</span>
                  <div className="exact-frac">
                    <span className="up">{vOrt.toFixed(2)} - {kayipVerim.toFixed(2)}</span>
                    <span className="down">{policeVerimiVar ? n(policeInfo.policeVerimi) : '...'}</span>
                  </div>
                  <span>) x 100 =</span>
                  <span className="exact-blank"><strong>{policeVerimiVar ? hesaplananMiktarKaybi.toFixed(2) : '0.00'} %</strong></span>
                </div>

                <div style={{ fontWeight: 'bold', fontSize: '11px', textAlign: 'center', marginBottom: '10px', borderTop: '1px dotted #111', paddingTop: '10px' }}>
                  Tüm Sezon Toplam Hasar = {policeVerimiVar ? 'Miktar Kaybına Bağlı Hasar (%)' : '6. Adımdaki Gerçek Hasar Oranı (%)'} + Kalite Kaybı Gerçek Hasar Oranı (Z) (%)
                </div>
                <div className="exact-f-math" style={{ justifyContent: 'center', borderTop: '1px solid #111', paddingTop: '10px' }}>
                  <div style={{ marginRight: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>Toplam =</div>
                  <span className="exact-blank">{nihaiMiktarHasari.toFixed(2)} % (Miktar)</span>
                  <span>+</span>
                  <span className="exact-blank">{kaliteGercekHasar.toFixed(2)} % (Z)</span>
                  <span>=</span>
                  <div style={{ border: '2px solid #16a34a', color: '#16a34a', padding: '6px 12px', fontWeight: 'bold', fontSize: '14px', marginLeft: '10px', backgroundColor: '#fff' }}>
                    {tumSezonToplamHasar.toFixed(2)} %
                  </div>
                </div>
              </div>
            </div>

            {/* ADIM 8 GÖRSEL */}
            <div className="exact-step" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <div className="exact-step-title">8. Adım: Alan Bazlı Hasar Oranı Hesaplayınız !</div>

              <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '15px 0', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>Sigortalı Alan (Da):</span>
                  <input type="text" inputMode="decimal" style={{ border: '1px solid #111', width: '80px', padding: '4px', fontWeight: 'bold', textAlign: 'center' }} value={policeInfo.sigortaliAlan} onChange={e => setPoliceInfo({ ...policeInfo, sigortaliAlan: e.target.value })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>Hasarlı Alan (Da):</span>
                  <input type="text" inputMode="decimal" style={{ border: '1px solid #111', width: '80px', padding: '4px', fontWeight: 'bold', textAlign: 'center' }} value={policeInfo.hasarliAlan} onChange={e => setPoliceInfo({ ...policeInfo, hasarliAlan: e.target.value })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>Hasar Oranı (%):</span>
                  <input type="text" inputMode="decimal" style={{ border: '1px solid #111', width: '80px', padding: '4px', fontWeight: 'bold', textAlign: 'center' }} value={policeInfo.hasarOraniAlan} onChange={e => setPoliceInfo({ ...policeInfo, hasarOraniAlan: e.target.value })} />
                </div>
              </div>

              <div className="exact-formula-box" style={{ padding: '10px', backgroundColor: '#e5e7eb', marginTop: '0' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', textAlign: 'center', marginBottom: '10px' }}>
                  Alan Bazlı Hasar Oranı = <div className="exact-frac" style={{ display: 'inline-flex', verticalAlign: 'middle' }}><span className="up" style={{ borderBottom: '1px solid #111' }}>Hasarlı Alan x Hasar Oranı</span><span className="down">Sigortalı Alan</span></div>
                </div>

                <div className="exact-f-math" style={{ justifyContent: 'center', borderTop: '1px solid #111', paddingTop: '15px', paddingBottom: '5px' }}>
                  <div style={{ marginRight: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>Alan Bazlı<br />Hasar Oranı =</div>
                  <div className="exact-frac">
                    <span className="up">{n(policeInfo.hasarliAlan)} x {n(policeInfo.hasarOraniAlan)}</span>
                    <span className="down">{n(policeInfo.sigortaliAlan) || 1}</span>
                  </div>
                  <span>=</span>
                  <div style={{ border: '2px solid #16a34a', color: '#16a34a', padding: '6px 12px', fontWeight: 'bold', fontSize: '14px', marginLeft: '10px', backgroundColor: '#fff' }}>
                    {alanBazliHasar.toFixed(2)} %
                  </div>
                </div>
              </div>
            </div>

            <div className="eksper-section">
              <strong>EKSPER NOTU:</strong>
              <textarea value={eksperAciklama} onChange={e => setEksperAciklama(e.target.value)}></textarea>
            </div>

            <footer className="page-footer">
              <div className="sig-line">Eksper İmza: __________________</div>
              <div className="sig-line">Eksper İmza: __________________</div>
            </footer>
          </>
        ) : (
          <FruitYieldCalculator />
        )}
      </main>
    </div>
  );
}

export default App;
