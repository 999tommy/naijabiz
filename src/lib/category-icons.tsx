
import {
    UtensilsCrossed,
    Shirt,
    Smartphone,
    Sparkles,
    Home,
    Car,
    GraduationCap,
    Music,
    ShoppingBag,
    Briefcase,
    Baby,
    Dumbbell,
    Laptop,
    HeartPulse,
    Palette,
    Camera,
    BookOpen,
    Plane,
    Hammer,
    Gift,
    SprayCan,
    Truck,
    Sprout,
    ShoppingBasket,
    WashingMachine
} from 'lucide-react'

export const getCategoryIcon = (categoryName: string) => {
    const normalized = categoryName.toLowerCase().trim()

    if (normalized.includes('food') || normalized.includes('restaurant') || normalized.includes('kitchen') || normalized.includes('catering')) return <UtensilsCrossed className="w-4 h-4" />
    if (normalized.includes('fashion') || normalized.includes('clothing') || normalized.includes('wear') || normalized.includes('boutique') || normalized.includes('tailor')) return <Shirt className="w-4 h-4" />
    if (normalized.includes('phone') || normalized.includes('gadget') || normalized.includes('electronic') || normalized.includes('tech')) return <Smartphone className="w-4 h-4" />
    if (normalized.includes('beauty') || normalized.includes('hair') || normalized.includes('makeup') || normalized.includes('salon') || normalized.includes('cosmetic')) return <Sparkles className="w-4 h-4" />
    if (normalized.includes('real estate') || normalized.includes('housing') || normalized.includes('property')) return <Home className="w-4 h-4" />
    if (normalized.includes('auto') || normalized.includes('car') || normalized.includes('motor') || normalized.includes('mechanic')) return <Car className="w-4 h-4" />
    if (normalized.includes('education') || normalized.includes('school') || normalized.includes('training')) return <GraduationCap className="w-4 h-4" />
    if (normalized.includes('entertainment') || normalized.includes('music') || normalized.includes('event')) return <Music className="w-4 h-4" />
    if (normalized.includes('health') || normalized.includes('medical') || normalized.includes('pharmacy') || normalized.includes('fitness')) return <HeartPulse className="w-4 h-4" />
    if (normalized.includes('art') || normalized.includes('design') || normalized.includes('creative')) return <Palette className="w-4 h-4" />
    if (normalized.includes('photo') || normalized.includes('media')) return <Camera className="w-4 h-4" />
    if (normalized.includes('book') || normalized.includes('stationery')) return <BookOpen className="w-4 h-4" />
    if (normalized.includes('travel') || normalized.includes('logistic')) return <Plane className="w-4 h-4" />
    if (normalized.includes('service') || normalized.includes('repair') || normalized.includes('clean')) return <Hammer className="w-4 h-4" />
    if (normalized.includes('gift') || normalized.includes('surprise')) return <Gift className="w-4 h-4" />
    if (normalized.includes('baby') || normalized.includes('kid')) return <Baby className="w-4 h-4" />
    if (normalized.includes('sport') || normalized.includes('gym')) return <Dumbbell className="w-4 h-4" />
    if (normalized.includes('computer') || normalized.includes('digital')) return <Laptop className="w-4 h-4" />

    // New Categories
    if (normalized.includes('perfume') || normalized.includes('fragrance') || normalized.includes('scent') || normalized.includes('body spray')) return <SprayCan className="w-4 h-4" />
    if (normalized.includes('logistics') || normalized.includes('delivery') || normalized.includes('dispatch') || normalized.includes('courier')) return <Truck className="w-4 h-4" />
    if (normalized.includes('grocery') || normalized.includes('provision') || normalized.includes('supermarket') || normalized.includes('market')) return <ShoppingBasket className="w-4 h-4" />
    if (normalized.includes('agriculture') || normalized.includes('farm') || normalized.includes('poultry') || normalized.includes('livestock')) return <Sprout className="w-4 h-4" />
    if (normalized.includes('laundry') || normalized.includes('cleaning') || normalized.includes('dry clean')) return <WashingMachine className="w-4 h-4" />

    // Default fallback
    return <ShoppingBag className="w-4 h-4" />
}
