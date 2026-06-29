// =============================================================
// Review generator locale packs.
// File: /app/utils/review-locale.js
//
// Selected by REVIEW_LOCALE env ("india" | "global"), set per-brand by
// scripts/configure-brand.mjs. Keeps the generator usable for any store,
// not just Indian ones. `india` is the original content, preserved verbatim.
// =============================================================

const india = {
  country: "IN",
  names: [
    "Aman Sharma","Riya Kapoor","Aarav Patel","Diya Khanna","Ishaan Trivedi",
    "Ananya Mehta","Vihaan Singh","Saanvi Gupta","Aditya Rao","Kavya Iyer",
    "Rohan Malhotra","Priya Nair","Karan Bhatia","Megha Reddy","Arjun Joshi",
    "Sneha Desai","Rahul Pillai","Tara Kulkarni","Yash Chawla","Nikita Bose",
    "Dhruv Agarwal","Pooja Verma","Siddharth Roy","Anjali Saxena","Manav Shetty",
    "Navya Reddy","Rishabh Desai","Jahnvi Joshi","Myra Bhatia","Shaurya Malhotra",
  ],
  locations: [
    "Mumbai, India","Delhi, India","Bengaluru, India","Hyderabad, India",
    "Chennai, India","Kolkata, India","Pune, India","Jaipur, India",
    "Ahmedabad, India","Lucknow, India","Chandigarh, India","Gurgaon, India",
    "Noida, India","Surat, India","Indore, India","Bhopal, India",
  ],
  t5: [
    (p) => `${p} is absolutely stunning. Quality is top-notch, packaging was solid, and it looks even better in person. Bohot premium feel hai. Worth every rupee.`,
    (p) => `Loved my ${p}! Bada premium feel hai aur budget me bhi. Ekdum kadak. Highly recommend if you want something that actually delivers.`,
    (p) => `Kamaal ki finish hai. ${p} looks gorgeous and the build is sturdy. Fast delivery too. Bina soche le lo.`,
    (p) => `Such a classy product. ${p} adds an instant aesthetic upgrade. Material is premium and packaging was very neat. Macha diya!`,
    (p) => `Yaar this is fab! ${p} is exactly what the photos show. Premium feel, great craftsmanship. A1 quality. Will buy again.`,
    (p) => `${p} arrived perfectly packaged and looks better than expected. Aesthetic is on point. Top-notch bhai.`,
    (p) => `Honestly impressed. ${p} ki finish is excellent and delivery was super quick. Chha gaye!`,
    (p) => `Beautiful piece — ${p} totally elevates the room. Bohot elegant look deta hai. Worth the price.`,
    (p) => `Quality is unmatched at this price point. ${p} feels premium, packaging was great, no damage. Jhakaas!`,
    (p) => `${p} is exactly as described. Great craftsmanship, durable build, fast shipping. Solid 5 stars.`,
  ],
  t4: [
    (p) => `${p} is really nice in person. Quality is good and looks premium. Slightly smaller than I expected but still happy with it.`,
    (p) => `Pretty solid product overall. ${p} ki build quality is good, packaging was decent. Just took a couple days extra to deliver.`,
    (p) => `Looks great and feels well-made. ${p} would have been 5 stars if assembly instructions were clearer.`,
    (p) => `Good purchase overall. ${p} arrived in good condition, looks neat, but the color is slightly different from the website.`,
    (p) => `${p} is good for the price. Build is solid, design is nice. Lost one star because the packaging could have been better.`,
    (p) => `Nice product, decent value. ${p} ki finish thodi rough hai but looks great from the front. Recommend.`,
  ],
  t3: [
    (p) => `${p} is okay. Looks nice but the build quality could be better at this price. Delivery was on time though.`,
    (p) => `Mixed feelings. ${p} looks good in photos but feels a bit lighter than expected. Not bad, not great.`,
    (p) => `Average product. ${p} works fine but nothing special. Was hoping for slightly better finish.`,
  ],
  titles: {
    5: ["Loved it!","Top-notch","Premium feel","Worth every rupee","Absolutely stunning",
        "Macha diya","Kamaal","A1 quality","Highly recommend","Best purchase"],
    4: ["Solid product","Pretty good","Looks great","Worth it","Nice purchase","Recommend"],
    3: ["It's okay","Average","Mixed feelings","Decent","Not bad"],
  },
};

