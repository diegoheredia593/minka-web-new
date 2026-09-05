export function SectionIntro({
  id,
  eyebrow,
  title,
  text,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="section-intro" data-reveal>
      <span>{eyebrow}</span>
      <h2 id={id}>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
