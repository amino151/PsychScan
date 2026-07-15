import { motion } from 'framer-motion';

export default function PageHeader({ eyebrow, icon: Icon, title, subtitle, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-3xl border border-white/40 bg-white/75 backdrop-blur-xl shadow-panel p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          {eyebrow ? (
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-primary/80">
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-display font-bold mt-2">{title}</h1>
          {subtitle ? <p className="text-muted-foreground mt-1">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </motion.div>
  );
}
