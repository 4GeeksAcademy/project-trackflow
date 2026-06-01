export default function ServicesSection() {
  return (
    <section style={{padding: '3rem 0', background: '#f5f5f5'}}>
      <h2 style={{fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem'}}>Our Services</h2>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem'}}>
        <div style={{maxWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: '2rem'}}>
          <h3 style={{fontWeight: 600}}>Warehouse Management</h3>
          <p>Inventory storage, order picking, packing, and fulfillment for e-commerce brands. Real-time stock and low-stock alerts.</p>
        </div>
        <div style={{maxWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: '2rem'}}>
          <h3 style={{fontWeight: 600}}>Last-Mile Delivery</h3>
          <p>Fast, reliable delivery to your customers’ doors in the US and Spain. Multi-carrier network for optimal routing.</p>
        </div>
        <div style={{maxWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: '2rem'}}>
          <h3 style={{fontWeight: 600}}>Reverse Logistics</h3>
          <p>Returns management, product inspection, and reconditioning. Automated approval and collection flows.</p>
        </div>
      </div>
    </section>
  );
}
