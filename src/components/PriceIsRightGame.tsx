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

const FALLBACK_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiB2aWV3Qm94PSIwIDAgODAwIDgwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI0MDAiIHk9IjQwMCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj4ocGljdHVyZSB1bmF2YWlsYWJsZSk8L3RleHQ+PC9zdmc+';

const RANDOM_ITEMS: Item[] = [
  { name: 'PlayStation 5', nameAr: 'بلايستيشن 5', price: 499, imageUrl: 'https://png.pngtree.com/png-vector/20200616/ourmid/pngtree-ps-5-or-playstation-5-png-set-with-game-controller-png-image_2256908.jpg' },
  { name: 'iPhone 15 Pro', nameAr: 'آيفون 15 برو', price: 999, imageUrl: 'https://www.mockupcloud.com/uploads/thumbs/images/2024/01/26/08_25-1170x780.jpg' },
  { name: 'Mechanical Keyboard', nameAr: 'لوحة مفاتيح ميكانيكية', price: 150, imageUrl: 'https://www.keychronsg.com/cdn/shop/files/Keychron-V1-QMK-VIA-custom-mechanical-keyboard-shell-white-for-Mac-Window-Linux-fully-assembled-knob-Keychron-K-Pro-brown.jpg?v=1723448903&width=1214' },
  { name: 'Gaming Chair', nameAr: 'كرسي ألعاب', price: 350, imageUrl: 'https://assets.corsair.com/image/upload/f_auto,q_auto/v1/akamai/pdp/tc100-relax/tc100-relax-leather-black/images/TC100_RELAXED_PL_BLACK_01.png' },
  { name: 'AirPods Pro', nameAr: 'إيربودز برو', price: 249, imageUrl: 'https://mightyskins.com/cdn/shop/products/APAIPO_323468a1-13bd-4189-9191-5f3c1630a8a4.png?v=1553893180' },
  { name: 'Nintendo Switch OLED', nameAr: 'نينتندو سويتش OLED', price: 349, imageUrl: 'https://m.media-amazon.com/images/I/51zjE7FRXmL.jpg' },
  { name: 'Sony WH-1000XM5', nameAr: 'سوني WH-1000XM5', price: 399, imageUrl: 'https://store.pcimage.com.my/image/shoppcimage/image/cache/data/all_product_images/product-12412/TbG11nbp1727056840-420x420.jpg' },
  { name: 'GoPro Hero 12', nameAr: 'جو برو هيرو 12', price: 399, imageUrl: 'https://powerkiteshop.com/cdn/shop/products/gopro-hero-12-black-powerkiteshop-6.jpg?v=1713897527' },
  { name: 'Kindle Paperwhite', nameAr: 'كيندل بيبروایت', price: 139, imageUrl: 'https://www.audicoonline.co.za/image/cache/catalog/product/1736263082_69836230-600x450.jpeg' },
  { name: 'Lego Star Wars Millennium Falcon', nameAr: 'ليغو حرب النجوم ميلينيوم فالكون', price: 849, imageUrl: 'https://i5.walmartimages.com/asr/1b903e87-0048-4f5e-89d5-a09f5d8d825e.846050d1c173c70e3052dd8f422d20a2.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF' },
  { name: 'Dyson V15 Vacuum', nameAr: 'مكنسة دايسون V15', price: 749, imageUrl: 'https://www.pennlive.com/resizer/v2/2IUBZNZP75HPBF624ERVYRLWRM.jpg?auth=341cfd8cf972f6c3fb450526d561dfd12aefc3367790ee34ec1ae4e393a2ad58&width=500&smart=true&quality=90' },
  { name: 'Samsung Galaxy S23 Ultra', nameAr: 'سامسونج جالاكسي S23 ألترا', price: 1199, imageUrl: 'https://media.cdn.kaufland.de/product-images/1024x1024/e92ddb86aa62f5577d0abf2996cde312.jpg' },
  { name: 'NVIDIA RTX 4090', nameAr: 'نفيديا RTX 4090', price: 1599, imageUrl: 'https://d2vfia6k6wrouk.cloudfront.net/productimages/4c6f7acb-25ed-4ebd-9a28-af1f01166284/images/1-xlr8-rtx-4090-verto-epic-x-triple-fan-ra.png' },
  { name: 'Apple Watch Ultra 2', nameAr: 'آبل ووتش ألترا 2', price: 799, imageUrl: 'https://cyberstore.co.bw/wp-content/uploads/2023/07/Cyberstore-Product-Image-Placeholder.png.webp' },
  { name: 'Nespresso Coffee Machine', nameAr: 'ماكينة قهوة نسبريسو', price: 199, imageUrl: 'https://s.yimg.com/uu/api/res/1.2/d24UEVIs0KQJrcG7i8tnYg--~B/Zmk9c3RyaW07aD03MjA7dz0xMjgwO2FwcGlkPXl0YWNoeW9u/https://s.yimg.com/os/creatr-uploaded-images/2026-02/77ce6d10-06cf-11f1-a137-9f95f3a86e7a' },
  { name: 'Tesla Model 3', nameAr: 'تسلا موديل 3', price: 38990, imageUrl: 'https://evaca.ca/cdn/shop/products/s-l500_a47703ff-9dae-46f1-a1f3-ed940e976a3b.jpg?v=1762528542&width=416' },
  { name: 'Rolex Submariner', nameAr: 'رولكس سابمارينر', price: 9100, imageUrl: 'https://www.coveted.com/_next/image?url=https://assets.coveted.com/watches/images/unmapped/v1/generated/u2net_final_1726467020_46b9dd2b0ba8_rolex_submariner_automatic_chronometer_black_dial_men_s_watch_116610_bkso.png&w=3840&q=75' },
  { name: 'Herman Miller Aeron', nameAr: 'كرسي هيرمان ميلر إيرون', price: 1600, imageUrl: 'https://www.hermanmiller.com/content/dam/hmicom/page_assets/videos/poster_images/products/pi_prd_ovw_aeron_masthead.jpg' },
  { name: 'DJI Mavic 3 Pro', nameAr: 'دي جي آي مافيك 3 برو', price: 2199, imageUrl: 'https://media.apalmanac.com/wp-content/uploads/2022/11/DJI_Mavic-3-Classic_cover-3.jpg' },
  { name: 'Canon EOS R5', nameAr: 'كانون EOS R5', price: 3399, imageUrl: 'https://carmarthencameras.com/cdn/shop/files/EasyCover-Silicone-Skin-for-Canon-EOS-R5-MKII-Black-product-photo-2.webp?v=1757923603&width=900' },
  { name: 'MacBook Pro 16"', nameAr: 'ماك بوك برو 16', price: 2499, imageUrl: 'https://d13s5rafcqkqiu.cloudfront.net/CACHE/images/products/computers/apple/689483_apple-macbook-pro16-inch_z4aW80_DSC08086/abc9a0ed639d1af9a71f1119352bdac8.JPG' },
  { name: 'iPad Pro 12.9"', nameAr: 'آيباد برو 12.9', price: 1099, imageUrl: 'https://ng.jumia.is/LjCjlJaJ84lxphinvJoljk7toik=/fit-in/500x500/filters:fill(white)/product/66/1039814/1.jpg?6216' },
  { name: 'Steam Deck OLED', nameAr: 'ستيم ديك OLED', price: 549, imageUrl: 'https://deckbuttons.com/cdn/shop/files/IMG_6362.jpg?v=1733196493&width=533' },
  { name: 'Meta Quest 3', nameAr: 'ميتا كويست 3', price: 499, imageUrl: 'https://immersive-display.com/img/cms/Produits/Quest 3/350954660_231811119570856_2438219435834379037_n.png' },
  { name: 'Dyson Airwrap', nameAr: 'دايسون إيرراب', price: 599, imageUrl: 'https://media.product.which.co.uk/prod/images/original/a957d6072e06-dyson.jpg' },
  { name: 'Segway Ninebot Max', nameAr: 'سيغواي ناينبوت ماكس', price: 799, imageUrl: 'https://i.ebayimg.com/images/g/1V4AAeSw-PpperiK/s-l300.jpg' },
  { name: 'Peloton Bike+', nameAr: 'بيلوتون بايك+', price: 2495, imageUrl: 'https://kbowarchery.com/cdn/shop/products/PhoneTray5_1891x.jpg?v=1594293609' },
  { name: 'Weber Genesis Grill', nameAr: 'شواية ويبر جينيسيس', price: 1249, imageUrl: 'https://media.johnlewiscontent.com/i/JohnLewis/112838944alt2?fmt=auto&$background-off-white$' },
  { name: 'KitchenAid Stand Mixer', nameAr: 'خلاط كيتشن إيد ثابت', price: 449, imageUrl: 'https://cdn.shopify.com/s/files/1/0641/9388/8321/files/50091826_926085.png?v=1770777860' },
  { name: 'Yeti Tundra 45 Cooler', nameAr: 'مبرد يتي تندرا 45', price: 325, imageUrl: 'https://unitedsport.ca/cdn/shop/files/yeti-tundra-45-hard-cooler-moon-dust-purple-2.jpg?v=1759344765&width=750' },
  { name: 'Samsung 98" Neo QLED 8K TV', nameAr: 'تلفاز سامسونج نيو QLED 8K مقاس 98 بوصة', price: 9999, imageUrl: 'https://www.sammobile.com/wp-content/uploads/2024/01/Samsung-Neo-QLED-8K-TV-Series-2024.jpg' },
  { name: 'Bose QuietComfort Ultra', nameAr: 'بوز كوايت كومفورت ألترا', price: 429, imageUrl: 'https://i.guim.co.uk/img/media/1efd5bdef70e904c634513d04894b3a5c6a22399/630_0_5387_4310/master/5387.jpg?width=445&dpr=1&s=none&crop=none' },
  { name: 'Razer Blade 16', nameAr: 'ريزر بليد 16', price: 2999, imageUrl: 'https://s.yimg.com/ny/api/res/1.2/ftsmRGZVjXEaSIlOSU3Emg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTU0MA--/https://media.zenfs.com/en/gamesradar_237/968c5278e6847b4de229961eb275f71b' },
  { name: 'Logitech G Pro X Superlight 2', nameAr: 'لوجيتك G برو X سوبرلايت 2', price: 159, imageUrl: 'https://cdn.mos.cms.futurecdn.net/HiqDqnpGg5Tk5tTavw9weU.jpeg' },
  { name: 'Elgato Stream Deck MK.2', nameAr: 'إلغاتو ستريم ديك MK.2', price: 149, imageUrl: 'https://res.cloudinary.com/elgato-pwa/image/upload/v1754988277/2025/Stream Deck Classic/Cards/stream_deck_classic_white.jpg' },
  { name: 'Blue Yeti Microphone', nameAr: 'ميكروفون بلو يتي', price: 129, imageUrl: 'https://www.gamingislife.sg/cdn/shop/files/Slide12_69d3ff28-8176-4a65-95a2-b02aec7a0c81.jpg?v=1737361101&width=1214' },
  { name: 'Nanoleaf Shapes', nameAr: 'نانوليف شيبس', price: 199, imageUrl: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3739146362844388651' },
  { name: 'Philips Hue Starter Kit', nameAr: 'طقم فيليبس هيو الأساسي', price: 179, imageUrl: 'https://bfasset.costco-static.com/U447IH35/as/t8qwb6jc35czm3kkhvbjkn5w/1586939-847__5?auto=webp&format=jpg&width=727&height=727&fit=bounds&canvas=727,727' },
  { name: 'Ring Video Doorbell Pro 2', nameAr: 'جرس رينغ الذكي برو 2', price: 249, imageUrl: 'https://seconds.sg/cdn/shop/files/ring-wired-doorbell-pro2-4.jpg?v=1732280357&width=1500' },
  { name: 'iRobot Roomba j7+', nameAr: 'آي روبوت رومبا j7+', price: 799, imageUrl: 'https://cdn.idealo.com/folder/Product/202221/9/202221946/s3_produktbild_gross_11/irobot-roomba-j7-combo.jpg' },
  { name: 'Breville Barista Express', nameAr: 'بريفيل باريستا إكسبريس', price: 699, imageUrl: 'https://www.watchandpuck.sg/cdn/shop/products/breville-original-single-wall-1-cup-54mm-basket-compatible-with-barista-pro-express-bambino-touch-917964.jpg?v=1738052041&width=1445' },
  { name: 'Vitamix A3500', nameAr: 'فايتامكس A3500', price: 649, imageUrl: 'https://ak1.ostkcdn.com/images/products/is/images/direct/105af5da93a0ac5aa9687c0b9e0c103804442fcf/Vitamix-A3500-Ascent-Series-Smart-Blender-(64-oz.).jpg' },
  { name: 'Instant Pot Duo 7-in-1', nameAr: 'إنستانت بوت ديو 7 في 1', price: 99, imageUrl: 'https://microless.com/cdn/products/8fb456ba1c4d264877cd7ce1ac7f1327-hi.jpg' },
  { name: 'Le Creuset Dutch Oven', nameAr: 'قدر لو كروزيه الهولندي', price: 390, imageUrl: 'https://casualgourmet.ca/cdn/shop/files/LS2501-22.jpg?v=1734286207&width=1920' },
  { name: 'Ember Mug 2', nameAr: 'كوب إمبر 2', price: 129, imageUrl: 'https://m.media-amazon.com/images/S/aplus-media-library-service-media/9cc7f64f-3872-4114-8055-83e14d13a3d8.__AC_SR166,182___.jpg' },
  { name: 'Theragun PRO', nameAr: 'ثيراغن برو', price: 599, imageUrl: 'https://media.johnlewiscontent.com/i/JohnLewis/111508226alt3?fmt=auto&$background-off-white$' },
  { name: 'Oura Ring Gen3', nameAr: 'خاتم أورا الجيل الثالث', price: 299, imageUrl: 'https://images.squarespace-cdn.com/content/v1/625fa0436c37d43557ea2c4c/1722362453492-3AZK1YZ0P5MMQN1AIRS7/IMG_4929.JPG?format=1500w' },
  { name: 'Bowflex SelectTech 552', nameAr: 'دمبل بو فليكس سيليكت تيك 552', price: 429, imageUrl: 'https://global.bowflex.com/dw/image/v2/AAYW_PRD/on/demandware.static/-/Sites-nautilus-master-catalog/default/dw03f446e3/images/bowflex/selecttech/552/100131/dumbbell-biceps-curl-selecttech-552.jpg?sw=1200&sh=800&sm=fit' },
  { name: 'Hydro Flask 32 oz', nameAr: 'قارورة هايدرو فلاسك 32 أونصة', price: 44, imageUrl: 'https://www.coastalcountry.com/globalassets/catalogs/product_hyfl_w32bfs464_673_altimagetext_primary_1_1.jpg?width=207&height=207&rmode=BoxPad&bgcolor=fff' },
  { name: 'Patagonia Better Sweater', nameAr: 'سترة باتاغونيا بيتر سويتر', price: 139, imageUrl: 'https://www.outsidersstore.com/cdn/shop/files/217104906_1.jpg?v=1761913927&width=935' },
  { name: 'Canada Goose Expedition Parka', nameAr: 'باركا كندا غوس إكسبيديشن', price: 1495, imageUrl: 'https://cdn.media.amplience.net/i/harryrosen/20168533061' },
  { name: 'Louis Vuitton Neverfull MM', nameAr: 'حقيبة لويس فويتون نيفرفول MM', price: 2030, imageUrl: 'https://www.kewaybags.com/bolsos-segunda-mano/fotos/louis-vuitton-neverfull-mm-1716811690.jpg' },
  { name: 'Gucci Double G Belt', nameAr: 'حزام غوتشي دبل جي', price: 490, imageUrl: 'https://i.etsystatic.com/49097041/r/il/2869d8/5620815584/il_fullxfull.5620815584_qnr3.jpg' },
  { name: 'Ray-Ban Wayfarer', nameAr: 'راي-بان وايفيرر', price: 163, imageUrl: 'https://occhiohouse.com/wp-content/uploads/2025/05/product-ray-ban-rb3757-kai-004-2v-polarized_2.jpg' },
  { name: 'Rimowa Original Cabin', nameAr: 'حقيبة ريموا أوريجينال كابين', price: 1430, imageUrl: 'https://www.crepslocker.com/cdn/shop/files/rimowa-essentials-gloss-ballerina-pink-check-in-l-suitcase-83273751-back.webp?v=1762365751&width=1200' },
  { name: 'Tumi Alpha 3 Carry-On', nameAr: 'حقيبة تومي ألفا 3 (Carry-On)', price: 825, imageUrl: 'https://assets.levelshoes.com/cdn-cgi/image/width=1500,height=2100,quality=95,format=webp/media/catalog/product/0/2/02203560d3_7.jpg?ts=20231118032013' },
  { name: 'Fender Stratocaster', nameAr: 'جيتار فيندر ستراتوكاستر', price: 849, imageUrl: 'https://media.gettyimages.com/id/851519050/photo/electric-and-acoustic-guitar-product-shoot.jpg?s=594x594&w=gi&k=20&c=ui_2CMrrMhbrIZTiyOZZMWV-g1LmNlfnXhmWp2jc-KE=' },
  { name: 'Gibson Les Paul Standard', nameAr: 'جيتار غيبسون ليس بول ستاندرد', price: 2799, imageUrl: 'https://nafiriguitar.com/cdn/shop/files/9B85E60D-F101-4826-B640-3A6053F40B43.jpg?v=1726311147&width=1946' },
  { name: 'Yamaha P-125 Digital Piano', nameAr: 'بيانو ياماها الرقمي P-125', price: 699, imageUrl: 'https://down-ph.img.susercontent.com/file/fc028215e61fe1dd7498bcfa21ef3b16' },
  { name: 'Eames Lounge Chair', nameAr: 'كرسي إيمز لاونج', price: 7995, imageUrl: 'https://okayart.com/cdn/shop/products/eames-schalenstuhl-leder-20_1667x.jpg?v=1603457835' },
  { name: 'Marshall Stanmore III', nameAr: 'مارشال ستانمور III', price: 379, imageUrl: 'https://vega.am/image/cache/catalog/Angel/Hrach/MARSHALL Acton III (Brown) 1006075 (4)-350x262.jpg' },
  { name: 'Audio-Technica LP120X', nameAr: 'أوديو-تكنيكا LP120X', price: 349, imageUrl: 'https://www.tiktok.com/api/img/?itemId=7052414084511239470&location=0&aid=1988' },
  { name: 'Specialized Tarmac SL8', nameAr: 'دراجة سبيشالايزد تارماك SL8', price: 14000, imageUrl: 'https://www.camdencycles.com.au/cdn/shop/files/74925-18_TARMAC-SL8-TEAM-REPLICA-QUICKSTEP_HERO-PDP_1024x1024.webp?v=1751434736' },
  { name: 'Brompton C Line', nameAr: 'دراجة برومبتون C لاين', price: 1750, imageUrl: 'https://cdn-jupiter.metropolis.co.uk/wp-content/uploads/sites/9/2023/09/Brompton-C_Line-6.webp' },
  { name: 'Big Green Egg (Large)', nameAr: 'شواية بيغ غرين إيغ (كبير)', price: 1200, imageUrl: 'https://coasthomepatio.com/wpcoasthomepatio/wp-content/uploads/big-green-egg-grilling-tools-prenium-tongs-01-300x300.jpg' },
  { name: 'Solo Stove Bonfire 2.0', nameAr: 'موقد سولو ستوف بونفاير 2.0', price: 299, imageUrl: 'https://elshubbo-cdn.sirv.com/bbqworld/images/SSBONSASH_4vlarge.jpg?profile=1200' },
  { name: 'Garmin fenix 7X', nameAr: 'جارمين فينيكس 7X', price: 899, imageUrl: 'https://www.zdnet.com/a/img/resize/605e5e821057a70bbdfbc1f1c7951268752799be/2023/06/13/ecb8abc1-b284-435a-b97e-255bd9844caa/img-4169.jpg?auto=webp&width=1280' },
  { name: 'Arc\'teryx Alpha SV', nameAr: 'أركتيركس ألفا SV', price: 900, imageUrl: 'https://cdn-fsly.yottaa.net/5d669b394f1bbf7cb77826ae/www.moosejaw.com/v~4b.bb1/medium/10574044x1121088_zm.jpg' },
  { name: 'Osprey Aether 65', nameAr: 'حقيبة أوسبري إيذر 65', price: 320, imageUrl: 'https://sg.boardinggate.com.sg/cdn/shop/files/Bagsmart-Blast-Quick-Access-Carry-On-Travel-Backpack-Standard-28L-Arona-1.jpg?v=1740115102' },
  { name: 'Ferrari SF90 Stradale', nameAr: 'فيراري SF90 سترادالي', price: 524000, imageUrl: 'https://vehicle-images.carscommerce.inc/115c-110007362/ZFF96NMA9R0303265/5a6c88a7464e9cdc907f9f2316b41344.jpg' },
  { name: 'Lamborghini Aventador', nameAr: 'لامبورغيني أفينتادور', price: 500000, imageUrl: 'https://hips.hearstapps.com/mtg-prod/65b79ab9271e470008b698e1/260857454.jpg?w=768&width=768&q=75&format=webp' },
  { name: 'Hermès Birkin 30', nameAr: 'حقيبة هيرميس بيركين 30', price: 12000, imageUrl: 'https://cdn1.jolicloset.com/img4/full/2024/06/1358052-4.jpg' },
  { name: 'Patek Philippe Nautilus', nameAr: 'باتيك فيليب نوتيلوس', price: 35000, imageUrl: 'https://watchexchange.sg/wp-content/uploads/2026/03/wASTJuJmeCS8D9GEkM18RMTrawlJ8b6SAcjsePWK-news-300x300.jpg' },
  { name: 'Leica M11 Camera', nameAr: 'كاميرا لايكا M11', price: 8995, imageUrl: 'https://www.overgaard.dk/thorstenovergaardcom_copyrighted_graphics/Leica-M11-shutter-speed-dial-640w.jpg' },
  { name: 'Bang & Olufsen Beolab 90', nameAr: 'سماعات بانغ آند أولفسن بيولاب 90', price: 115000, imageUrl: 'https://cdn1.avstore.ro/qube/get/90w400h400/4687af8f1bfaa92f0f50770779745f68' },
  { name: 'Audeze LCD-5 Headphones', nameAr: 'سماعات أوديز LCD-5', price: 4500, imageUrl: 'https://www.audeze.com/cdn/shop/files/LCD-2-ProductImages-Front_600x.png?v=1725554974' },
  { name: 'Sennheiser HE 1', nameAr: 'سماعات زينهايزر HE 1', price: 59000, imageUrl: 'https://preview.redd.it/first-ever-sennheiser-he-1-unboxing-owner-review-and-ama-v0-vgkhxp8xg07a1.jpg?width=2268&format=pjpg&auto=webp&s=b0663d2b9a87eed2ac15405d691b5d1a0c2c1407' },
  { name: 'Steinway Model D Piano', nameAr: 'بيانو ستاينواي موديل D', price: 190000, imageUrl: 'https://b2612937.smushcdn.com/2612937/wp-content/uploads/2024/12/IMG_4093.jpg?lossy=2&strip=1&webp=1' },
  { name: 'Kartell Componibili', nameAr: 'وحدة كارتيل كومبونيبيلي', price: 150, imageUrl: 'https://media.madeindesign.com/cdn-cgi/image/fit=pad,format=auto,width=500,height=500,quality=70/nuxeo/products/0/7/rangement-componibili-glossy-white-kartell_madeindesign_62493_original.jpg' },
  { name: 'Vitra Panton Chair', nameAr: 'كرسي فيترا بانتون', price: 450, imageUrl: 'https://cdn.mohd.it/cache/image/format=webp/media/catalog/product/p/a/panton-junior-vitra-0011-livello-10-1.jpg' },
  { name: 'LEGO Disney Castle', nameAr: 'قلعة ديزني من ليغو', price: 399, imageUrl: 'https://alab.toys/cdn/shop/products/43222_alt10.png?v=1706705298&width=1946' },
  { name: 'Tamagotchi Pix', nameAr: 'تاماغوتشي بيكس', price: 59, imageUrl: 'https://media.karousell.com/media/photos/products/2017/02/06/tamagotchi_p2_yellow_1486356882_cf603316.jpg' },
  { name: 'Barbie Dreamhouse', nameAr: 'بيت أحلام باربي', price: 199, imageUrl: 'https://media.houseandgarden.co.uk/photos/62deb01f335f8686d969d8f9/master/w_1600,c_limit/1990%20Barbie%20Magical%20Mansion.jpg' },
  { name: 'DJI Osmo Pocket 3', nameAr: 'دي جي آي أوزمو بوكيت 3', price: 519, imageUrl: 'https://www.samys.com/imagesproc/aHR0cHM6Ly9pLnl0aW1nLmNvbS92aS90QkJ4SkY1cUpIZy9tcWRlZmF1bHQuanBn_H_SH760_MW760.jpg' },
  { name: 'Insta360 X3', nameAr: 'إنستا360 X3', price: 449, imageUrl: 'https://shop.villman.com/cdn/shop/files/KH_1200x.png?v=1731479508' },
  { name: 'Fujifilm Instax Mini 12', nameAr: 'فوجي فيلم إنستاكس ميني 12', price: 79, imageUrl: 'https://www.instaxcanada.ca/wp-content/uploads/2024/08/instax-mini-Link-3_Product-Clay-White_02.png' },
  { name: 'Polaroid Now+', nameAr: 'بولارويد ناو+', price: 149, imageUrl: 'https://logon.citysuper.com.hk/cdn/shop/products/009075_Polaroid_Now__Gen2_Green_Left_3000x3000_f846c5d4-ecdc-4e8e-82c5-7109394b412b.jpg?v=1697537227&width=1946' },
  { name: 'Akai MPC One+', nameAr: 'أكاي MPC One+', price: 699, imageUrl: 'https://cdn11.bigcommerce.com/s-dl6a9h3u/images/stencil/500x659/products/2006/3832/IMG_20200304_141326__80121.1583349913.jpg?c=2' },
  { name: 'Onewheel GT', nameAr: 'ون ويل GT', price: 2250, imageUrl: 'https://lh3.googleusercontent.com/lzZSZDECGVAOOJDCXjB8n4lUvUGElzQq5sLby5rTqCPtXqcDklBRvHdLHLsNqJX8LKqqxTZ_mHUWiX72nfBUn4aaJrUCoVCnYGFK0YWh5dzBq6R6h9HjvLPagRsgrDn9dm5wAOhq' },
  { name: 'Apple Vision Pro', nameAr: 'آبل فيجن برو', price: 3499, imageUrl: 'https://c8.alamy.com/comp/2WHEPFH/hcmc-vn-feb-2024-apple-vision-pro-for-editorial-use-2WHEPFH.jpg' },
  { name: 'Samsung Galaxy Z Fold 5', nameAr: 'سامسونج جالاكسي زد فولد 5', price: 1799, imageUrl: 'https://images.samsung.com/in/smartphones/galaxy-z-flip7/images/galaxy-z-flip7-features-kv.jpg?imbypass=true' },
  { name: 'Sony A7 IV Camera', nameAr: 'كاميرا سوني A7 IV', price: 2499, imageUrl: 'https://i.etsystatic.com/32033245/r/il/ba4257/6113355795/il_fullxfull.6113355795_4mo4.jpg' },
  { name: 'Bose SoundLink Max', nameAr: 'سماعة بوز ساوند لينك ماكس', price: 399, imageUrl: 'https://www.dealmonday.co.uk/image/cache/wp/gp/Bose/Bose-SoundLink-Max-Portable-Party-Speaker-Black-7-800x800.webp' },
  { name: 'Herman Miller Embody', nameAr: 'كرسي هيرمان ميلر إمبودي', price: 1695, imageUrl: 'https://www.hermanmiller.hk/cdn/shop/files/embody_feature_03.jpg?height=844&v=1661161696&width=1500' },
  { name: 'DJI Mini 4 Pro', nameAr: 'دي جي آي ميني 4 برو', price: 759, imageUrl: 'https://dji-retail.co.uk/cdn/shop/files/dji-mini-5-pro-fly-more-combo-rc2.webp?v=1760073908&width=1000' },
  { name: 'KitchenAid Espresso Machine', nameAr: 'ماكينة إسبرسو كيتشن إيد', price: 799, imageUrl: 'https://cb.scene7.com/is/image/Crate/KitchenAidSmAutoEspMchnMlkROF21?$web_pdp_main_carousel_med$' },
  { name: 'LG C3 OLED 65"', nameAr: 'تلفاز إل جي C3 OLED مقاس 65 بوصة', price: 1799, imageUrl: 'https://images.webfronts.com/cache/rdgqinmeibge.jpg?imgeng=/w_640/h_640/m_letterbox_ffffff_100' },
  { name: 'Beats Studio Pro', nameAr: 'سماعات بيتس ستوديو برو', price: 349, imageUrl: 'https://designskinz.com/cdn/shop/products/The_White_Mustaches_with_blue_background_Skin_for_the_Beats_by_Dre_Pro_Headphones_600x.png?v=1578623967' },
  { name: 'Nintendo Switch Pro Controller', nameAr: 'يد تحكم نينتندو سويتش برو', price: 69, imageUrl: 'https://www.skinit.com/cdn/shop/products/van-gogh--irises-nintendo-switch-pro-controller-skin-1547748542_SKNBRGVNG04NTSPCT-PR-01_600x.jpg?v=1683120721' },
  { name: 'Trek Marlin 7', nameAr: 'دراجة تريك مارلين 7', price: 889, imageUrl: 'https://www.bicyclechain.co.uk/content/products/liv-tempt-4_107800488_tmb.jpg' },
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

      // Extract standalone number from message, converting Arabic numerals if any
      const englishText = text.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      const match = englishText.match(/\b\d+\b/);
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
    if (streamerGuess && !isNaN(parseInt(streamerGuess))) {
      allGuesses['أنت (الستريمر)'] = parseInt(streamerGuess);
    }
    
      // Find closest absolute guess
      let bestGuess: { username: string; guess: number; diff: number } | null = null;

      Object.entries(allGuesses).forEach(([username, guess]) => {
        if (guess > item.price) return;
          const diff = item.price - guess;
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
    <div className="flex flex-col h-full max-w-6xl mx-auto bg-black/80  rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl font-arabic" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-brand-gold/10 bg-black/70 relative z-10">
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
                  className="flex items-center gap-2 px-6 py-3 bg-black/70 hover:bg-black/80 text-white rounded-xl font-bold transition-colors border border-brand-gold/20 hover:border-brand-gold/40"
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
              className="w-full max-w-md bg-black/70 p-12 rounded-3xl border border-brand-gold/20 text-center relative overflow-hidden shadow-2xl"
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
                          : 'bg-black/70 border-brand-gold/20 text-brand-gold/70 hover:bg-brand-gold/10 hover:border-brand-gold/40'
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
              <div className="w-full bg-black/70 border border-brand-gold/20 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/10 to-transparent z-0" />
                <div className="relative z-10">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={`${item.nameAr} - ${item.name}`}
                      onError={handleImageError}
                      className="w-64 h-64 object-contain mx-auto mb-6 rounded-2xl bg-black/70 p-4 shadow-2xl border border-brand-gold/20"
                    />
                  ) : (
                    <div className="w-64 h-64 mx-auto mb-6 rounded-2xl bg-black/70 border border-brand-gold/20 flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-brand-gold/50" />
                    </div>
                  )}
                  <h3 className="text-4xl font-bold text-white mb-2">{item.nameAr}</h3>
                  <p className="text-base text-zinc-400 mb-4" dir="ltr">{item.name}</p>
                  <p className="text-xl text-zinc-400 mb-4">اكتب <span className="text-brand-gold font-bold bg-brand-gold/10 px-2 py-1 rounded-lg border border-brand-gold/20">!join</span> للمشاركة، ثم خمن السعر!</p>
                  
                  {status === 'guessing' && (
                    <div className="mt-8 bg-black/70 p-6 rounded-2xl border border-brand-gold/20 max-w-sm mx-auto">
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
                      <p className="text-xl text-zinc-400">لم تكن هناك تخمينات صحيحة من اللاعبين.</p>
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
              
              <div className="bg-black/70 border border-brand-gold/20 rounded-3xl p-8 mb-8">
                <h4 className="text-2xl font-bold text-zinc-400 mb-6 uppercase tracking-wider">الترتيب النهائي</h4>
                <div className="space-y-4">
                  {finalScores.map(([username, score], index) => (
                    <div key={username} className="flex items-center justify-between bg-black/70 p-4 rounded-xl border border-brand-gold/10">
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
        <div className="w-80 bg-black/70 border-r border-brand-gold/10 p-6 flex flex-col relative z-10">
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
                        'bg-black/70 border-brand-gold/10'
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
                  className="bg-black/70 border border-brand-gold/10 rounded-xl p-4 flex items-center justify-between opacity-60"
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

