import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { PlexCoin } from '@/components/sections/PlexCoin'
import { Auth } from '@/components/sections/Auth'
import { DepositsOverview } from '@/components/sections/DepositsOverview'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Referral } from '@/components/sections/Referral'
import { Loyalty } from '@/components/sections/Loyalty'
import { Multipliers } from '@/components/sections/Multipliers'
import { DeviceMining } from '@/components/sections/DeviceMining'
import { VolatilityTrading } from '@/components/sections/VolatilityTrading'
import { TechInfo } from '@/components/sections/TechInfo'
import { MevDetailed } from '@/components/sections/MevDetailed'
import { TaxModel } from '@/components/sections/TaxModel'
import { Security } from '@/components/sections/Security'
import { Roadmap } from '@/components/sections/Roadmap'
import { Team } from '@/components/sections/Team'
import { Partners } from '@/components/sections/Partners'
import { Testimonials } from '@/components/sections/Testimonials'
import { FAQ } from '@/components/sections/FAQ'
import { PwaInstall } from '@/components/sections/PwaInstall'
import { PlatformAccess } from '@/components/sections/PlatformAccess'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background-primary">
      <Header />
      <Hero />
      <Features />
      <PlexCoin />
      <Auth />
      <DepositsOverview />
      <HowItWorks />
      <Referral />
      <Loyalty />
      <Multipliers />
      <DeviceMining />
      <VolatilityTrading />
      <TechInfo />
      <MevDetailed />
      <TaxModel />
      <Security />
      <Roadmap />
      <Team />
      <Partners />
      <Testimonials />
      <FAQ />
      <PwaInstall />
      <PlatformAccess />
      <FinalCTA />
      <Footer />
    </main>
  )
}
