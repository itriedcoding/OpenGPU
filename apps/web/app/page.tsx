import { HeroSection } from "@/components/HeroSection";
import { StatsBar } from "@/components/StatsBar";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { GpuShowcase } from "@/components/GpuShowcase";
import { ProviderCTA } from "@/components/ProviderCTA";
import { Testimonials } from "@/components/Testimonials";
import { FinalCTA } from "@/components/FinalCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeaturesGrid />
      <HowItWorks />
      <GpuShowcase />
      <ProviderCTA />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
