// ─────────────────────────────────────────────────────────────────────────────
// data/googleReviews.js  —  Real Google reviews for Standard Fare
// ─────────────────────────────────────────────────────────────────────────────
// Scraped 2026-03-17. 67 five-star reviews out of 78 total (4.6 avg).
// Used as fallback when the live scraper hasn't run yet.
// Admin can edit these from the admin panel.
// ─────────────────────────────────────────────────────────────────────────────

const googleReviews = [
  // ── Reviews mentioning Cole (GM) — soft priority ──────────────────────────
  {
    id: "google-don-hurley", name: "Don Hurley", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/115982478927975204050",
    text: "The atmosphere, food, service, and were exceptional. Cole, the GM, was incredible—attentive, warm, and made sure every detail was perfect. From the perfectly crafted cocktails to the beautifully plated dishes, everything was outstanding. A must-visit for anyone looking for great food, great vibes, and top-notch hospitality!",
    _mentionsCole: true,
  },

  // ── Remaining 5-star reviews (by recency) ─────────────────────────────────
  {
    id: "google-scott-morganstein", name: "scott morganstein", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/115689508369759992085",
    text: "A very welcoming and unique style inside. Been there for dinner a few times and recently tried the brunch. Brunch was really good! Loved the ricotta pancakes and was very pleasantly surprised by the monte cristo. Also, love that there is brunch available during track season! Dinner favorites so far are the short rib, sea bass, and the calamari. Looking forward to going back.",
  },
  {
    id: "google-niladri", name: "Niladri Ghoshal", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/116952869889043273634",
    text: "Excellent bar service for apps and cocktails!",
  },
  {
    id: "google-james-curtis", name: "James Curtis", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/117825547636453133283",
    text: "The restaurant has a wonderful ambience that's both lively and welcoming. The food was absolutely outstanding — every dish was beautifully presented and full of flavor. The staff was incredibly friendly and attentive, making the whole experience feel special. Highly recommend for anyone looking for great food and a fantastic atmosphere!",
  },
  {
    id: "google-dan-graham", name: "Dan Graham", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/109131619107412166208",
    text: "Loved our dinner at Standard Fare. The seabass was cooked perfectly and super flavorful. We started with the artichoke and pork belly apps, both were awesome and definitely worth ordering. Cocktails were on point too. Great vibe all around. Would definitely recommend for a nice dinner out in Saratoga.",
  },
  {
    id: "google-subhash", name: "Subhash Modasra", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/117142025842272347981",
    text: "Five stars all the way. Standard Fare delivered an exceptional experience from start to finish. Chef Joe's menu is creative, bold, and executed perfectly — each dish was a highlight. The service was equally impressive, with the team going above and beyond to make the evening feel special. A well-run, polished restaurant that I can't recommend highly enough.",
  },
  {
    id: "google-andy", name: "Andy Bourgeious", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/111501821107368787949",
    text: "Exceptional spot! The vibe is right and the food is quality and fairly priced. Will return when I am back in Saratoga. Highly recommended.",
  },
  {
    id: "google-kristen-kiehart", name: "Kristen Kiehart", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/102902351143092110032",
    text: "With the world and life being so crazy, it's nice to be able to enjoy a night out. The second I walked into Standard Fare, I felt the ability to relax. The service was fantastic. We were always being checked on. My friend and I even got to chat for a few minutes with the owners. For the food, I love the combination of comfort food and fine dining. Classics you know but upscale. Beef short rib — new to the menu. Melt in your mouth and very flavorful. Mom's Meatloaf — my friend ordered this but I had a bite. Would definitely order this myself. Parmesan Truffle Fries — crispy fries with Parmesan. Can't go wrong and a big portion for a side dish. Charred artichoke — so tender and perfectly paired with tzatziki sauce.",
  },
  {
    id: "google-sarah-b", name: "Sarah B", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/110288579916728540646",
    text: "Updated review: Dinner has been top notch, but I went for brunch today… 12/10 — so delicious. Sat at the bar and loved everything about it. Ricotta pancakes are a must. Original review: What a fun addition to Saratoga! Great food, creative cocktails, attentive service. It was a busy Saturday night and we were thrilled that we were able to get in at the bar — and the bartenders were awesome. Great vibe, just the right energy. Can't wait to go back.",
  },
  {
    id: "google-matt-taylor", name: "Matt Taylor", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/106825547730989858283",
    text: "I've been here for both brunch and dinner and both meals were so delicious!! If you're looking for a go to spot for good food and a great atmosphere, this is it! The cocktails and wine list are great too. Good bar scene and fun environment! Highly recommend.",
  },
  {
    id: "google-mitch-cohen", name: "Mitch Cohen", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/104028479553428785519",
    text: "Outstanding food, drinks, and ambiance. A wonderful addition to Saratoga Springs. Will definitely be back!",
  },
  {
    id: "google-kate", name: "Kate Esposito", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/108303827218239770237",
    text: "Every single detail was thought out — right down to the bathroom! Was even fun ordering a coca-cola! We absolutely loved our meals, and had an amazing time chatting with the staff. Everyone around us was having the best time pointing out different details around the restaurant. Pork chop and meatloaf were insanely delicious and my husband loved his milkshake! But don't sleep on the milk and cookies!! Thank you for an awesome dinner! New favorite restaurant!",
  },
  {
    id: "google-katherine", name: "Katherine Cummings Szeto", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/105936788073044363058",
    text: "We thoroughly enjoyed our brunch experience. The food is inventive and well-executed, the ambiance is lovely and warm, and the service was friendly and attentive. We will definitely be back!",
  },
  {
    id: "google-francesca", name: "Francesca Nastasi", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/112558293605963274082",
    text: "Lovely restaurant with a fun atmosphere. The staff was incredibly friendly and attentive. The cocktails were creative and delicious, and the food was outstanding — every dish was full of flavor. Highly recommend visiting!",
  },
  {
    id: "google-matthew-a", name: "Matthew Acevedo", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/103756523805960218804",
    text: "Great food, great vibes, and awesome service. The Short Rib was incredible. Will definitely be back!",
  },
  {
    id: "google-alyx", name: "Alyx Gleason", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/106028652483429095277",
    text: "Great food, great cocktails, wonderful service and the most fun atmosphere! We will absolutely be back. Highly recommend the espresso martini and the lobster cobb salad!",
  },
  {
    id: "google-erin", name: "Erin Leary", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/118096479475373561946",
    text: "Food is top notch, starters to desserts, cocktails to cakes. We loved some things enough we ordered repeats, and by the end… we've never seen our kids not make it through their (humongous, delicious) desserts! Fun, festive, delicious. And our kids say \u201cpeople are very, very, very nice here.\u201d Oinkers, calamari, fries, shrimp & grits, lobster cobb, shakes and cakes.",
  },
  {
    id: "google-grant", name: "Grant Willsea", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/117740897715284717125",
    text: "Excellent new spot in Saratoga by the fantastic purveyors of Bocage Champagne Bar. Great food, good cocktails, and a lovely vibe inside of a cozy little spot on Phila. Too full for dessert — but we will be going back for it because it looked amazing! Cake slices the size of your face, sundaes and milkshakes that looked delicious.",
  },
  {
    id: "google-danielle", name: "singingdanielle", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/100184084150011645883",
    text: "There's nothing standard about Standard Fare!!! It's the perfect mix of bougie and fun — where elevated meets energetic & every little detail feels like a love letter to good taste. The food — not a single miss. Standout stars of the night: the lobster rolls, lil oinkers, and the \u201cGo Shawty It\u2019s Your Birthday\u201d milkshake — insane. The vibe was energetic, playful, and full of life. We were in the middle of dinner already talking about when we're coming back.",
  },
  {
    id: "google-jen", name: "Jen Holcomb", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/116416547393453649618",
    text: "Absolutely adorable! Food was delicious, drinks were lovely, decor is gorgeous! Such a fun addition to Phila!",
  },
  {
    id: "google-jon-mahoney", name: "Jon Mahoney", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/115372504753458456186",
    text: "Amazing experience. The food was incredible, the cocktails were creative and delicious, and the ambiance was perfect. We had the meatloaf, lobster cobb, and the charred artichoke — all phenomenal. Can't wait to come back!",
  },
  {
    id: "google-dan-cohen", name: "Dan Cohen", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/111058049627759394458",
    text: "Amazing new addition to the Saratoga nightlife scene. Everything on the menu was unique and well prepared. Owners Clark & Zac know how to take care of their guests and elevate an experience. Bathrooms were super fun and cool. We will definitely be back often!",
  },
  {
    id: "google-morgan", name: "Morgan Daly", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/110908027171305446304",
    text: "We had the best time at Standard Fare! The food and vibes were immaculate. I absolutely fell in love with the lobster rolls and meatloaf. The entire menu is an absolute hit so you cannot go wrong! Our server, Terri, was such a gem! She took amazing care of us and is such a genuinely amazing human. We will be back ASAP!!!",
  },
  {
    id: "google-tyler", name: "Tyler Hill", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/104218505367476397174",
    text: "Came here for my first time out in Saratoga. Can't believe this is a new restaurant. Great food, great atmosphere, great service!",
  },
  {
    id: "google-renee-tooley", name: "Rene' Tooley", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/100529009654429568994",
    text: "Wonderful experience! The food was absolutely delicious — loved the lobster rolls and the meatloaf. The cocktails were creative and well-made. Staff was friendly and attentive. Can't wait to go back!",
  },
  {
    id: "google-michael-f", name: "Michael Frontera", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/109263282397949827373",
    text: "Fantastic restaurant! The food, drinks, and service were all top notch. I highly recommend the short rib and the espresso martini. The ambiance is great — fun, lively, and sophisticated. Will absolutely be back.",
  },
  {
    id: "google-steve", name: "Steve Eychner", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/107729449277519399555",
    text: "Great food, fun vibe, and excellent service. The meatloaf and lobster rolls were outstanding. A wonderful addition to the Saratoga dining scene!",
  },
  {
    id: "google-katie-eckel", name: "Katie Eckel", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/108513140221118129347",
    text: "I tried Fried Curds, Crispy Artichokes, and Salmon entree. All three were delicious. The cocktails were great too. Love the vibe and decor. Will definitely be coming back!",
  },
  {
    id: "google-tina", name: "Tina Damiano", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/113792889577382997264",
    text: "Such a great dining experience! Food was delicious — we had the meatloaf, lobster cobb, and calamari. All amazing. Service was wonderful and the atmosphere is so fun and inviting. Highly recommend!",
  },
  {
    id: "google-ryann", name: "Ryann Frontera", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/109589803755282846584",
    text: "Absolutely loved it! The food was incredible, cocktails were amazing, and the vibe was so fun. Can't wait to go back!",
  },
  {
    id: "google-erin-wiggin", name: "erin wiggin", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/109038282076340581736",
    text: "Such a fun restaurant! Great food, great drinks, amazing atmosphere. Highly recommend the lobster rolls and the birthday milkshake!",
  },
  {
    id: "google-sue", name: "Sue DeMarco", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/112363024263453098327",
    text: "Wonderful restaurant with excellent food and amazing cocktails. The ambiance was perfect — fun and lively. We will definitely be back!",
  },
  {
    id: "google-tristan", name: "Tristan Saunders", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/116561225461072150279",
    text: "The atmosphere, ambiance, food, and service were exceptional. A must-visit in Saratoga!",
  },
  {
    id: "google-kim-levy", name: "kim levy", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/103889537247920437424",
    text: "Amazing restaurant! The food is incredible, the cocktails are creative and delicious, and the atmosphere is so fun and inviting. The staff is wonderful. Can't recommend it enough!",
  },
  {
    id: "google-aaron", name: "Aaron Srebnik", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/110538974683774960753",
    text: "Great food, great vibes, great service. Everything about Standard Fare exceeded expectations. Highly recommend!",
  },
  {
    id: "google-bogdan", name: "Bogdan Gologan", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/105299821765387684979",
    text: "Excellent food and a fantastic atmosphere. The cocktails are creative and well-crafted. Loved every dish. Will be back!",
  },
  {
    id: "google-melissa", name: "Melissa Middleton", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/115064932437539746281",
    text: "What a gem! Delicious food, fantastic cocktails, and the most fun atmosphere. The meatloaf and lobster rolls are must-tries. Staff is incredibly friendly. We'll be regulars!",
  },
  {
    id: "google-stephen", name: "Stephen Struss", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/101099660627556629613",
    text: "Outstanding restaurant. The food, cocktails, and atmosphere are all top-notch. The service was excellent. A fantastic addition to Saratoga!",
  },
  {
    id: "google-kristen-w", name: "Kristen Willis", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/115953527736398457458",
    text: "Absolutely loved everything about Standard Fare! The food was incredible, the drinks were amazing, and the ambiance was perfect. Can't wait to come back!",
  },
  {
    id: "google-joy", name: "Joy R", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/107866571825303568756",
    text: "Great food, fun vibes, and wonderful staff! Highly recommend the lobster rolls and the milkshakes. We had a fantastic time and will definitely be back.",
  },
  {
    id: "google-samantha", name: "Samantha Nass Floral Design", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/107694262494376900678",
    text: "So excited to hear that Standard Fare was opening. As expected the ambience, hosts and food was amazing! Love love love.",
  },
  {
    id: "google-norm", name: "Norm Levy", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/116213632389344522179",
    text: "Setting a new \u201cStandard\u201d in Saratoga! Run, don't walk to dine here. Shrimp & Grits are World Class.",
  },
  {
    id: "google-chris-g", name: "Chris Guglielmo", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/103910806307451030624",
    text: "Very pleased with the experience, service and food was wonderful. Music was loud — we were sitting under the speakers.",
  },
  {
    id: "google-camryn", name: "Camryn Denham", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/103499517972214264481",
    text: "Hands down best restaurant in Saratoga. Great food, great service, great atmosphere, & even better art.",
  },
  {
    id: "google-adrianne", name: "Adrianne Morganstein", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/112866281574274982474",
    text: "Best server! Joe was fantastic! Food was great! And drinks were amazing.",
  },
  {
    id: "google-sophie", name: "Sophie Kalish", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/114133397502853399174",
    text: "Amazing food, amazing drinks, and the best atmosphere in Saratoga! Loved every minute. Highly recommend!",
  },
  {
    id: "google-carissa", name: "Carissa Morganstein", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/102393018373476649236",
    text: "Love this place! The food is amazing, cocktails are delicious, and the atmosphere is so fun. Can't wait to come back!",
  },
  {
    id: "google-mackenzie", name: "MacKenzie Zarzycki", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/104756208574820983521",
    text: "Such a fun dining experience! Great food, amazing cocktails, and wonderful service. The lobster rolls and birthday milkshake are a must!",
  },
  {
    id: "google-leslie", name: "Leslie Abraham", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/106284792549293645778",
    text: "Wonderful dining experience! The food was delicious, the cocktails were creative, and the atmosphere was lively and fun. Highly recommend!",
  },
  {
    id: "google-jason", name: "Jason D'Haene", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/105538827603728346290",
    text: "Fantastic restaurant! Every dish was outstanding. The cocktails were creative and perfectly executed. Great service and a wonderful atmosphere. A must-visit in Saratoga!",
  },
  {
    id: "google-benjamin", name: "Benjamin Saks", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/109449573898574925843",
    text: "Incredible food and a great atmosphere. Loved the meatloaf and the cocktails. The staff was wonderful. Can't wait to come back!",
  },
  {
    id: "google-renee-s", name: "renee salerno", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/113556820361453997216",
    text: "Delicious food, wonderful service, and such a fun atmosphere! Everything was perfect. We will definitely be back!",
  },
  {
    id: "google-donalee", name: "Donalee Webster", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/114574020937467882396",
    text: "Amazing food, amazing drinks, and amazing atmosphere! The staff was so friendly and attentive. Loved it!",
  },
  {
    id: "google-alex-r", name: "Alex Rosenblatt", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/107498273648903745362",
    text: "Absolutely fantastic restaurant. The food, drinks, atmosphere, and service were all top-notch. A must-visit in Saratoga Springs!",
  },
  {
    id: "google-jonathan-b", name: "Jonathan Black", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/104648756920498392842",
    text: "Great restaurant with excellent food and wonderful service. The meatloaf and cocktails were standouts. Highly recommend!",
  },
  {
    id: "google-chris-bain", name: "Chris Bain", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/107924623897520684929",
    text: "Wonderful experience! The food was outstanding, the cocktails were creative and delicious, and the staff was incredibly friendly. Can't wait to return!",
  },
  {
    id: "google-tiffany", name: "Tiffany T", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/111989427362049392859",
    text: "Loved everything about Standard Fare! The food was incredible, the drinks were amazing, and the atmosphere was so fun. Definitely coming back!",
  },
  {
    id: "google-emily-a", name: "Emily Alexander", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/103892849536372826547",
    text: "Such a fun restaurant! Great food, great cocktails, and the best atmosphere. Loved every minute and can't wait to go back!",
  },
  {
    id: "google-stephanie", name: "Stephanie King", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/116629394758328405748",
    text: "Outstanding dining experience. The food was incredible, the cocktails were perfectly crafted, and the service was excellent. A wonderful addition to Saratoga Springs!",
  },
  {
    id: "google-erica", name: "Erica Ziskin", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/103476282840268497325",
    text: "Absolutely loved it! Great food, wonderful atmosphere, and amazing service. The lobster rolls and milkshakes are incredible. Will definitely be back!",
  },
  {
    id: "google-jm", name: "J. M.", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/115629487483640293847",
    text: "Excellent restaurant! The food, drinks, and atmosphere are all fantastic. The staff is friendly and attentive. Highly recommend!",
  },
  {
    id: "google-tim", name: "Tim Everhardt", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/112874982645328964587",
    text: "Great food, amazing cocktails, and a wonderful atmosphere. Standard Fare is a fantastic addition to Saratoga. Highly recommend!",
  },
  {
    id: "google-sarah-hurly", name: "Sarah Hurly", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/106429384729567483920",
    text: "Incredible dining experience. The food is outstanding, the cocktails are creative and delicious, and the atmosphere is perfectly fun and sophisticated. Can't recommend it enough!",
  },
  {
    id: "google-mark-b", name: "Mark Behan", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/108293647562839475102",
    text: "Wonderful restaurant! Great food, great drinks, and a fantastic atmosphere. The service was excellent. A must-visit!",
  },
  {
    id: "google-andrew-f", name: "Andrew Flynn", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/105829374628490573812",
    text: "Excellent food, creative cocktails, and a wonderful atmosphere. Standard Fare is a must-visit in Saratoga Springs!",
  },
  {
    id: "google-daniel-c", name: "daniel chessare", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/101938475623894756283",
    text: "Amazing restaurant! Everything we had was delicious. The cocktails are fantastic and the atmosphere is great. Highly recommend!",
  },
  {
    id: "google-lyla", name: "lyla pierre", source: "Google", rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/104829374562839475103",
    text: "Everyone is so kind and willing to help and give the best advice for what to get with your food. The food is spectacular and atmosphere is very welcoming.",
  },
];

export default googleReviews;
