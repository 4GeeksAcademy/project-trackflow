export default function ContactSection() {
  return (
    <section style={{padding: '3rem 0', background: '#f5f5f5', textAlign: 'center'}}>
      <h2 style={{fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem'}}>Contact & Lead Form</h2>
      <p style={{maxWidth: 600, margin: '0 auto 2rem'}}>
        Interested in outsourcing your logistics? Contact our team for a tailored proposal.
      </p>
      <form style={{maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <input type="text" placeholder="Company Name" required style={{padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc'}} />
        <input type="email" placeholder="Corporate Email" required style={{padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc'}} />
        <input type="text" placeholder="Contact Person" required style={{padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc'}} />
        <input type="text" placeholder="Phone" style={{padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc'}} />
        <input type="url" placeholder="Company Website" style={{padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc'}} />
        <button type="submit" style={{padding: '0.75rem', borderRadius: 6, background: '#047857', color: '#fff', fontWeight: 600, border: 'none'}}>Request Info</button>
      </form>
      <div style={{marginTop: '2rem', color: '#666', fontSize: '0.95rem'}}>
        Or email us: <a href="mailto:comercial@trackflow.com">comercial@trackflow.com</a>
      </div>
    </section>
  );
}
