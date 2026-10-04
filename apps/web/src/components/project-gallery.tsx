'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';
import type { ProjectImage } from '@buhariy/contracts';
export function ProjectGallery({
  images,
  title,
  labels,
}: {
  images: ProjectImage[];
  title: string;
  labels: { open: string; close: string; previous: string; next: string; image: string };
}) {
  const [active, setActive] = useState(
      Math.max(
        0,
        images.findIndex((i) => i.isCover),
      ),
    ),
    [opened, setOpened] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!opened) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, [opened]);
  if (!images.length) return null;
  const image = images[active];
  const step = (direction: number) =>
    setActive((index) => (index + direction + images.length) % images.length);
  return (
    <div className="project-gallery case-gallery">
      <button
        className="case-gallery-main"
        type="button"
        aria-label={labels.open}
        onClick={() => {
          dialog.current?.showModal();
          setOpened(true);
        }}
      >
        <Image
          key={image.id}
          src={image.url}
          alt={image.alt || title}
          width={1800}
          height={1100}
          sizes="(max-width:768px) 92vw, 85vw"
          loading="eager"
        />
        <span className="gallery-expand">
          <Expand size={18} />
          {labels.open}
        </span>
      </button>
      <div className="gallery-caption">
        <span>{image.alt || title}</span>
        <span>
          {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </span>
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails" role="group" aria-label={title}>
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${labels.image} ${index + 1}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <Image
                src={item.url}
                alt={item.alt || `${title} ${index + 1}`}
                width={240}
                height={150}
                sizes="(max-width:768px) 17vw, 150px"
              />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-label={title}
        onClose={() => setOpened(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            step(-1);
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            step(1);
          }
        }}
      >
        <div className="gallery-dialog-bar">
          <span>
            {title} · {active + 1} / {images.length}
          </span>
          <button
            type="button"
            aria-label={labels.close}
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            <X />
          </button>
        </div>
        {opened && (
          <Image src={image.url} alt={image.alt || title} width={2000} height={1400} sizes="95vw" />
        )}
        <div className="gallery-dialog-bar">
          <button
            type="button"
            disabled={images.length < 2}
            aria-label={labels.previous}
            onClick={() => step(-1)}
          >
            <ArrowLeft />
          </button>
          <p>{image.alt || title}</p>
          <button
            type="button"
            disabled={images.length < 2}
            aria-label={labels.next}
            onClick={() => step(1)}
          >
            <ArrowRight />
          </button>
        </div>
      </dialog>
    </div>
  );
}
