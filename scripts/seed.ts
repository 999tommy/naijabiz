import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export const CategoryMap: Record<string, string> = {
    agriculture: 'a00674c6-2e31-46c9-a6d9-429c990f45ea',
    art: '4b4c5493-94e8-4cda-9ed8-6fd960a5b4e8',
    auto: 'f048f44d-ea60-4c32-9c1d-901cf9da568a',
    baby: '72f3e460-12e4-423d-80c4-942360dbd79d',
    beauty: 'dd68cb7f-9c85-4c90-9901-ab4a9b28a453',
    books: '0e16fd5b-1f57-4c3b-8791-9280d1342299',
    cleaning: '4c8019b5-fe26-4e84-bf55-3fcb7d8203ae',
    electronics: '4dab1a06-33e1-459e-8acb-ac9655ee4c5f',
    fashion: '2ef0425c-b169-4594-b074-3f536a38653b',
    food: 'b95197b9-1ccc-4065-99eb-a439be245841',
    groceries: 'e90e3949-33db-4a75-890a-05f663d5e8e1',
    health: '3fb24195-1d23-49a3-9b2c-613f2a93f14e',
    home: '1a6933ed-a1c0-4450-b087-dbfe3121862a',
    jewelry: 'aa4db965-f5c0-49fa-b0e8-74eaf78569c0',
    logistics: 'dd270754-97fc-4733-b012-50cc66fedc9e',
    others: '5988e8e6-7b7c-4c78-a638-43d3f5f36bea',
    perfumes: '88bb9b81-51e9-4963-b4aa-987983901186',
    phones: 'dd64e000-5341-4c6d-b10a-91dedc8e8a5f',
    services: '2912deef-53a8-4fa6-a87a-40fcee5a1b00',
    shoes: 'b146aec6-38a4-42c6-a41e-54b88a29c229',
    sports: '555fa81e-6ad7-4f64-9eda-4ea9af4cd90c',
    wigs: '657421b4-373f-4cbf-8d57-b9fb21c480fd'
}

const NIGERIAN_NAMES = ['Chidi', 'Nkechi', 'Kemi', 'Damilola', 'Osas', 'Amaka', 'Chukwuma', 'Bisi', 'Femi', 'Zainab', 'Adaeze', 'Okafor', 'Ngozi', 'Tunde', 'Nifemi', 'Esther', 'Chima', 'Shade', 'Ade', 'Musa', 'Yetunde', 'Ify', 'Biodun', 'Kunle', 'Amara', 'Shalewa', 'Victor', 'Dorcas', 'Risi', 'Ahmed', 'Blessing', 'Emeka', 'Nneka', 'Hauwa', 'Fidelis', 'Abeke', 'Dantata', 'Comfort', 'Stella', 'Ikechi', 'Nora', 'Bello', 'Cynthia', 'Rasheed', 'Taiwo', 'Kenny', 'Grace', 'Segun', 'Fatima', 'Ebuka', 'Adaora', 'Titi', 'Samson', 'Jamil', 'Chioma', 'Zainab', 'Efuru', 'Isaac', 'Henry', 'Adanna', 'Fola']
const NIGERIAN_LOCATIONS = ['Surulere, Lagos', 'Wuse II, Abuja', 'Lekki Phase 1, Lagos', 'GRA, Port Harcourt', 'Ikeja, Lagos', 'Benin City, Edo', 'Victoria Island, Lagos', 'Maitama, Abuja', 'Nnewi, Anambra', 'Festac, Lagos', 'Ibadan, Oyo', 'Kano, Kano', 'Kaduna, Kaduna', 'Enugu, Enugu', 'Onitsha, Anambra', 'Asaba, Delta', 'Epe, Lagos', 'Akure, Ondo', 'Jos, Plateau', 'Yaba, Lagos', 'Makurdi, Benue', 'Oshodi, Lagos', 'Ikeja GRA, Lagos', 'Abuja, FCT', 'Abeokuta, Ogun', 'Owerri, Imo', 'Ikorodu, Lagos', 'Warri, Delta', 'Uyo, Akwa Ibom', 'Mushin, Lagos', 'Ojota, Lagos', 'Calabar, Cross River', 'Ajah, Lagos', 'Sokoto, Sokoto', 'Ikotun, Lagos', 'Aba, Abia', 'Ado-Ekiti, Ekiti', 'Garki, Abuja', 'Agege, Lagos', 'Gusau, Zamfara', 'Ilorin, Kwara', 'Maiduguri, Borno', 'Isale-Eko, Lagos', 'Katsina, Katsina', 'Maryland, Lagos']

