import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="section container">
      <p className="eyebrow">404</p>
      <h1>Sahifa topilmadi.</h1>
      <Link className="button spaced" href="/">
        Bosh sahifaga ↗
      </Link>
    </section>
  );
}
