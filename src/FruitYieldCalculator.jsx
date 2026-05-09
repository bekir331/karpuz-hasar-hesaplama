import React, { useState } from 'react';

const FruitYieldCalculator = () => {
  const [samples, setSamples] = useState(
    Array(6).fill(null).map(() => ({
      a: '', // Bir Ağaçtaki Ana Dal sayısı
      b: '', // Bir Ana Daldaki Ortalama Yan Dal Sayısı
      c: '', // Bir Yan Daldaki Ortalama Dalcık Sayısı
      d: '', // Bir Dalcık Üzerindeki Ortalama Meyve Adedi
      e: '', // Meyve Çeşidine göre Ortalama Ağırlık (Gr)
      g: '', // Tanımlanamayan Diğer Verim (Kg/ağaç)
      i: '', // Hasat Edilen Toplam Meyve Miktarı (Kg/ağaç)
    }))
  );

  const n = (v) => {
    if (v === '' || v === undefined || v === null) return 0;
    const normalized = v.toString().replace(',', '.');
    const num = Number(normalized);
    return isNaN(num) ? 0 : num;
  };

  const handleInputChange = (index, field, value) => {
    const newSamples = [...samples];
    newSamples[index] = { ...newSamples[index], [field]: value };
    setSamples(newSamples);
  };

  const calculateSampleResults = (s) => {
    const f = (n(s.a) * n(s.b) * n(s.c) * n(s.d) * n(s.e)) / 1000;
    const total = f + n(s.g) + n(s.i);
    return { f, total };
  };

  const activeSamples = samples.filter(s => Object.values(s).some(val => val !== ''));
  const activeCount = activeSamples.length || 1;
  const results = samples.map(calculateSampleResults);
  
  const totalSum = samples.reduce((acc, s) => {
    if (Object.values(s).some(val => val !== '')) {
      return acc + calculateSampleResults(s).total;
    }
    return acc;
  }, 0);
  
  const avgYield = totalSum / activeCount;

  const getFormulaText = () => {
    if (activeSamples.length === 0) return "(0) / 0";
    const indices = [];
    samples.forEach((s, i) => {
      if (Object.values(s).some(val => val !== '')) {
        indices.push(i + 1);
      }
    });
    return `(${indices.join('+')}) / ${indices.length}`;
  };

  return (
    <div className="form-card">
      <h3 className="card-title grey">Açık Alan Verim Tespiti (Meyve)</h3>
      <div className="scroll-table">
        <table className="calc-table">
          <thead>
            <tr>
              <th style={{ width: '250px' }}>Gözlenen Kriterler</th>
              {samples.map((_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A) Bir Ağaçtaki Ana Dal sayısı</td>
              {samples.map((s, i) => (
                <td key={i}><input type="text" value={s.a} onChange={(e) => handleInputChange(i, 'a', e.target.value)} /></td>
              ))}
            </tr>
            <tr>
              <td>B) Bir Ana Daldaki Ortalama Yan Dal Sayısı</td>
              {samples.map((s, i) => (
                <td key={i}><input type="text" value={s.b} onChange={(e) => handleInputChange(i, 'b', e.target.value)} /></td>
              ))}
            </tr>
            <tr>
              <td>C) Bir Yan Daldaki Ortalama Dalcık Sayısı</td>
              {samples.map((s, i) => (
                <td key={i}><input type="text" value={s.c} onChange={(e) => handleInputChange(i, 'c', e.target.value)} /></td>
              ))}
            </tr>
            <tr>
              <td>D) Bir Dalcık Üzerindeki Ortalama Meyve Adedi</td>
              {samples.map((s, i) => (
                <td key={i}><input type="text" value={s.d} onChange={(e) => handleInputChange(i, 'd', e.target.value)} /></td>
              ))}
            </tr>
            <tr>
              <td>E) Meyve Çeşidine göre Ortalama Ağırlık (Gr)</td>
              {samples.map((s, i) => (
                <td key={i}><input type="text" value={s.e} onChange={(e) => handleInputChange(i, 'e', e.target.value)} /></td>
              ))}
            </tr>
            <tr className="res-row">
              <td style={{ fontWeight: 'bold' }}>F) Ortalama Verim (kg/ağaç) = (A x B x C x D x E) / 1000</td>
              {results.map((r, i) => (
                <td key={i} className="res">{r.f.toFixed(2)}</td>
              ))}
            </tr>
            <tr>
              <td>G) Tanımlanamayan Diğer Verim (Kg/ağaç)</td>
              {samples.map((s, i) => (
                <td key={i}><input type="text" value={s.g} onChange={(e) => handleInputChange(i, 'g', e.target.value)} /></td>
              ))}
            </tr>
            <tr>
              <td>I) Hasat Edilen Toplam Meyve Miktarı (Kg/ağaç)</td>
              {samples.map((s, i) => (
                <td key={i}><input type="text" value={s.i} onChange={(e) => handleInputChange(i, 'i', e.target.value)} /></td>
              ))}
            </tr>
            <tr className="res-row-highlight">
              <td style={{ fontWeight: 'bold' }}>Toplam Verim (Kg/ağaç)</td>
              {results.map((r, i) => (
                <td key={i} className="res"><strong>{r.total.toFixed(2)}</strong></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="exact-result-box" style={{ marginTop: '20px' }}>
        <div className="exact-res-title">Ortalama Verim (Kg/ağaç)</div>
        <div className="exact-res-math" style={{ fontSize: '24px' }}>
          = {getFormulaText()} = <strong style={{ color: '#16a34a' }}>{avgYield.toFixed(2)} kg / Ağaç</strong>
        </div>
      </div>
    </div>
  );
};

export default FruitYieldCalculator;
