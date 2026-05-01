import {
  ArrowRight,
  Sparkles,
  DatabaseIcon,
  Eye,
  Shield,
  Target,
  TrendingUp,
  MessageSquare,
  Brain,
  Instagram,
  Linkedin,
  Youtube,
  Plane,
  Luggage,
  MapPin,
  Globe,
  Coffee,
  Home,
  ShoppingBag,
  Train,
  Utensils,
  BookOpen,
  Heart,
} from "lucide-react";
import { DynamicLucideIcon } from "@/components/DynamicLucideIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMeetingCollections } from "@/store/slices/meetingSlice";
import { getMeetingModules } from "@/store/slices/meetingModulesSlice";
import { selectTotalModulesCountRounded } from "@/store/selectors/meetingModulesSelectors";
import { generateCategoryId } from "@/utils/categoryId";
import { logger } from "@/utils/logger";
import { useProduct } from "@/hooks/useProduct";
import { cn } from "@/lib/utils";

const ROTATING_LANGUAGES = ["English", "Spanish", "French", "Catalan", "Portuguese", "Italian"];

function TypewriterLanguage() {
  const [langIndex, setLangIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = ROTATING_LANGUAGES[langIndex];
    if (!isDeleting && displayed === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }
    if (isDeleting && displayed === "") {
      setIsDeleting(false);
      setLangIndex((prev) => (prev + 1) % ROTATING_LANGUAGES.length);
      return;
    }
    const speed = isDeleting ? 50 : 100;
    const timeout = setTimeout(() => {
      setDisplayed(
        isDeleting
          ? currentWord.slice(0, displayed.length - 1)
          : currentWord.slice(0, displayed.length + 1)
      );
    }, speed);
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, langIndex]);

  return (
    <span className="inline-block min-w-[4ch]">
      {displayed}
      <span className="animate-pulse text-white/40">|</span>
    </span>
  );
}

