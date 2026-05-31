export default function CoverageSection() {
  return (
    <section style={{padding: '3rem 0', textAlign: 'center'}}>
      <h2 style={{fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem'}}>Coverage</h2>
      <p style={{maxWidth: 600, margin: '0 auto 2rem'}}>
        TrackFlow operates warehouses in Los Angeles (USA) and Zaragoza (Spain), serving e-commerce brands across both countries. Our carrier network includes UPS, FedEx, DHL, MRW, SEUR, and more.
      </p>
      <div style={{display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap'}}>
        <div style={{background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: '1.5rem', minWidth: 200}}>
          <strong>USA</strong>
          <div>Los Angeles warehouse</div>
          <div>UPS, FedEx, DHL</div>
        </div>
        <div style={{background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: '1.5rem', minWidth: 200}}>
          <strong>Spain</strong>
          <div>Zaragoza warehouse</div>
          <div>MRW, SEUR, DHL, local carriers</div>
        </div>
      </div>
    </section>
  );
}
