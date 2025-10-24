import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Eye, Activity, Target, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">{APP_TITLE}</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/profile/setup">
                  <Button variant="outline">Profilim</Button>
                </Link>
              </>
            ) : (
              <>
                <a href="#features">
                  <Button variant="ghost">Özellikler</Button>
                </a>
                <Link href="/pricing">
                  <Button variant="ghost">Fiyatlandırma</Button>
                </Link>
                <a href={getLoginUrl()}>
                  <Button>Giriş Yap</Button>
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-accent/20 to-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                AI Destekli Göz Sağlığı Platformu
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Gözlerinizin Sağlığını
                <span className="text-primary block">Takip Edin</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Bilimsel temelli göz egzersizleri, kişiselleştirilmiş takip ve AI destekli simülasyonlarla 
                göz sağlığınızı koruyun ve iyileştirin.
              </p>
              <div className="flex gap-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2">
                      Dashboard'a Git <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <a href={getLoginUrl()}>
                      <Button size="lg" className="gap-2">
                        Ücretsiz Başla <ArrowRight className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href="#features">
                      <Button size="lg" variant="outline">
                        Özellikleri Keşfet
                      </Button>
                    </a>
                  </>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>3 gün ücretsiz deneme</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Kredi kartı gerekmez</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
                <Eye className="h-64 w-64 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Neden VisionCare?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bilimsel araştırmalara dayanan, kullanıcı dostu ve etkili bir göz sağlığı platformu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Eye className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI Göz Simülasyonu</CardTitle>
                <CardDescription>
                  Gözünüzün dünyayı nasıl gördüğünü gerçek zamanlı olarak simüle edin ve gelişiminizi görsel olarak takip edin
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Kişiselleştirilmiş Egzersizler</CardTitle>
                <CardDescription>
                  Yaşınıza, mesleğinize ve göz durumunuza özel olarak tasarlanmış bilimsel egzersiz programları
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Gelişim Takibi</CardTitle>
                <CardDescription>
                  Günlük, haftalık ve aylık raporlarla göz sağlığınızdaki değişimi detaylı olarak izleyin
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Bilimsel Temelli</CardTitle>
                <CardDescription>
                  Tüm önerilerimiz güncel bilimsel makalelere ve klinik araştırmalara dayanmaktadır
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Kapsamlı Testler</CardTitle>
                <CardDescription>
                  Snellen, kontrast, renk görme, astigmat ve konverjans testleriyle tam değerlendirme
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Akıllı Bildirimler</CardTitle>
                <CardDescription>
                  Bilimsel referanslarla desteklenmiş kişiselleştirilmiş hatırlatıcılar ve öneriler
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Göz Sağlığınız İçin İlk Adımı Atın
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            3 gün ücretsiz deneme ile tüm özelliklere erişin. Kredi kartı bilgisi gerekmez.
          </p>
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary" className="gap-2">
                Hemen Başla <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                <span className="font-bold">{APP_TITLE}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bilimsel temelli göz sağlığı takip platformu
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ürün</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features">Özellikler</a></li>
                <li><Link href="/pricing">Fiyatlandırma</Link></li>
                <li><Link href="/exercises">Egzersizler</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq">SSS</Link></li>
                <li><Link href="/contact">İletişim</Link></li>
                <li><Link href="/privacy">Gizlilik</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Bilimsel Kaynaklar</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/research">Araştırmalar</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 {APP_TITLE}. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