const BUSINESS_TEMPLATES: Record<string, { type: string, products: string[], imgQueries: string[], desc: string }> = {
    food: { type: 'Kitchen', products: ['Jollof Rice Combo', 'Pounded Yam & Egusi', 'Fried Rice with Turkey', 'Asun Pan', 'Pepper Soup'], imgQueries: ['nigerian-food', 'jollof-rice', 'african-food'], desc: "Authentic homemade meals prepared with love. Delivering fresh and hot to your doorstep daily." },
    fashion: { type: 'Couture', products: ['Ankara Maxi Dress', 'Senator Material Wear', 'Aso-Ebi Stitching', 'Custom Agbada', 'Ready to Wear Top'], imgQueries: ['african-fashion', 'tailor', 'ankara-fabric'], desc: "Bespoke tailoring and ready-to-wear fashion pieces for men and women. Look your best for any occasion." },
    beauty: { type: 'Skincare', products: ['Glow Body Scrub', 'Vitamin C Serum', 'Shea Butter Cream', 'Acne Clearing Soap', 'Lip Gloss'], imgQueries: ['skincare', 'cosmetics', 'beauty-products'], desc: "Premium skincare solutions using organic and locally sourced ingredients for the perfect melanin glow." },
    electronics: { type: 'Gadgets', products: ['UK Used iPhone 13 Pro', 'MacBook Pro M1 (Used)', 'AirPods Pro V2', 'Samsung S23 Ultra', 'Fast Charging Powerbank'], imgQueries: ['iphone', 'macbook', 'gadgets'], desc: "Your trusted plug for brand new and UK used gadgets, laptops, and original accessories. Warranty guaranteed." },
    wigs: { type: 'Hair', products: ['Bone Straight 22"', 'Braided Wig (Knee Length)', 'Deep Wave Closure', 'Bob Wig', 'Frontal Installation'], imgQueries: ['wigs', 'hair-salon', 'braids'], desc: "Top grade human hair, custom wig making and professional installation services." },
    auto: { type: 'Auto', products: ['Toyota Corolla Shocks', 'Brake Pads (Honda)', 'Complete Engine Servicing', 'Car AC Repair', 'Synthetic Engine Oil'], imgQueries: ['mechanic', 'car-repair', 'auto-parts'], desc: "Expert automotive repair and genuine spare parts. We keep your vehicle running smoothly." },
    jewelry: { type: 'Jewels', products: ['18k Gold Chain', 'Cuban Link Bracelet', 'Custom Name Pendant', 'Diamond Stud Earrings', 'Couple Rings'], imgQueries: ['gold-jewelry', 'necklace', 'watches'], desc: "Luxurious and affordable jewelry pieces. Solid gold, sterling silver, and custom name pieces." },
    gym: { type: 'Fitness', products: ['Dumbbell Set 20kg', 'Yoga Mat', 'Whey Protein Isolate', 'Resistance Bands', 'Treadmill Installation'], imgQueries: ['gym-equipment', 'dumbbell', 'fitness'], desc: "Everything you need for your home gym and fitness journey. Nationwide delivery available." },
    perfumes: { type: 'Scents', products: ['Oud Wood (Clone)', 'Baccarat Rouge 540', 'Vanilla Body Mist', 'Designer Perfume Oils', 'Car Air Freshener'], imgQueries: ['perfume', 'fragrance', 'bottles'], desc: "Smell expensive on a budget. Long-lasting designer clones and concentrated perfume oils." }
}

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function toSlug(str: string) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

export async function generateAndSeed(counts: { pro: number, free: number }) {
    console.log(`Starting generation. PRO: ${counts.pro}, FREE: ${counts.free}`)
    let total = counts.pro + counts.free;

    const createdUsers = [];

    // Create 10 Pro Businesses
    for (let i = 0; i < total; i++) {
        const isPro = i < counts.pro;
        const name = randItem(NIGERIAN_NAMES)
        const templateKeys = Object.keys(BUSINESS_TEMPLATES)
        const tKey = randItem(templateKeys)
        const t = BUSINESS_TEMPLATES[tKey]
        const businessName = `${name}'s ${t.type}`
        const slug = toSlug(businessName) + '-' + randInt(100, 999)

        // Auth user creation
        const email = `${slug}@mocknaijabiz.com`
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: 'Password123!',
            email_confirm: true,
            user_metadata: { name }
        })

        if (authErr || !authData.user) {
            console.error('Error creating auth user:', authErr)
            continue
        }

        const uid = authData.user.id

        // Map template to actual category id
        let catId = CategoryMap[tKey] || CategoryMap.others

        // 50% chance of logo via Unsplash
        const useLogo = Math.random() > 0.5
        const logoTerm = randItem(t.imgQueries)
        const logoUrl = useLogo ? `https://images.unsplash.com/photo-${randInt(100000, 999999)}?w=200&h=200&fit=crop&q=80` : null

        const phone = `23480${randInt(10000000, 99999999)}`

        const { error: updateErr } = await supabase.from('users').update({
            business_name: businessName,
            business_slug: slug,
            description: t.desc,
            location: randItem(NIGERIAN_LOCATIONS),
            category_id: catId,
            whatsapp_number: phone,
            instagram_handle: Math.random() > 0.2 ? `@${toSlug(name)}_${tKey}` : null,
            tiktok_handle: Math.random() > 0.6 ? `@${toSlug(name)}teek` : null,
            logo_url: useLogo ? `https://images.unsplash.com/featured/?${logoTerm}` : null,
            is_verified: isPro,
            plan: isPro ? 'pro' : 'free',
            upvotes: isPro ? randInt(50, 200) : randInt(0, 30)
        }).eq('id', uid)

        if (updateErr) {
            console.error('Error updating user:', updateErr.message)
            continue;
        }

        const prodCount = isPro ? randInt(4, 6) : randInt(2, 3)
        const prods = []

        for (let p = 0; p < prodCount; p++) {
            const pName = t.products[p % t.products.length] + (p >= t.products.length ? ` (Variant ${p})` : '')
            const pPrice = randInt(20, 250) * 100 // 2000 to 25000 naira
            const pImg = Math.random() > 0.3 ? `https://images.unsplash.com/featured/?${logoTerm},${toSlug(pName)}` : null

            prods.push({
                user_id: uid,
                name: pName,
                price: pPrice,
                description: `Locally sourced ${pName.toLowerCase()} highly rated by our customers.`,
                image_url: pImg,
                is_active: true
            })
        }

        const { error: prodErr } = await supabase.from('products').insert(prods)
        if (prodErr) console.error('Error inserting products', prodErr.message)

        console.log(`✅ Created ${businessName} (${isPro ? 'PRO' : 'FREE'})`)
        createdUsers.push(uid)
    }

    console.log('DONE! Created', createdUsers.length, 'businesses.')
}

generateAndSeed({ pro: 10, free: 60 }).catch((e) => {
    console.error(e)
    process.exit(1)
})
