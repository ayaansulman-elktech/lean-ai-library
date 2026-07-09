export function Hero() {
  return (
    <section
      className="relative w-full text-center"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
        paddingTop: 'clamp(60px, 6.77vw, 130px)',
        paddingBottom: 'clamp(40px, 4.17vw, 80px)',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(36px, 6.25vw, 120px)',
          fontWeight: 700,
          lineHeight: '1.0',
          letterSpacing: '0',
          color: '#000000',
          margin: '0 auto',
        }}
      >
        Build lean<br />
        Measure fast<br />
        Keep only what wins.
      </h1>

      <p
        style={{
          marginTop: 'clamp(24px, 2.4vw, 46px)',
          fontSize: 'clamp(13px, 1.308vw, 25.11px)',
          fontWeight: 274,
          lineHeight: '1.7',
          letterSpacing: '0',
          color: '#3c3c3c',
          margin: 'clamp(24px, 2.4vw, 46px) auto 0',
        }}
      >
        Cognitive shift is an independent platform built on continuous exposure to advanced AI research from MIT and the<br />
        latest industry practices from leading Silicon Valley companies, Cognitive Shift transforms complex ideas into<br />
        directly applicable frameworks.
      </p>
    </section>
  );
}
