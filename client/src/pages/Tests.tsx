import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Target, Palette, Grid3x3, Focus, ClipboardList } from "lucide-react";
import { Link } from "wouter";

const TESTS = [
  {
    id: "snellen",
    name: "Snellen Görme Keskinliği Testi",
    description: "Uzak mesafe görme keskinliğinizi ölçer. Standart göz muayenelerinde kullanılan en yaygın testtir.",
    icon: Eye,
    duration: "5 dakika",
    difficulty: "Kolay",
    path: "/tests/snellen",
    available: true,
  },
  {
    id: "contrast",
    name: "Kontrast Duyarlılığı Testi",
    description: "Farklı kontrast seviyelerindeki nesneleri ayırt etme yeteneğinizi değerlendirir.",
    icon: Target,
    duration: "7 dakika",
    difficulty: "Orta",
    path: "/tests/contrast",
    available: false,
  },
  {
    id: "color",
    name: "Renk Görme Testi (Ishihara)",
    description: "Renk körlüğü ve renk algılama problemlerini tespit eder.",
    icon: Palette,
    duration: "5 dakika",
    difficulty: "Kolay",
    path: "/tests/color",
    available: false,
  },
  {
    id: "astigmatism",
    name: "Astigmat Testi",
    description: "Gözünüzde astigmat olup olmadığını ve derecesini kontrol eder.",
    icon: Grid3x3,
    duration: "3 dakika",
    difficulty: "Kolay",
    path: "/tests/astigmatism",
    available: false,
  },
  {
    id: "convergence",
    name: "Göz Takibi ve Konverjans Testi",
    description: "Kamera ile göz hareketlerinizi takip eder ve konverjans yeteneğinizi ölçer.",
    icon: Focus,
    duration: "4 dakika",
    difficulty: "Orta",
    path: "/tests/eye-tracking",
    available: true,
  },
  {
    id: "symptom",
    name: "Semptom Anketi",
    description: "Dijital göz yorgunluğu ve diğer göz problemlerini değerlendiren kapsamlı anket.",
    icon: ClipboardList,
    duration: "10 dakika",
    difficulty: "Kolay",
    path: "/tests/symptom",
    available: false,
  },
];

export default function Tests() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VisionCare</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/tests">
              <Button variant="default">Testler</Button>
            </Link>
            <Link href="/exercises">
              <Button variant="ghost">Egzersizler</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Göz Sağlığı Testleri</h1>
          <p className="text-muted-foreground mt-2">
            Kapsamlı testlerle göz sağlığınızı değerlendirin ve gelişiminizi takip edin
          </p>
        </div>

        <div className="bg-accent/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">⚠️ Önemli Uyarı</h3>
          <p className="text-sm text-muted-foreground">
            Bu testler bilgilendirme amaçlıdır ve profesyonel bir göz muayenesinin yerini tutmaz. 
            Herhangi bir görme problemi yaşıyorsanız lütfen bir göz doktoruna başvurun.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTS.map((test) => {
            const Icon = test.icon;

            return (
              <Card key={test.id} className={!test.available ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Icon className="h-10 w-10 text-primary shrink-0" />
                    {!test.available && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                        Yakında
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-4">{test.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {test.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>⏱️ {test.duration}</span>
                    <span>📊 {test.difficulty}</span>
                  </div>

                  {test.available ? (
                    <Link href={test.path}>
                      <Button className="w-full">Teste Başla</Button>
                    </Link>
                  ) : (
                    <Button className="w-full" disabled>
                      Yakında Gelecek
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Önerileri</CardTitle>
            <CardDescription>Göz sağlığınız için test programı</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Haftalık Kontrol</h4>
                <p className="text-sm text-muted-foreground">
                  Snellen testi ve semptom anketini haftada bir kez yapmanızı öneriyoruz.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="bg-accent/50 p-2 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Aylık Değerlendirme</h4>
                <p className="text-sm text-muted-foreground">
                  Tüm testleri ayda bir kez tamamlayarak kapsamlı bir değerlendirme yapın.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="bg-green-100 p-2 rounded-lg">
                <ClipboardList className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">İlerleme Takibi</h4>
                <p className="text-sm text-muted-foreground">
                  Test sonuçlarınız otomatik olarak kaydedilir ve dashboard'da görüntülenebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

