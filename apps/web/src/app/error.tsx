'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section container">
      <p className="eyebrow">BUHARIY TECH</p>
      <h1>Ma’lumotlarni yuklab bo‘lmadi.</h1>
      <p>Iltimos, birozdan so‘ng qayta urinib ko‘ring.</p>
      <button className="button" onClick={reset}>
        Qayta urinish ↗
      </button>
    </section>
  );
}
