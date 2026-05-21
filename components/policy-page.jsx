export function PolicyPage({ eyebrow, sections, title }) {
  return (
    <section className="info-page policy-page">
      <div className="info-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>BubbleBud keeps store policies clear so customers can shop with confidence before checkout.</p>
      </div>
      <div className="info-detail-grid policy-grid">
        {sections.map(([heading, body]) => (
          <article key={heading}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
