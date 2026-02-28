import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Square, RotateCcw, ArrowRight, Image as ImageIcon, Timer, DollarSign, UserPlus, User, Search } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  message: string;
  color?: string;
}

interface Props {
  messages: Message[];
  onLeave: () => void;
}

interface Item {
  name: string;
  nameAr: string;
  price: number;
  imageUrl: string;
}

const FALLBACK_IMAGE_URL = 'https://picsum.photos/seed/price-game/800/800';

const RANDOM_ITEMS: Item[] = [
  { name: 'PlayStation 5', nameAr: 'بلايستيشن 5', price: 499, imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80' },
  { name: 'iPhone 15 Pro', nameAr: 'آيفون 15 برو', price: 999, imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80' },
  { name: 'Mechanical Keyboard', nameAr: 'لوحة مفاتيح ميكانيكية', price: 150, imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80' },
  { name: 'Gaming Chair', nameAr: 'كرسي ألعاب', price: 350, imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fce66?w=800&q=80' },
  { name: 'AirPods Pro', nameAr: 'إيربودز برو', price: 249, imageUrl: 'https://images.unsplash.com/photo-1588423770674-f2855ee476e7?w=800&q=80' },
  { name: 'Nintendo Switch OLED', nameAr: 'نينتندو سويتش OLED', price: 349, imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80' },
  { name: 'Sony WH-1000XM5', nameAr: 'سوني WH-1000XM5', price: 399, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { name: 'GoPro Hero 12', nameAr: 'جو برو هيرو 12', price: 399, imageUrl: 'https://images.unsplash.com/photo-1526170315870-ef0cd9c5949a?w=800&q=80' },
  { name: 'Kindle Paperwhite', nameAr: 'كيندل بيبروایت', price: 139, imageUrl: 'https://images.unsplash.com/photo-1594980596247-87c52a646cfb?w=800&q=80' },
  { name: 'Lego Star Wars Millennium Falcon', nameAr: 'ليغو حرب النجوم ميلينيوم فالكون', price: 849, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80' },
  { name: 'Dyson V15 Vacuum', nameAr: 'مكنسة دايسون V15', price: 749, imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80' },
  { name: 'Samsung Galaxy S23 Ultra', nameAr: 'سامسونج جالاكسي S23 ألترا', price: 1199, imageUrl: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800&q=80' },
  { name: 'NVIDIA RTX 4090', nameAr: 'نفيديا RTX 4090', price: 1599, imageUrl: 'https://images.unsplash.com/photo-1667990278450-482860829875?w=800&q=80' },
  { name: 'Apple Watch Ultra 2', nameAr: 'آبل ووتش ألترا 2', price: 799, imageUrl: 'https://images.unsplash.com/photo-1695653422718-990ee00017e0?w=800&q=80' },
  { name: 'Nespresso Coffee Machine', nameAr: 'ماكينة قهوة نسبريسو', price: 199, imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80' },
  { name: 'Tesla Model 3', nameAr: 'تسلا موديل 3', price: 38990, imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80' },
  { name: 'Rolex Submariner', nameAr: 'رولكس سابمارينر', price: 9100, imageUrl: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80' },
  { name: 'Herman Miller Aeron', nameAr: 'كرسي هيرمان ميلر إيرون', price: 1600, imageUrl: 'https://images.unsplash.com/photo-1589384273441-c5ae2f670ee5?w=800&q=80' },
  { name: 'DJI Mavic 3 Pro', nameAr: 'دي جي آي مافيك 3 برو', price: 2199, imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80' },
  { name: 'Canon EOS R5', nameAr: 'كانون EOS R5', price: 3399, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
  { name: 'MacBook Pro 16"', nameAr: 'ماك بوك برو 16', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1517336714468-48356af71f1f?w=800&q=80' },
  { name: 'iPad Pro 12.9"', nameAr: 'آيباد برو 12.9', price: 1099, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80' },
  { name: 'Steam Deck OLED', nameAr: 'ستيم ديك OLED', price: 549, imageUrl: 'https://images.unsplash.com/photo-1683525540602-53641753697e?w=800&q=80' },
  { name: 'Meta Quest 3', nameAr: 'ميتا كويست 3', price: 499, imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80' },
  { name: 'Dyson Airwrap', nameAr: 'دايسون إيرراب', price: 599, imageUrl: 'https://images.unsplash.com/photo-1610991148731-30716af1b34b?w=800&q=80' },
  { name: 'Segway Ninebot Max', nameAr: 'سيغواي ناينبوت ماكس', price: 799, imageUrl: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?w=800&q=80' },
  { name: 'Peloton Bike+', nameAr: 'بيلوتون بايك+', price: 2495, imageUrl: 'https://images.unsplash.com/photo-1591741535018-d042766c62eb?w=800&q=80' },
  { name: 'Weber Genesis Grill', nameAr: 'شواية ويبر جينيسيس', price: 1249, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80' },
  { name: 'KitchenAid Stand Mixer', nameAr: 'خلاط كيتشن إيد ثابت', price: 449, imageUrl: 'https://images.unsplash.com/photo-1594385208934-27a59f518475?w=800&q=80' },
  { name: 'Yeti Tundra 45 Cooler', nameAr: 'مبرد يتي تندرا 45', price: 325, imageUrl: 'https://images.unsplash.com/photo-1625693941344-6873c9767058?w=800&q=80' },
  { name: 'Samsung 98" Neo QLED 8K TV', nameAr: 'تلفاز سامسونج نيو QLED 8K مقاس 98 بوصة', price: 9999, imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80' },
  { name: 'Bose QuietComfort Ultra', nameAr: 'بوز كوايت كومفورت ألترا', price: 429, imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80' },
  { name: 'Razer Blade 16', nameAr: 'ريزر بليد 16', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80' },
  { name: 'Logitech G Pro X Superlight 2', nameAr: 'لوجيتك G برو X سوبرلايت 2', price: 159, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80' },
  { name: 'Elgato Stream Deck MK.2', nameAr: 'إلغاتو ستريم ديك MK.2', price: 149, imageUrl: 'https://images.unsplash.com/photo-1616433357599-270889988292?w=800&q=80' },
  { name: 'Blue Yeti Microphone', nameAr: 'ميكروفون بلو يتي', price: 129, imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80' },
  { name: 'Nanoleaf Shapes', nameAr: 'نانوليف شيبس', price: 199, imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80' },
  { name: 'Philips Hue Starter Kit', nameAr: 'طقم فيليبس هيو الأساسي', price: 179, imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80' },
  { name: 'Ring Video Doorbell Pro 2', nameAr: 'جرس رينغ الذكي برو 2', price: 249, imageUrl: 'https://images.unsplash.com/photo-1621146028531-5683251f5e23?w=800&q=80' },
  { name: 'iRobot Roomba j7+', nameAr: 'آي روبوت رومبا j7+', price: 799, imageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&q=80' },
  { name: 'Breville Barista Express', nameAr: 'بريفيل باريستا إكسبريس', price: 699, imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80' },
  { name: 'Vitamix A3500', nameAr: 'فايتامكس A3500', price: 649, imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80' },
  { name: 'Instant Pot Duo 7-in-1', nameAr: 'إنستانت بوت ديو 7 في 1', price: 99, imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80' },
  { name: 'Le Creuset Dutch Oven', nameAr: 'قدر لو كروزيه الهولندي', price: 390, imageUrl: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=800&q=80' },
  { name: 'Ember Mug 2', nameAr: 'كوب إمبر 2', price: 129, imageUrl: 'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=800&q=80' },
  { name: 'Theragun PRO', nameAr: 'ثيراغن برو', price: 599, imageUrl: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=800&q=80' },
  { name: 'Oura Ring Gen3', nameAr: 'خاتم أورا الجيل الثالث', price: 299, imageUrl: 'https://images.unsplash.com/photo-1613913399314-87b127b49d13?w=800&q=80' },
  { name: 'Bowflex SelectTech 552', nameAr: 'دمبل بو فليكس سيليكت تيك 552', price: 429, imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80' },
  { name: 'Hydro Flask 32 oz', nameAr: 'قارورة هايدرو فلاسك 32 أونصة', price: 44, imageUrl: 'https://images.unsplash.com/photo-1602143303410-7199d123ad24?w=800&q=80' },
  { name: 'Patagonia Better Sweater', nameAr: 'سترة باتاغونيا بيتر سويتر', price: 139, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80' },
  { name: 'Canada Goose Expedition Parka', nameAr: 'باركا كندا غوس إكسبيديشن', price: 1495, imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80' },
  { name: 'Louis Vuitton Neverfull MM', nameAr: 'حقيبة لويس فويتون نيفرفول MM', price: 2030, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80' },
  { name: 'Gucci Double G Belt', nameAr: 'حزام غوتشي دبل جي', price: 490, imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb8ec5521?w=800&q=80' },
  { name: 'Ray-Ban Wayfarer', nameAr: 'راي-بان وايفيرر', price: 163, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80' },
  { name: 'Rimowa Original Cabin', nameAr: 'حقيبة ريموا أوريجينال كابين', price: 1430, imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&q=80' },
  { name: 'Tumi Alpha 3 Carry-On', nameAr: 'حقيبة تومي ألفا 3 (Carry-On)', price: 825, imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80' },
  { name: 'Fender Stratocaster', nameAr: 'جيتار فيندر ستراتوكاستر', price: 849, imageUrl: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=800&q=80' },
  { name: 'Gibson Les Paul Standard', nameAr: 'جيتار غيبسون ليس بول ستاندرد', price: 2799, imageUrl: 'https://images.unsplash.com/photo-1564186763535-ebb21ef52784?w=800&q=80' },
  { name: 'Yamaha P-125 Digital Piano', nameAr: 'بيانو ياماها الرقمي P-125', price: 699, imageUrl: 'https://images.unsplash.com/photo-1520529611443-d22364e89ca5?w=800&q=80' },
  { name: 'Eames Lounge Chair', nameAr: 'كرسي إيمز لاونج', price: 7995, imageUrl: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80' },
  { name: 'Marshall Stanmore III', nameAr: 'مارشال ستانمور III', price: 379, imageUrl: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80' },
  { name: 'Audio-Technica LP120X', nameAr: 'أوديو-تكنيكا LP120X', price: 349, imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80' },
  { name: 'Specialized Tarmac SL8', nameAr: 'دراجة سبيشالايزد تارماك SL8', price: 14000, imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80' },
  { name: 'Brompton C Line', nameAr: 'دراجة برومبتون C لاين', price: 1750, imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77891?w=800&q=80' },
  { name: 'Big Green Egg (Large)', nameAr: 'شواية بيغ غرين إيغ (كبير)', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80' },
  { name: 'Solo Stove Bonfire 2.0', nameAr: 'موقد سولو ستوف بونفاير 2.0', price: 299, imageUrl: 'https://images.unsplash.com/photo-1521220609214-a8552380c7a4?w=800&q=80' },
  { name: 'Garmin fenix 7X', nameAr: 'جارمين فينيكس 7X', price: 899, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  { name: 'Arc\'teryx Alpha SV', nameAr: 'أركتيركس ألفا SV', price: 900, imageUrl: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=800&q=80' },
  { name: 'Osprey Aether 65', nameAr: 'حقيبة أوسبري إيذر 65', price: 320, imageUrl: 'https://images.unsplash.com/photo-1551632432-c735e7a030be?w=800&q=80' },
  { name: 'Ferrari SF90 Stradale', nameAr: 'فيراري SF90 سترادالي', price: 524000, imageUrl: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80' },
  { name: 'Lamborghini Aventador', nameAr: 'لامبورغيني أفينتادور', price: 500000, imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80' },
  { name: 'Hermès Birkin 30', nameAr: 'حقيبة هيرميس بيركين 30', price: 12000, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80' },
  { name: 'Patek Philippe Nautilus', nameAr: 'باتيك فيليب نوتيلوس', price: 35000, imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80' },
  { name: 'Leica M11 Camera', nameAr: 'كاميرا لايكا M11', price: 8995, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
  { name: 'Bang & Olufsen Beolab 90', nameAr: 'سماعات بانغ آند أولفسن بيولاب 90', price: 115000, imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80' },
  { name: 'Audeze LCD-5 Headphones', nameAr: 'سماعات أوديز LCD-5', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80' },
  { name: 'Sennheiser HE 1', nameAr: 'سماعات زينهايزر HE 1', price: 59000, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { name: 'Steinway Model D Piano', nameAr: 'بيانو ستاينواي موديل D', price: 190000, imageUrl: 'https://images.unsplash.com/photo-1520529611443-d22364e89ca5?w=800&q=80' },
  { name: 'Kartell Componibili', nameAr: 'وحدة كارتيل كومبونيبيلي', price: 150, imageUrl: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80' },
  { name: 'Vitra Panton Chair', nameAr: 'كرسي فيترا بانتون', price: 450, imageUrl: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80' },
  { name: 'LEGO Disney Castle', nameAr: 'قلعة ديزني من ليغو', price: 399, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80' },
  { name: 'Tamagotchi Pix', nameAr: 'تاماغوتشي بيكس', price: 59, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80' },
  { name: 'Barbie Dreamhouse', nameAr: 'بيت أحلام باربي', price: 199, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80' },
  { name: 'DJI Osmo Pocket 3', nameAr: 'دي جي آي أوزمو بوكيت 3', price: 519, imageUrl: 'https://images.unsplash.com/photo-1526170315870-ef0cd9c5949a?w=800&q=80' },
  { name: 'Insta360 X3', nameAr: 'إنستا360 X3', price: 449, imageUrl: 'https://images.unsplash.com/photo-1526170315870-ef0cd9c5949a?w=800&q=80' },
  { name: 'Fujifilm Instax Mini 12', nameAr: 'فوجي فيلم إنستاكس ميني 12', price: 79, imageUrl: 'https://images.unsplash.com/photo-1526170315870-ef0cd9c5949a?w=800&q=80' },
  { name: 'Polaroid Now+', nameAr: 'بولارويد ناو+', price: 149, imageUrl: 'https://images.unsplash.com/photo-1526170315870-ef0cd9c5949a?w=800&q=80' },
  { name: 'Akai MPC One+', nameAr: 'أكاي MPC One+', price: 699, imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80' },
  { name: 'Onewheel GT', nameAr: 'ون ويل GT', price: 2250, imageUrl: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?w=800&q=80' },
  { name: 'Apple Vision Pro', nameAr: 'آبل فيجن برو', price: 3499, imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80' },
  { name: 'Samsung Galaxy Z Fold 5', nameAr: 'سامسونج جالاكسي زد فولد 5', price: 1799, imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80' },
  { name: 'Sony A7 IV Camera', nameAr: 'كاميرا سوني A7 IV', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&q=80' },
  { name: 'Bose SoundLink Max', nameAr: 'سماعة بوز ساوند لينك ماكس', price: 399, imageUrl: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800&q=80' },
  { name: 'Herman Miller Embody', nameAr: 'كرسي هيرمان ميلر إمبودي', price: 1695, imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80' },
  { name: 'DJI Mini 4 Pro', nameAr: 'دي جي آي ميني 4 برو', price: 759, imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80' },
  { name: 'KitchenAid Espresso Machine', nameAr: 'ماكينة إسبرسو كيتشن إيد', price: 799, imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80' },
  { name: 'LG C3 OLED 65"', nameAr: 'تلفاز إل جي C3 OLED مقاس 65 بوصة', price: 1799, imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80' },
  { name: 'Beats Studio Pro', nameAr: 'سماعات بيتس ستوديو برو', price: 349, imageUrl: 'https://images.unsplash.com/photo-1518441902110-5f3f0f94d10e?w=800&q=80' },
  { name: 'Nintendo Switch Pro Controller', nameAr: 'يد تحكم نينتندو سويتش برو', price: 69, imageUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=80' },
  { name: 'Trek Marlin 7', nameAr: 'دراجة تريك مارلين 7', price: 889, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80' },
];

export const PriceIsRightGame: React.FC<Props> = ({ messages, onLeave }) => {
  const [status, setStatus] = useState<'setup' | 'guessing' | 'revealed' | 'game_over'>('setup');
  const [item, setItem] = useState<Item>({ name: '', nameAr: '', price: 0, imageUrl: '' });
  const [guesses, setGuesses] = useState<Record<string, number>>({});
  const [joinedPlayers, setJoinedPlayers] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(60);
  const [streamerGuess, setStreamerGuess] = useState<string>('');
  const [winner, setWinner] = useState<{ username: string; guess: number; diff: number } | null>(null);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const processedMessageIds = useRef<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);
  const usedItemIndicesRef = useRef<Set<number>>(new Set());

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget;
    target.onerror = null;
    target.src = FALLBACK_IMAGE_URL;
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    if (processedMessageIds.current.has(latestMessage.id)) return;
    processedMessageIds.current.add(latestMessage.id);

    const text = latestMessage.message.trim().toLowerCase();
    
    // Handle !join - works in both setup and guessing states
    if (text === '!join') {
      setJoinedPlayers(prev => {
        const next = new Set(prev);
        next.add(latestMessage.username);
        return next;
      });
      return;
    }

    if (status !== 'guessing') return;

    // Only accept guesses from joined players
    if (!joinedPlayers.has(latestMessage.username)) return;

    // Extract number from message
    const match = text.match(/\d+/);
    if (match) {
      const guess = parseInt(match[0], 10);
      if (!isNaN(guess) && guess > 0) {
        setGuesses(prev => ({
          ...prev,
          [latestMessage.username]: guess
        }));
      }
    }
  }, [messages, status, joinedPlayers]);

  useEffect(() => {
    if (status === 'guessing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            revealPrice();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const startGame = () => {
    setCurrentRound(1);
    setScores({});
    usedItemIndicesRef.current.clear();
    startRound(1);
  };

  const startRound = (roundNum: number) => {
    const availableIndices = RANDOM_ITEMS.map((_, i) => i).filter(i => !usedItemIndicesRef.current.has(i));
    let indexToUse;
    
    if (availableIndices.length === 0) {
      usedItemIndicesRef.current.clear();
      indexToUse = Math.floor(Math.random() * RANDOM_ITEMS.length);
    } else {
      indexToUse = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }
    
    usedItemIndicesRef.current.add(indexToUse);
    const randomItem = RANDOM_ITEMS[indexToUse];
    setItem(randomItem);
    setGuesses({});
    setWinner(null);
    setTimeLeft(60);
    setStreamerGuess('');
    setStatus('guessing');
    processedMessageIds.current.clear();
  };

  const nextRound = () => {
    if (currentRound < totalRounds) {
      const nextR = currentRound + 1;
      setCurrentRound(nextR);
      startRound(nextR);
    } else {
      setStatus('game_over');
    }
  };

  const revealPrice = () => {
    setStatus('revealed');
    
    const allGuesses = { ...guesses };
    // Streamer guess is not added to allGuesses for winner calculation as per request
    
      // Find closest absolute guess
      let bestGuess: { username: string; guess: number; diff: number } | null = null;

      Object.entries(allGuesses).forEach(([username, guess]) => {
        const diff = Math.abs(item.price - guess);
        if (!bestGuess || diff < bestGuess.diff) {
          bestGuess = { username, guess, diff };
        }
      });    if (bestGuess) {
      setWinner(bestGuess);
      setScores(prev => ({
        ...prev,
        [bestGuess!.username]: (prev[bestGuess!.username] || 0) + 1
      }));
    } else {
      setWinner(null);
    }
  };

  const sortedGuesses = [
    ...(streamerGuess && !isNaN(parseInt(streamerGuess)) ? [['أنت (الستريمر)', parseInt(streamerGuess)] as [string, number]] : []),
    ...Object.entries(guesses)
  ].sort(([, a], [, b]) => b - a)
   .slice(0, 15);

  const finalScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] font-arabic" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-brand-gold/10 bg-black/40 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onLeave}
            className="p-3 bg-brand-gold/5 hover:bg-brand-gold/10 text-brand-gold/70 hover:text-brand-gold rounded-xl transition-colors border border-brand-gold/20 hover:border-brand-gold/40"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">خمن السعر</h2>
            <p className="text-brand-gold/50 text-sm">أقرب تخمين للسعر الحقيقي بدون تجاوزه يفوز!</p>
          </div>
        </div>
        
        {(status === 'guessing' || status === 'revealed') && (
          <div className="flex items-center gap-6">
            <div className="text-zinc-400 font-bold">
              الجولة <span className="text-white text-xl">{currentRound}</span> من <span className="text-white text-xl">{totalRounds}</span>
            </div>
            {status === 'guessing' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-6 py-3 rounded-xl font-bold text-xl border border-brand-gold/30">
                  <Timer className="w-6 h-6" />
                  {timeLeft} ثانية
                </div>
                <button
                  onClick={revealPrice}
                  className="flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/60 text-white rounded-xl font-bold transition-colors border border-brand-gold/20 hover:border-brand-gold/40"
                >
                  <Square className="w-5 h-5 fill-current" />
                  إنهاء التخمين
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto">
          {status === 'setup' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-black/40 p-12 rounded-3xl border border-brand-gold/20 text-center relative overflow-hidden shadow-2xl"
            >
              {/* Game Show Background Decoration */}
              <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
                <img 
                  src="/priceisright.png" 
                  alt="Game Show Background" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&q=80";
                  }}
                />
              </div>

              <div className="relative z-10">
                <DollarSign className="w-32 h-32 text-brand-gold mx-auto mb-8 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
                <h3 className="text-3xl font-bold text-white mb-4">لعبة خمن السعر</h3>
                <p className="text-zinc-400 mb-8 text-lg">سيتم اختيار منتج عشوائي عند البدء. اطلب من المتابعين كتابة <span className="text-brand-gold font-bold bg-brand-gold/10 px-2 py-1 rounded-lg border border-brand-gold/20">!join</span> للمشاركة.</p>
                
                <div className="mb-10 text-right">
                  <label className="block text-zinc-400 mb-3 font-bold">عدد الجولات</label>
                  <div className="flex gap-3">
                    {[3, 5, 10, 15].map(num => (
                      <button
                        key={num}
                        onClick={() => setTotalRounds(num)}
                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                          totalRounds === num 
                          ? 'bg-brand-gold border-brand-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                          : 'bg-black/40 border-brand-gold/20 text-brand-gold/70 hover:bg-brand-gold/10 hover:border-brand-gold/40'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="w-full flex items-center justify-center gap-3 py-6 bg-brand-gold hover:bg-brand-gold-light text-black rounded-2xl font-bold text-2xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] active:scale-95"
                >
                  <Play className="w-8 h-8 fill-current" />
                  ابدأ اللعبة
                </button>
              </div>
            </motion.div>
          )}

          {(status === 'guessing' || status === 'revealed') && (
            <div className="flex flex-col items-center w-full max-w-2xl">
              <div className="w-full bg-black/40 border border-brand-gold/20 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/10 to-transparent z-0" />
                <div className="relative z-10">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={`${item.nameAr} - ${item.name}`}
                      onError={handleImageError}
                      className="w-64 h-64 object-contain mx-auto mb-6 rounded-2xl bg-black/40 p-4 shadow-2xl border border-brand-gold/20"
                    />
                  ) : (
                    <div className="w-64 h-64 mx-auto mb-6 rounded-2xl bg-black/40 border border-brand-gold/20 flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-brand-gold/50" />
                    </div>
                  )}
                  <h3 className="text-4xl font-bold text-white mb-2">{item.nameAr}</h3>
                  <p className="text-base text-zinc-400 mb-4" dir="ltr">{item.name}</p>
                  <p className="text-xl text-zinc-400 mb-4">اكتب <span className="text-brand-gold font-bold bg-brand-gold/10 px-2 py-1 rounded-lg border border-brand-gold/20">!join</span> للمشاركة، ثم خمن السعر!</p>
                  
                  {status === 'guessing' && (
                    <div className="mt-8 bg-black/40 p-6 rounded-2xl border border-brand-gold/20 max-w-sm mx-auto">
                      <label className="block text-zinc-400 mb-2 text-sm font-bold uppercase tracking-wider">تخمينك (الستريمر)</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={streamerGuess}
                          onChange={(e) => setStreamerGuess(e.target.value)}
                          className="flex-1 bg-black/50 border border-brand-gold/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold transition-colors text-center font-bold text-xl"
                          placeholder="أدخل تخمينك..."
                        />
                      </div>
                      <p className="text-zinc-500 text-xs mt-2 italic">التخمين مخفي لمنع الغش</p>
                    </div>
                  )}

                  {status === 'revealed' && (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-block bg-brand-gold/20 border border-brand-gold/50 rounded-2xl px-12 py-6 mt-4"
                    >
                      <div className="text-brand-gold text-sm font-bold mb-2 uppercase tracking-wider">السعر الحقيقي</div>
                      <div className="text-6xl font-bold text-white glow-gold-text flex items-center justify-center gap-2">
                        <DollarSign className="w-12 h-12 text-brand-gold" />
                        {item.price}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {status === 'revealed' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full text-center"
                >
                  {winner ? (
                    <div className="bg-brand-gold/20 border border-brand-gold/50 rounded-3xl p-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
                      <Trophy className="w-20 h-20 text-brand-gold mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)] glow-gold" />
                      <h4 className="text-2xl text-brand-gold font-bold mb-2">فائز الجولة</h4>
                      <div className="text-5xl font-bold text-white mb-4">{winner.username}</div>
                      <div className="text-xl text-zinc-300">
                        خمن: <span className="text-brand-gold font-bold mx-2">${winner.guess}</span>
                        (الفرق: ${winner.diff})
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8">
                      <h4 className="text-3xl font-bold text-red-400 mb-2">لا يوجد فائز!</h4>
                      <p className="text-xl text-zinc-400">جميع التخمينات تجاوزت السعر الحقيقي.</p>
                    </div>
                  )}

                  <button
                    onClick={nextRound}
                    className="mt-8 flex items-center gap-2 px-12 py-5 bg-brand-gold hover:bg-brand-gold-light text-black rounded-2xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] mx-auto"
                  >
                    {currentRound < totalRounds ? 'الجولة التالية' : 'النتائج النهائية'}
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {status === 'game_over' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full max-w-2xl"
            >
              <Trophy className="w-32 h-32 text-brand-gold mx-auto mb-6 drop-shadow-[0_0_30px_rgba(212,175,55,0.5)] glow-gold" />
              <h3 className="text-4xl font-bold text-white mb-8">انتهت اللعبة!</h3>
              
              <div className="bg-black/40 border border-brand-gold/20 rounded-3xl p-8 mb-8">
                <h4 className="text-2xl font-bold text-zinc-400 mb-6 uppercase tracking-wider">الترتيب النهائي</h4>
                <div className="space-y-4">
                  {finalScores.map(([username, score], index) => (
                    <div key={username} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-brand-gold/10">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-brand-gold text-black' :
                          index === 1 ? 'bg-zinc-300 text-black' :
                          index === 2 ? 'bg-amber-600 text-black' :
                          'bg-white/10 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-xl font-bold text-white">{username}</span>
                      </div>
                      <div className="text-2xl font-bold text-brand-gold">{score} فوز</div>
                    </div>
                  ))}
                  {finalScores.length === 0 && (
                    <div className="text-zinc-500 py-4">لا يوجد فائزون في هذه اللعبة</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setStatus('setup')}
                className="flex items-center gap-2 px-8 py-4 bg-brand-gold hover:bg-brand-gold-light text-black rounded-xl font-bold text-lg transition-colors mx-auto shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                <RotateCcw className="w-6 h-6" />
                لعبة جديدة
              </button>
            </motion.div>
          )}
        </div>

        {/* Live Guesses Sidebar */}
        <div className="w-80 bg-black/40 border-r border-brand-gold/10 p-6 flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-brand-gold" />
              <h3 className="text-xl font-bold text-white">المشاركون ({joinedPlayers.size})</h3>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            <AnimatePresence>
              {/* Streamer Guess in Sidebar */}
              {status === 'guessing' && streamerGuess && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-brand-gold/20 border border-brand-gold/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-white">أنت (الستريمر)</span>
                    <span className="text-xs text-brand-gold font-bold italic">تم التخمين (سري)</span>
                  </div>
                  <div className="w-10 h-6 bg-brand-gold/30 rounded-md animate-pulse" />
                </motion.div>
              )}

                {/* Viewer & Streamer Guesses */}
                {sortedGuesses.map(([username, guess]) => {
                  const isStreamer = username === 'أنت (الستريمر)';
                  const isWinner = status === 'revealed' && winner?.username === username;
                  const isGuessing = status === 'guessing';

                  return (
                    <motion.div
                      key={username}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${
                        isWinner ? 'bg-brand-gold/20 border-brand-gold/50' :
                        isStreamer ? 'bg-brand-gold/10 border-brand-gold/30' :
                        'bg-black/40 border-brand-gold/10'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-white truncate max-w-[120px]">{username}</span>
                        {isWinner && <span className="text-xs text-brand-gold font-bold">الفائز!</span>}
                        {isStreamer && <span className="text-xs text-brand-gold font-bold">للعرض فقط</span>}
                        {isGuessing && <span className="text-xs text-brand-gold font-bold italic">تم التخمين (سري)</span>}
                      </div>
                      {isGuessing ? (
                        <div className="w-10 h-6 bg-brand-gold/20 rounded-md animate-pulse" />
                      ) : (
                        <span className={`font-bold text-lg text-brand-gold`}>
                          ${guess}
                        </span>
                      )}
                    </motion.div>
                  );
                })}              {/* Joined but not guessed */}
              {Array.from(joinedPlayers).filter(p => !guesses[p]).map(username => (
                <motion.div
                  key={username}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/40 border border-brand-gold/10 rounded-xl p-4 flex items-center justify-between opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-500" />
                    <span className="font-bold text-zinc-300 truncate max-w-[120px]">{username}</span>
                  </div>
                  <span className="text-xs text-zinc-500 italic">بانتظار التخمين...</span>
                </motion.div>
              ))}

              {joinedPlayers.size === 0 && !streamerGuess && (
                <div className="text-center text-zinc-500 py-8">
                  لا يوجد مشاركون بعد.<br/>اكتب <span className="text-brand-gold font-bold">!join</span> للمشاركة!
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
