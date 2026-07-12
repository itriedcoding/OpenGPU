import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "OpenGPU cut our AI training costs by 70%. The marketplace makes it easy to find the perfect GPU for any workload.",
    author: "Sarah Chen",
    role: "ML Engineer at TechCorp",
    rating: 5,
  },
  {
    quote: "I'm earning $800/month from my gaming PC's idle time. Setup was incredibly simple - just install the agent and go.",
    author: "Marcus Johnson",
    role: "GPU Provider",
    rating: 5,
  },
  {
    quote: "The open source approach gives us confidence. We can audit the code and contribute features we need.",
    author: "Dr. Emily Park",
    role: "Research Lead at AI Lab",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="section-heading text-foreground">
            Loved by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            See what our community has to say about OpenGPU.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="glass-panel p-8">
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-foreground leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {testimonial.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
