// src/components/Logo.tsx
type LogoProps = {
  /** Ruta del PNG (si está en /public, por ejemplo "/logo.png") */
  src?: string;
  alt?: string;
  /** Clases Tailwind para el contenedor (centrado, alto, etc.) */
  containerClass?: string;
  /** Clases Tailwind para la imagen (w/h/size, borde, sombra, etc.) */
  imgClass?: string;
  /** Si true (default), centra con grid place-items-center */
  centered?: boolean;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Logo({
  src = "/logo.png",
  alt = "Logo",
  containerClass,
  imgClass,
  centered = true,
}: LogoProps) {
  return (
    <div
      className={cn(
        centered && "grid place-items-center",
        // altura mínima para evitar layout shift si la imagen tarda
        "relative",
        containerClass
      )}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={cn(
          // base: mantiene proporción cuadrada y se adapta al contenedor
          "object-contain aspect-square",
          // tamaño y estilo por defecto (fácil de sobrescribir)
          "w-24 h-24 drop-shadow-md",
          imgClass
        )}
        onError={(e) => {
          // fallback visual simple si el PNG no existe
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
