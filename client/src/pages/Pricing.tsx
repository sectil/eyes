import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Check, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: plans, isLoading } = trpc.subscription.getPlans.useQuery();
  const subscribe = trpc.subscription.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Abonelik başarıyla oluşturuldu!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Abonelik oluşturulurken hata: " + error.message);
    },
  });

  const handleSubscribe = (planId: number, price: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (price === 0) {
      // Free trial - direct subscription
      subscribe.mutate({ planId });
    } else {
      // Paid plan - redirect to payment
      toast.info("Ödeme sayfasına yönlendiriliyorsunuz...");
      // TODO: Implement payment flow
      setTimeout(() => {
        subscribe.mutate({ 
          planId,
          paymentMethod: "credit_card",
          transactionId: `TXN-${Date.now()}` 
        });
      }, 1000);
    }
  };

  const getPlanBadge = (type: string) => {
    switch (type) {
      case "trial":
        return <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">Ücretsiz</span>;
      case "monthly":
        return <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Popüler</span>;
      case "yearly":
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">En Avantajlı</span>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Eye className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">VisionCare</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="outline">Giriş Yap</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="container py-16 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Fiyatlandırma</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            İhtiyacınıza uygun planı seçin ve göz sağlığınızı iyileştirmeye başlayın
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans?.map((plan) => {
            const features = plan.features ? JSON.parse(plan.features) : [];
            const isPopular = plan.type === "monthly";

            return (
              <Card 
                key={plan.id} 
                className={isPopular ? "border-primary shadow-lg" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {getPlanBadge(plan.type)}
                  </div>
                  <CardDescription className="min-h-[40px]">
                    {plan.durationDays} gün süreyle tüm özelliklere erişim
                  </CardDescription>
                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      {plan.price === 0 ? (
                        "Ücretsiz"
                      ) : (
                        <>
                          ₺{formatPrice(plan.price)}
                          <span className="text-lg font-normal text-muted-foreground">
                            /{plan.type === "monthly" ? "ay" : plan.type === "quarterly" ? "3 ay" : "yıl"}
                          </span>
                        </>
                      )}
                    </div>
                    {plan.type === "quarterly" && (
                      <p className="text-sm text-green-600 mt-1">%12 tasarruf</p>
                    )}
                    {plan.type === "yearly" && (
                      <p className="text-sm text-green-600 mt-1">%32 tasarruf</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id, plan.price)}
                    disabled={subscribe.isPending}
                  >
                    {subscribe.isPending ? "İşleniyor..." : plan.price === 0 ? "Ücretsiz Başla" : "Satın Al"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sıkça Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ücretsiz deneme nasıl çalışır?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  3 günlük ücretsiz deneme ile tüm özelliklere erişebilirsiniz. Kredi kartı bilgisi gerekmez. 
                  Deneme süresi sonunda otomatik olarak ücretlendirme yapılmaz.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aboneliğimi iptal edebilir miyim?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar 
                  hizmetlerimizden faydalanmaya devam edebilirsiniz.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hangi ödeme yöntemlerini kabul ediyorsunuz?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Tüm ödemeler güvenli SSL 
                  şifrelemesi ile korunmaktadır.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Planımı yükseltebilir miyim?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Evet, istediğiniz zaman planınızı yükseltebilirsiniz. Fark tutarı hesaplanarak yeni plan 
                  devreye alınır.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

