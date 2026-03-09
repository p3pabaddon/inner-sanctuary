
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const services = [
    { name: "Bireysel Terapi", description: "Kişisel gelişim ve ruh sağlığı yolculuğunuzda size özel birebir destek.", price: 850, duration: 50 },
    { name: "Çift ve Aile Terapisi", description: "İlişkilerdeki dengeleri yeniden kurmak ve iletişimi güçlendirmek için profesyonel rehberlik.", price: 1200, duration: 75 },
    { name: "Çocuk ve Ergen Terapisi", description: "Genç zihinlerin dünyasını anlamak ve gelişim süreçlerinde onlara eşlik etmek.", price: 850, duration: 50 },
    { name: "EMDR Terapisi", description: "Geçmişin izlerini silmek ve travmatik anıları sağlıklı bir şekilde işlemek için güçlü bir yöntem.", price: 1000, duration: 60 },
    { name: "Bilişsel Davranışçı Terapi", description: "Düşünce ve davranış kalıplarınızı değiştirerek daha sağlıklı bir yaşam kurgulayın.", price: 850, duration: 50 },
    { name: "Cinsel Terapi", description: "Cinsel sağlık ve yakınlık konularında güvenli, yargısız bir alan sunuyoruz.", price: 1100, duration: 60 },
    { name: "Oyun Terapisi", description: "Çocukların dili olan oyun aracılığıyla duygusal sorunlarını çözmelerine yardımcı oluyoruz.", price: 800, duration: 45 },
    { name: "Grup Terapisi", description: "Benzer deneyimler yaşayan bireylerle paylaşım yaparak birlikte iyileşin.", price: 400, duration: 90 },
    { name: "Sınav Kaygısı Danışmanlığı", description: "Sınav sürecindeki yoğun stresi yönetmek ve potansiyelinizi ortaya çıkarmak için stratejiler.", price: 750, duration: 45 },
    { name: "Online Psikolojik Destek", description: "Nerede olursanız olun, profesyonel terapi desteğine tek tıkla ulaşın.", price: 700, duration: 50 }
];

async function insertServices() {
    console.log("Hizmetler ekleniyor...");
    const { data, error } = await supabase.from('services').insert(services);
    if (error) {
        console.error("Hata:", error);
    } else {
        console.log("Hizmetler başarıyla eklendi.");
    }
}

insertServices();