export default function Homepage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleCTA = () => {
    if (auth.isLoggedIn()) {
      navigate("/dashboard");
    } else if (localStorage.getItem("onboarding_complete")) {
      navigate("/login");
    } else {
      navigate("/onboarding");
    }
  };
  const config = useProduct();

  const { collections, collectionsLoading, collectionsError } = useAppSelector(
    (state) => state.meeting
  );
  const totalModulesCount = useAppSelector(selectTotalModulesCountRounded);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  useEffect(() => {
    logger.log("[Homepage] Mounting");
    dispatch(fetchMeetingCollections(false));
    dispatch(getMeetingModules({}));
  }, [dispatch]);

  useEffect(() => {
    logger.log("[Homepage] Collections:", { loading: collectionsLoading, error: collectionsError, count: collections.length });
  }, [collectionsLoading, collectionsError, collections]);

  return (
    <>
      <Header showLogout solidBackground={true} />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { Icon: Heart, style: { top: "25%", left: "25%", animationDuration: "6s", animationDelay: "0s" } },
            { Icon: Luggage, style: { top: "33%", right: "25%", animationDuration: "8s", animationDelay: "1s" } },
            { Icon: Globe, style: { bottom: "33%", left: "33%", animationDuration: "7s", animationDelay: "0.5s" } },
            { Icon: MapPin, style: { top: "66%", right: "33%", animationDuration: "9s", animationDelay: "2s" } },
            { Icon: Coffee, style: { top: "20%", right: "20%", animationDuration: "7.5s", animationDelay: "1.5s" } },
            { Icon: Home, style: { bottom: "25%", left: "20%", animationDuration: "8.5s", animationDelay: "0.8s" } },
            { Icon: ShoppingBag, style: { top: "12%", left: "55%", animationDuration: "7s", animationDelay: "1.2s" } },
            { Icon: Train, style: { top: "45%", right: "10%", animationDuration: "8s", animationDelay: "2.5s" } },
            { Icon: Utensils, style: { bottom: "15%", left: "48%", animationDuration: "6.5s", animationDelay: "0.3s" } },
            { Icon: BookOpen, style: { top: "50%", left: "8%", animationDuration: "9s", animationDelay: "1.8s" } },
            { Icon: Plane, style: { bottom: "10%", right: "18%", animationDuration: "7.5s", animationDelay: "3s" } },
          ].map(({ Icon, style }, i) => (
            <div key={i} className="absolute w-10 h-10 border-2 border-white/20 rounded-lg animate-float flex items-center justify-center text-white/25" style={style as React.CSSProperties}>
              <Icon size={20} />
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-12 tracking-tight animate-fade-in leading-tight">
            <TypewriterLanguage />, Like an Expat
          </h1>
          <p className="text-xl sm:text-2xl text-white/95 max-w-4xl mx-auto leading-relaxed mb-16 animate-fade-in font-medium">
            {config.i18n.hero.description}
          </p>
          <div className="flex justify-center items-center animate-fade-in mb-20">
            <Button
              size="lg"
              onClick={handleCTA}
              className="bg-white text-primary hover:bg-white hover:scale-105 text-lg px-10 py-7 h-auto font-bold shadow-2xl transition-transform duration-300"
            >
              {config.i18n.hero.ctaButton}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {config.i18n.categories.title}
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {totalModulesCount > 0 ? config.i18n.categories.subtitle : config.i18n.categories.subtitleFallback}
          </p>
        </div>

        {collectionsLoading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground text-lg">{config.i18n.loading}</p>
          </div>
        )}

        {/* collectionsError block hidden until backend is connected */}

        {!collectionsLoading && !collectionsError && collections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {[...collections].sort((a, b) => a.order - b.order).map((collection) => {
              const categoryId = generateCategoryId(collection.name);
              return (
                <Card
                  key={collection.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur cursor-pointer overflow-hidden relative"
                  onClick={() => navigate(`/dashboard#${categoryId}`)}
                >
                  <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity", collection.color)} />
                  <CardContent className="p-8 relative z-10">
                    <div className={cn("w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300", collection.color)}>
                      <DynamicLucideIcon name={collection.icon} className="w-8 h-8 text-white" fallback="Target" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-3">{collection.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">{collection.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!collectionsLoading && !collectionsError && collections.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">{config.i18n.noConversationCategories}</p>
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="relative bg-gradient-to-br from-primary via-accent to-primary py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Languages You Can Learn</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Practice real conversations in the language you need most</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { flag: "🇬🇧", name: "English" },
              { flag: "🇪🇸", name: "Spanish" },
              { flag: "🇫🇷", name: "French" },
              { flag: "🇮🇹", name: "Italian" },
              { flag: "🏴", name: "Catalan" },
              { flag: "🇧🇷", name: "Portuguese" },
            ].map((lang) => (
              <Card key={lang.name} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/20 hover:border-white/40 bg-white/10 backdrop-blur">
                <CardContent className="p-6 text-center flex flex-col items-center gap-3">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{lang.flag}</span>
                  <h3 className="text-lg font-bold text-white">{lang.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Data Protection */}
      <div className="bg-gradient-to-br from-muted/50 via-background to-muted/30 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">{config.i18n.dataProtection.title}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{config.i18n.dataProtection.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: DatabaseIcon, ...config.i18n.dataProtection.encryption, color: "from-blue-500 to-cyan-600" },
              { icon: Eye, ...config.i18n.dataProtection.privacy, color: "from-purple-500 to-pink-600" },
              { icon: Shield, ...config.i18n.dataProtection.storage, color: "from-green-500 to-emerald-600" },
            ].map((item, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-border/50 hover:border-green-500/50 bg-card/80 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Card className="max-w-2xl mx-auto border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="p-6">
                <p className="text-foreground font-medium">
                  <MessageSquare className="w-5 h-5 inline-block mr-2 text-green-600" />
                  {config.i18n.dataProtection.bottomMessage.split("only you have access to it")[0]}
                  <span className="font-bold text-green-600">only you have access to it</span>
                  {config.i18n.dataProtection.bottomMessage.split("only you have access to it")[1]}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-background py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">{config.i18n.howItWorks.title}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{config.i18n.howItWorks.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            {[
              { step: "1", icon: Target, ...config.i18n.howItWorks.step1, color: "from-blue-500 to-cyan-600" },
              { step: "2", icon: Brain, ...config.i18n.howItWorks.step2, color: "from-purple-500 to-pink-600" },
              { step: "3", icon: TrendingUp, ...config.i18n.howItWorks.step3, color: "from-orange-500 to-red-600" },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}>
                    <item.icon className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute top-0 left-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg -translate-x-2 -translate-y-2 border-4 border-background z-20">
                    <span className="text-2xl font-bold text-foreground">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-br from-primary via-accent to-primary rounded-3xl p-12 sm:p-16 text-center text-white overflow-hidden shadow-2xl">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
          <div className="relative z-10">
            <Sparkles className="w-16 h-16 mx-auto animate-pulse mb-6" />
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">{config.i18n.cta.title}</h2>
            <p className="text-2xl text-white/95 mb-10 max-w-3xl mx-auto font-medium">{config.i18n.cta.subtitle}</p>
            <Button size="lg" onClick={handleCTA} className="bg-white text-primary hover:bg-white hover:scale-105 text-xl px-12 py-8 h-auto font-bold shadow-2xl transition-transform">
              {config.i18n.cta.button}
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-primary via-accent to-primary mt-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">{config.i18n.footer.companyName}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{config.i18n.footer.companyDescription}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">{config.i18n.footer.resources}</h3>
              <ul className="space-y-2">
                {[
                  { to: "/faq", label: config.i18n.footer.faq },
                  { to: "/privacy-policy", label: config.i18n.footer.privacyPolicy },
                  { to: "/terms-of-service", label: config.i18n.footer.termsOfService },
                  { to: "/subscription-billing", label: config.i18n.footer.subscriptionBilling },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-white/80 hover:text-white text-sm transition-colors duration-200">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">{config.i18n.footer.contact}</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">{config.i18n.footer.contactDescription}</p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors duration-200"><Instagram className="w-5 h-5" /></a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors duration-200"><Linkedin className="w-5 h-5" /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors duration-200"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-sm">{config.i18n.footer.copyright(new Date().getFullYear())}</p>
              <p className="text-white/60 text-sm">{config.i18n.footer.madeWith}</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
