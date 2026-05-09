import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-xl font-bold tracking-tight text-primary">
        KEDevs<span className="text-foreground/50">.</span>
      </span>
    </Link>
  );
}
