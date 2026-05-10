import { db, citiesTable, activityCatalogTable } from "@workspace/db";

async function seed() {
  console.log("Seeding cities...");

  const cities = await db.insert(citiesTable).values([
    { name: "Tokyo", country: "Japan", region: "Asia", costIndex: "120", popularity: 95, imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", description: "A dazzling blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples." },
    { name: "Paris", country: "France", region: "Europe", costIndex: "150", popularity: 98, imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", description: "The City of Light captivates with its iconic landmarks, world-class cuisine, and art." },
    { name: "Bali", country: "Indonesia", region: "Asia", costIndex: "60", popularity: 88, imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", description: "An island paradise with stunning temples, terraced rice fields, and vibrant beach culture." },
    { name: "New York City", country: "USA", region: "North America", costIndex: "200", popularity: 97, imageUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80", description: "The city that never sleeps — cultural capital of the world with iconic skyline and energy." },
    { name: "Barcelona", country: "Spain", region: "Europe", costIndex: "100", popularity: 90, imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80", description: "Gaudí's city of art and architecture, world-famous beaches, and vibrant nightlife." },
    { name: "Kyoto", country: "Japan", region: "Asia", costIndex: "100", popularity: 85, imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", description: "Japan's ancient capital with 2,000 temples, traditional geisha districts, and bamboo groves." },
    { name: "Amsterdam", country: "Netherlands", region: "Europe", costIndex: "130", popularity: 87, imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=800&q=80", description: "A city of canals, cycling culture, world-class museums, and vibrant café scene." },
    { name: "Rome", country: "Italy", region: "Europe", costIndex: "110", popularity: 92, imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80", description: "The Eternal City where ancient history meets la dolce vita — ruins, food, and art." },
    { name: "Singapore", country: "Singapore", region: "Asia", costIndex: "140", popularity: 86, imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80", description: "A futuristic city-state of stunning architecture, diverse cuisine, and immaculate green spaces." },
    { name: "Cape Town", country: "South Africa", region: "Africa", costIndex: "70", popularity: 82, imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80", description: "Where mountains meet the ocean — dramatic landscapes, vineyards, and vibrant culture." },
    { name: "Lisbon", country: "Portugal", region: "Europe", costIndex: "80", popularity: 84, imageUrl: "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=800&q=80", description: "A city of hills, colorful tiles, fado music, and extraordinary pastries." },
    { name: "Bangkok", country: "Thailand", region: "Asia", costIndex: "55", popularity: 89, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80", description: "A sensory overload of ornate temples, street food, night markets, and modern malls." },
    { name: "Sydney", country: "Australia", region: "Oceania", costIndex: "160", popularity: 88, imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80", description: "Iconic Opera House, stunning harbour, world-class beaches, and a relaxed outdoor lifestyle." },
    { name: "Marrakech", country: "Morocco", region: "Africa", costIndex: "50", popularity: 80, imageUrl: "https://images.unsplash.com/photo-1539020140153-e479b8fc7098?w=800&q=80", description: "A labyrinth of souks, riads, and spice-filled medinas with vibrant colors and flavors." },
    { name: "Dubai", country: "UAE", region: "Middle East", costIndex: "180", popularity: 91, imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", description: "A futuristic metropolis of record-breaking architecture, luxury, and desert adventures." },
  ]).returning();

  console.log(`Seeded ${cities.length} cities.`);

  const tokyoId = cities.find((c) => c.name === "Tokyo")!.id;
  const parisId = cities.find((c) => c.name === "Paris")!.id;
  const baliId = cities.find((c) => c.name === "Bali")!.id;
  const nycId = cities.find((c) => c.name === "New York City")!.id;
  const barcelonaId = cities.find((c) => c.name === "Barcelona")!.id;
  const kyotoId = cities.find((c) => c.name === "Kyoto")!.id;
  const romeId = cities.find((c) => c.name === "Rome")!.id;
  const bangkokId = cities.find((c) => c.name === "Bangkok")!.id;

  console.log("Seeding activity catalog...");

  await db.insert(activityCatalogTable).values([
    // Tokyo
    { cityId: tokyoId, name: "Shibuya Crossing Visit", category: "sightseeing", description: "Experience the world's busiest pedestrian crossing at its iconic scramble intersection.", cost: "0", duration: "1" },
    { cityId: tokyoId, name: "Tsukiji Outer Market Tour", category: "food", description: "Explore the bustling outer market with fresh sushi, tamagoyaki, and local street food.", cost: "20", duration: "2" },
    { cityId: tokyoId, name: "teamLab Borderless Digital Art", category: "culture", description: "Immersive digital art museum experience unlike anywhere else in the world.", cost: "32", duration: "3" },
    { cityId: tokyoId, name: "Senso-ji Temple Visit", category: "culture", description: "Tokyo's oldest temple in Asakusa district with traditional crafts market.", cost: "0", duration: "2" },
    { cityId: tokyoId, name: "Mount Fuji Day Trip", category: "nature", description: "Scenic day trip to iconic Mount Fuji with stunning views and Hakone area.", cost: "80", duration: "8" },
    { cityId: tokyoId, name: "Robot Restaurant Show", category: "entertainment", description: "Over-the-top neon robot cabaret show — uniquely Tokyo entertainment.", cost: "80", duration: "2" },
    // Paris
    { cityId: parisId, name: "Eiffel Tower Visit", category: "sightseeing", description: "Ascend the iconic iron tower for panoramic views of the City of Light.", cost: "28", duration: "2" },
    { cityId: parisId, name: "Louvre Museum", category: "culture", description: "World's largest art museum — home to the Mona Lisa and thousands of masterworks.", cost: "17", duration: "4" },
    { cityId: parisId, name: "Seine River Cruise", category: "sightseeing", description: "Glide past Notre Dame, Musée d'Orsay, and the Eiffel Tower by boat.", cost: "15", duration: "1" },
    { cityId: parisId, name: "Versailles Palace Tour", category: "culture", description: "Explore the grand palace and stunning gardens of the Sun King.", cost: "20", duration: "5" },
    { cityId: parisId, name: "Montmartre & Sacré-Cœur", category: "sightseeing", description: "Stroll artist's quarter, visit the stunning basilica, and enjoy city views.", cost: "0", duration: "3" },
    { cityId: parisId, name: "French Cooking Class", category: "food", description: "Learn to make croissants and classic French dishes with a local chef.", cost: "100", duration: "4" },
    // Bali
    { cityId: baliId, name: "Ubud Rice Terrace Trekking", category: "nature", description: "Trek through the iconic emerald terraced rice paddies of Tegallalang.", cost: "5", duration: "3" },
    { cityId: baliId, name: "Tanah Lot Temple Sunset", category: "culture", description: "Watch the sunset at the iconic sea temple perched on a rocky outcrop.", cost: "4", duration: "2" },
    { cityId: baliId, name: "Balinese Cooking Class", category: "food", description: "Visit a morning market and cook authentic Balinese dishes with a local host.", cost: "35", duration: "4" },
    { cityId: baliId, name: "Whitewater Rafting Ayung River", category: "adventure", description: "Thrilling rafting through jungle gorges on the Ayung River.", cost: "30", duration: "3" },
    { cityId: baliId, name: "Traditional Kecak Fire Dance", category: "entertainment", description: "Watch the spectacular fire dance ritual at Uluwatu Temple at sunset.", cost: "10", duration: "2" },
    // NYC
    { cityId: nycId, name: "Central Park Walk", category: "nature", description: "Explore the 843-acre urban oasis — Bethesda Fountain, Belvedere Castle, and more.", cost: "0", duration: "3" },
    { cityId: nycId, name: "Metropolitan Museum of Art", category: "culture", description: "One of the world's greatest art museums with 5,000 years of art history.", cost: "30", duration: "4" },
    { cityId: nycId, name: "High Line Walk", category: "sightseeing", description: "Stroll the elevated park on a former rail line with art, gardens, and Hudson River views.", cost: "0", duration: "2" },
    { cityId: nycId, name: "Broadway Show", category: "entertainment", description: "Experience world-class theater in the Theater District — the pinnacle of live performance.", cost: "100", duration: "3" },
    { cityId: nycId, name: "Empire State Building Observatory", category: "sightseeing", description: "Iconic views of Manhattan from the 86th-floor observatory.", cost: "44", duration: "2" },
    // Barcelona
    { cityId: barcelonaId, name: "Sagrada Família Visit", category: "culture", description: "Tour Gaudí's breathtaking unfinished basilica — one of the world's greatest buildings.", cost: "26", duration: "2" },
    { cityId: barcelonaId, name: "Barceloneta Beach Day", category: "nature", description: "Relax on the famous city beach — swimming, sun, and fresh seafood nearby.", cost: "0", duration: "4" },
    { cityId: barcelonaId, name: "Park Güell Tour", category: "culture", description: "Gaudí's mosaic-covered park with panoramic city views and whimsical architecture.", cost: "10", duration: "2" },
    { cityId: barcelonaId, name: "Tapas Bar Crawl", category: "food", description: "Sample patatas bravas, jamón, and croquetas across the best tapas bars in the Gothic Quarter.", cost: "50", duration: "3" },
    // Kyoto
    { cityId: kyotoId, name: "Fushimi Inari Shrine Hike", category: "sightseeing", description: "Hike through thousands of vermilion torii gates on the sacred mountain trail.", cost: "0", duration: "3" },
    { cityId: kyotoId, name: "Arashiyama Bamboo Grove", category: "nature", description: "Walk through the stunning bamboo forest and visit Tenryu-ji garden nearby.", cost: "5", duration: "2" },
    { cityId: kyotoId, name: "Tea Ceremony Experience", category: "culture", description: "Participate in a traditional Japanese matcha tea ceremony with a tea master.", cost: "40", duration: "1" },
    { cityId: kyotoId, name: "Geisha District Walk (Gion)", category: "culture", description: "Explore Kyoto's geisha quarter — traditional wooden machiya townhouses and teahouses.", cost: "0", duration: "2" },
    // Rome
    { cityId: romeId, name: "Colosseum Tour", category: "culture", description: "Walk through the ancient amphitheater where gladiators fought 2,000 years ago.", cost: "16", duration: "3" },
    { cityId: romeId, name: "Vatican Museums & Sistine Chapel", category: "culture", description: "Admire Michelangelo's iconic ceiling and world-class papal art collections.", cost: "20", duration: "4" },
    { cityId: romeId, name: "Roman Food Tour", category: "food", description: "Taste authentic cacio e pepe, supplì, and gelato on a guided neighborhood food tour.", cost: "65", duration: "3" },
    { cityId: romeId, name: "Trevi Fountain & Spanish Steps", category: "sightseeing", description: "Toss a coin at the Trevi Fountain and stroll up the elegant Spanish Steps.", cost: "0", duration: "2" },
    // Bangkok
    { cityId: bangkokId, name: "Grand Palace & Wat Phra Kaew", category: "culture", description: "Explore the spectacular royal palace complex and the Temple of the Emerald Buddha.", cost: "15", duration: "3" },
    { cityId: bangkokId, name: "Floating Market Tour", category: "food", description: "Visit the colorful Damnoen Saduak or Amphawa floating market by longtail boat.", cost: "25", duration: "4" },
    { cityId: bangkokId, name: "Street Food Night Walk", category: "food", description: "Guided evening street food tour through Chinatown's Yaowarat Road.", cost: "30", duration: "3" },
    { cityId: bangkokId, name: "Rooftop Bar Experience", category: "entertainment", description: "Drinks at one of Bangkok's iconic rooftop bars with panoramic city views.", cost: "40", duration: "2" },
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
