
import fs from "fs";
let c = fs.readFileSync("src/components/PriceIsRightGame.tsx", "utf8");

c = c.replace(
  "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=800&q=80",
  "https://cdn-fsly.yottaa.net/5d669b394f1bbf7cb77826ae/www.moosejaw.com/v~4b.bb1/medium/10574044x1121088_zm.jpg"
);

c = c.replace(
  "https://media.diy.com/is/image/KingfisherDigital/gtplayer-gaming-chair-with-footrest-computer-chairs-for-adults-ergonomic-lumbar-support-height-adjustable-pu-pc-chair-white~6978281581195_02c_MP?$MOB_PREVhttps://images.unsplash.com/photo-1598550476439-6847785fce66?w=800&q=80$width=284&$height=284",
  "https://assets.corsair.com/image/upload/f_auto,q_auto/v1/akamai/pdp/tc100-relax/tc100-relax-leather-black/images/TC100_RELAXED_PL_BLACK_01.png"
);

fs.writeFileSync("src/components/PriceIsRightGame.tsx", c);
console.log("Images fixed!");

