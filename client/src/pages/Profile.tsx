import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar, Briefcase, Clock, Eye, Edit, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch user data
  const { data: user } = trpc.auth.me.useQuery();
  
  // Fetch profile data
  const { data: profile, refetch } = trpc.profile.get.useQuery();
  
  const [formData, setFormData] = useState({
    age: profile?.age?.toString() || "",
    gender: profile?.gender || "",
    occupation: profile?.occupation || "",
    dailyScreenTime: profile?.dailyScreenTime?.toString() || "",
    usesGlasses: profile?.usesGlasses?.toString() || "0",
    symptoms: [] as string[],
  });

  const updateProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profil güncellendi!");
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Profil güncellenemedi: " + error.message);
    },
  });

  const handleSave = () => {
    if (!formData.age || !formData.occupation || !formData.dailyScreenTime) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    updateProfile.mutate({
      age: parseInt(formData.age),
      gender: formData.gender ? (formData.gender as "male" | "female" | "other") : undefined,
      occupation: formData.occupation,
      dailyScreenTime: parseInt(formData.dailyScreenTime),
      usesGlasses: parseInt(formData.usesGlasses),
    });
  };

  const handleCancel = () => {
    setFormData({
      age: profile?.age?.toString() || "",
      gender: profile?.gender || "",
      occupation: profile?.occupation || "",
      dailyScreenTime: profile?.dailyScreenTime?.toString() || "",
      usesGlasses: profile?.usesGlasses?.toString() || "0",
      symptoms: [],
    });
    setIsEditing(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getGenderLabel = (gender: string | null | undefined) => {
    if (!gender) return "Belirtilmemiş";
    if (gender === "male") return "Erkek";
    if (gender === "female") return "Kadın";
    return "Diğer";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profilim</h1>
              <p className="text-muted-foreground">Kişisel bilgilerinizi görüntüleyin ve düzenleyin</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              Dashboard'a Dön
            </Button>
          </div>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}` : undefined} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{user?.name || "Kullanıcı"}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user?.email || "email@example.com"}
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Düzenle
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={updateProfile.isPending} className="gap-2">
                      <Save className="h-4 w-4" />
                      Kaydet
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="gap-2">
                      <X className="h-4 w-4" />
                      İptal
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>Göz sağlığınız için önemli bilgiler</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Yaş</p>
                      <p className="font-medium">{profile?.age || "Belirtilmemiş"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cinsiyet</p>
                      <p className="font-medium">{getGenderLabel(profile?.gender)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Meslek</p>
                      <p className="font-medium">{profile?.occupation || "Belirtilmemiş"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Günlük Ekran Süresi</p>
                      <p className="font-medium">{profile?.dailyScreenTime ? `${profile.dailyScreenTime} saat` : "Belirtilmemiş"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gözlük/Lens Kullanımı</p>
                      <p className="font-medium">
                        {profile?.usesGlasses === 1 ? "Gözlük" : profile?.usesGlasses === 2 ? "Lens" : "Hayır"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age">Yaşınız *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      placeholder="Örn: 28"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Cinsiyet</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Erkek</SelectItem>
                        <SelectItem value="female">Kadın</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Mesleğiniz *</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => updateField("occupation", e.target.value)}
                      placeholder="Örn: Yazılım Geliştirici"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyScreenTime">Günlük Ekran Süresi (saat) *</Label>
                    <Input
                      id="dailyScreenTime"
                      type="number"
                      min="0"
                      max="24"
                      value={formData.dailyScreenTime}
                      onChange={(e) => updateField("dailyScreenTime", e.target.value)}
                      placeholder="Örn: 8"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="usesGlasses">Gözlük/Lens Kullanıyor musunuz?</Label>
                    <Select value={formData.usesGlasses} onValueChange={(value) => updateField("usesGlasses", value)}>
                      <SelectTrigger id="usesGlasses">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Hayır</SelectItem>
                        <SelectItem value="1">Gözlük</SelectItem>
                        <SelectItem value="2">Lens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Hesap Bilgileri</CardTitle>
              <CardDescription>Hesabınızla ilgili detaylar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Giriş Yöntemi</p>
                  <p className="font-medium capitalize">{user?.loginMethod || "Bilinmiyor"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Hesap Oluşturma Tarihi</p>
                  <p className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Son Giriş</p>
                  <p className="font-medium">
                    {user?.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