const global = {
  country: "US",
  names: [
    "Emma Johnson","Liam Smith","Olivia Brown","Noah Williams","Ava Jones",
    "Sophia Garcia","Jackson Miller","Isabella Davis","Lucas Martin","Mia Wilson",
    "Ethan Moore","Charlotte Taylor","Mason Anderson","Amelia Thomas","Logan White",
    "Harper Martinez","James Robinson","Evelyn Clark","Benjamin Lewis","Abigail Walker",
    "Henry Hall","Ella Young","Alexander King","Scarlett Wright","Daniel Green",
    "Grace Baker","Matthew Adams","Chloe Nelson","Samuel Carter","Lily Mitchell",
  ],
  locations: [
    "New York, USA","Los Angeles, USA","Chicago, USA","Houston, USA",
    "Austin, USA","Seattle, USA","Denver, USA","Boston, USA",
    "London, UK","Manchester, UK","Toronto, Canada","Vancouver, Canada",
    "Sydney, Australia","Melbourne, Australia","Dublin, Ireland","Auckland, NZ",
  ],
  t5: [
    (p) => `${p} is absolutely stunning. The quality is top-notch, packaging was solid, and it looks even better in person. Worth every penny.`,
    (p) => `Loved my ${p}! Premium feel without the premium price tag. Highly recommend if you want something that actually delivers.`,
    (p) => `Beautiful finish. ${p} looks gorgeous and the build is sturdy. Fast delivery too — don't think twice.`,
    (p) => `Such a classy product. ${p} adds an instant upgrade to the space. Material feels premium and packaging was very neat.`,
    (p) => `This is fantastic! ${p} is exactly what the photos show. Premium feel, great craftsmanship. Will definitely buy again.`,
    (p) => `${p} arrived perfectly packaged and looks better than expected. Genuinely impressed with the quality.`,
    (p) => `Honestly impressed. ${p}'s finish is excellent and delivery was super quick. Couldn't be happier.`,
    (p) => `Beautiful piece — ${p} totally elevates the room. Elegant look and well worth the price.`,
    (p) => `Quality is unmatched at this price point. ${p} feels premium, packaging was great, arrived with no damage.`,
    (p) => `${p} is exactly as described. Great craftsmanship, durable build, fast shipping. Solid 5 stars.`,
  ],
  t4: [
    (p) => `${p} is really nice in person. Quality is good and it looks premium. Slightly smaller than I expected but still happy with it.`,
    (p) => `Pretty solid overall. ${p}'s build quality is good and packaging was decent. Took a couple extra days to arrive.`,
    (p) => `Looks great and feels well made. ${p} would have been 5 stars if the assembly instructions were clearer.`,
    (p) => `Good purchase overall. ${p} arrived in good condition and looks neat, though the color is slightly different from the website.`,
    (p) => `${p} is good for the price. Build is solid and the design is nice. Lost a star because the packaging could be better.`,
    (p) => `Nice product, decent value. ${p}'s finish is a touch rough up close but it looks great from the front. Recommend.`,
  ],
  t3: [
    (p) => `${p} is okay. Looks nice but the build quality could be better at this price. Delivery was on time though.`,
    (p) => `Mixed feelings. ${p} looks good in photos but feels a bit lighter than expected. Not bad, not great.`,
    (p) => `Average product. ${p} works fine but nothing special. Was hoping for a slightly better finish.`,
  ],
  titles: {
    5: ["Loved it!","Top-notch","Premium feel","Worth every penny","Absolutely stunning",
        "Exceeded expectations","Fantastic","Excellent quality","Highly recommend","Best purchase"],
    4: ["Solid product","Pretty good","Looks great","Worth it","Nice purchase","Recommend"],
    3: ["It's okay","Average","Mixed feelings","Decent","Not bad"],
  },
};

const PACKS = { india, global };

export function getLocale(preset) {
  return PACKS[String(preset || "india").toLowerCase()] || india;
}
