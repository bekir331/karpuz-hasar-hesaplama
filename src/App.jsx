import React, { useState } from 'react';
import './App.css';

function App() {
  const [policeInfo, setPoliceInfo] = useState({
    policeNo: '', adSoyad: '', ekspertizTipi: 'Gecici', tarih: '',
    gelismeEvresi: 'Cikis - Fide Dikim Evresi', cesit: '',
    policeVerimi: '', sigortaliAlan: '', hasarliAlan: '', hasarOraniAlan: ''
  });

  const [tablo1, setTablo1] = useState(Array(7).fill({ a: '', b: '', c: '', e: '', g: '' }));
  const [tablo2, setTablo2] = useState(Array(7).fill({ j: '', r: '', s: '', n1: '', n2: '', n3: '', n4: '' }));
  const [tablo3, setTablo3] = useState(Array(7).fill({ u: '' }));
  const [eksperAciklama, setEksperAciklama] = useState('');

  const yaprakHasarFaktoru = 20;
  const n = (v) => v === '' ? 0 : Number(v);

  // Ortalamalar
  const getAvg = (arr, key) => {
    const valid = arr.filter(i => n(i[key]) > 0);
    return valid.length === 0 ? 0 : valid.reduce((s, i) => s + n(i[key]), 0) / valid.length;
  };

  const t1Rows = tablo1.map(r => ({ ...r, d: n(r.a)*n(r.b)*n(r.c), f: n(r.a)*n(r.c)*n(r.e), v: n(r.a)*n(r.c)*n(r.g) }));
  const dOrt = getAvg(t1Rows, 'd'); const fOrt = getAvg(t1Rows, 'f'); const vOrt = getAvg(t1Rows, 'v');

  const t2Rows = tablo2.map(r => {
    const p = n(r.j) * 10;
    const t = n(r.r) > 0 ? (n(r.s) * 100) / n(r.r) : 0;
    const totalN = n(r.n1) + n(r.n2) + n(r.n3) + n(r.n4);
    const y = totalN > 0 ? ((n(r.n2)*25) + (n(r.n3)*50) + (n(r.n4)*75)) / totalN : 0;
    return { ...r, p, t, y };
  });
  const pOrt = getAvg(t2Rows, 'p'); const tOrt = getAvg(t2Rows, 't'); const yOrt = getAvg(t2Rows, 'y');

  const t3Rows = tablo3.map(r => ({ ...r, z: (n(r.u) * yaprakHasarFaktoru) / 100 }));
  const uOrt = getAvg(t3Rows, 'u'); const zOrt = getAvg(t3Rows, 'z');

  // Adım Hesaplamaları
  const K = pOrt;
  const L = (tOrt * (100 - K)) / 100;
  const M = (zOrt * (100 - (K + L))) / 100;
  const hMiktar = K + L + M;
  const N_Step = pOrt;
  const O_Step = (zOrt * (100 - N_Step)) / 100;
  const hKalan = N_Step + O_Step;
  const kayipVerim = (dOrt * (hMiktar / 100)) + ((vOrt - (dOrt + fOrt)) * (hKalan / 100));
  const kalanVerim = (vOrt - fOrt) - kayipVerim;
  const kaliteGercekHasar = vOrt > 0 ? (dOrt * (1 - (hMiktar / 100)) * yOrt) / vOrt : 0;
  const miktarYayilmisHasar = vOrt > 0 ? (kayipVerim / vOrt) * 100 : 0;
  const toplamYayilmisHasar = miktarYayilmisHasar + kaliteGercekHasar;
  const miktarKaybiBagliHasar = Math.max(0, n(policeInfo.policeVerimi) > 0 ? (1 - (vOrt - kayipVerim) / n(policeInfo.policeVerimi)) * 100 : 0);
  const tumSezonToplamHasar = miktarKaybiBagliHasar + kaliteGercekHasar;
  const alanBazliHasar = n(policeInfo.sigortaliAlan) > 0 ? (n(policeInfo.hasarliAlan) * n(policeInfo.hasarOraniAlan)) / n(policeInfo.sigortaliAlan) : 0;

  const handleT1 = (i, f, v) => { const a = [...tablo1]; a[i] = { ...a[i], [f]: v }; setTablo1(a); };
  const handleT2 = (i, f, v) => { const a = [...tablo2]; a[i] = { ...a[i], [f]: v }; setTablo2(a); };
  const handleT3 = (i, f, v) => { const a = [...tablo3]; a[i] = { ...a[i], [f]: v }; setTablo3(a); };

  return (
    <div className="form-app">
      <header className="header-bar">
         <div className="logo-box">
            <svg width="40" height="40" viewBox="0 0 100 100" style={{marginRight: '10px'}}>
              <circle cx="50" cy="50" r="45" fill="#1e293b" />
              <text x="50" y="65" fontSize="40" textAnchor="middle" fill="white">🍉</text>
            </svg>
            TARSIM DIJITAL PANEL
         </div>
         <div className="actions">
            <button className="btn-modern btn-red" onClick={() => window.location.reload()}>SIFIRLA</button>
            <button className="btn-modern btn-blue" onClick={() => window.print()}>YAZDIR / PDF</button>
         </div>
      </header>

      <main className="form-container">
        {/* POLIÇE BILGILERI */}
        <div className="form-card">
           <div className="row">
              <div className="col"><strong>POLİÇE NO:</strong> <input type="text" value={policeInfo.policeNo} onChange={e => setPoliceInfo({...policeInfo, policeNo: e.target.value})} /></div>
              <div className="col"><strong>TARİH:</strong> <input type="date" value={policeInfo.tarih} onChange={e => setPoliceInfo({...policeInfo, tarih: e.target.value})} /></div>
           </div>
           <div className="row">
              <div className="col"><strong>SIGORTALI:</strong> <input type="text" value={policeInfo.adSoyad} onChange={e => setPoliceInfo({...policeInfo, adSoyad: e.target.value})} /></div>
              <div className="col"><strong>EVRE / ÇEŞİT:</strong> <input type="text" value={`${policeInfo.gelismeEvresi} / ${policeInfo.cesit}`} readOnly /></div>
           </div>
        </div>

        {/* TABLO 1 */}
        <div className="form-card">
          <h4 className="card-title orange">Tablo 1 - Verim Tespiti</h4>
          <div className="scroll-table">
            <table className="calc-table">
               <thead>
                  <tr><th>No</th><th>Bitki (A)</th><th>M/Ç (B)</th><th>Ağır. (C)</th><th>Verim (D)</th><th>Hasat (E)</th><th>Ürün (F)</th><th>Meyve (G)</th><th>V Ort.</th></tr>
               </thead>
               <tbody>
                  {t1Rows.map((r, i) => (
                    <tr key={i}>
                       <td>{i+1}</td>
                       <td><input type="number" value={r.a} onChange={e => handleT1(i, 'a', e.target.value)} /></td>
                       <td><input type="number" value={r.b} onChange={e => handleT1(i, 'b', e.target.value)} /></td>
                       <td><input type="number" value={r.c} onChange={e => handleT1(i, 'c', e.target.value)} /></td>
                       <td className="res">{r.d.toFixed(1)}</td>
                       <td><input type="number" value={r.e} onChange={e => handleT1(i, 'e', e.target.value)} /></td>
                       <td className="res">{r.f.toFixed(1)}</td>
                       <td><input type="number" value={r.g} onChange={e => handleT1(i, 'g', e.target.value)} /></td>
                       <td className="res">{r.v.toFixed(1)}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* TABLO 2 */}
        <div className="form-card">
          <h4 className="card-title red">Tablo 2 - Hasar Tespiti</h4>
          <div className="scroll-table">
            <table className="calc-table">
               <thead>
                  <tr><th>No</th><th>Tam Hasarlı (J)</th><th>H. Oranı (P)</th><th>Mevcut (R)</th><th>Hasarlı (S)</th><th>H. Oranı (T)</th><th>n1</th><th>n2</th><th>n3</th><th>n4</th><th>Kalite (Y)</th></tr>
               </thead>
               <tbody>
                  {t2Rows.map((r, i) => (
                    <tr key={i}>
                       <td>{i+1}</td>
                       <td><input type="number" value={r.j} onChange={e => handleT2(i, 'j', e.target.value)} /></td>
                       <td className="res">{r.p}%</td>
                       <td><input type="number" value={r.r} onChange={e => handleT2(i, 'r', e.target.value)} /></td>
                       <td><input type="number" value={r.s} onChange={e => handleT2(i, 's', e.target.value)} /></td>
                       <td className="res">{r.t.toFixed(1)}%</td>
                       <td><input type="number" value={r.n1} onChange={e => handleT2(i, 'n1', e.target.value)} /></td>
                       <td><input type="number" value={r.n2} onChange={e => handleT2(i, 'n2', e.target.value)} /></td>
                       <td><input type="number" value={r.n3} onChange={e => handleT2(i, 'n3', e.target.value)} /></td>
                       <td><input type="number" value={r.n4} onChange={e => handleT2(i, 'n4', e.target.value)} /></td>
                       <td className="res">{r.y.toFixed(1)}%</td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* TABLO 3 & 4 */}
        <div className="flex-tables">
          <div className="form-card flex-1">
            <h4 className="card-title purple">Tablo 3 - Yaprak Hasarı</h4>
            <table className="calc-table">
               <thead>
                  <tr><th>No</th><th>Yaprak Hasar Oranı (%) (U)</th><th>Verime Etkisi (%) (Z)</th></tr>
               </thead>
               <tbody>
                  {t3Rows.map((r, i) => (
                    <tr key={i}>
                       <td>{i+1}</td>
                       <td><input type="number" placeholder="U değerini girin" value={r.u} onChange={e => handleT3(i, 'u', e.target.value)} /></td>
                       <td className="res">
                         <div className="dynamic-formula">
                           ({n(r.u) || 0} x {yaprakHasarFaktoru}) / 100 = <strong>{r.z.toFixed(2)}%</strong>
                         </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
          <div className="form-card" style={{width: '300px'}}>
            <h4 className="card-title grey">Tablo 4 - Faktör</h4>
            <table className="calc-table">
               <thead><tr><th>Evre</th><th>Faktör</th></tr></thead>
               <tbody>
                  <tr><td>Fide / Yaprak</td><td>%20</td></tr>
               </tbody>
            </table>
          </div>
        </div>

        {/* ADIM 1 & 2 GÖRSEL TASARIM */}
        <div className="visual-steps-grid">
           {/* ADIM 1 */}
           <div className="visual-step-card">
              <div className="step-header">1. Adım: Mevcut Verim Hasar Oranını Hesaplayınız !</div>
              <div className="formula-container">
                 <div className="top-boxes">
                    <div className="f-box"><span>Tam Hasar (P Ort)</span><strong>{pOrt.toFixed(1)}%</strong></div>
                    <div className="f-box"><span>M/Ç Hasar (T Ort)</span><strong>{tOrt.toFixed(1)}%</strong></div>
                 </div>
                 
                 <div className="formula-row-visual">
                    <div className="tag">Tablo 2'den</div>
                    <div className="var">K = {pOrt.toFixed(1)} %</div>
                 </div>

                 <div className="formula-row-visual">
                    <div className="tag">Tablo 2'den</div>
                    <div className="math-flex">
                       <span>L =</span>
                       <div className="box">{tOrt.toFixed(1)}%</div>
                       <span>x</span>
                       <div className="frac">
                          <div className="up">100 - {K.toFixed(1)}</div>
                          <div className="down">100</div>
                       </div>
                       <span>=</span>
                       <div className="res-box">{L.toFixed(2)} %</div>
                    </div>
                 </div>

                 <div className="formula-row-visual">
                    <div className="tag">Tablo 3'den</div>
                    <div className="math-flex">
                       <span>M =</span>
                       <div className="box">{zOrt.toFixed(2)}%</div>
                       <span>x</span>
                       <div className="frac">
                          <div className="up">100 - {(K+L).toFixed(1)}</div>
                          <div className="down">100</div>
                       </div>
                       <span>=</span>
                       <div className="res-box">{M.toFixed(2)} %</div>
                    </div>
                 </div>

                 <div className="step-footer-box">
                    H Miktar = (K + L + M) = <strong>{hMiktar.toFixed(2)} %</strong>
                 </div>
              </div>
           </div>

           {/* ADIM 2 */}
           <div className="visual-step-card">
              <div className="step-header">2. Adım: Kalan Verim Hasar Oranını Hesaplayınız !</div>
              <div className="formula-container">
                 <div className="top-boxes">
                    <div className="f-box"><span>Tam Hasar (P Ort)</span><strong>{pOrt.toFixed(1)}%</strong></div>
                    <div className="f-box"><span>Yaprak Hasarı (U)</span><strong>{uOrt.toFixed(1)}%</strong></div>
                 </div>

                 <div className="formula-row-visual">
                    <div className="tag">Tablo 3'den</div>
                    <div className="var">N = {pOrt.toFixed(1)} %</div>
                 </div>

                 <div className="formula-row-visual">
                    <div className="tag">Tablo 1'den</div>
                    <div className="math-flex">
                       <span>O =</span>
                       <div className="box">{zOrt.toFixed(2)}%</div>
                       <span>x</span>
                       <div className="frac">
                          <div className="up">100 - {N_Step.toFixed(1)}</div>
                          <div className="down">100</div>
                       </div>
                       <span>=</span>
                       <div className="res-box">{O_Step.toFixed(2)} %</div>
                    </div>
                 </div>

                 <div className="step-footer-box blue">
                    H Kalan = (N + O) = <strong>{hKalan.toFixed(2)} %</strong>
                 </div>
              </div>
           </div>
        </div>

        {/* ADIM 3 GÖRSEL */}
        <div className="visual-step-card full">
            <div className="step-header">3. Adım: Hasar Sonrası Kalan Verimi Hesaplayınız !</div>
            <div className="complex-formula">
               <div className="math-flex center">
                  <span>(</span> <div className="box-v">{vOrt.toFixed(1)}</div> <span>-</span> <div className="box-v">{fOrt.toFixed(1)}</div> <span>)</span>
                  <span>-</span>
                  <span>(</span> <div className="box-v">{dOrt.toFixed(1)}</div> <span>x</span> 
                    <div className="frac"> <div className="up">{hMiktar.toFixed(2)}</div> <div className="down">100</div> </div>
                  <span>)</span>
                  <span>-</span>
                  <span>((</span> <div className="box-v">{vOrt.toFixed(1)}</div> <span>-</span> <span>(</span> <div className="box-v">{dOrt.toFixed(1)}</div> <span>+</span> <div className="box-v">{fOrt.toFixed(1)}</div> <span>)) x</span>
                    <div className="frac"> <div className="up">{hKalan.toFixed(2)}</div> <div className="down">100</div> </div>
                  <span>) =</span>
                  <div className="final-result-box">{kalanVerim.toFixed(2)} Kg/Da</div>
               </div>
            </div>
        </div>

        {/* ADIM 4 GÖRSEL */}
        <div className="visual-step-card full">
            <div className="step-header">4. Adım: Hasar Nedenli Kayıp Verimi Hesaplayınız !</div>
            <div className="complex-formula">
               <div className="math-flex center">
                  <span>(</span> <div className="box-v">{dOrt.toFixed(1)}</div> <span>x</span> 
                    <div className="frac"> <div className="up">{hMiktar.toFixed(2)}</div> <div className="down">100</div> </div>
                  <span>)</span>
                  <span>+</span>
                  <span>((</span> <div className="box-v">{vOrt.toFixed(1)}</div> <span>-</span> <span>(</span> <div className="box-v">{dOrt.toFixed(1)}</div> <span>+</span> <div className="box-v">{fOrt.toFixed(1)}</div> <span>)) x</span>
                    <div className="frac"> <div className="up">{hKalan.toFixed(2)}</div> <div className="down">100</div> </div>
                  <span>) =</span>
                  <div className="final-result-box orange-box">{kayipVerim.toFixed(2)} Kg/Da</div>
               </div>
            </div>
        </div>

        {/* ADIM 5 & 6 GÖRSEL */}
        <div className="visual-steps-grid">
           <div className="visual-step-card">
              <div className="step-header">5. Adım: Kalite Kaybı Gerçek Hasar Oranı</div>
              <div className="complex-formula">
                 <div className="math-flex column">
                    <div className="frac-large">
                       <div className="up">({dOrt.toFixed(1)} x (1 - {hMiktar.toFixed(2)}/100)) x {yOrt.toFixed(1)}</div>
                       <div className="down">{vOrt.toFixed(1)}</div>
                    </div>
                    <div className="res-box mt-10">Z (%) = {kaliteGercekHasar.toFixed(2)} %</div>
                 </div>
              </div>
           </div>

           <div className="visual-step-card">
              <div className="step-header">6. Adım: Miktar ve Kalite Yayılmış Hasar Oranı</div>
              <div className="step-content-box">
                 <div className="calc-line">Miktar Hasarı: <strong>{miktarYayilmisHasar.toFixed(2)} %</strong></div>
                 <div className="calc-line">Kalite Hasarı (Z): <strong>{kaliteGercekHasar.toFixed(2)} %</strong></div>
                 <div className="final-box-sum">Toplam = {toplamYayilmisHasar.toFixed(2)} %</div>
              </div>
           </div>
        </div>

        {/* ADIM 7 & 8 */}
        <div className="visual-steps-grid">
           <div className="visual-step-card">
              <div className="step-header">7. Adım: Tüm Sezon Poliçe Verimi Bazlı</div>
              <div className="input-area">
                 Poliçe Verimi: <input type="number" value={policeInfo.policeVerimi} onChange={e => setPoliceInfo({...policeInfo, policeVerimi: e.target.value})} />
              </div>
              <div className="res-box green-res">Toplam Hasar: {tumSezonToplamHasar.toFixed(2)} %</div>
           </div>
           <div className="visual-step-card">
              <div className="step-header">8. Adım: Alan Bazlı Hasar Oranı</div>
              <div className="input-area-grid">
                 <input type="number" placeholder="S. Alan" value={policeInfo.sigortaliAlan} onChange={e => setPoliceInfo({...policeInfo, sigortaliAlan: e.target.value})} />
                 <input type="number" placeholder="H. Alan" value={policeInfo.hasarliAlan} onChange={e => setPoliceInfo({...policeInfo, hasarliAlan: e.target.value})} />
                 <input type="number" placeholder="H. Oranı" value={policeInfo.hasarOraniAlan} onChange={e => setPoliceInfo({...policeInfo, hasarOraniAlan: e.target.value})} />
              </div>
              <div className="res-box orange-res">Alan Bazlı Sonuç: {alanBazliHasar.toFixed(2)} %</div>
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
      </main>
    </div>
  );
}

export default App;
