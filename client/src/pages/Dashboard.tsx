import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Eye, Activity, Target, TrendingUp, TrendingDown, Minus, Calendar, Award } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: subscription } = trpc.subscription.getMySubscription.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: fatigueStats } = trpc.fatigue.getStats.useQuery({ days: 7 });
  const { data: exerciseStats } = trpc.exercises.getStats.useQuery({ days: 30 });
  const { data: latestSimulation } = trpc.simulation.getLatest.useQuery({});

  const hasProfile = !!profile;
  const hasActiveSubscription = subscription?.status === "active" && new Date(subscription.endDate) > new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
              <Button variant="ghost">Testler</Button>
            </Link>
            <Link href="/exercises">
              <Button variant="ghost">Egzersizler</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline">Profil</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Hoş Geldiniz, {user?.name || "Kullanıcı"}!</h1>
          <p className="text-muted-foreground mt-2">
            Göz sağlığınızı takip edin ve gelişiminizi izleyin
          </p>
        </div>

        {/* Onboarding Alert */}
        {!hasProfile && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle>Profilinizi Tamamlayın</CardTitle>
              <CardDescription>
                Kişiselleştirilmiş öneriler ve egzersiz programları için göz sağlığı profilinizi oluşturun.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile/setup">
                <Button>Profil Oluştur</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Subscription Status */}
        {!hasActiveSubscription && (
          <Card className="border-accent bg-accent/5">
            <CardHeader>
              <CardTitle>Abonelik Durumu</CardTitle>
              <CardDescription>
                {subscription ? "Aboneliğinizin süresi dolmuş" : "Henüz bir aboneliğiniz yok"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pricing">
                <Button variant="outline">Abonelik Planlarını Görüntüle</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {hasActiveSubscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Aktif Abonelik
              </CardTitle>
              <CardDescription>
                Aboneliğiniz {new Date(subscription.endDate).toLocaleDateString("tr-TR")} tarihine kadar geçerli
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Göz Yorgunluğu</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fatigueStats?.averageScore ? `${fatigueStats.averageScore}/10` : "-"}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {fatigueStats?.trend === "improving" && (
                  <>
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">İyileşiyor</span>
                  </>
                )}
                {fatigueStats?.trend === "worsening" && (
                  <>
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Kötüleşiyor</span>
                  </>
                )}
                {fatigueStats?.trend === "stable" && (
                  <>
                    <Minus className="h-3 w-3 text-muted-foreground" />
                    <span>Stabil</span>
                  </>
                )}
                <span className="ml-1">Son 7 gün</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Egzersiz</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exerciseStats?.totalExercises || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Egzersiz Süresi</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exerciseStats?.totalMinutes || 0} dk</div>
              <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Günler</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exerciseStats?.uniqueDays || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bugünkü Görevler</CardTitle>
              <CardDescription>Göz sağlığınız için önerilen aktiviteler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Sabah Yorgunluk Kaydı</p>
                  <p className="text-sm text-muted-foreground">Gözlerinizin yorgunluk seviyesini kaydedin</p>
                </div>
                <Link href="/fatigue/log">
                  <Button size="sm">Kaydet</Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Günlük Egzersiz</p>
                  <p className="text-sm text-muted-foreground">10 dakikalık göz egzersizi yapın</p>
                </div>
                <Link href="/exercises">
                  <Button size="sm">Başla</Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Haftalık Test</p>
                  <p className="text-sm text-muted-foreground">Görme keskinliği testinizi yapın</p>
                </div>
                <Link href="/tests/snellen">
                  <Button size="sm">Teste Başla</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Simülasyon</CardTitle>
              <CardDescription>Gözünüzün dünyayı nasıl gördüğü</CardDescription>
            </CardHeader>
            <CardContent>
              {latestSimulation ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Eye className="h-24 w-24 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Tip:</span> {latestSimulation.simulationType}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Şiddet:</span> {latestSimulation.severity}/10
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(latestSimulation.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <Link href="/simulation">
                    <Button variant="outline" className="w-full">Simülasyonu Görüntüle</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <Eye className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm text-muted-foreground">Henüz simülasyon oluşturulmamış</p>
                  <Link href="/simulation/create">
                    <Button>İlk Simülasyonu Oluştur</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

